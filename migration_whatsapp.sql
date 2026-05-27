-- ─────────────────────────────────────────────────────────────────
-- WhatsApp message ingestion schema
-- Run this in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────

-- WhatsApp messages received from Baileys / official API
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id       UUID        REFERENCES chats(id) ON DELETE CASCADE,
  sender        TEXT        NOT NULL,
  sender_phone  TEXT,
  body          TEXT        NOT NULL DEFAULT '',
  sent_at       TIMESTAMPTZ DEFAULT NOW(),
  wa_message_id TEXT        UNIQUE,          -- WhatsApp message ID (dedup)
  source        TEXT        DEFAULT 'baileys', -- 'baileys' | 'whatsapp-api'
  status        TEXT        DEFAULT 'pending', -- 'pending' | 'actioned' | 'not_actioned'
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wa_msgs_chat_id  ON whatsapp_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_wa_msgs_sent_at  ON whatsapp_messages(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_wa_msgs_status   ON whatsapp_messages(status);

-- RLS (authenticated users can read/write)
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_all" ON whatsapp_messages;
CREATE POLICY "auth_all" ON whatsapp_messages FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Replica identity needed for real-time filtering
ALTER TABLE whatsapp_messages REPLICA IDENTITY FULL;

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE whatsapp_messages;

-- ─────────────────────────────────────────────────────────────────
-- Group ID mapping (links WhatsApp group → Supabase chat)
-- Populate after you know your WhatsApp group IDs.
-- Get chat IDs with:  SELECT id, name FROM chats;
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE chats ADD COLUMN IF NOT EXISTS whatsapp_group_id TEXT;
CREATE INDEX IF NOT EXISTS idx_chats_wa_group ON chats(whatsapp_group_id);
