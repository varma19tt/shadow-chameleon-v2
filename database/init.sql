-- Enhanced targets table
CREATE TABLE IF NOT EXISTS targets (
    id SERIAL PRIMARY KEY,
    target TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    note TEXT,
    scan_type VARCHAR(20) DEFAULT 'quick',
    created_at TIMESTAMP DEFAULT NOW(),
    scan_started_at TIMESTAMP,
    scan_completed_at TIMESTAMP,
    scan_results JSONB
);

-- Scan results table for detailed findings
CREATE TABLE IF NOT EXISTS scan_results (
    id SERIAL PRIMARY KEY,
    target_id INTEGER REFERENCES targets(id),
    scan_type VARCHAR(50) NOT NULL,
    results JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Services discovered
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    target_id INTEGER REFERENCES targets(id),
    port INTEGER,
    protocol VARCHAR(10),
    service_name VARCHAR(100),
    version TEXT,
    banner TEXT,
    discovered_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_targets_status ON targets(status);
CREATE INDEX IF NOT EXISTS idx_scan_results_target_id ON scan_results(target_id);
CREATE INDEX IF NOT EXISTS idx_services_target_id ON services(target_id);

-- Insert a test target for verification
INSERT INTO targets (target, note, status) VALUES 
('scanme.nmap.org', 'Test target for verification', 'completed')
ON CONFLICT DO NOTHING;
