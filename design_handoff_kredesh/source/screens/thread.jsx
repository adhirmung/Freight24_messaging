// Thread view — messages with inline extracted entity chips + right-side extraction panel

// Hardcoded extraction for the t1 demo thread
const T1_EXTRACTED = [
  { id: 'pro', label: 'Load ID', value: 'PRO 778‑441920', kind: 'pro', icon: 'pkg', tone: 'cyan' },
  { id: 'address-pickup', label: 'Pickup', value: 'Tualatin DC · 7800 SW Durham Rd, Tigard OR 97224', kind: 'address', icon: 'pin2', tone: 'blue' },
  { id: 'time-pickup', label: 'Pickup window', value: 'Today · wheels up 14:20 PT', kind: 'time', icon: 'clock', tone: 'blue' },
  { id: 'address-drop', label: 'Drop', value: 'Cascade Cold Storage · 1450 N Marine Dr, Portland OR 97217', kind: 'address', icon: 'pin2', tone: 'blue' },
  { id: 'time-drop', label: 'Delivery window', value: 'Wed 06:00–10:00 PT', kind: 'time', icon: 'clock', tone: 'blue' },
  { id: 'equipment', label: 'Equipment', value: '53′ dry van', kind: 'equipment', icon: 'truck', tone: 'cyan' },
  { id: 'pallets', label: 'Pallets', value: '24', kind: 'numeric', icon: 'pkg', tone: 'cyan' },
  { id: 'weight', label: 'Weight', value: '38,420 lbs', kind: 'numeric', icon: 'pkg', tone: 'cyan' },
  { id: 'detention', label: 'Detention risk', value: '~1.5 hr at Cascade', kind: 'risk', icon: 'warn', tone: 'warn' },
];

