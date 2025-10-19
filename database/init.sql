-- Simple targets table
CREATE TABLE IF NOT EXISTS targets (
    id SERIAL PRIMARY KEY,
    target TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Simple scans table
CREATE TABLE IF NOT EXISTS scan_results (
    id SERIAL PRIMARY KEY,
    target_id INTEGER REFERENCES targets(id),
    raw_json JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
