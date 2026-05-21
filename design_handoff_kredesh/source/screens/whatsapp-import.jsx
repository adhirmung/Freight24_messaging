// WhatsApp import modal with Claude AI extraction

// ── WhatsApp chat parser ──────────────────────────────────────────────────────
function parseWhatsAppText(raw) {
  if (!raw || !raw.trim()) return [];
  const messages = [];

  // Detect exported format: [DD/MM/YYYY, HH:MM:SS] Name: body
  // or Android export:       DD/MM/YYYY, HH:MM - Name: body
  const hasExportFormat = /\[?\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(raw.split('\n')[0]) ||
    /\[?\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(raw.split('\n').slice(0, 6).join('\n'));

  if (hasExportFormat) {
    // Matches both [DD/MM/YY, HH:MM] and DD/MM/YY, HH:MM -
    const pat = /\[?(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}),\s*(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[aApP][mM])?)\]?\s*[-–]\s*([^:]+):\s*([\s\S]*?)(?=\[?\d{1,2}[\/\-]\d{1,2}[\/\-]|$)/g;
    let m;
    while ((m = pat.exec(raw)) !== null) {
      const body = m[4].trim();
      if (body && m[3].trim() !== 'Messages and calls are end-to-end encrypted') {
        messages.push({ id: 'wm' + messages.length, sender: m[3].trim(), date: m[1], time: m[2], body });
      }
    }
    if (messages.length > 0) return messages;
  }

  // Manual / screenshot block format:
  //   Sender Name          ← short capitalized line
  //   Message line 1
  //   Message line 2
  //   HH:MM                ← timestamp ends the block
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  const timeRx = /^(\d{1,2}:\d{2}(?:\s*[aApP][mM])?)\s*(?:→\s*\d{1,2}:\d{2})?$/;
  // Sender heuristic: 1–6 words, mostly letters, no colon, shorter than 45 chars
  const senderRx = /^[A-ZÀ-Ö][A-Za-zÀ-öÙ-ý0-9\s\-\.]{1,44}$/;

  let currentSender = null, currentBody = [], currentTime = '';

  const flush = () => {
    if (currentSender && currentBody.length > 0) {
      messages.push({ id: 'wm' + messages.length, sender: currentSender, time: currentTime, body: currentBody.join('\n') });
    }
    currentSender = null; currentBody = []; currentTime = '';
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (timeRx.test(line)) {
      currentTime = line.replace(/→.*/, '').trim();
      flush();
      continue;
    }
    const wordCount = line.split(/\s+/).length;
    if (senderRx.test(line) && wordCount <= 5 && currentBody.length === 0) {
      if (currentSender) flush();
      currentSender = line;
    } else {
      if (!currentSender) currentSender = 'Unknown';
      currentBody.push(line);
    }
  }
  flush();

  return messages;
}

// ── Claude API extraction ──────────────────────────────────────────────────────
async function extractWithClaude(messages, apiKey) {
  const text = messages.map(m => {
    const ts = m.date ? `[${m.date} ${m.time}]` : m.time ? `[${m.time}]` : '';
    return `${ts} ${m.sender}: ${m.body}`;
  }).join('\n\n');

  const systemPrompt = `You are a logistics data extraction AI for Freight 24 Messaging, a South African freight and logistics company.
Your job: analyze WhatsApp chat messages from drivers, dispatchers, carriers, and warehouse staff, then return structured JSON.

South African freight terminology you must recognize:
- "Horse" = truck cab/prime mover. Registrations like CT17549, CA123456 (province prefix + numbers)
- "Trailer" = semi-trailer. Multiple trailers per horse are common ("Trailer 1", "Trailer 2")
- Container IDs start with letters + numbers: FSCU8065100, IS068750, TEMU12345, MSCU9876
- Container sizes: 20ft, 40ft, 12m, 6m
- DBN = Durban, JHB/JNB = Johannesburg, CPT/CTN = Cape Town, PE = Port Elizabeth
- Cargo: SLES (sodium lauryl ether sulphate, a liquid chemical), Allied (Allied chemicals), Slackwax (petroleum wax), Caustic Soda (NaOH), NIS slings (sodium silicate), prime cargo
- "F24" / "Freight 24" / "Freight 24 Messaging" = the company
- "Unpack teams" = warehouse workers assigned to unload containers
- Loading plan with dates + X counts = how many containers load on each day
- "Horse" cell/phone = driver's contact number
- ID number = South African national ID (13 digits)
- ETA given as "08h45" or "14:00" format`;

  const userPrompt = `Extract all logistics information from these WhatsApp messages and return ONLY valid JSON (no markdown, no explanation).

MESSAGES:
${text}

Return this exact JSON structure:
{
  "fields": [
    {
      "id": "unique-kebab-id",
      "label": "Human-readable label (e.g. Container ID, Driver, Horse Reg, Pickup Location)",
      "value": "The extracted value exactly as in messages",
      "kind": "pro OR address OR time OR equipment OR driver OR carrier OR cargo OR numeric OR risk",
      "icon": "pkg OR pin2 OR clock OR truck OR user OR warn OR hash OR building",
      "tone": "blue OR cyan OR warn OR ok"
    }
  ],
  "tasks": [
    {
      "title": "Specific actionable task for the ops team",
      "priority": "high OR med OR low",
      "due": "Timeframe e.g. Today, Today 08:45, Wed 14:00"
    }
  ],
  "confidence": {
    "addresses": 0-100,
    "ids": 0-100,
    "times": 0-100,
    "risk": 0-100
  },
  "summary": "One sentence describing what this conversation is about",
  "thread_title": "Short title for inbox e.g. Joeys Linehaul — SLES to Tristar",
  "thread_kind": "carrier OR driver OR warehouse OR broker"
}

Extraction rules:
- Container IDs → kind:"pro", icon:"pkg", tone:"cyan"
- Horse/Trailer registrations → kind:"equipment", icon:"truck", tone:"cyan"
- Driver name/contact → kind:"driver", icon:"user", tone:"blue"
- Carrier/transporter name → kind:"carrier", icon:"building", tone:"blue"
- Pickup/loading location → kind:"address", icon:"pin2", tone:"blue"
- Delivery/destination → kind:"address", icon:"pin2", tone:"blue"
- Cargo type and quantity → kind:"cargo", icon:"pkg", tone:"cyan"
- Loading/delivery dates → kind:"time", icon:"clock", tone:"blue"
- ETA times → kind:"time", icon:"clock", tone:"ok"
- Container counts/quantities → kind:"numeric", icon:"hash", tone:"cyan"
- Any problem, delay or risk → kind:"risk", icon:"warn", tone:"warn"
- Unpack team booking → kind:"numeric", icon:"users", tone:"blue"

Generate tasks for: confirming deliveries, tracking arrivals, coordinating unpack teams, verifying vehicle details, logging cargo, following up on ETAs.`;

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-request-allowed': 'true',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-7',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${resp.status}`);
  }

  const data = await resp.json();
  const content = data.content?.[0]?.text || '';
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in Claude response');
  return JSON.parse(jsonMatch[0]);
}

// ── WhatsApp icon SVG ─────────────────────────────────────────────────────────
function WhatsAppIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#22C55E">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );
}

// ── Step 1: Paste raw text ─────────────────────────────────────────────────────
function StepPaste({ raw, setRaw, error, apiKey }) {
  return (
    <div>
      <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6 }}>
        Paste WhatsApp chat text below. Freight 24 Messaging will parse each message, then use Claude AI to extract logistics fields, generate tasks, and create a new thread in your inbox.
      </p>

      {!apiKey && (
        <div style={{
          marginBottom: 14, padding: '10px 13px',
          background: 'var(--warn-soft)', border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 8, fontSize: 12, color: '#FCD34D',
          display: 'flex', alignItems: 'flex-start', gap: 8,
        }}>
          <Icons.warn size={14} stroke="#FCD34D" style={{ flexShrink: 0, marginTop: 1 }} />
          <span>No Claude API key configured — AI extraction will be unavailable. Add your key in <strong>Settings → AI extraction</strong>.</span>
        </div>
      )}

      <div style={{ marginBottom: 10, fontSize: 11.5, color: 'var(--ink-3)', lineHeight: 1.7 }}>
        <strong style={{ color: 'var(--ink-2)' }}>Accepted formats:</strong><br />
        <span className="mono">{'[DD/MM/YY, HH:MM] Name: Message'}</span>  — WhatsApp iOS export<br />
        <span className="mono">{'DD/MM/YY, HH:MM - Name: Message'}</span>  — WhatsApp Android export<br />
        Name / message lines / HH:MM  — manual block paste from screenshots
      </div>

      <textarea
        autoFocus
        value={raw}
        onChange={e => setRaw(e.target.value)}
        placeholder={`[13/01/2025, 08:15:00] Nerishka F24: Hi All\nPlease see below details for Joeys truck loading out SLES today for delivery to Tristar, Prospecton\n\nJOEYS LINEHAUL\nCustomer ID - Freight 24\nDriver - Eugene\nHorse - CT17549\nTrailer 1 - CT26295\nTrailer 2 - CT26343\nCell = 0726117096\nEta - 08h45`}
        rows={13}
        style={{
          width: '100%', boxSizing: 'border-box', padding: '11px 13px',
          background: 'var(--bg-2)', border: '1px solid var(--line-2)',
          borderRadius: 10, color: 'var(--ink-0)',
          fontSize: 12.5, fontFamily: 'var(--mono)', lineHeight: 1.7,
          resize: 'vertical', outline: 'none',
        }}
      />

      {error && (
        <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--bad-soft)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 7, fontSize: 12, color: '#FCA5A5' }}>
          {error}
        </div>
      )}
    </div>
  );
}

// ── Step 2: Preview parsed messages + trigger extraction ──────────────────────
function StepPreview({ messages, loading, error }) {
  return (
    <div>
      {!loading && (
        <div style={{ marginBottom: 14, padding: '9px 12px', background: 'var(--brand-soft)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 8, fontSize: 12.5, color: '#BFDBFE', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icons.spark size={13} stroke="#93C5FD" />
          Parsed <strong>{messages.length}</strong> message{messages.length !== 1 ? 's' : ''}. Click <strong>Extract with AI</strong> to analyze with Claude.
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-2)' }}>
          <div style={{ marginBottom: 14, opacity: 0.8 }}><Icons.spark size={32} stroke="#93C5FD" /></div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Claude is analyzing messages…</div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6 }}>Identifying entities, extracting fields, generating tasks</div>
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 5 }}>
            {[0,1,2].map(i => (
              <span key={i} style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--brand)', animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
          </div>
        </div>
      )}

      {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {messages.map(m => (
            <div key={m.id} style={{ padding: '10px 13px', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 9 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-0)' }}>{m.sender}</span>
                {m.date && <span className="mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>{m.date}</span>}
                {m.time && <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginLeft: 'auto' }}>{m.time}</span>}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-1)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{m.body}</div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div style={{ marginTop: 14, padding: '11px 13px', background: 'var(--bad-soft)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, fontSize: 12.5, color: '#FCA5A5' }}>
          <div style={{ fontWeight: 700, marginBottom: 5 }}>Extraction failed</div>
          <div style={{ lineHeight: 1.6 }}>{error}</div>
          <div style={{ marginTop: 8, color: 'var(--ink-3)', fontSize: 11.5 }}>
            If you see a CORS error: the Anthropic API requires a server-side proxy in production. For local dev, try disabling CORS in your browser or use a proxy like <span className="mono">cors-anywhere</span>.
          </div>
        </div>
      )}
    </div>
  );
}

// ── Step 3: Review extracted data and confirm thread creation ─────────────────
function StepConfirm({ extraction, messages }) {
  const toneColor = { blue: '#93C5FD', cyan: '#67E8F9', warn: '#FCD34D', ok: '#86EFAC' };

  return (
    <div>
      {/* AI summary */}
      <div style={{ padding: '13px 15px', marginBottom: 18, background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(34,211,238,0.06))', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 11 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(59,130,246,0.2)', display: 'grid', placeItems: 'center' }}>
            <Icons.spark size={13} stroke="#93C5FD" />
          </div>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: '#BFDBFE' }}>AI Summary</span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginLeft: 'auto' }}>
            {extraction.fields?.length || 0} fields · {extraction.tasks?.length || 0} tasks
          </span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-1)', lineHeight: 1.6 }}>{extraction.summary}</div>
        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--ink-3)' }}>
          Thread will be created as: <span className="chip" style={{ marginLeft: 4 }}>{extraction.thread_title || 'WhatsApp thread'}</span>
        </div>
      </div>

      {/* Extracted fields */}
      {extraction.fields?.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 9 }}>
            Extracted fields ({extraction.fields.length})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {extraction.fields.map(f => {
              const Ico = Icons[f.icon] || Icons.pkg;
              const color = toneColor[f.tone] || '#93C5FD';
              return (
                <div key={f.id} style={{ padding: '9px 11px', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 8, display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                  <Ico size={13} stroke={color} style={{ flexShrink: 0, marginTop: 1 }} />
                  <div style={{ minWidth: 0 }}>
                    <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{f.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-0)', marginTop: 2, fontWeight: 500, wordBreak: 'break-word' }}>{f.value}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Auto-tasks */}
      {extraction.tasks?.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 9 }}>
            Auto-tasks ({extraction.tasks.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {extraction.tasks.map((t, i) => (
              <div key={i} style={{ padding: '9px 11px', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                <TaskCheckbox status="pending" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-0)' }}>{t.title}</div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>{t.due}</div>
                </div>
                <Pill tone={t.priority === 'high' ? 'bad' : t.priority === 'med' ? 'warn' : 'neutral'}>{t.priority}</Pill>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confidence */}
      {extraction.confidence && (
        <div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 9 }}>Confidence</div>
          <div style={{ padding: '10px 12px', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 7 }}>
            {Object.entries(extraction.confidence).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ flex: 1, fontSize: 11.5, color: 'var(--ink-2)', textTransform: 'capitalize' }}>{k}</span>
                <div style={{ width: 100, height: 5, background: 'var(--bg-3)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: v + '%', height: '100%', background: v > 90 ? 'var(--ok)' : v > 75 ? 'var(--brand)' : 'var(--warn)', transition: 'width .4s ease' }} />
                </div>
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-1)', width: 30, textAlign: 'right' }}>{v}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main modal component ──────────────────────────────────────────────────────
function WhatsAppImportModal({ onClose, onImport }) {
  const [step, setStep] = React.useState(1);
  const [raw, setRaw] = React.useState('');
  const [messages, setMessages] = React.useState([]);
  const [extraction, setExtraction] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const apiKey = React.useMemo(() => {
    try { return localStorage.getItem('kredesh-claude-key') || ''; } catch { return ''; }
  }, []);

  const handleParse = () => {
    setError(null);
    const parsed = parseWhatsAppText(raw);
    if (parsed.length === 0) {
      setError('Could not parse any messages. Check the format — paste the exported chat text or use Name / message / HH:MM blocks.');
      return;
    }
    setMessages(parsed);
    setStep(2);
  };

  const handleExtract = async () => {
    if (!apiKey) {
      setError('No Claude API key. Add it in Settings → AI extraction, then try again.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await extractWithClaude(messages, apiKey);
      setExtraction(result);
      setError(null);
      setStep(3);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    const D = window.KredeshData;
    const chatId = 'wa-' + Date.now();

    // Build chat messages with matched or synthesised users
    const userCache = {};
    const chatMessages = messages.map((m, i) => {
      const key = m.sender.toLowerCase();
      if (!userCache[key]) {
        const match = D.users.find(u => {
          const n = u.name.toLowerCase().replace('you — ', '');
          return n.includes(m.sender.toLowerCase().split(' ')[0]) || m.sender.toLowerCase().includes(n.split(' ')[0]);
        });
        if (match) {
          userCache[key] = match.id;
        } else {
          const uid = 'ext-' + key.replace(/\s+/g, '-').slice(0, 14) + '-' + i;
          const initials = m.sender.split(/\s+/).map(w => w[0] || '').join('').slice(0, 2).toUpperCase() || '??';
          const hue = ((m.sender.charCodeAt(0) || 60) * 37 + (m.sender.charCodeAt(1) || 60) * 53) % 360;
          D.users.push({ id: uid, name: m.sender, role: 'External', team: 'External', status: 'offline', avatar: `hsl(${hue},55%,48%)`, initials });
          userCache[key] = uid;
        }
      }
      return { id: chatId + '_m' + i, from: userCache[key], at: m.time || '', segments: [{ t: m.body }] };
    });

    // Create new chat in chats array
    const newChat = {
      id: chatId,
      name: extraction?.thread_title || (messages[0]?.sender + ' — WhatsApp'),
      kind: 'whatsapp',
      preview: messages[messages.length - 1]?.body?.slice(0, 90) || '',
      lastAt: 'Just now',
      unread: 0,
      members: [],
      messages: chatMessages,
      extraction: extraction || null,
      confidence: extraction?.confidence || null,
    };
    D.chats.unshift(newChat);

    // Register extracted tasks
    if (extraction?.tasks?.length) {
      extraction.tasks.forEach((t, i) => {
        D.tasks.unshift({
          id: chatId + '_t' + i,
          title: t.title,
          chat: chatId,
          status: 'pending',
          assignee: 'me',
          due: t.due || 'Today',
          priority: t.priority || 'med',
          extractedFrom: extraction.summary || 'WhatsApp import',
        });
      });
    }

    onImport({ chatId });
    onClose();
  };

  const stepLabels = ['Paste chat', 'Preview', 'Confirm'];

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(7,11,20,0.72)', backdropFilter: 'blur(4px)',
      display: 'grid', placeItems: 'center',
      zIndex: 50,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 'min(700px, 96vw)', maxHeight: '90vh',
        background: 'var(--bg-1)', border: '1px solid var(--line-2)',
        borderRadius: 14, overflow: 'hidden',
        boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <WhatsAppIcon size={16} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Import from WhatsApp</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>Step {step} of 3 · {stepLabels[step - 1]}</div>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: 5 }}>
            {[1,2,3].map(s => (
              <div key={s} style={{ width: s < step ? 24 : 6, height: 6, background: s <= step ? 'var(--brand)' : 'var(--bg-3)', borderRadius: 999, transition: 'all .3s ease' }} />
            ))}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--ink-3)', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: '0 4px', marginLeft: 8 }}>×</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          {step === 1 && <StepPaste raw={raw} setRaw={setRaw} error={error} apiKey={apiKey} />}
          {step === 2 && <StepPreview messages={messages} loading={loading} error={error} />}
          {step === 3 && extraction && <StepConfirm extraction={extraction} messages={messages} />}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 8 }}>
          {step > 1 && !loading && (
            <Btn ghost size="sm" onClick={() => { setStep(s => s - 1); setError(null); }}>← Back</Btn>
          )}
          <div style={{ flex: 1 }} />
          <Btn ghost size="sm" onClick={onClose}>Cancel</Btn>
          {step === 1 && (
            <Btn primary size="sm" onClick={handleParse} icon={<Icons.arrow size={13} />}>Parse messages</Btn>
          )}
          {step === 2 && (
            <Btn primary size="sm" onClick={handleExtract} icon={<Icons.spark size={13} />} style={{ opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Extracting…' : apiKey ? 'Extract with AI' : 'Extract (no key)'}
            </Btn>
          )}
          {step === 3 && (
            <Btn primary size="sm" onClick={handleCreate} icon={<Icons.plus size={13} />}>Create chat & tasks</Btn>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { WhatsAppImportModal, parseWhatsAppText, extractWithClaude, WhatsAppIcon });