function ThreadView({ thread, user }) {
  const D = window.KredeshData;
  const [composer, setComposer] = React.useState('');
  const [showPanel, setShowPanel] = React.useState(true);
  React.useEffect(() => {
    const check = () => setShowPanel(window.innerWidth >= 1200);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  const [highlighted, setHighlighted] = React.useState(null);
  const [extractAnimating, setExtractAnimating] = React.useState(false);
  const [reAnalyzing, setReAnalyzing] = React.useState(false);
  // Dynamic extraction state — starts from thread.extraction (WhatsApp import) or hardcoded t1
  const [liveExtraction, setLiveExtraction] = React.useState(null);

  // Reset when thread changes
  React.useEffect(() => {
    setLiveExtraction(null);
    setHighlighted(null);
    setComposer('');
  }, [thread.id]);

  // Resolve participants
  const withUser = thread.with ? D.byId(D.users, thread.with) : null;
  const isChannel = thread.kind === 'channel';

  // Messages: thread.messages (WhatsApp import), t1 seed, or stub
  const messages = thread.messages || (thread.id === 't1' ? D.t1Messages : sampleMessages(thread, D));

  // Extraction data priority: re-analyzed → WhatsApp import → t1 hardcoded
  const activeExtraction = liveExtraction || thread.extraction || null;
  const extracted = activeExtraction?.fields || (thread.id === 't1' ? T1_EXTRACTED : []);
  const hasExtraction = extracted.length > 0;

  const threadTasks = D.tasks.filter(t => t.source === thread.id);

  // Composer extraction preview
  const previewExtraction = React.useMemo(() => parseComposerEntities(composer), [composer]);

  const handleSend = () => {
    if (!composer.trim()) return;
    setExtractAnimating(true);
    setTimeout(() => setExtractAnimating(false), 1200);
    setComposer('');
  };

  // Re-analyze all messages in this thread using Claude AI
  const handleReAnalyze = async () => {
    const apiKey = (() => { try { return localStorage.getItem('kredesh-claude-key') || ''; } catch { return ''; } })();
    if (!apiKey) { alert('Add your Claude API key in Settings → AI extraction first.'); return; }
    setReAnalyzing(true);
    setExtractAnimating(true);
    try {
      const textMessages = messages.map((m, i) => ({
        id: 'rm' + i,
        sender: D.byId(D.users, m.from)?.name || m.from || 'Unknown',
        time: m.at || '',
        body: m.segments.map(s => s.t).join(''),
      }));
      const result = await window.extractWithClaude(textMessages, apiKey);
      setLiveExtraction(result);
    } catch (e) {
      alert('Re-analysis failed: ' + e.message);
    } finally {
      setReAnalyzing(false);
      setTimeout(() => setExtractAnimating(false), 1200);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', minWidth: 0, background: 'var(--bg-0)' }}>
      {/* Center column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Thread header */}
        <div style={{
          padding: '12px 22px',
          borderBottom: '1px solid var(--line)',
          background: 'var(--bg-1)',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          {withUser ? <Avatar user={withUser} size={36} /> : (
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-3)', display: 'grid', placeItems: 'center', color: 'var(--ink-1)', fontFamily: 'var(--mono)', fontSize: 18 }}>
              {thread.tags?.includes('whatsapp') ? <WhatsAppIcon size={18} /> : '#'}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {thread.title}
              </h2>
              {thread.id === 't1' && <Pill tone="cyan">Load active</Pill>}
              {thread.tags?.includes('whatsapp') && <Pill tone="ok">WhatsApp</Pill>}
              {hasExtraction && thread.id !== 't1' && !thread.tags?.includes('whatsapp') && <Pill tone="blue">AI analyzed</Pill>}
            </div>
            <div style={{ display: 'flex', gap: 14, marginTop: 2, fontSize: 11.5, color: 'var(--ink-3)' }}>
              {withUser && <span>{withUser.role}</span>}
              {isChannel && <span>{D.channels.find(c => c.id === thread.channel)?.members || 12} members</span>}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span className="live-dot" /> Live · last seen just now
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button title="Link to shipment" style={iconBtnLg}><Icons.link size={15} stroke="var(--ink-2)" /></button>
            <button title="Pin" style={iconBtnLg}><Icons.pin size={15} stroke="var(--ink-2)" /></button>
            <button title="Re-analyze with Claude AI" onClick={handleReAnalyze}
              style={{ ...iconBtnLg, background: reAnalyzing ? 'var(--brand-soft)' : 'transparent', borderColor: reAnalyzing ? 'rgba(59,130,246,0.4)' : 'transparent' }}>
              <Icons.refresh size={15} stroke={reAnalyzing ? 'var(--brand)' : 'var(--ink-2)'} />
            </button>
            <button title="Toggle extraction panel" onClick={() => setShowPanel(p => !p)}
              style={{ ...iconBtnLg, background: showPanel ? 'var(--bg-3)' : 'transparent', borderColor: showPanel ? 'var(--line-2)' : 'transparent' }}>
              <Icons.spark size={15} stroke={showPanel ? 'var(--brand)' : 'var(--ink-2)'} />
            </button>
            <button title="More" style={iconBtnLg}><Icons.more size={15} stroke="var(--ink-2)" /></button>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 28px' }}>
          {/* Day stamp */}
          <div style={{ textAlign: 'center', margin: '6px 0 22px' }}>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', letterSpacing: 0.6, textTransform: 'uppercase', background: 'var(--bg-1)', padding: '3px 10px', borderRadius: 999, border: '1px solid var(--line)' }}>
              Today · Tue, May 19
            </span>
          </div>

          {messages.map((m, i) => (
            <MessageRow key={m.id} m={m} prev={messages[i - 1]} user={user}
              onChipClick={(eid) => setHighlighted(h => h === eid ? null : eid)}
              highlighted={highlighted} />
          ))}

          {/* AI-extracted summary card: show for t1 or any thread with extraction */}
          {(thread.id === 't1' || hasExtraction) && threadTasks.length > 0 && (
            <ExtractedSummaryCard tasks={threadTasks.slice(0, 3)} fieldCount={extracted.length} />
          )}
          {/* WhatsApp import summary card when no tasks yet */}
          {hasExtraction && threadTasks.length === 0 && activeExtraction?.summary && (
            <div style={{ margin: '18px 0 6px 43px', padding: '12px 14px', background: 'linear-gradient(180deg, rgba(59,130,246,0.10), rgba(15,23,42,0))', border: '1px solid rgba(59,130,246,0.28)', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(59,130,246,0.2)', display: 'grid', placeItems: 'center' }}>
                  <Icons.spark size={13} stroke="#93C5FD" />
                </div>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: '#BFDBFE' }}>Kredesh extracted {extracted.length} field{extracted.length !== 1 ? 's' : ''}</span>
                <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginLeft: 'auto' }}>AI · just now</span>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.55 }}>{activeExtraction.summary}</div>
            </div>
          )}

          {/* Typing indicator */}
          {thread.id === 't1' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, color: 'var(--ink-3)', fontSize: 12 }}>
              {withUser && <Avatar user={withUser} size={20} />}
              <span><b style={{ color: 'var(--ink-2)' }}>{withUser?.name.split(' ')[0]}</b> is typing<TypingDots /></span>
            </div>
          )}
        </div>

        {/* Composer */}
        <div style={{ borderTop: '1px solid var(--line)', background: 'var(--bg-1)', padding: '14px 22px 18px' }}>
          {composer && previewExtraction.length > 0 && (
            <div style={{
              marginBottom: 10, padding: '8px 11px',
              background: 'var(--brand-soft)', border: '1px solid rgba(59,130,246,0.3)',
              borderRadius: 8, display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap',
            }}>
              <Icons.spark size={13} stroke="#93C5FD" />
              <span style={{ fontSize: 11.5, color: '#BFDBFE', fontWeight: 600 }}>Will extract:</span>
              {previewExtraction.map((p, i) => <span key={i} className="chip" style={{ pointerEvents: 'none' }}>{p.kind}: {p.value}</span>)}
            </div>
          )}

          <div style={{
            display: 'flex', flexDirection: 'column', gap: 8,
            padding: '11px 13px',
            background: 'var(--bg-2)', border: '1px solid var(--line-2)',
            borderRadius: 12,
          }}>
            <textarea
              value={composer}
              onChange={e => setComposer(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleSend(); } }}
              placeholder={`Message ${withUser?.name.split(' ')[0] || 'thread'}…  ⌥/ for AI extract`}
              rows={2}
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--ink-0)', fontSize: 14, lineHeight: 1.5, resize: 'none',
                fontFamily: 'var(--ui)', minHeight: 40,
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button style={iconBtnLg} title="Attach"><Icons.paper size={15} stroke="var(--ink-2)" /></button>
              <button style={iconBtnLg} title="Voice note"><Icons.mic size={15} stroke="var(--ink-2)" /></button>
              <button style={iconBtnLg} title="Link shipment"><Icons.pkg size={15} stroke="var(--ink-2)" /></button>
              <button style={iconBtnLg} title="Emoji"><Icons.smile size={15} stroke="var(--ink-2)" /></button>
              <button style={{ ...iconBtnLg, marginLeft: 4 }} title="AI suggest reply">
                <Icons.spark size={15} stroke="#93C5FD" />
              </button>
              <div style={{ flex: 1 }} />
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>⌘↵ to send</span>
              <Btn primary size="sm" onClick={handleSend} icon={<Icons.send size={13} />}>Send</Btn>
            </div>
          </div>

          {/* Quick suggestions */}
          {thread.id === 't1' && composer === '' && (
            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
              <SuggestChip text="POD required on delivery + temp log" onClick={setComposer} />
              <SuggestChip text="Confirm detention threshold (2 hr free)" onClick={setComposer} />
              <SuggestChip text="Push ETA to customer Wellspring Foods" onClick={setComposer} />
            </div>
          )}
        </div>
      </div>

      {/* Right extraction panel */}
      {showPanel && (
        <ExtractionPanel
          extracted={extracted}
          highlighted={highlighted}
          setHighlighted={setHighlighted}
          tasks={threadTasks}
          thread={thread}
          isStub={!hasExtraction}
          animating={extractAnimating || reAnalyzing}
          onReAnalyze={handleReAnalyze}
          confidence={activeExtraction?.confidence || null}
          summary={activeExtraction?.summary || null}
        />
      )}
    </div>
  );
}

