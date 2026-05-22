// Chats — WhatsApp-style chat list + chat view + extraction panel
function ChatsScreen({ route, setRoute, user, sbUser }) {
  const D = window.KredeshData;

  const [chats]      = React.useState(() => D.chats);
  const activeId     = route.chatId || 'c1';
  const active       = chats.find(c => c.id === activeId) || chats[0];
  const [showPanel, setShowPanel] = React.useState(() => window.innerWidth >= 1180);
  const [dbMessages, setDbMessages] = React.useState([]);
  const { isMobile, isTablet } = useResponsive();
  const [mobileChatOpen, setMobileChatOpen] = React.useState(false);

  const fmtTime = (iso) => {
    const d = new Date(iso);
    return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
  };
  const rowToMsg = (row) => ({
    id:       row.id,
    from:     row.sender_id === sbUser?.id ? 'me' : (row.sender?.name || row.sender_id || 'unknown'),
    at:       fmtTime(row.sent_at),
    segments: [{ t: row.body }],
    status:   'sent',
  });

  // Load messages from DB whenever active chat changes
  React.useEffect(() => {
    if (!sbUser) return;
    setDbMessages([]);
    sb.from('messages')
      .select('id, body, sent_at, sender_id, sender:profiles(name)')
      .eq('chat_id', activeId)
      .order('sent_at', { ascending: true })
      .then(({ data }) => { if (data) setDbMessages(data.map(rowToMsg)); });
  }, [activeId, sbUser?.id]);

  // Real-time subscription for new messages from other users
  React.useEffect(() => {
    if (!sbUser) return;
    const channel = sb.channel(`msgs_${activeId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `chat_id=eq.${activeId}`,
      }, (payload) => {
        const row = payload.new;
        if (row.sender_id !== sbUser.id) {
          setDbMessages(prev => [...prev, rowToMsg(row)]);
        }
      })
      .subscribe();
    return () => sb.removeChannel(channel);
  }, [activeId, sbUser?.id]);

  const allMessages = [
    { kind: 'system', text: 'Today', id: 'sys-today' },
    ...dbMessages,
  ];

  const handleSend = async (text, replyTo) => {
    if (!text.trim()) return;
    const now = new Date();
    const at  = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
    const tempId = 'local-' + Date.now();
    // Optimistic
    setDbMessages(prev => [...prev, {
      id: tempId, from: 'me', at,
      segments: [{ t: text }], status: 'sent',
      ...(replyTo ? { replyTo } : {}),
    }]);
    // Persist
    if (sbUser) {
      const { data } = await sb.from('messages')
        .insert({ chat_id: activeId, sender_id: sbUser.id, body: text })
        .select('id').single();
      if (data) setDbMessages(prev => prev.map(m => m.id === tempId ? { ...m, id: data.id } : m));
    }
  };

  const showExtractionPanel = showPanel && active.kind === 'group' && !isTablet;

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flex: 1, minWidth: 0 }}>
        {mobileChatOpen
          ? <ChatView chat={active} user={user} messages={allMessages} onSend={handleSend}
              showPanel={false} setShowPanel={setShowPanel} setRoute={setRoute}
              onBack={() => setMobileChatOpen(false)} />
          : <ChatList chats={chats} active={active}
              onSelect={c => { setRoute({ screen: 'chats', chatId: c.id }); setMobileChatOpen(true); }}
              user={user} fullWidth />
        }
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flex: 1, minWidth: 0 }}>
      <ChatList chats={chats} active={active} onSelect={c => setRoute({ screen: 'chats', chatId: c.id })} user={user} width={isTablet ? 280 : 360} />
      <ChatView chat={active} user={user} messages={allMessages} onSend={handleSend} showPanel={showExtractionPanel} setShowPanel={setShowPanel} setRoute={setRoute} />
      {showExtractionPanel && <ExtractionPanel chat={active} messages={allMessages} setRoute={setRoute} />}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// LEFT — chat list + flows panel
// ────────────────────────────────────────────────────────────────
function ChatList({ chats, active, onSelect, user, width = 360, fullWidth = false }) {
  const D = window.KredeshData;
  const [q, setQ] = React.useState('');
  const [filter, setFilter] = React.useState('all');
  const [leftTab, setLeftTab] = React.useState('chats');
  const [loads, setLoads] = React.useState(() => D.loads || []);

  // Refresh loads when switching to flows tab
  React.useEffect(() => {
    if (leftTab === 'flows') setLoads(D.loads || []);
  }, [leftTab]);

  // Also refresh every few seconds while on flows tab so newly extracted loads appear
  React.useEffect(() => {
    if (leftTab !== 'flows') return;
    const id = setInterval(() => setLoads([...(D.loads || [])]), 3000);
    return () => clearInterval(id);
  }, [leftTab]);

  const filtered = chats.filter(c => {
    if (filter === 'unread' && !c.unread) return false;
    if (filter === 'groups' && c.kind !== 'group') return false;
    const w = c.with ? D.byId(D.users, c.with) : null;
    const name = c.name || w?.name || '';
    if (q && !(name + ' ' + c.preview).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ width: fullWidth ? '100%' : width, flexShrink: 0, background: 'var(--bg-1)', borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column' }}>
      {/* Header with top-level tabs */}
      <div style={{ background: 'var(--bg-2)', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
        <div style={{ padding: '12px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink-0)' }}>
            {leftTab === 'chats' ? 'Chats' : 'Flows'}
          </span>
          {leftTab === 'chats' && (
            <div style={{ display: 'flex', gap: 4 }}>
              <button title="New group" style={chatHdrBtn}><Icons.users size={16} stroke="var(--ink-2)" /></button>
              <button title="New chat"  style={chatHdrBtn}><Icons.plus  size={16} stroke="var(--ink-2)" /></button>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', padding: '6px 10px 0', gap: 2 }}>
          {[
            { id: 'chats', label: 'Chats' },
            { id: 'flows', label: `Flows${loads.length ? ' · ' + loads.length : ''}` },
          ].map(tb => (
            <button key={tb.id} onClick={() => setLeftTab(tb.id)} style={{
              padding: '6px 12px 8px', background: 'transparent', border: 'none',
              borderBottom: `2px solid ${leftTab === tb.id ? '#6FE3C2' : 'transparent'}`,
              color: leftTab === tb.id ? 'var(--ink-0)' : 'var(--ink-3)',
              fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
            }}>{tb.label}</button>
          ))}
        </div>
      </div>

      {leftTab === 'chats' && (
        <>
          {/* Search */}
          <div style={{ padding: '8px 12px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', background: 'var(--bg-2)', borderRadius: 8 }}>
              <Icons.search size={15} stroke="var(--ink-3)" />
              <input value={q} onChange={e => setQ(e.target.value)}
                placeholder="Search or start new chat"
                style={{ flex: 1, background: 'none', border: 'none', color: 'var(--ink-0)', fontSize: 13.5, outline: 'none' }} />
            </div>
          </div>
          {/* Filter pills */}
          <div style={{ padding: '2px 12px 8px', display: 'flex', gap: 6, flexShrink: 0 }}>
            {[{ id: 'all', label: 'All' }, { id: 'unread', label: 'Unread' }, { id: 'groups', label: 'Groups' }].map(t => {
              const on = filter === t.id;
              return (
                <button key={t.id} onClick={() => setFilter(t.id)} style={{
                  padding: '4px 11px', borderRadius: 999,
                  background: on ? 'var(--green-soft)' : 'transparent',
                  color: on ? '#6FE3C2' : 'var(--ink-2)',
                  border: '1px solid', borderColor: on ? 'rgba(6,207,156,0.3)' : 'var(--line)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}>{t.label}</button>
              );
            })}
          </div>
          {/* List */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            {filtered.map(c => <ChatRow key={c.id} c={c} active={c.id === active.id} onClick={() => onSelect(c)} />)}
            {filtered.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>No chats.</div>
            )}
          </div>
        </>
      )}

      {leftTab === 'flows' && <FlowsView loads={loads} />}
    </div>
  );
}

function FlowsView({ loads }) {
  const inbound  = loads.filter(l => l.direction === 'inbound');
  const outbound = loads.filter(l => l.direction === 'outbound');

  const statusDot = s => ({ arrived: '#6FE3C2', 'en route': '#FCD68A', 'loaded out': '#A78BFA', scheduled: 'var(--ink-3)' })[s] || 'var(--ink-3)';

  const LoadCard = ({ l }) => (
    <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
      <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 7, height: 7, borderRadius: 999, background: statusDot(l.status), flexShrink: 0, display: 'inline-block' }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-2)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{l.status}</span>
        <span className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', marginLeft: 'auto' }}>{l.loggedAt}</span>
      </div>
      <div style={{ padding: '0 12px 10px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-0)', marginBottom: 6, lineHeight: 1.35 }}>{l.cargo}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 12px' }}>
          {l.vehicle && l.vehicle !== '—' && <FlowMeta icon="truck"  val={l.vehicle} />}
          {l.eta     && l.eta     !== '—' && <FlowMeta icon="clock"  val={l.eta} />}
          {l.customer && l.customer !== '—' && <FlowMeta icon="user"  val={l.customer} />}
        </div>
      </div>
    </div>
  );

  const Section = ({ label, color, arrow, items }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{arrow} {label}</span>
        <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 999, padding: '1px 7px' }}>{items.length}</span>
      </div>
      {items.length === 0
        ? <div style={{ padding: '10px 12px', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 9, fontSize: 12, color: 'var(--ink-4)' }}>None logged yet</div>
        : items.map(l => <LoadCard key={l.id} l={l} />)}
    </div>
  );

  if (!loads.length) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28, textAlign: 'center' }}>
        <Icons.truck size={32} stroke="var(--ink-4)" style={{ marginBottom: 14 }} />
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 6 }}>No loads yet</div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.6 }}>
          Paste messages into a group chat. AI will extract inbound and outbound loads automatically.
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '16px 14px' }}>
      <Section label="Inbound"  color="#6FE3C2" arrow="↓" items={inbound} />
      <Section label="Outbound" color="#A78BFA" arrow="↑" items={outbound} />
    </div>
  );
}

function FlowMeta({ icon, val }) {
  const Ico = Icons[icon] || Icons.spark;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <Ico size={11} stroke="var(--ink-3)" />
      <span style={{ fontSize: 11.5, color: 'var(--ink-2)' }}>{val}</span>
    </div>
  );
}

const chatHdrBtn = {
  width: 32, height: 32, display: 'grid', placeItems: 'center',
  background: 'transparent', border: 'none',
  borderRadius: 7, color: 'var(--ink-2)', cursor: 'pointer',
};

function ChatRow({ c, active, onClick }) {
  const D = window.KredeshData;
  const w = c.with ? D.byId(D.users, c.with) : null;
  const name = c.name || w?.name || '—';
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 13,
      width: '100%', padding: '10px 16px',
      background: active ? 'var(--bg-3)' : 'transparent',
      border: 'none', borderBottom: '1px solid var(--line)',
      cursor: 'pointer', textAlign: 'left',
    }}>
      {c.kind === 'group' ? (
        <div style={{ width: 46, height: 46, borderRadius: 999, background: 'var(--bg-3)', border: '1px solid var(--line-2)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <Icons.users size={20} stroke="var(--ink-2)" />
        </div>
      ) : (
        <Avatar user={w} size={46} />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          {c.pinned && <Icons.pin size={11} stroke="var(--ink-3)" />}
          <span style={{ fontSize: 14.5, fontWeight: 500, color: 'var(--ink-0)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
          <span className="mono" style={{ fontSize: 11, color: c.unread ? 'var(--green-2)' : 'var(--ink-3)', fontWeight: c.unread ? 700 : 400, flexShrink: 0 }}>{c.lastAt}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: 'var(--ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.preview}</span>
          {c.unread > 0 ? (
            <span className="mono" style={{ fontSize: 11, fontWeight: 700, background: 'var(--green)', color: '#0B141A', padding: '1px 6px', borderRadius: 999, minWidth: 20, textAlign: 'center', flexShrink: 0 }}>{c.unread}</span>
          ) : null}
        </div>
      </div>
    </button>
  );
}

// ────────────────────────────────────────────────────────────────
// CENTER — chat view (WhatsApp bubbles)
// ────────────────────────────────────────────────────────────────
function ChatView({ chat, user, messages: rawPropMessages, onSend, showPanel, setShowPanel, setRoute, onBack }) {
  const D = window.KredeshData;
  const w = chat.with ? D.byId(D.users, chat.with) : null;
  const name = chat.name || w?.name || '—';
  const status = chat.kind === 'group'
    ? (chat.members?.length ? `${chat.members.length} members` : 'Group')
    : (w?.status || '');

  const [composer, setComposer] = React.useState('');
  const [highlighted, setHighlighted] = React.useState(null);
  const [replyTo, setReplyTo] = React.useState(null);
  const [openInfoFor, setOpenInfoFor] = React.useState(null);
  const [openRemindFor, setOpenRemindFor] = React.useState(null);
  const [localReminders, setLocalReminders] = React.useState({});
  const bottomRef   = React.useRef(null);
  const textareaRef = React.useRef(null);

  // Auto-expand textarea to fit content
  React.useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 320) + 'px';
  }, [composer]);

  const messages = rawPropMessages.map(m => {
    const lr = localReminders[m.id];
    if (!lr) return m;
    return { ...m, reminders: [...(m.reminders || []), { user: 'me', ...lr }] };
  });

  const tasksHere = D.tasks.filter(t => t.chat === chat.id);
  const previewExtraction = React.useMemo(() => chatParseEntities(composer), [composer]);
  const replyMsg = replyTo ? rawPropMessages.find(m => m.id === replyTo) : null;

  // Scroll to bottom on mount and when new messages arrive
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'instant' });
  }, [chat.id]);
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = () => {
    if (!composer.trim()) return;
    onSend(composer.trim(), replyTo);
    setComposer('');
    setReplyTo(null);
    if (textareaRef.current) textareaRef.current.style.height = '38px';
  };
  const setReminder = (msgId, label) => { setLocalReminders(prev => ({ ...prev, [msgId]: { at: 'set', label } })); setOpenRemindFor(null); };

  React.useEffect(() => {
    if (!openInfoFor && !openRemindFor) return;
    const h = () => { setOpenInfoFor(null); setOpenRemindFor(null); };
    window.addEventListener('click', h);
    return () => window.removeEventListener('click', h);
  }, [openInfoFor, openRemindFor]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: 'var(--bg-0)' }}>
      {/* Header */}
      <div style={{ padding: '10px 16px', background: 'var(--bg-2)', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 13 }}>
        {onBack && (
          <button onClick={onBack} style={{
            width: 34, height: 34, display: 'grid', placeItems: 'center',
            background: 'transparent', border: 'none', borderRadius: 8,
            color: 'var(--ink-1)', cursor: 'pointer', flexShrink: 0, marginLeft: -6,
          }}>
            <span style={{ display: 'grid', transform: 'scaleX(-1)' }}>
              <Icons.arrow size={18} stroke="var(--ink-1)" />
            </span>
          </button>
        )}
        {chat.kind === 'group' ? (
          <div style={{ width: 38, height: 38, borderRadius: 999, background: 'var(--bg-3)', border: '1px solid var(--line-2)', display: 'grid', placeItems: 'center' }}>
            <Icons.users size={17} stroke="var(--ink-2)" />
          </div>
        ) : (
          <Avatar user={w} size={38} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 500, color: 'var(--ink-0)' }}>{name}</div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 5 }}>
            {w?.status === 'online' && <span className="live-dot" />}
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{status}{w?.role ? ` · ${w.role}` : ''}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button title="Search" style={chatHdrBtn}><Icons.search size={17} stroke="var(--ink-2)" /></button>
          <button title="Extracted data + tasks" onClick={() => setShowPanel(p => !p)}
            style={{ ...chatHdrBtn, background: showPanel ? 'var(--bg-3)' : 'transparent' }}>
            <Icons.spark size={17} stroke={showPanel ? 'var(--green-2)' : 'var(--ink-2)'} />
          </button>
          <button title="More" style={chatHdrBtn}><Icons.more size={17} stroke="var(--ink-2)" /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-pattern" style={{ flex: 1, overflow: 'auto', padding: '20px 7%', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {messages.map((m, i) => (
          <ChatMessageBubble key={m.id || i} m={m} prev={messages[i - 1]}
            allMessages={messages}
            chatKind={chat.kind}
            chatMembers={chat.members}
            onChipClick={(eid) => setHighlighted(h => h === eid ? null : eid)}
            highlighted={highlighted}
            tasks={m.kind === 'extract' ? tasksHere.slice(0, 3) : null}
            onReply={() => { setReplyTo(m.id); setOpenInfoFor(null); setOpenRemindFor(null); }}
            onRemind={(e) => { e?.stopPropagation?.(); setOpenRemindFor(rf => rf === m.id ? null : m.id); setOpenInfoFor(null); }}
            onInfo={(e) => { e?.stopPropagation?.(); setOpenInfoFor(of => of === m.id ? null : m.id); setOpenRemindFor(null); }}
            infoOpen={openInfoFor === m.id}
            remindOpen={openRemindFor === m.id}
            onPickReminder={(label) => setReminder(m.id, label)}
            onCloseInfo={() => setOpenInfoFor(null)}
          />
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div style={{ background: 'var(--bg-2)', padding: '8px 14px', borderTop: '1px solid var(--line)' }}>
        {replyMsg && <ChatReplyBar m={replyMsg} onClear={() => setReplyTo(null)} />}
        {composer && previewExtraction.length > 0 && (
          <div style={{ margin: '0 0 8px', padding: '6px 10px', background: 'var(--green-soft)', border: '1px solid rgba(6,207,156,0.28)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Icons.spark size={12} stroke="#6FE3C2" />
            <span style={{ fontSize: 11.5, color: '#6FE3C2', fontWeight: 600 }}>Will extract:</span>
            {previewExtraction.map((p, i) => <span key={i} className="chip">{p.kind}: {p.value}</span>)}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          <button style={chatHdrBtn} title="Emoji"><Icons.smile size={20} stroke="var(--ink-2)" /></button>
          <button style={chatHdrBtn} title="Attach"><Icons.paper size={20} stroke="var(--ink-2)" /></button>
          <textarea
            ref={textareaRef}
            value={composer}
            onChange={e => setComposer(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={replyMsg ? 'Reply…' : 'Type a message'}
            rows={1}
            style={{ flex: 1, background: 'var(--bg-3)', border: 'none', borderRadius: 8, padding: '9px 12px', color: 'var(--ink-0)', fontSize: 14, lineHeight: 1.45, outline: 'none', resize: 'none', fontFamily: 'var(--ui)', minHeight: 38, overflowY: 'auto' }}
          />
          <button onClick={handleSend} title={composer.trim() ? 'Send' : 'Voice note'} style={{ width: 38, height: 38, borderRadius: 999, background: 'var(--green)', border: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
            {composer.trim()
              ? <Icons.send size={17} stroke="#0B141A" sw={2}/>
              : <Icons.mic  size={17} stroke="#0B141A" sw={2}/>}
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatReplyBar({ m, onClear }) {
  const D = window.KredeshData;
  const u = D.byId(D.users, m.from);
  const text = chatPreviewOf(m);
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, margin: '0 0 8px', background: 'var(--bg-3)', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ width: 4, background: chatNameColor(m.from) }} />
      <div style={{ flex: 1, padding: '7px 11px', minWidth: 0 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: chatNameColor(m.from), marginBottom: 1 }}>
          Replying to {u?.name || m.from || '—'}
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</div>
      </div>
      <button onClick={onClear} style={{ background: 'transparent', border: 'none', color: 'var(--ink-3)', padding: '0 12px', cursor: 'pointer', fontSize: 16 }}>✕</button>
    </div>
  );
}

function chatPreviewOf(m) {
  if (!m) return '';
  if (m.segments) return m.segments.map(s => s.t).join('').replace(/\n+/g, ' · ').slice(0, 90);
  if (m.text) return m.text.slice(0, 90);
  return '';
}

function ChatMessageBubble({ m, prev, allMessages, chatKind, chatMembers, onChipClick, highlighted, tasks, onReply, onRemind, onInfo, infoOpen, remindOpen, onPickReminder, onCloseInfo }) {
  const D = window.KredeshData;
  const [hover, setHover] = React.useState(false);

  if (m.kind === 'system') return <div className="bubble system">{m.text}</div>;
  if (m.kind === 'extract') return <ChatExtractBubble m={m} tasks={tasks} />;

  const u = D.byId(D.users, m.from) || (m.from && m.from !== 'me' ? { name: m.from, initials: (m.from || '?')[0].toUpperCase(), avatar: '#8696A0' } : null);
  const isMe = m.from === 'me' || u?.isMe;
  const sameAsPrev = prev?.from === m.from;
  const replied = m.replyTo ? allMessages?.find(x => x.id === m.replyTo) : null;
  const myReminder = (m.reminders || []).find(r => r.user === 'me');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', marginTop: sameAsPrev ? 1 : 7, alignItems: isMe ? 'flex-end' : 'flex-start' }}>
      <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{ position: 'relative', maxWidth: '72%', display: 'flex', alignItems: 'flex-start' }}>
        <div className={`bubble ${isMe ? 'sent' : 'received'}`} style={{ maxWidth: '100%' }}>
          {!isMe && !sameAsPrev && u && (
            <div style={{ fontSize: 11.5, fontWeight: 600, color: chatNameColor(m.from), marginBottom: 1 }}>{u.name}</div>
          )}
          {replied && <ChatQuotedSnippet m={replied} />}
          {m.segments && (
            <span style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
              {m.segments.map((seg, i) => {
                if (!seg.hl) return <span key={i}>{seg.t}</span>;
                const cls = 'hl' + (seg.hl === 'warn' ? ' warn' : '') + (highlighted === seg.entity ? ' active' : '');
                return <span key={i} className={cls} onClick={() => onChipClick?.(seg.entity)}>{seg.t}</span>;
              })}
            </span>
          )}
          <span className="meta">
            {m.at}
            {isMe && (
              <button onClick={chatKind === 'group' ? onInfo : undefined}
                style={{ background: 'none', border: 'none', padding: 0, cursor: chatKind === 'group' ? 'pointer' : 'default', display: 'inline-flex', alignItems: 'center', marginLeft: 2 }}>
                <ChatReadTicks read={m.status === 'read'} />
              </button>
            )}
          </span>
        </div>

        {hover && <ChatMessageActions isMe={isMe} onReply={onReply} onRemind={onRemind} />}
        {infoOpen && isMe && chatKind === 'group' && <ChatReadInfoPopover m={m} members={chatMembers} onClose={onCloseInfo} />}
        {remindOpen && <ChatRemindMenu onPick={onPickReminder} isMe={isMe} />}
      </div>

      {myReminder && (
        <div style={{ marginTop: 4, padding: '3px 8px', background: 'var(--warn-soft)', border: '1px solid rgba(255,176,32,0.32)', borderRadius: 999, fontSize: 10.5, color: '#FCD68A', display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 600 }}>
          <Icons.bell size={11} stroke="#FCD68A" /> {myReminder.label}
        </div>
      )}
    </div>
  );
}

function ChatQuotedSnippet({ m }) {
  const D = window.KredeshData;
  const u = D.byId(D.users, m.from) || (m.from ? { name: m.from } : null);
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', marginBottom: 6, background: 'rgba(11,20,26,0.35)', borderRadius: 6, overflow: 'hidden', maxWidth: '100%' }}>
      <div style={{ width: 3, background: chatNameColor(m.from), flexShrink: 0 }} />
      <div style={{ padding: '4px 8px 5px', minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: chatNameColor(m.from), lineHeight: 1.2 }}>{u?.name || '—'}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.35, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 360 }}>{chatPreviewOf(m)}</div>
      </div>
    </div>
  );
}

function ChatMessageActions({ isMe, onReply, onRemind }) {
  const side = isMe ? { right: '100%', marginRight: 6 } : { left: '100%', marginLeft: 6 };
  return (
    <div style={{ position: 'absolute', top: 6, ...side, display: 'flex', gap: 2, background: 'var(--bg-1)', border: '1px solid var(--line-2)', borderRadius: 999, padding: 2, boxShadow: '0 4px 14px rgba(0,0,0,0.4)', zIndex: 5 }} onClick={e => e.stopPropagation()}>
      <button onClick={onReply} title="Reply" style={chatActionBtn}><Icons.arrow size={13} stroke="var(--ink-1)" sw={2}/></button>
      <button onClick={onRemind} title="Remind me" style={chatActionBtn}><Icons.bell size={13} stroke="var(--ink-1)" sw={1.8}/></button>
      <button title="More" style={chatActionBtn}><Icons.more size={13} stroke="var(--ink-1)" sw={1.8}/></button>
    </div>
  );
}

const chatActionBtn = { width: 26, height: 26, borderRadius: 999, background: 'transparent', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center' };

function ChatRemindMenu({ onPick, isMe }) {
  const side = isMe ? { right: 0 } : { left: 0 };
  const options = ['In 15 min', 'In 1 hour', 'In 4 hours', 'Tomorrow 08:00', '1h before ETA'];
  return (
    <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: '100%', ...side, marginTop: 6, minWidth: 200, background: 'var(--bg-1)', border: '1px solid var(--line-2)', borderRadius: 10, padding: 6, boxShadow: '0 14px 40px rgba(0,0,0,0.5)', zIndex: 10 }}>
      <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: 0.7, textTransform: 'uppercase', padding: '6px 8px 4px' }}>Remind me</div>
      {options.map(o => (
        <button key={o} onClick={() => onPick(o)} style={{ width: '100%', textAlign: 'left', padding: '7px 9px', background: 'transparent', border: 'none', color: 'var(--ink-1)', fontSize: 12.5, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <Icons.bell size={12} stroke="#FCD68A" /> {o}
        </button>
      ))}
    </div>
  );
}

function ChatReadInfoPopover({ m, members, onClose }) {
  const D = window.KredeshData;
  const readBy = m.readBy || [];
  const memberIds = (members || []).filter(id => id !== 'me');
  const rows = memberIds.map(id => { const u = D.byId(D.users, id); const r = readBy.find(x => x.user === id); return { u, read: !!r, at: r?.at }; });
  const readCount = rows.filter(r => r.read).length;
  return (
    <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: '100%', right: 0, marginTop: 6, width: 260, background: 'var(--bg-1)', border: '1px solid var(--line-2)', borderRadius: 11, overflow: 'hidden', boxShadow: '0 14px 40px rgba(0,0,0,0.55)', zIndex: 12 }}>
      <div style={{ padding: '10px 13px 8px', borderBottom: '1px solid var(--line)' }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.6 }}>Message info</div>
        <div style={{ marginTop: 4, fontSize: 13, fontWeight: 600 }}>
          <span style={{ color: 'var(--read)' }}>{readCount}</span>
          <span style={{ color: 'var(--ink-2)' }}> of {rows.length} read</span>
        </div>
      </div>
      <div style={{ maxHeight: 260, overflow: 'auto' }}>
        {rows.map(({ u, read, at }) => u && (
          <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 13px', borderBottom: '1px solid var(--line)' }}>
            <Avatar user={u} size={26} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--ink-0)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{read ? `Read · ${at}` : 'Delivered'}</div>
            </div>
            <ChatReadTicks read={read} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatReadTicks({ read }) {
  return (
    <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
      <path d="M4 6l2 2 4-5" stroke={read ? 'var(--read)' : 'rgba(233,237,239,0.6)'} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 6l2 2 4-5" stroke={read ? 'var(--read)' : 'rgba(233,237,239,0.6)'} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ChatExtractBubble({ m, tasks }) {
  return (
    <div style={{ alignSelf: 'center', maxWidth: '78%', padding: '11px 14px', background: 'rgba(0,168,132,0.10)', border: '1px solid rgba(6,207,156,0.28)', borderRadius: 10, margin: '6px 0', boxShadow: '0 1px 0.5px rgba(11,20,26,0.13)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9 }}>
        <Icons.spark size={13} stroke="#6FE3C2" />
        <span style={{ fontSize: 12, fontWeight: 700, color: '#6FE3C2' }}>Freight 24 extracted {m.fields} fields · created {m.tasks} tasks</span>
        <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginLeft: 'auto' }}>{m.at}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {(tasks || []).map(t => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '5px 7px', borderRadius: 6, background: 'rgba(11,20,26,0.4)' }}>
            <TaskCheckbox status={t.status} />
            <span style={{ flex: 1, fontSize: 12.5, color: t.status === 'complete' ? 'var(--ink-3)' : 'var(--ink-0)', textDecoration: t.status === 'complete' ? 'line-through' : 'none' }}>{t.title}</span>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{t.due}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function chatNameColor(fromId) {
  const palette = ['#FFB020','#06CF9C','#3B82F6','#A78BFA','#F472B6','#F15C6D','#00A884'];
  let h = 0;
  for (let i = 0; i < (fromId || '').length; i++) h = (h * 31 + fromId.charCodeAt(i)) | 0;
  return palette[Math.abs(h) % palette.length];
}

// ────────────────────────────────────────────────────────────────
// RIGHT — extraction panel
// ────────────────────────────────────────────────────────────────
// ── Claude extraction helper ──────────────────────────────────────────────────
async function chatExtractWithClaude(text, apiKey = '') {
  const system = `You are a logistics data extraction AI for Freight 24 Messaging, a South African freight company.
Analyze chat messages and return structured JSON with logistics fields.
Terminology: Horse = truck cab, container IDs like FSCU8065100, DBN = Durban, JHB = Johannesburg, CPT = Cape Town.
Cargo types: SLES, Allied, Slackwax, Caustic Soda, NIS slings.`;

  const prompt = `Extract logistics information from these chat messages. Return ONLY valid JSON with no explanation:

${text}

Rules:
- tasks: ONE task per message maximum. The task title must be the full verbatim message body, lightly cleaned (remove greetings like "Hi All"). Do NOT split a message into multiple tasks.
- loads: extract every inbound/outbound load mentioned (trucks arriving, containers, deliveries, loadouts). One load object per movement.
- fields: key structured data points (container IDs, vehicles, ETAs, customers, drivers).

{
  "fields": [{"label": "Human label", "value": "extracted value", "icon": "pkg|pin2|clock|truck|user|warn|hash|shield", "tone": "ok|warn|bad"}],
  "tasks": [{"title": "Full message body cleaned", "priority": "high|med|low", "due": "Today|Tomorrow|specific time"}],
  "loads": [{"direction": "inbound|outbound", "cargo": "what is being moved", "vehicle": "truck/container ID or —", "eta": "time or —", "customer": "customer name or —", "status": "scheduled|en route|arrived|loaded out"}],
  "summary": "One sentence summary",
  "confidence": 0-100
}`;

  const resp = await fetch('/api/claude', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { 'x-api-key': apiKey } : {}),
    },
    body: JSON.stringify({
      model: 'claude-opus-4-7',
      max_tokens: 2048,
      system,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (resp.status === 401 || resp.status === 403) {
    throw new Error('AUTH_REQUIRED');
  }
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${resp.status}`);
  }
  const data = await resp.json();
  const raw = data.content?.[0]?.text || '';
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON in Claude response');
  return JSON.parse(match[0]);
}

function ExtractionPanel({ chat, messages }) {
  const D = window.KredeshData;
  if (!D.loads) D.loads = [];
  if (!D.extractedMsgIds) {
    try {
      const stored = JSON.parse(localStorage.getItem('kredesh-extracted-ids') || '[]');
      D.extractedMsgIds = new Set(stored);
    } catch { D.extractedMsgIds = new Set(); }
  }

  const [apiKey,    setApiKey]    = React.useState(() => { try { return localStorage.getItem('kredesh-claude-key') || ''; } catch { return ''; } });
  const [keyDraft,  setKeyDraft]  = React.useState('');
  const [needsKey,  setNeedsKey]  = React.useState(false);
  const [extraction, setExtraction] = React.useState(null);
  const [loading,   setLoading]   = React.useState(false);
  const [error,     setError]     = React.useState(null);
  const [chatTasks, setChatTasks] = React.useState(() => D.tasks.filter(t => t.chat === chat.id));
  const [chatLoads, setChatLoads] = React.useState(() => D.loads.filter(l => l.chat === chat.id));
  const [activeTab, setActiveTab] = React.useState('extract');
  const runningRef = React.useRef(false);

  React.useEffect(() => {
    setExtraction(null);
    setError(null);
    setNeedsKey(false);
    setChatTasks(D.tasks.filter(t => t.chat === chat.id));
    setChatLoads(D.loads.filter(l => l.chat === chat.id));
    runningRef.current = false;
  }, [chat.id]);

  const runExtraction = React.useCallback(async (key, forceAll = false) => {
    if (runningRef.current) return;
    const k = key ?? apiKey;

    const allMsgs = messages.filter(m => m.from && m.segments && m.id);
    // Only process messages we haven't extracted yet; forceAll re-processes all
    const newMsgs = forceAll
      ? allMsgs
      : allMsgs.filter(m => !D.extractedMsgIds.has(m.id));
    if (!newMsgs.length) return;

    const lines = newMsgs.map(m => {
      const u = D.byId(D.users, m.from);
      const body = m.segments.map(s => s.t || '').join(' ');
      return `[${m.at || ''}] ${u?.name || m.from}: ${body}`;
    });

    runningRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const result = await chatExtractWithClaude(lines.join('\n'), k);

      // Mark extracted immediately to prevent re-processing on remount
      newMsgs.forEach(m => D.extractedMsgIds.add(m.id));
      try { localStorage.setItem('kredesh-extracted-ids', JSON.stringify([...D.extractedMsgIds])); } catch {}

      setExtraction(result);

      if (result.tasks?.length) {
        // Fetch existing task titles for this chat to prevent duplicates across sessions/devices
        const { data: existing } = await sb.from('tasks').select('title').eq('chat_id', chat.id);
        const existingTitles = new Set((existing || []).map(t => (t.title || '').toLowerCase().trim()));
        const deduped = result.tasks.filter(t => !existingTitles.has((t.title || '').toLowerCase().trim()));
        if (deduped.length > 0) {
          const tasksToInsert = deduped.map(t => ({
            chat_id: chat.id,
            title: t.title,
            status: 'pending',
            priority: t.priority || 'med',
            due: t.due || 'Today',
            extracted_from: chat.name || chat.id,
          }));
          const { data: insertedTasks } = await sb.from('tasks').insert(tasksToInsert).select();
          const newTasks = (insertedTasks || []).map(t => ({
            ...t, id: t.id, chat: t.chat_id, extractedFrom: t.extracted_from, assignee: 'me',
          }));
          D.tasks.unshift(...newTasks);
          setChatTasks(D.tasks.filter(tt => tt.chat === chat.id));
        }
      }

      if (result.loads?.length) {
        const now = new Date();
        const at = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
        const loadsToInsert = result.loads.map(l => ({
          chat_id: chat.id,
          direction: l.direction,
          cargo: l.cargo || '',
          vehicle: l.vehicle || '—',
          eta: l.eta || '—',
          customer: l.customer || '—',
          status: l.status || 'scheduled',
          logged_at: at,
        }));
        const { data: insertedLoads } = await sb.from('loads').insert(loadsToInsert).select();
        const newLoads = (insertedLoads || []).map(l => ({
          ...l, chat: l.chat_id, loggedAt: l.logged_at,
        }));
        D.loads.push(...newLoads);
        setChatLoads(D.loads.filter(l => l.chat === chat.id));
      }
    } catch (e) {
      if (e.message === 'AUTH_REQUIRED') setNeedsKey(true);
      else setError(e.message);
    } finally {
      runningRef.current = false;
      setLoading(false);
    }
  }, [apiKey, messages, chat.id]);

  // Auto-trigger on new messages — no client key required when server has one
  React.useEffect(() => {
    const hasNew = messages.some(m => m.from && m.segments && m.id && !D.extractedMsgIds.has(m.id));
    if (!hasNew) return;
    const t = setTimeout(() => runExtraction(), 2000);
    return () => clearTimeout(t);
  }, [messages.length, chat.id]);

  const saveKey = () => {
    if (!keyDraft.trim()) return;
    try { localStorage.setItem('kredesh-claude-key', keyDraft.trim()); } catch {}
    setApiKey(keyDraft.trim());
    setKeyDraft('');
    setNeedsKey(false);
    runExtraction(keyDraft.trim(), true);
  };

  const fields = extraction?.fields || [];

  return (
    <aside style={{ width: 340, flexShrink: 0, background: 'var(--bg-1)', borderLeft: '1px solid var(--line)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header + tabs */}
      <div style={{ background: 'var(--bg-2)', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
        <div style={{ padding: '11px 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icons.spark size={14} stroke="#6FE3C2" />
          <span style={{ fontSize: 13.5, fontWeight: 600 }}>Freight 24 AI</span>
          {loading && <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginLeft: 'auto' }}>Analyzing…</span>}
          {!loading && extraction && (
            <span className="mono" style={{ fontSize: 10, color: extraction.confidence >= 80 ? '#6FE3C2' : '#FCD68A', marginLeft: 'auto' }}>
              {extraction.confidence}%
            </span>
          )}
          {!loading && apiKey && (
            <button onClick={() => runExtraction(undefined, true)} title="Re-extract"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', marginLeft: (extraction || !loading) ? 4 : 'auto' }}>
              <Icons.refresh size={13} stroke="var(--ink-3)" />
            </button>
          )}
        </div>
        <div style={{ display: 'flex', padding: '6px 8px 0', gap: 2 }}>
          {[
            { id: 'extract', label: 'Extracted' },
            { id: 'loads',   label: `Loads${chatLoads.length ? ' · ' + chatLoads.length : ''}` },
          ].map(tb => (
            <button key={tb.id} onClick={() => setActiveTab(tb.id)} style={{
              padding: '6px 11px 8px', background: 'transparent', border: 'none',
              borderBottom: `2px solid ${activeTab === tb.id ? '#6FE3C2' : 'transparent'}`,
              color: activeTab === tb.id ? 'var(--ink-0)' : 'var(--ink-3)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>{tb.label}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 14px 18px' }}>
        {/* API key input — only shown if server has no key configured */}
        {needsKey && (
          <div style={{ marginBottom: 16, padding: '14px', background: 'var(--bg-2)', border: '1px solid rgba(252,165,165,0.3)', borderRadius: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Icons.lock size={14} stroke="#FCA5A5" />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#FCA5A5' }}>API key required</span>
            </div>
            <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.6 }}>
              No key found on the server. Add your Claude API key to enable extraction.
            </p>
            <input value={keyDraft} onChange={e => setKeyDraft(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveKey()}
              placeholder="sk-ant-api03-…" type="password"
              style={{ width: '100%', boxSizing: 'border-box', padding: '8px 11px', background: 'var(--bg-3)', border: '1px solid var(--line-2)', borderRadius: 8, color: 'var(--ink-0)', fontSize: 12.5, fontFamily: 'var(--mono)', outline: 'none', marginBottom: 8 }} />
            <Btn primary size="sm" onClick={saveKey} style={{ width: '100%', justifyContent: 'center' }}>
              Save &amp; extract
            </Btn>
          </div>
        )}

        {/* ── Extracted tab ── */}
        {activeTab === 'extract' && (
          <>
            {loading && (
              <div style={{ padding: '32px 0', textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 500 }}>Claude is analyzing…</div>
                <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center', gap: 5 }}>
                  {[0,1,2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--green-2)', animation: `pulse-dot 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
                </div>
              </div>
            )}

            {error && !loading && (
              <div style={{ marginBottom: 14, padding: '10px 12px', background: 'var(--bad-soft)', border: '1px solid rgba(241,92,109,0.3)', borderRadius: 8, fontSize: 12, color: '#FCA5A5', lineHeight: 1.5 }}>
                {error}
              </div>
            )}

            {!loading && extraction?.summary && (
              <div style={{ marginBottom: 14, padding: '9px 11px', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 9, fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.5, fontStyle: 'italic' }}>
                {extraction.summary}
              </div>
            )}

            {!loading && fields.length > 0 && (
              <>
                <PanelSectionLabel>{fields.length} fields</PanelSectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
                  {fields.map((f, i) => {
                    const Ico = Icons[f.icon] || Icons.spark;
                    const color = f.tone === 'warn' ? '#FCD68A' : f.tone === 'bad' ? '#FCA5A5' : '#6FE3C2';
                    return (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '9px 11px', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 9 }}>
                        <Ico size={14} stroke={color} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 2 }}>{f.label}</div>
                          <div style={{ fontSize: 12.5, color: 'var(--ink-0)', fontWeight: 500, lineHeight: 1.35, wordBreak: 'break-word' }}>{f.value}</div>
                        </div>
                        <button onClick={() => navigator.clipboard?.writeText(f.value)} title="Copy"
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0 }}>
                          <Icons.copy size={12} stroke="var(--ink-4)" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {!loading && (
              <>
                <PanelSectionLabel right={<Pill tone="green">{chatTasks.length}</Pill>}>Tasks</PanelSectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {chatTasks.map(t => {
                    const done = t.status === 'complete';
                    return (
                      <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, padding: '9px 11px', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 9 }}>
                        <div style={{ width: 15, height: 15, borderRadius: 3, border: `2px solid ${done ? 'var(--green-2)' : 'var(--ink-3)'}`, background: done ? 'var(--green-2)' : 'transparent', flexShrink: 0, marginTop: 1, display: 'grid', placeItems: 'center' }}>
                          {done && <span style={{ fontSize: 8, color: '#0B141A', fontWeight: 700 }}>✓</span>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, color: done ? 'var(--ink-3)' : 'var(--ink-0)', textDecoration: done ? 'line-through' : 'none', lineHeight: 1.45, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{t.title}</div>
                          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 3 }}>{t.due}</div>
                        </div>
                      </div>
                    );
                  })}
                  {chatTasks.length === 0 && (
                    <div style={{ padding: '10px 11px', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 9, fontSize: 12, color: 'var(--ink-3)' }}>
                      Tasks appear here after extraction.
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* ── Loads tab ── */}
        {activeTab === 'loads' && (
          <LoadsTab loads={chatLoads} />
        )}
      </div>
    </aside>
  );
}

function LoadsTab({ loads }) {
  const dirColor = d => d === 'inbound' ? '#6FE3C2' : '#A78BFA';
  const statusColor = s => ({ arrived: '#6FE3C2', 'en route': '#FCD68A', 'loaded out': '#A78BFA', scheduled: 'var(--ink-3)' })[s] || 'var(--ink-3)';

  if (!loads.length) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
        No loads logged yet.<br />
        <span style={{ fontSize: 12 }}>Loads are extracted automatically from messages.</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {loads.map(l => (
        <div key={l.id} style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 10, overflow: 'hidden' }}>
          {/* Direction banner */}
          <div style={{ padding: '7px 12px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--line)' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: dirColor(l.direction), textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: 'var(--mono)' }}>
              {l.direction === 'inbound' ? '↓ Inbound' : '↑ Outbound'}
            </span>
            <span style={{ marginLeft: 'auto', fontSize: 10, color: statusColor(l.status), fontFamily: 'var(--mono)', fontWeight: 600 }}>{l.status}</span>
          </div>
          {/* Load details */}
          <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-0)', lineHeight: 1.3 }}>{l.cargo}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', marginTop: 4 }}>
              {[
                { label: 'Vehicle', val: l.vehicle },
                { label: 'ETA',     val: l.eta },
                { label: 'Customer',val: l.customer },
                { label: 'Logged',  val: l.loggedAt },
              ].map(({ label, val }) => val && val !== '—' && (
                <div key={label}>
                  <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-1)', marginTop: 1 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PanelSectionLabel({ children, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
      <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: 0.7, textTransform: 'uppercase' }}>{children}</span>
      {right}
    </div>
  );
}

// ── helpers ──
function chatSampleMessages() {
  return [{ kind: 'system', text: 'Today' }];
}

function chatParseEntities(text) {
  if (!text) return [];
  const out = [];
  const cont = text.match(/\b[A-Z]{4}\d{6,7}\b/);
  if (cont) out.push({ kind: 'Container', value: cont[0] });
  const plate = text.match(/\b(CT|GP|ZN|NP|EC|FS|WC|NW|LP)\d{4,6}\b/);
  if (plate) out.push({ kind: 'Vehicle', value: plate[0] });
  const eta = text.match(/\b\d{1,2}h\d{2}\b/i);
  if (eta) out.push({ kind: 'ETA', value: eta[0] });
  const size = text.match(/\b(20|40)\s*ft\b|\b\d{1,2}\s*m\b/i);
  if (size) out.push({ kind: 'Size', value: size[0] });
  const iso = text.match(/\bISO\d{4,6}\b/i);
  if (iso) out.push({ kind: 'ISO', value: iso[0] });
  const id = text.match(/\b\d{13}\b/);
  if (id) out.push({ kind: 'ID', value: id[0] });
  const cell = text.match(/\b0\d{9}\b/);
  if (cell) out.push({ kind: 'Cell', value: cell[0] });
  return out;
}

Object.assign(window, { ChatsScreen });
