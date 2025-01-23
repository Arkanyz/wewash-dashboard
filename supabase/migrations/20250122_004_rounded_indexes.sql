-- Migration 4: Création des index
BEGIN;

-- Index pour rounded_calls
CREATE INDEX IF NOT EXISTS idx_rounded_calls_laundry ON rounded_calls(laundry_id);
CREATE INDEX IF NOT EXISTS idx_rounded_calls_user ON rounded_calls(user_id);
CREATE INDEX IF NOT EXISTS idx_rounded_calls_status ON rounded_calls(status);
CREATE INDEX IF NOT EXISTS idx_rounded_calls_created ON rounded_calls(created_at);

-- Index pour rounded_call_segments
CREATE INDEX IF NOT EXISTS idx_rounded_segments_call ON rounded_call_segments(call_id);
CREATE INDEX IF NOT EXISTS idx_rounded_segments_user ON rounded_call_segments(user_id);

-- Index pour rounded_variables
CREATE INDEX IF NOT EXISTS idx_rounded_variables_call ON rounded_variables(call_id);
CREATE INDEX IF NOT EXISTS idx_rounded_variables_segment ON rounded_variables(segment_id);
CREATE INDEX IF NOT EXISTS idx_rounded_variables_user ON rounded_variables(user_id);

-- Index pour rounded_tools_usage
CREATE INDEX IF NOT EXISTS idx_rounded_tools_call ON rounded_tools_usage(call_id);
CREATE INDEX IF NOT EXISTS idx_rounded_tools_segment ON rounded_tools_usage(segment_id);
CREATE INDEX IF NOT EXISTS idx_rounded_tools_user ON rounded_tools_usage(user_id);

COMMIT;