const iconBtnLg = {
  width: 30, height: 30, display: 'grid', placeItems: 'center',
  background: 'transparent', border: '1px solid transparent',
  borderRadius: 7, color: 'var(--ink-2)', cursor: 'pointer',
};

function MessageRow({ m, prev, user, onChipClick, highlighted }) {
  const D = window.KredeshData;
  const u = D.byId(D.users, m.from);
  const isMe = u?.isMe;
  const sameAsPrev = prev?.from === m.from;

  return (
    <div style={{ display: 'flex', gap: 11, marginBottom: sameAsPrev ? 4 : 14, marginTop: sameAsPrev ? 0 : 4 }}>
      <div style={{ width: 32, flexShrink: 0 }}>
        {!sameAsPrev && <Avatar user={u} size={32} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {!sameAsPrev && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
            <span style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--ink-0)' }}>{u?.name.replace('You — ', '')}</span>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{u?.role}</span>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginLeft: 'auto' }}>{m.at}</span>
          </div>
        )}

        <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink-0)' }}>
          {m.segments.map((seg, i) => {
            if (!seg.hl) return <span key={i}>{seg.t}</span>;
            const isActive = highlighted === seg.entity;
            const cls = 'hl' + (seg.hl === 'cyan' ? ' cyan' : seg.hl === 'warn' ? ' warn' : '');
            return (
              <span key={i} className={cls}
                onClick={() => onChipClick?.(seg.entity)}
                style={{
                  filter: isActive ? 'brightness(1.4)' : undefined,
                  boxShadow: isActive ? '0 0 0 2px rgba(59,130,246,0.45)' : undefined,
                }}>
                {seg.t}
              </span>
            );
          })}
        </div>

        {/* Attachments */}
        {m.attachments && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 9, maxWidth: 380 }}>
            {m.attachments.map((a, i) => <DocAttachment key={i} a={a} />)}
          </div>
        )}

        {/* Voice note */}
        {m.voice && <VoiceNote v={m.voice} />}

        {/* Reactions */}
        {!sameAsPrev && m.id === 'm3' && (
          <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
            <Reaction emoji="✓" count={2} mine />
            <Reaction emoji="🚛" count={1} />
          </div>
        )}
      </div>
    </div>
  );
}

