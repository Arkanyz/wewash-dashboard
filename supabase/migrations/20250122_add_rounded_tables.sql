-- Création des tables pour ROUNDED
CREATE TABLE IF NOT EXISTS phone_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    call_id TEXT NOT NULL UNIQUE,
    caller_number TEXT NOT NULL,
    status TEXT NOT NULL,
    duration INTEGER,
    recording_url TEXT,
    transcript TEXT,
    intent TEXT,
    laundry_id UUID REFERENCES laundries(id),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS call_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    call_id UUID REFERENCES phone_calls(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    action_data JSONB NOT NULL DEFAULT '{}',
    status TEXT NOT NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Politiques RLS
ALTER TABLE phone_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own calls"
    ON phone_calls FOR SELECT
    USING (auth.uid() = owner_id);

CREATE POLICY "ROUNDED can insert calls"
    ON phone_calls FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can view their own call actions"
    ON call_actions FOR SELECT
    USING (auth.uid() = owner_id);

CREATE POLICY "ROUNDED can insert call actions"
    ON call_actions FOR INSERT
    WITH CHECK (true);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_phone_calls_owner_id ON phone_calls(owner_id);
CREATE INDEX IF NOT EXISTS idx_phone_calls_laundry_id ON phone_calls(laundry_id);
CREATE INDEX IF NOT EXISTS idx_call_actions_call_id ON call_actions(call_id);

-- Fonction pour associer automatiquement le owner_id
CREATE OR REPLACE FUNCTION set_call_action_owner_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.owner_id := (SELECT owner_id FROM phone_calls WHERE id = NEW.call_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour automatiquement définir le owner_id des call_actions
CREATE TRIGGER set_call_action_owner_id_trigger
    BEFORE INSERT ON call_actions
    FOR EACH ROW
    EXECUTE FUNCTION set_call_action_owner_id();
