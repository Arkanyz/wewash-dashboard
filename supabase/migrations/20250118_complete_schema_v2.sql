-- Créer les types s'ils n'existent pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'call_category') THEN
        CREATE TYPE call_category AS ENUM ('technique', 'information', 'urgence');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'call_priority') THEN
        CREATE TYPE call_priority AS ENUM ('low', 'medium', 'high');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'call_sentiment') THEN
        CREATE TYPE call_sentiment AS ENUM ('positif', 'neutre', 'négatif');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'problem_type') THEN
        CREATE TYPE problem_type AS ENUM (
            'start_failure',
            'stop_failure',
            'water_leak',
            'payment_issue',
            'door_issue',
            'heating_issue',
            'other'
        );
    END IF;
END $$;

-- Créer les tables si elles n'existent pas
CREATE TABLE IF NOT EXISTS public.rounded_calls (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    call_id text UNIQUE NOT NULL,
    caller_number text NOT NULL,
    recipient_number text NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone,
    duration integer,
    recording_url text,
    transcript text,
    status text NOT NULL,
    direction text NOT NULL,
    raw_data jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table d'analyse des appels
CREATE TABLE IF NOT EXISTS public.call_analysis (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    call_id uuid REFERENCES public.rounded_calls(id) ON DELETE CASCADE,
    category call_category NOT NULL,
    priority call_priority NOT NULL,
    sentiment call_sentiment NOT NULL,
    summary text NOT NULL,
    keywords text[],
    machine_id uuid REFERENCES public.machines(id),
    problem_type problem_type,
    action_required boolean DEFAULT false,
    action_type text,
    estimated_resolution_time interval,
    analyzed_by text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table des actions de suivi
CREATE TABLE IF NOT EXISTS public.call_actions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    analysis_id uuid REFERENCES public.call_analysis(id) ON DELETE CASCADE,
    action_type text NOT NULL,
    description text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at timestamp with time zone
);

-- Activer RLS sur les nouvelles tables
ALTER TABLE IF EXISTS public.rounded_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.call_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.call_actions ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS
DO $$ 
BEGIN
    -- Politiques pour rounded_calls
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rounded_calls' AND policyname = 'Enable read access for all users') THEN
        CREATE POLICY "Enable read access for all users" ON public.rounded_calls
            FOR SELECT USING (true);
    END IF;

    -- Politiques pour call_analysis
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'call_analysis' AND policyname = 'Enable read access for all users') THEN
        CREATE POLICY "Enable read access for all users" ON public.call_analysis
            FOR SELECT USING (true);
    END IF;

    -- Politiques pour call_actions
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'call_actions' AND policyname = 'Enable read access for all users') THEN
        CREATE POLICY "Enable read access for all users" ON public.call_actions
            FOR SELECT USING (true);
    END IF;
END $$;
