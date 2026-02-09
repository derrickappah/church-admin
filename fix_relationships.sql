-- Fix relationships to allow joining profiles from requisitions
-- Since profiles.id is the same as auth.users.id, we can add a FK reference to profiles
-- to enable easy joining in the API.

ALTER TABLE requisitions 
DROP CONSTRAINT IF EXISTS requisitions_created_by_fkey;

ALTER TABLE requisitions
ADD CONSTRAINT requisitions_created_by_fkey 
FOREIGN KEY (created_by) 
REFERENCES profiles(id);

-- Do the same for other tables if needed for UI display
ALTER TABLE missions_reports 
DROP CONSTRAINT IF EXISTS missions_reports_created_by_fkey;

ALTER TABLE missions_reports
ADD CONSTRAINT missions_reports_created_by_fkey 
FOREIGN KEY (created_by) 
REFERENCES profiles(id);

ALTER TABLE move_reports 
DROP CONSTRAINT IF EXISTS move_reports_created_by_fkey;

ALTER TABLE move_reports
ADD CONSTRAINT move_reports_created_by_fkey 
FOREIGN KEY (created_by) 
REFERENCES profiles(id);

ALTER TABLE department_reports 
DROP CONSTRAINT IF EXISTS department_reports_created_by_fkey;

ALTER TABLE department_reports
ADD CONSTRAINT department_reports_created_by_fkey 
FOREIGN KEY (created_by) 
REFERENCES profiles(id);
