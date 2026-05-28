-- ─────────────────────────────────────────────────────────────────
-- ETAs table — auto-extracted from chat messages via Claude
-- Run this in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS etas (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id       TEXT,                           -- matches chats.id (TEXT)
  what          TEXT        NOT NULL,            -- cargo / container description
  customer      TEXT        DEFAULT '—',
  vehicle       TEXT        DEFAULT '—',         -- truck / container ID
  at            TEXT        DEFAULT '—',         -- time string e.g. "14:30"
  dest          TEXT        DEFAULT '—',         -- destination
  kind          TEXT        DEFAULT 'inbound',   -- 'inbound' | 'outbound' | 'visit'
  status        TEXT        DEFAULT 'scheduled', -- 'scheduled' | 'enroute' | 'arrived' | 'delayed'
  eta_date      DATE        DEFAULT CURRENT_DATE,
  detail        TEXT,
  extracted_from TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_etas_chat_id  ON etas(chat_id);
CREATE INDEX IF NOT EXISTS idx_etas_eta_date ON etas(eta_date DESC);
CREATE INDEX IF NOT EXISTS idx_etas_status   ON etas(status);

-- RLS
ALTER TABLE etas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_all" ON etas;
CREATE POLICY "auth_all" ON etas FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Real-time
ALTER TABLE etas REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE etas;