function DocAttachment({ a }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 11,
      padding: '9px 11px',
      background: 'var(--bg-2)', border: '1px solid var(--line)',
      borderRadius: 9,
    }}>
      <div style={{
        width: 32, height: 38, borderRadius: 5,
        background: 'linear-gradient(180deg, #1E293B, #0F172A)',
        border: '1px solid var(--line-2)',
        display: 'grid', placeItems: 'center',
        position: 'relative',
      }}>
        <span className="mono" style={{ fontSize: 8.5, color: '#93C5FD', fontWeight: 700 }}>PDF</span>
        <span style={{ position: 'absolute', top: -3, right: -3, width: 14, height: 14, borderRadius: 4, background: 'var(--brand)', color: '#fff', fontSize: 8, fontWeight: 700, display: 'grid', placeItems: 'center' }}>
          <Icons.check size={9} stroke="#fff" sw={2.2} />
        </span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-0)' }}>{a.name}</div>
        <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{a.type} · {a.size} · auto-attached to PRO 778‑441920</div>
      </div>
      <button style={iconBtnLg} title="Download"><Icons.download size={14} stroke="var(--ink-2)" /></button>
    </div>
  );
}

function VoiceNote({ v }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 11,
      padding: '9px 13px', marginTop: 9, maxWidth: 380,
      background: 'var(--bg-2)', border: '1px solid var(--line)',
      borderRadius: 999,
    }}>
      <button style={{
        width: 30, height: 30, borderRadius: 999,
        background: 'var(--brand)', border: 'none', display: 'grid', placeItems: 'center', color: '#fff', cursor: 'pointer',
      }}>
        <Icons.play size={13} stroke="#fff" fill="#fff" sw={0} />
      </button>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2, height: 24 }}>
        {v.waveform.map((h, i) => (
          <div key={i} style={{
            width: 2, height: Math.max(3, h),
            background: i < 8 ? 'var(--brand)' : 'var(--ink-4)',
            borderRadius: 1,
          }} />
        ))}
      </div>
      <span className="mono" style={{ fontSize: 11, color: 'var(--ink-2)' }}>{v.dur}</span>
      <span title="Transcribed" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#67E8F9' }}>
        <Icons.spark size={11} stroke="#67E8F9" /> Auto‑transcribed
      </span>
    </div>
  );
}

