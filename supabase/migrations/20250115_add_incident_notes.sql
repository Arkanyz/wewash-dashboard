-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create table for incident notes
CREATE TABLE IF NOT EXISTS incident_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES maintenance_reports(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    status TEXT CHECK (status IN ('pending', 'in_progress', 'resolved')) DEFAULT 'pending'
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_incident_notes_incident_id ON incident_notes(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_notes_created_at ON incident_notes(created_at);

-- Enable RLS
ALTER TABLE incident_notes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view notes for their incidents"
    ON incident_notes FOR SELECT
    USING (
        auth.uid() IN (
            SELECT owner_id 
            FROM laundries l
            JOIN machines m ON m.laundry_id = l.id
            JOIN maintenance_reports mr ON mr.machine_id = m.id
            WHERE mr.id = incident_notes.incident_id
        )
        OR 
        auth.uid() IN (
            SELECT user_id 
            FROM user_roles 
            WHERE role = 'admin'
        )
    );

CREATE POLICY "Support staff can create notes"
    ON incident_notes FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT user_id 
            FROM user_roles 
            WHERE role IN ('support', 'admin')
        )
    );

CREATE POLICY "Support staff can update their own notes"
    ON incident_notes FOR UPDATE
    USING (
        created_by = auth.uid()
        OR 
        auth.uid() IN (
            SELECT user_id 
            FROM user_roles 
            WHERE role = 'admin'
        )
    );
