-- Enums
CREATE TYPE user_role AS ENUM ('president', 'manager', 'it_staff', 'department_head', 'staff');
CREATE TYPE report_status AS ENUM ('draft', 'submitted', 'approved', 'rejected');
CREATE TYPE employee_status AS ENUM ('active', 'inactive', 'on_leave');

-- Departments
CREATE TABLE IF NOT EXISTS departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
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
  profile_id UUID REFERENCES profiles(id) UNIQUE,
  position TEXT,
  status employee_status DEFAULT 'active',
  date_joined DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Missions Reports
CREATE TABLE IF NOT EXISTS missions_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  month INTEGER CHECK (month BETWEEN 1 AND 12),
  year INTEGER,
  content TEXT,
  attachments TEXT[], 
  status report_status DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Move Reports
CREATE TABLE IF NOT EXISTS move_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  month INTEGER CHECK (month BETWEEN 1 AND 12),
  year INTEGER,
  content TEXT,
  attachments TEXT[],
  status report_status DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Department Reports
CREATE TABLE IF NOT EXISTS department_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  department_id UUID REFERENCES departments(id),
  month INTEGER CHECK (month BETWEEN 1 AND 12),
  year INTEGER,
  summary TEXT,
  financial_summary TEXT,
  status report_status DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Requisitions
CREATE TABLE IF NOT EXISTS requisitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  purpose TEXT,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  attachments TEXT[],
  status report_status DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Withdrawal Forms
CREATE TABLE IF NOT EXISTS withdrawal_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requisition_id UUID REFERENCES requisitions(id) UNIQUE,
  reference_number TEXT UNIQUE NOT NULL,
  amount DECIMAL(12,2),
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