function Reaction({ emoji, count, mine }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 7px', borderRadius: 999,
      background: mine ? 'var(--brand-soft)' : 'var(--bg-3)',
      border: '1px solid', borderColor: mine ? 'rgba(59,130,246,0.4)' : 'var(--line)',
      fontSize: 11, color: mine ? '#93C5FD' : 'var(--ink-1)', fontWeight: 600,
    }}>
      <span style={{ fontSize: 11.5 }}>{emoji}</span> {count}
    </span>
  );
}

function TypingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: 3, marginLeft: 6, verticalAlign: 0 }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 4, height: 4, borderRadius: 999, background: 'var(--ink-3)',
          animation: `pulse-dot 1.2s ease-in-out ${i * 0.18}s infinite`,
        }} />
      ))}
    </span>
  );
}

function SuggestChip({ text, onClick }) {
  return (
    <button onClick={() => onClick(text)} style={{
      padding: '5px 10px', fontSize: 11.5,
      background: 'var(--bg-2)', border: '1px dashed var(--line-2)',
      color: 'var(--ink-1)', borderRadius: 999, cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', gap: 5,
    }}>
      <Icons.spark size={11} stroke="#93C5FD" /> {text}
    </button>
  );
}

function ExtractedSummaryCard({ tasks, fieldCount }) {
  return (
    <div style={{
      marginTop: 18, marginBottom: 6,
      padding: '14px 16px',
      background: 'linear-gradient(180deg, rgba(59,130,246,0.10), rgba(15,23,42,0))',
      border: '1px solid rgba(59,130,246,0.28)',
      borderRadius: 12, marginLeft: 43,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(59,130,246,0.2)', display: 'grid', placeItems: 'center' }}>
          <Icons.spark size={13} stroke="#93C5FD" />
        </div>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: '#BFDBFE' }}>
          Kredesh extracted {fieldCount || 8} fields and created {tasks.length} task{tasks.length !== 1 ? 's' : ''}
        </span>
        <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginLeft: 'auto' }}>auto · just now</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {tasks.map(t => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '6px 8px', borderRadius: 7, background: 'rgba(15,23,42,0.5)' }}>
            <TaskCheckbox status={t.status} />
            <span style={{ flex: 1, fontSize: 12.5, color: t.status === 'complete' ? 'var(--ink-3)' : 'var(--ink-0)', textDecoration: t.status === 'complete' ? 'line-through' : 'none' }}>
              {t.title}
            </span>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{t.due}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TaskCheckbox({ status, onClick }) {
  const map = {
    complete: { bg: 'var(--ok)', icon: <Icons.check size={11} stroke="#0B1220" sw={2.4}/> },
    pending:  { bg: 'transparent', border: '1.5px solid var(--ink-3)', icon: null },
    incomplete: { bg: 'transparent', border: '1.5px solid var(--bad)', icon: <span style={{ width: 8, height: 8, background: 'var(--bad)', borderRadius: 999 }} /> },
  };
  const s = map[status] || map.pending;
  return (
    <button onClick={onClick} style={{
      width: 16, height: 16, borderRadius: 5,
      background: s.bg, border: s.border || '1.5px solid transparent',
      display: 'grid', placeItems: 'center', flexShrink: 0,
      cursor: 'pointer', padding: 0,
    }}>
      {s.icon}
    </button>
  );
}

