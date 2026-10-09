CREATE TABLE IF NOT EXISTS contact_enquiries (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  project_type text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new'
);
