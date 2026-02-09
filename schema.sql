-- Enums
CREATE TYPE user_role AS ENUM ('president', 'manager', 'it_staff', 'department_head', 'staff');
CREATE TYPE report_status AS ENUM ('draft', 'submitted', 'approved', 'rejected');
CREATE TYPE employee_status AS ENUM ('active', 'inactive', 'on_leave');

-- Departments
CREATE TABLE IF NOT EXISTS departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role user_role DEFAULT 'staff',
  department_id UUID REFERENCES departments(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employees
CREATE TABLE IF NOT EXISTS employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  position TEXT,
  status employee_status DEFAULT 'active',
  date_joined DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Missions Reports
CREATE TABLE IF NOT EXISTS missions_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  month INTEGER,
  year INTEGER,
  content TEXT,
  attachments TEXT[], 
  status report_status DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Move Reports
CREATE TABLE IF NOT EXISTS move_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  month INTEGER,
  year INTEGER,
  content TEXT,
  attachments TEXT[],
  status report_status DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Department Reports
CREATE TABLE IF NOT EXISTS department_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  department_id UUID REFERENCES departments(id),
  month INTEGER,
  year INTEGER,
  summary TEXT,
  financial_summary TEXT,
  status report_status DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Requisitions
CREATE TABLE IF NOT EXISTS requisitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  purpose TEXT,
  amount DECIMAL(10,2) NOT NULL,
  attachments TEXT[],
  status report_status DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Withdrawal Forms
CREATE TABLE IF NOT EXISTS withdrawal_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requisition_id UUID REFERENCES requisitions(id) UNIQUE,
  reference_number TEXT UNIQUE,
  amount DECIMAL(10,2),
  generated_by UUID REFERENCES auth.users(id),
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  pdf_url TEXT
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT,
  entity TEXT,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Storage (Create buckets if not exist - might need to be done in dashboard)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('attachments', 'attachments', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) 
VALUES ('forms', 'forms', false) ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE move_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE requisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function for user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'staff');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Basic Policies (We will refine these via SQL or code later, but this allows basic access)
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Requisition Policies
CREATE POLICY "Enable read access for all users" ON requisitions FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON requisitions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for users based on email" ON requisitions FOR UPDATE USING (auth.uid() = created_by);
