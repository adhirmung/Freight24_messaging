/**
 * Freight 24 Messaging — Phase 1 WhatsApp Listener (Baileys)
 * ─────────────────────────────────────────────────────────────
 * Run this locally while waiting for WhatsApp Official API approval.
 * It connects your WhatsApp account to the group, then forwards every
 * group message into the Supabase `whatsapp_messages` table — from
 * where the web app picks them up in real-time.
 *
 * Setup:
 *   1. npm install @whiskeysockets/baileys @supabase/supabase-js dotenv
 *   2. Copy .env.example → .env and fill in your values
 *   3. node baileys-listener.js
 *   4. Scan the QR code with WhatsApp on your phone
 *
 * After pairing, auth is saved in ./auth — no need to scan again.
 *
 * ─────────────────────────────────────────────────────────────
 * GROUP_TO_CHAT mapping
 * ─────────────────────────────────────────────────────────────
 * Each WhatsApp group ID maps to a Supabase chat UUID.
 * Find your chat UUIDs with:
 *   SELECT id, name FROM chats;
 * Find your WhatsApp group IDs by sending a message to the group
 * after pairing — the script will log the remoteJid for unknown groups.
 *
 * Format:
 *   '120363XXXXXXXXXX@g.us': 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
 */

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } =
  require('@whiskeysockets/baileys');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// ─── Config ─────────────────────────────────────────────────────────────────

const SUPABASE_URL      = process.env.SUPABASE_URL      || 'https://mwgygfjufeynkewntdgq.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';  // fill in .env

/**
 * Map your WhatsApp group IDs → Supabase chat IDs.
 *
 * Supabase chats (from SELECT id, name FROM chats):
 *   c1  →  WHS 24 OPERATIONS
 *   c5  →  Allied Bookings
 *   c2, c3, c4, c6, c7  →  (unnamed — rename in app if needed)
 *
 * To find your WhatsApp group IDs:
 *   1. Run this script and scan the QR code
 *   2. Send any message in a WhatsApp group
 *   3. The console will log:  ⚠️  Unknown group: 120363XXXXXXXX@g.us
 *   4. Copy that ID and paste it below
 */
const GROUP_TO_CHAT = {
  // WHS 24 OPERATIONS
  // '120363XXXXXXXXXX@g.us': 'c1',

  // Allied Bookings
  // '120363XXXXXXXXXX@g.us': 'c5',

  // Add more groups here ↓
};

// ─── Supabase ────────────────────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Listener ────────────────────────────────────────────────────────────────

async function startListener() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    browser: ['Freight24', 'Chrome', '1.0.0'],
  });

  sock.ev.on('creds.update', saveCreds);

  // ── Connection lifecycle ──────────────────────────────────────────────────

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\n📱  Scan the QR code above with WhatsApp → Linked Devices\n');
    }

    if (connection === 'open') {
      console.log('✅  Connected to WhatsApp — listening for group messages…');
    }

    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = code !== DisconnectReason.loggedOut;
      console.log(`❌  Disconnected (${code}) — ${shouldReconnect ? 'reconnecting in 5s…' : 'logged out, delete ./auth to re-pair'}`);
      if (shouldReconnect) {
        setTimeout(startListener, 5000);
      }
    }
  });

  // ── Message handler ───────────────────────────────────────────────────────

  sock.ev.on('messages.upsert', async ({ messages: msgs, type }) => {
    // 'notify' = new messages; 'append' = history load — ignore history
    if (type !== 'notify') return;

    for (const message of msgs) {
      // Ignore own messages
      if (message.key.fromMe) continue;

      const remoteJid = message.key.remoteJid;

      // Only process group messages
      if (!remoteJid?.endsWith('@g.us')) continue;

      // Extract text (handles plain text, extended text, image captions)
      const body =
        message.message?.conversation ||
        message.message?.extendedTextMessage?.text ||
        message.message?.imageMessage?.caption ||
        message.message?.videoMessage?.caption ||
        '';

      // Skip empty / non-text messages
      if (!body.trim()) continue;

      const sender      = message.pushName || message.key.participant || 'Unknown';
      const senderPhone = message.key.participant || remoteJid;
      const waMessageId = message.key.id;
      const sentAt      = new Date((message.messageTimestamp || Date.now() / 1000) * 1000).toISOString();

      // Look up the Supabase chat UUID for this group
      const chatId = GROUP_TO_CHAT[remoteJid];

      if (!chatId) {
        // Log the group ID so the user can add it to GROUP_TO_CHAT above
        console.warn(`⚠️  Unknown group: ${remoteJid}  —  add it to GROUP_TO_CHAT in baileys-listener.js`);
        continue;
      }

      console.log(`📩  [${remoteJid}] ${sender}: ${body.substring(0, 80)}${body.length > 80 ? '…' : ''}`);

      try {
        const { error } = await supabase.from('whatsapp_messages').insert({
          chat_id:       chatId,
          sender:        sender,
          sender_phone:  senderPhone,
          body:          body,
          sent_at:       sentAt,
          wa_message_id: waMessageId,
          source:        'baileys',
          status:        'pending',
        });

        if (error) {
          // wa_message_id has a UNIQUE constraint — duplicate = already saved, safe to ignore
          if (error.code === '23505') {
            console.log(`   ↳ duplicate (already stored), skipping`);
          } else {
            console.error('   ↳ Supabase error:', error.message);
          }
        } else {
          console.log(`   ↳ saved to chat ${chatId}`);
        }
      } catch (err) {
        console.error('   ↳ unexpected error:', err.message);
      }
    }
  });
}

// ─── Start ───────────────────────────────────────────────────────────────────

console.log('🚚  Freight 24 Messaging — WhatsApp Listener (Phase 1)');
console.log('   Supabase:', SUPABASE_URL);
console.log('   Groups mapped:', Object.keys(GROUP_TO_CHAT).length || '(none — add groups to GROUP_TO_CHAT)');
console.log('');

startListener().catch(console.error);