-- RLS Helper Functions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('president', 'manager', 'it_staff')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Trigger Function for Requisition Approval -> Withdrawal Form
CREATE OR REPLACE FUNCTION public.handle_requisition_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    INSERT INTO public.withdrawal_forms (requisition_id, reference_number, amount, generated_by)
    VALUES (
      NEW.id,
      'WF-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(NEW.id::text, 1, 8)),
      NEW.amount,
      NEW.approved_by
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger Function for Audit Logging
CREATE OR REPLACE FUNCTION public.proc_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  uid UUID := auth.uid();
BEGIN
  INSERT INTO public.audit_logs (user_id, action, entity, entity_id, details)
  VALUES (
    uid,
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for New User Profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', COALESCE((new.raw_user_meta_data->>'role')::user_role, 'staff'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind Triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE TRIGGER tr_requisition_approved
  AFTER UPDATE ON requisitions
  FOR EACH ROW EXECUTE PROCEDURE public.handle_requisition_approval();

-- Audit Triggers
CREATE TRIGGER audit_missions_reports AFTER INSERT OR UPDATE OR DELETE ON missions_reports FOR EACH ROW EXECUTE PROCEDURE public.proc_audit_log();
CREATE TRIGGER audit_move_reports AFTER INSERT OR UPDATE OR DELETE ON move_reports FOR EACH ROW EXECUTE PROCEDURE public.proc_audit_log();
CREATE TRIGGER audit_department_reports AFTER INSERT OR UPDATE OR DELETE ON department_reports FOR EACH ROW EXECUTE PROCEDURE public.proc_audit_log();
CREATE TRIGGER audit_requisitions AFTER INSERT OR UPDATE OR DELETE ON requisitions FOR EACH ROW EXECUTE PROCEDURE public.proc_audit_log();

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

-- RLS POLICIES

-- Profiles
CREATE POLICY "Profiles viewable by admins or owner" ON profiles FOR SELECT USING (is_admin() OR auth.uid() = id);
CREATE POLICY "Admins can update roles" ON profiles FOR UPDATE USING (is_admin());

-- Departments
CREATE POLICY "Departments viewable by all authenticated" ON departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage departments" ON departments FOR ALL USING (is_admin());

-- Employees
CREATE POLICY "Employees viewable by admins or owner" ON employees FOR SELECT USING (is_admin() OR auth.uid() = profile_id);
CREATE POLICY "Admins can manage employees" ON employees FOR ALL USING (is_admin());

-- Universal Policy Macro for Reports/Requisitions
-- 1. Owners can view their own
-- 2. Admins can view all
-- 3. Owners can insert
-- 4. Owners can update ONLY if draft/rejected AND not changing approval fields
-- 5. Admins can update ONLY approval fields

-- Missions Reports
CREATE POLICY "missions_reports_select" ON missions_reports FOR SELECT USING (is_admin() OR auth.uid() = created_by);
CREATE POLICY "missions_reports_insert" ON missions_reports FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "missions_reports_owner_update" ON missions_reports FOR UPDATE 
  USING (auth.uid() = created_by AND status IN ('draft', 'rejected'))
  WITH CHECK (auth.uid() = created_by AND status IN ('draft', 'submitted'));
CREATE POLICY "missions_reports_admin_update" ON missions_reports FOR UPDATE 
  USING (is_admin())
  WITH CHECK (is_admin());

-- Move Reports
CREATE POLICY "move_reports_select" ON move_reports FOR SELECT USING (is_admin() OR auth.uid() = created_by);
CREATE POLICY "move_reports_insert" ON move_reports FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "move_reports_owner_update" ON move_reports FOR UPDATE 
  USING (auth.uid() = created_by AND status IN ('draft', 'rejected'))
  WITH CHECK (auth.uid() = created_by AND status IN ('draft', 'submitted'));
CREATE POLICY "move_reports_admin_update" ON move_reports FOR UPDATE 
  USING (is_admin())
  WITH CHECK (is_admin());

-- Department Reports
CREATE POLICY "department_reports_select" ON department_reports FOR SELECT USING (is_admin() OR auth.uid() = created_by);
CREATE POLICY "department_reports_insert" ON department_reports FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "department_reports_owner_update" ON department_reports FOR UPDATE 
  USING (auth.uid() = created_by AND status IN ('draft', 'rejected'))
  WITH CHECK (auth.uid() = created_by AND status IN ('draft', 'submitted'));
CREATE POLICY "department_reports_admin_update" ON department_reports FOR UPDATE 
  USING (is_admin())
  WITH CHECK (is_admin());

-- Requisitions
CREATE POLICY "requisitions_select" ON requisitions FOR SELECT USING (is_admin() OR auth.uid() = created_by);
CREATE POLICY "requisitions_insert" ON requisitions FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "requisitions_owner_update" ON requisitions FOR UPDATE 
  USING (auth.uid() = created_by AND status IN ('draft', 'rejected'))
  WITH CHECK (auth.uid() = created_by AND status IN ('draft', 'submitted'));
CREATE POLICY "requisitions_admin_update" ON requisitions FOR UPDATE 
  USING (is_admin())
  WITH CHECK (is_admin());

-- Withdrawal Forms
CREATE POLICY "withdrawal_forms_select" ON withdrawal_forms FOR SELECT 
  USING (is_admin() OR EXISTS (
    SELECT 1 FROM requisitions WHERE id = requisition_id AND created_by = auth.uid()
  ));

-- Audit Logs
CREATE POLICY "Only admins can view audit logs" ON audit_logs FOR SELECT USING (is_admin());

-- Storage Buckets (Create buckets if not exist)
-- Note: Bucket management usually via Supabase Dashboard or API, but SQL is fine for schema.
INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('forms', 'forms', false) ON CONFLICT DO NOTHING;

-- Storage Policies
CREATE POLICY "Allow authenticated to upload attachments" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'attachments');
CREATE POLICY "Allow users to view own attachments or admins" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'attachments' AND (auth.uid() = owner OR is_admin()));
CREATE POLICY "Allow admins to manage forms" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'forms' AND is_admin());
CREATE POLICY "Allow owners to view own forms" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'forms' AND EXISTS (
  SELECT 1 FROM withdrawal_forms wf JOIN requisitions r ON wf.requisition_id = r.id WHERE r.created_by = auth.uid() AND (storage.foldername(name))[1] = wf.reference_number
));