function ExtractionPanel({ extracted, highlighted, setHighlighted, tasks, thread, isStub, animating, onReAnalyze, confidence, summary }) {
  // For t1 demo, use hardcoded shipment card; for dynamic extractions skip the shipment map
  const showShipmentCard = thread.id === 't1' && !thread.extraction;

  const confidenceData = confidence
    ? [
        { label: 'Addresses', v: confidence.addresses || 0 },
        { label: 'IDs', v: confidence.ids || 0 },
        { label: 'Time windows', v: confidence.times || 0 },
        { label: 'Risk signals', v: confidence.risk || 0 },
      ]
    : thread.id === 't1' ? [
        { label: 'Addresses', v: 98 },
        { label: 'PRO / IDs', v: 100 },
        { label: 'Time windows', v: 92 },
        { label: 'Risk signals', v: 76 },
      ] : null;

  return (
    <aside style={{
      width: 320, flexShrink: 0,
      background: 'var(--bg-1)',
      borderLeft: '1px solid var(--line)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icons.spark size={14} stroke="#93C5FD" />
        <span style={{ fontSize: 13, fontWeight: 600 }}>Extracted data</span>
        {animating && <span className="mono" style={{ fontSize: 10, color: '#93C5FD', marginLeft: 'auto' }}>re-analyzing<TypingDots /></span>}
        {!animating && !isStub && (
          <button onClick={onReAnalyze} title="Re-analyze with Claude AI" style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--ink-3)', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}>
            <Icons.refresh size={13} stroke="var(--ink-3)" />
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '12px 14px' }}>
        {isStub ? (
          <div style={{ padding: '40px 14px', textAlign: 'center', color: 'var(--ink-3)' }}>
            <Icons.spark size={26} stroke="var(--ink-4)" />
            <div style={{ marginTop: 12, fontSize: 12.5 }}>Nothing extracted from this thread yet.</div>
            <div style={{ marginTop: 8, fontSize: 11.5, color: 'var(--ink-4)', lineHeight: 1.6 }}>
              Click <Icons.refresh size={11} stroke="var(--ink-4)" /> above to analyze with Claude AI,<br />
              or import messages via WhatsApp import.
            </div>
            <button onClick={onReAnalyze} style={{ marginTop: 14, padding: '6px 14px', background: 'var(--brand-soft)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 7, color: '#93C5FD', fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icons.spark size={12} stroke="#93C5FD" /> Analyze with AI
            </button>
          </div>
        ) : (
          <React.Fragment>
            {/* Linked shipment — only for the demo t1 thread */}
            {showShipmentCard && (
              <React.Fragment>
                <SectionLabel>Linked shipment</SectionLabel>
                <div style={{ padding: 12, background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 10, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span className="mono" style={{ fontSize: 11, color: '#67E8F9', fontWeight: 700 }}>PRO 778‑441920</span>
                    <Pill tone="cyan">In transit</Pill>
                  </div>
                  <RouteMini />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11.5 }}>
                    <div>
                      <div style={{ color: 'var(--ink-3)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>ETA</div>
                      <div className="mono" style={{ color: 'var(--ink-0)', fontWeight: 600 }}>13:48 PT</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--ink-3)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Carrier</div>
                      <div style={{ color: 'var(--ink-0)', fontWeight: 600 }}>Northbound</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--ink-3)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Driver</div>
                      <div style={{ color: 'var(--ink-0)', fontWeight: 600 }}>A. Whitehorse</div>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            )}

            {/* AI summary for dynamic extractions */}
            {summary && !showShipmentCard && (
              <div style={{ marginBottom: 14, padding: '9px 11px', background: 'var(--brand-soft)', border: '1px solid rgba(59,130,246,0.22)', borderRadius: 8, fontSize: 12, color: '#BFDBFE', lineHeight: 1.55 }}>
                {summary}
              </div>
            )}

            <SectionLabel>Fields ({extracted.length})</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
              {extracted.map(e => <ExtractedField key={e.id} e={e} active={highlighted === e.id} onClick={() => setHighlighted(h => h === e.id ? null : e.id)} />)}
            </div>

            <SectionLabel right={<Pill tone="blue">{tasks.length} created</Pill>}>Auto‑tasks</SectionLabel>
            {tasks.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                {tasks.map(t => <SidebarTaskRow key={t.id} t={t} />)}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: 'var(--ink-4)', marginBottom: 16, padding: '8px 10px', background: 'var(--bg-2)', borderRadius: 8, border: '1px solid var(--line)' }}>
                No tasks created yet. Tasks auto-populate when extraction generates action items.
              </div>
            )}

            {confidenceData && (
              <React.Fragment>
                <SectionLabel>Confidence</SectionLabel>
                <ConfidenceBar data={confidenceData} />
              </React.Fragment>
            )}

            <div style={{ marginTop: 16, padding: 11, background: 'var(--bg-2)', border: '1px dashed var(--line-2)', borderRadius: 10 }}>
              <div style={{ fontSize: 11.5, color: 'var(--ink-2)', lineHeight: 1.5 }}>
                <Icons.spark size={12} stroke="#93C5FD" /> Anything wrong?
                Click any field to jump to its source, or{' '}
                <button onClick={onReAnalyze} style={{ background: 'none', border: 'none', color: '#93C5FD', cursor: 'pointer', padding: 0, fontSize: 11.5 }}>request a re-analysis</button>.
              </div>
            </div>
          </React.Fragment>
        )}
      </div>
    </aside>
  );
}

