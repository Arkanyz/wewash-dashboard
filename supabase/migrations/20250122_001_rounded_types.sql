-- Migration 1: Création des types
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types with safe error handling
DO $$ 
BEGIN
    CREATE TYPE call_status AS ENUM ('initiated', 'connected', 'completed', 'missed', 'failed');
EXCEPTION 
    WHEN duplicate_object THEN 
        RAISE NOTICE 'Type call_status already exists, skipping...';
END $$;

DO $$ 
BEGIN
    CREATE TYPE call_direction AS ENUM ('inbound', 'outbound');
EXCEPTION 
    WHEN duplicate_object THEN 
        RAISE NOTICE 'Type call_direction already exists, skipping...';
END $$;

DO $$ 
BEGIN
    CREATE TYPE variable_type AS ENUM ('string', 'boolean', 'number', 'date');
EXCEPTION 
    WHEN duplicate_object THEN 
        RAISE NOTICE 'Type variable_type already exists, skipping...';
END $$;

DO $$ 
BEGIN
    CREATE TYPE variable_source AS ENUM ('api_call', 'csv', 'extracted');
EXCEPTION 
    WHEN duplicate_object THEN 
        RAISE NOTICE 'Type variable_source already exists, skipping...';
END $$;
