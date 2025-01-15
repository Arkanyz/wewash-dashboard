-- Create VAPI calls table
CREATE TABLE IF NOT EXISTS incidents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    incident_id TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Client Details
    client_id TEXT,
    client_name TEXT,
    client_phone TEXT,
    client_email TEXT,
    preferred_contact_method TEXT,
    
    -- Machine Details
    machine_id UUID REFERENCES public.machines(id),
    location TEXT,
    machine_type TEXT,
    model TEXT,
    last_maintenance_date TIMESTAMP WITH TIME ZONE,
    
    -- Problem Details
    problem_type TEXT,
    description TEXT,
    detected_by TEXT,
    priority TEXT,
    status TEXT DEFAULT 'pending',
    recommended_action TEXT,
    diagnosis_details TEXT,
    classification_source TEXT,
    
    -- Actions Taken
    actions_taken JSONB DEFAULT '[]'::jsonb,
    
    -- Client Notification
    last_contacted TIMESTAMP WITH TIME ZONE,
    notification_method TEXT,
    notification_message TEXT,
    
    -- Follow Up
    survey_sent BOOLEAN DEFAULT false,
    feedback TEXT,
    
    -- Resolution Details
    resolved BOOLEAN DEFAULT false,
    resolution_timestamp TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_incidents_timestamp ON incidents(timestamp);
CREATE INDEX IF NOT EXISTS idx_incidents_machine_id ON incidents(machine_id);
CREATE INDEX IF NOT EXISTS idx_incidents_client_phone ON incidents(client_phone);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_resolved ON incidents(resolved);

-- Enable Row Level Security
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- Create policy for owners to view their incidents
CREATE POLICY "Enable read access for owners" ON incidents
    FOR SELECT
    TO authenticated
    USING (
        machine_id IN (
            SELECT m.id 
            FROM machines m 
            JOIN laundries l ON m.laundry_id = l.id 
            WHERE l.manager_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Create policy for the service role to insert data
CREATE POLICY "Enable insert for service role" ON incidents
    FOR INSERT
    TO service_role
    WITH CHECK (true);