function SectionLabel({ children, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
      <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: 0.7, textTransform: 'uppercase' }}>{children}</span>
      {right}
    </div>
  );
}

function ExtractedField({ e, active, onClick }) {
  const Ico = Icons[e.icon] || Icons.pkg;
  const toneColor = { blue: '#93C5FD', cyan: '#67E8F9', warn: '#FCD34D' }[e.tone] || '#93C5FD';
  return (
    <button onClick={onClick} style={{
      display: 'flex', gap: 9, alignItems: 'flex-start',
      padding: '8px 10px', textAlign: 'left',
      background: active ? 'var(--bg-3)' : 'var(--bg-2)',
      border: '1px solid', borderColor: active ? toneColor : 'var(--line)',
      borderRadius: 9, cursor: 'pointer',
      transition: 'border-color .12s ease',
    }}>
      <Ico size={14} stroke={toneColor} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 2 }}>{e.label}</div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-0)', fontWeight: 500, lineHeight: 1.35, wordBreak: 'break-word' }}>{e.value}</div>
      </div>
      <Icons.copy size={12} stroke="var(--ink-4)" />
    </button>
  );
}

function SidebarTaskRow({ t }) {
  const D = window.KredeshData;
  const assignee = D.byId(D.users, t.assignee);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 9,
      padding: '8px 10px',
      background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 9,
    }}>
      <TaskCheckbox status={t.status} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, color: t.status === 'complete' ? 'var(--ink-3)' : 'var(--ink-0)', textDecoration: t.status === 'complete' ? 'line-through' : 'none', lineHeight: 1.35 }}>
          {t.title}
        </div>
        <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>
          {assignee?.initials || '—'} · {t.due}
        </div>
      </div>
    </div>
  );
}

function ConfidenceBar({ data }) {
  const items = data || [
    { label: 'Addresses', v: 98 },
    { label: 'PRO / IDs', v: 100 },
    { label: 'Time windows', v: 92 },
    { label: 'Risk signals', v: 76 },
  ];
  return (
    <div style={{ padding: 10, background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 9, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map(i => (
        <div key={i.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ flex: 1, fontSize: 11.5, color: 'var(--ink-2)' }}>{i.label}</span>
          <div style={{ width: 100, height: 5, background: 'var(--bg-3)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: i.v + '%', height: '100%', background: i.v > 90 ? 'var(--ok)' : i.v > 80 ? 'var(--brand)' : 'var(--warn)' }} />
          </div>
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-1)', width: 28, textAlign: 'right' }}>{i.v}%</span>
        </div>
      ))}
    </div>
  );
}

function RouteMini() {
  return (
    <div style={{ padding: 8, background: 'var(--bg-3)', borderRadius: 7, position: 'relative', overflow: 'hidden' }}>
      <svg width="100%" height="60" viewBox="0 0 280 60" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="rg" x1="0" x2="1">
            <stop offset="0" stopColor="#22D3EE" />
            <stop offset="1" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
        {/* dashed remainder */}
        <path d="M16 30 C 90 5, 180 55, 264 30" stroke="#334155" strokeWidth="1.6" strokeDasharray="3 3" fill="none" />
        {/* completed portion */}
        <path d="M16 30 C 90 5, 180 55, 264 30" stroke="url(#rg)" strokeWidth="2.2" fill="none"
          pathLength="100" strokeDasharray="62 100" />
        <circle cx="16" cy="30" r="4" fill="#67E8F9" />
        <circle cx="264" cy="30" r="4" fill="#0B1220" stroke="#94A3B8" strokeWidth="1.4" />
        {/* truck position */}
        <g transform="translate(170,18)">
          <rect x="-10" y="0" width="20" height="9" rx="1.5" fill="#3B82F6" stroke="#0B1220" />
          <circle cx="-5" cy="11" r="2" fill="#0B1220" stroke="#3B82F6" />
          <circle cx="5" cy="11" r="2" fill="#0B1220" stroke="#3B82F6" />
        </g>
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: 'var(--ink-2)', marginTop: 2 }}>
        <span>Tualatin DC</span>
        <span style={{ color: 'var(--ink-3)' }}>62% · 11 mi left</span>
        <span>Cascade Cold</span>
      </div>
    </div>
  );
}

// Simple stub message thread for non-t1 conversations
function sampleMessages(thread, D) {
  const other = thread.with ? D.byId(D.users, thread.with) : D.users[1];
  if (thread.kind === 'channel') {
    return [
      { id: 'cm1', from: 'u2', at: '08:14', segments: [{ t: thread.preview }] },
      { id: 'cm2', from: 'u1', at: '08:18', segments: [{ t: 'Acknowledged — pushing alert to all driver apps.' }] },
      { id: 'cm3', from: 'u5', at: '08:22', segments: [{ t: 'Copy. Already on OR‑35, ETA holds.' }] },
    ];
  }
  return [
    { id: 'sm1', from: other?.id || 'u2', at: '10:55', segments: [{ t: thread.preview }] },
    { id: 'sm2', from: 'me', at: '11:02', segments: [{ t: 'Got it — assigning a task for follow-up.' }] },
  ];
}

// Very simple "extraction" preview for composer
function parseComposerEntities(text) {
  if (!text) return [];
  const out = [];
  const pro = text.match(/PRO\s*\d{3}[-‑]?\d{6}/i);
  if (pro) out.push({ kind: 'PRO', value: pro[0] });
  const wt = text.match(/(\d{2,3}[, ]\d{3})\s*lbs?/i);
  if (wt) out.push({ kind: 'Weight', value: wt[0] });
  const palette = text.match(/(\d{1,3})\s*pallets?/i);
  if (palette) out.push({ kind: 'Pallets', value: palette[0] });
  const time = text.match(/(\d{1,2}:\d{2}\s*(am|pm|PT|ET)?)/i);
  if (time) out.push({ kind: 'Time', value: time[0] });
  return out;
}

Object.assign(window, { ThreadView, TaskCheckbox });
