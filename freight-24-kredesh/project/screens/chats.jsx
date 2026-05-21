// Chats — WhatsApp-style chat list + chat view + extraction panel (toggleable)
function ChatsScreen({ route, setRoute, user }) {
  const D = window.KredeshData;
  const activeId = route.chatId || 'c1';
  const active = D.chats.find(c => c.id === activeId) || D.chats[0];
  const [showPanel, setShowPanel] = React.useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1180 : true);

  return (
    <div style={{ display: 'flex', flex: 1, minWidth: 0 }}>
      <ChatList active={active} onSelect={c => setRoute({ screen: 'chats', chatId: c.id })} user={user} />
      <ChatView chat={active} user={user} showPanel={showPanel} setShowPanel={setShowPanel} setRoute={setRoute} />
      {showPanel && active.id === 'c1' && <ExtractionPanel chat={active} setRoute={setRoute} />}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// LEFT — chat list
// ────────────────────────────────────────────────────────────────
function ChatList({ active, onSelect, user }) {
  const D = window.KredeshData;
  const [q, setQ] = React.useState('');
  const [filter, setFilter] = React.useState('all');

  const filtered = D.chats.filter(c => {
    if (filter === 'unread' && !c.unread) return false;
    if (filter === 'groups' && c.kind !== 'group') return false;
    const w = c.with ? D.byId(D.users, c.with) : null;
    const name = c.name || w?.name || '';
    if (q && !(name + ' ' + c.preview).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{
      width: 360, flexShrink: 0,
      background: 'var(--bg-1)',
      borderRight: '1px solid var(--line)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--bg-2)',
      }}>
        <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink-0)' }}>Chats</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button title="New group" style={hdrBtn}><Icons.users size={17} stroke="var(--ink-2)" /></button>
          <button title="New chat" style={hdrBtn}><Icons.plus size={17} stroke="var(--ink-2)" /></button>
          <button title="More" style={hdrBtn}><Icons.more size={17} stroke="var(--ink-2)" /></button>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: '8px 12px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '6px 12px',
          background: 'var(--bg-2)', borderRadius: 8,
        }}>
          <Icons.search size={15} stroke="var(--ink-3)" />
          <input value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search or start new chat"
            style={{ flex: 1, background: 'none', border: 'none', color: 'var(--ink-0)', fontSize: 13.5, outline: 'none' }} />
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ padding: '4px 12px 6px', display: 'flex', gap: 6 }}>
        {[{ id: 'all', label: 'All' }, { id: 'unread', label: 'Unread' }, { id: 'groups', label: 'Groups' }].map(t => {
          const on = filter === t.id;
          return (
            <button key={t.id} onClick={() => setFilter(t.id)} style={{
              padding: '4px 11px', borderRadius: 999,
              background: on ? 'var(--green-soft)' : 'transparent',
              color: on ? '#6FE3C2' : 'var(--ink-2)',
              border: '1px solid', borderColor: on ? 'rgba(6,207,156,0.3)' : 'var(--line)',
              fontSize: 12, fontWeight: 600,
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
    </div>
  );
}

const hdrBtn = {
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
      width: '100%',
      padding: '10px 16px',
      background: active ? 'var(--bg-3)' : 'transparent',
      border: 'none',
      borderBottom: '1px solid var(--line)',
      cursor: 'pointer', textAlign: 'left',
    }}>
      {c.kind === 'group' ? (
        <div style={{
          width: 46, height: 46, borderRadius: 999,
          background: 'var(--bg-3)', border: '1px solid var(--line-2)',
          display: 'grid', placeItems: 'center', flexShrink: 0,
        }}>
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
          <span style={{
            flex: 1, minWidth: 0,
            fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.35,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{c.preview}</span>
          {c.unread > 0 ? (
            <span className="mono" style={{
              fontSize: 11, fontWeight: 700,
              background: 'var(--green)', color: '#0B141A',
              padding: '1px 6px', borderRadius: 999, minWidth: 20, textAlign: 'center', flexShrink: 0,
            }}>{c.unread}</span>
          ) : null}
        </div>
      </div>
    </button>
  );
}

// ────────────────────────────────────────────────────────────────
// CENTER — chat view (WhatsApp bubbles)
// ────────────────────────────────────────────────────────────────
function ChatView({ chat, user, showPanel, setShowPanel, setRoute }) {
  const D = window.KredeshData;
  const w = chat.with ? D.byId(D.users, chat.with) : null;
  const name = chat.name || w?.name || '—';
  const status = chat.kind === 'group'
    ? `${(chat.members || []).length} members · ${(chat.members || []).map(m => D.byId(D.users, m)?.name.split(' ')[0]).join(', ')}`
    : (w?.status || '');

  const [composer, setComposer] = React.useState('');
  const [highlighted, setHighlighted] = React.useState(null);
  const [replyTo, setReplyTo] = React.useState(null);            // message id
  const [openInfoFor, setOpenInfoFor] = React.useState(null);    // message id of read-info popover
  const [openRemindFor, setOpenRemindFor] = React.useState(null);// message id of remind menu
  const [localReminders, setLocalReminders] = React.useState({});// { msgId: { at, label } }

  const baseMessages = chat.id === 'c1' ? D.c1Messages : sampleMessages(chat);
  // Merge in any locally-added reminders
  const messages = baseMessages.map(m => {
    const lr = localReminders[m.id];
    if (!lr) return m;
    const existing = m.reminders || [];
    return { ...m, reminders: [...existing, { user: 'me', ...lr }] };
  });
  const tasksHere = D.tasks.filter(t => t.chat === chat.id);

  const previewExtraction = React.useMemo(() => parseEntities(composer), [composer]);
  const replyMsg = replyTo ? baseMessages.find(m => m.id === replyTo) : null;

  const handleSend = () => {
    if (!composer.trim()) return;
    setComposer('');
    setReplyTo(null);
  };

  const setReminder = (msgId, label) => {
    setLocalReminders(prev => ({ ...prev, [msgId]: { at: 'set', label } }));
    setOpenRemindFor(null);
  };

  // close any popover when clicking outside
  React.useEffect(() => {
    if (!openInfoFor && !openRemindFor) return;
    const h = () => { setOpenInfoFor(null); setOpenRemindFor(null); };
    window.addEventListener('click', h);
    return () => window.removeEventListener('click', h);
  }, [openInfoFor, openRemindFor]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: 'var(--bg-0)' }}>
      {/* Header */}
      <div style={{
        padding: '10px 16px',
        background: 'var(--bg-2)',
        borderBottom: '1px solid var(--line)',
        display: 'flex', alignItems: 'center', gap: 13,
      }}>
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
          <button title="Search" style={hdrBtn}><Icons.search size={17} stroke="var(--ink-2)" /></button>
          <button title="Extracted data + tasks" onClick={() => setShowPanel(p => !p)}
            style={{ ...hdrBtn, background: showPanel ? 'var(--bg-3)' : 'transparent', color: showPanel ? 'var(--green-2)' : 'var(--ink-2)' }}>
            <Icons.spark size={17} stroke={showPanel ? 'var(--green-2)' : 'var(--ink-2)'} />
          </button>
          <button title="More" style={hdrBtn}><Icons.more size={17} stroke="var(--ink-2)" /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-pattern" style={{ flex: 1, overflow: 'auto', padding: '20px 7%', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {messages.map((m, i) => (
          <MessageBubble key={m.id || i} m={m} prev={messages[i - 1]}
            allMessages={baseMessages}
            chatKind={chat.kind}
            chatMembers={chat.members}
            onChipClick={(eid) => setHighlighted(h => h === eid ? null : eid)}
            highlighted={highlighted}
            tasks={m.kind === 'extract' ? tasksHere.filter(t => t.chat === chat.id).slice(0, 3) : null}
            onReply={() => { setReplyTo(m.id); setOpenInfoFor(null); setOpenRemindFor(null); }}
            onRemind={(e) => { e?.stopPropagation?.(); setOpenRemindFor(rf => rf === m.id ? null : m.id); setOpenInfoFor(null); }}
            onInfo={(e) => { e?.stopPropagation?.(); setOpenInfoFor(of => of === m.id ? null : m.id); setOpenRemindFor(null); }}
            infoOpen={openInfoFor === m.id}
            remindOpen={openRemindFor === m.id}
            onPickReminder={(label) => setReminder(m.id, label)}
            onCloseInfo={() => setOpenInfoFor(null)}
          />
        ))}

        {/* Typing */}
        {chat.id === 'c1' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, marginLeft: 4 }}>
            <div className="bubble received" style={{ padding: '8px 14px', display: 'flex', gap: 4 }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  width: 6, height: 6, borderRadius: 999, background: 'var(--ink-3)',
                  animation: `pulse-dot 1.2s ease-in-out ${i * 0.18}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Composer */}
      <div style={{
        background: 'var(--bg-2)', padding: '8px 14px',
        borderTop: '1px solid var(--line)',
      }}>
        {replyMsg && (
          <ReplyBar m={replyMsg} onClear={() => setReplyTo(null)} />
        )}
        {composer && previewExtraction.length > 0 && (
          <div style={{
            margin: '0 0 8px', padding: '6px 10px',
            background: 'var(--green-soft)', border: '1px solid rgba(6,207,156,0.28)',
            borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
          }}>
            <Icons.spark size={12} stroke="#6FE3C2" />
            <span style={{ fontSize: 11.5, color: '#6FE3C2', fontWeight: 600 }}>Will extract:</span>
            {previewExtraction.map((p, i) => <span key={i} className="chip">{p.kind}: {p.value}</span>)}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          <button style={hdrBtn} title="Emoji"><Icons.smile size={20} stroke="var(--ink-2)" /></button>
          <button style={hdrBtn} title="Attach"><Icons.paper size={20} stroke="var(--ink-2)" /></button>
          <textarea
            value={composer}
            onChange={e => setComposer(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={replyMsg ? 'Reply…' : 'Type a message'}
            rows={1}
            style={{
              flex: 1, background: 'var(--bg-3)', border: 'none',
              borderRadius: 8, padding: '9px 12px',
              color: 'var(--ink-0)', fontSize: 14, lineHeight: 1.45,
              outline: 'none', resize: 'none',
              fontFamily: 'var(--ui)',
              minHeight: 38, maxHeight: 120,
            }}
          />
          {composer.trim() ? (
            <button onClick={handleSend} title="Send" style={{
              width: 38, height: 38, borderRadius: 999,
              background: 'var(--green)', border: 'none',
              display: 'grid', placeItems: 'center', cursor: 'pointer',
            }}>
              <Icons.send size={17} stroke="#0B141A" sw={2}/>
            </button>
          ) : (
            <button title="Voice note" style={{
              width: 38, height: 38, borderRadius: 999,
              background: 'var(--green)', border: 'none',
              display: 'grid', placeItems: 'center', cursor: 'pointer',
            }}>
              <Icons.mic size={17} stroke="#0B141A" sw={2}/>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Quoted-reply preview bar above the composer
function ReplyBar({ m, onClear }) {
  const D = window.KredeshData;
  const u = D.byId(D.users, m.from);
  const text = previewOf(m);
  return (
    <div style={{
      display: 'flex', alignItems: 'stretch', gap: 0,
      margin: '0 0 8px',
      background: 'var(--bg-3)', borderRadius: 8, overflow: 'hidden',
    }}>
      <div style={{ width: 4, background: getNameColor(m.from) }} />
      <div style={{ flex: 1, padding: '7px 11px', minWidth: 0 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: getNameColor(m.from), marginBottom: 1 }}>
          Replying to {u?.name || '—'}
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {text}
        </div>
      </div>
      <button onClick={onClear} style={{
        background: 'transparent', border: 'none', color: 'var(--ink-3)',
        padding: '0 12px', cursor: 'pointer', fontSize: 16,
      }}>✕</button>
    </div>
  );
}

// Plain-text preview of a message (flattens segments)
function previewOf(m) {
  if (!m) return '';
  if (m.segments) return m.segments.map(s => s.t).join('').replace(/\n+/g, ' · ').slice(0, 90);
  if (m.voice) return '🎤 Voice note · ' + m.voice.dur;
  if (m.attachments?.length) return '📄 ' + m.attachments[0].name;
  if (m.text) return m.text;
  return '';
}

function MessageBubble({
  m, prev, allMessages, chatKind, chatMembers,
  onChipClick, highlighted, tasks,
  onReply, onRemind, onInfo,
  infoOpen, remindOpen, onPickReminder, onCloseInfo,
}) {
  const D = window.KredeshData;
  const [hover, setHover] = React.useState(false);

  if (m.kind === 'system') {
    return <div className="bubble system">{m.text}</div>;
  }
  if (m.kind === 'extract') {
    return <ExtractBubble m={m} tasks={tasks} />;
  }
  const u = D.byId(D.users, m.from);
  const isMe = u?.isMe;
  const sameAsPrev = prev?.from === m.from;
  const replied = m.replyTo ? allMessages?.find(x => x.id === m.replyTo) : null;
  const myReminder = (m.reminders || []).find(r => r.user === 'me');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', marginTop: sameAsPrev ? 1 : 7, alignItems: isMe ? 'flex-end' : 'flex-start' }}>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{ position: 'relative', maxWidth: '72%', display: 'flex', alignItems: 'flex-start' }}
      >
        <div className={`bubble ${isMe ? 'sent' : 'received'}`} style={{ maxWidth: '100%' }}>
          {!isMe && !sameAsPrev && (
            <div style={{ fontSize: 11.5, fontWeight: 600, color: getNameColor(m.from), marginBottom: 1 }}>{u?.name}</div>
          )}

          {/* Quoted reply */}
          {replied && <QuotedSnippet m={replied} />}

          {m.segments && (
            <span style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
              {m.segments.map((seg, i) => {
                if (!seg.hl) return <span key={i}>{seg.t}</span>;
                const cls = 'hl' + (seg.hl === 'warn' ? ' warn' : '') + (highlighted === seg.entity ? ' active' : '');
                return <span key={i} className={cls} onClick={() => onChipClick?.(seg.entity)}>{seg.t}</span>;
              })}
            </span>
          )}
          {m.attachments && (
            <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {m.attachments.map((a, i) => <DocAttachment key={i} a={a} />)}
            </div>
          )}
          {m.voice && <VoiceWaveform v={m.voice} sent={isMe} />}

          <span className="meta">
            {m.at}
            {isMe && (
              <button
                onClick={chatKind === 'group' ? onInfo : undefined}
                title={chatKind === 'group' ? 'Read by…' : ''}
                style={{
                  background: 'none', border: 'none', padding: 0, cursor: chatKind === 'group' ? 'pointer' : 'default',
                  display: 'inline-flex', alignItems: 'center', marginLeft: 2,
                }}
              >
                <ReadTicks read={m.status === 'read'} />
              </button>
            )}
          </span>
        </div>

        {/* Hover action menu */}
        {hover && (
          <MessageActions isMe={isMe} onReply={onReply} onRemind={onRemind} />
        )}

        {/* Read info popover (own message, group chat) */}
        {infoOpen && isMe && chatKind === 'group' && (
          <ReadInfoPopover m={m} members={chatMembers} onClose={onCloseInfo} />
        )}

        {/* Remind menu */}
        {remindOpen && (
          <RemindMenu onPick={onPickReminder} isMe={isMe} />
        )}
      </div>

      {/* Reminder pill (under bubble) */}
      {myReminder && (
        <div style={{
          marginTop: 4, padding: '3px 8px',
          background: 'var(--warn-soft)', border: '1px solid rgba(255,176,32,0.32)',
          borderRadius: 999, fontSize: 10.5, color: '#FCD68A',
          display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 600,
        }}>
          <Icons.bell size={11} stroke="#FCD68A" />
          {myReminder.label}
        </div>
      )}
    </div>
  );
}

function QuotedSnippet({ m }) {
  const D = window.KredeshData;
  const u = D.byId(D.users, m.from);
  return (
    <div style={{
      display: 'flex', alignItems: 'stretch',
      marginBottom: 6,
      background: 'rgba(11,20,26,0.35)', borderRadius: 6, overflow: 'hidden',
      maxWidth: '100%',
    }}>
      <div style={{ width: 3, background: getNameColor(m.from), flexShrink: 0 }} />
      <div style={{ padding: '4px 8px 5px', minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: getNameColor(m.from), lineHeight: 1.2 }}>{u?.name || '—'}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.35, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 360 }}>
          {previewOf(m)}
        </div>
      </div>
    </div>
  );
}

function MessageActions({ isMe, onReply, onRemind }) {
  const side = isMe ? { right: '100%', marginRight: 6 } : { left: '100%', marginLeft: 6 };
  return (
    <div style={{
      position: 'absolute', top: 6, ...side,
      display: 'flex', gap: 2,
      background: 'var(--bg-1)', border: '1px solid var(--line-2)',
      borderRadius: 999, padding: 2,
      boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
      zIndex: 5,
    }} onClick={e => e.stopPropagation()}>
      <button onClick={onReply} title="Reply" style={actionBtn}>
        <Icons.arrow size={13} stroke="var(--ink-1)" sw={2}/>
      </button>
      <button onClick={onRemind} title="Remind me" style={actionBtn}>
        <Icons.bell size={13} stroke="var(--ink-1)" sw={1.8}/>
      </button>
      <button title="More" style={actionBtn}>
        <Icons.more size={13} stroke="var(--ink-1)" sw={1.8}/>
      </button>
    </div>
  );
}

const actionBtn = {
  width: 26, height: 26, borderRadius: 999,
  background: 'transparent', border: 'none', cursor: 'pointer',
  display: 'grid', placeItems: 'center',
};

function RemindMenu({ onPick, isMe }) {
  const side = isMe ? { right: 0 } : { left: 0 };
  const options = [
    { label: 'In 15 min',   value: 'In 15 min' },
    { label: 'In 1 hour',   value: 'In 1 hour' },
    { label: 'In 4 hours',  value: 'In 4 hours' },
    { label: 'Tomorrow 08:00', value: 'Tomorrow 08:00' },
    { label: '1h before ETA', value: '1h before ETA' },
  ];
  return (
    <div onClick={e => e.stopPropagation()} style={{
      position: 'absolute', top: '100%', ...side,
      marginTop: 6, minWidth: 200,
      background: 'var(--bg-1)', border: '1px solid var(--line-2)',
      borderRadius: 10, padding: 6,
      boxShadow: '0 14px 40px rgba(0,0,0,0.5)',
      zIndex: 10,
    }}>
      <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: 0.7, textTransform: 'uppercase', padding: '6px 8px 4px' }}>
        Remind me
      </div>
      {options.map(o => (
        <button key={o.value} onClick={() => onPick(o.value)} style={{
          width: '100%', textAlign: 'left',
          padding: '7px 9px', background: 'transparent', border: 'none',
          color: 'var(--ink-1)', fontSize: 12.5, borderRadius: 6, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Icons.bell size={12} stroke="#FCD68A" /> {o.label}
        </button>
      ))}
    </div>
  );
}

function ReadInfoPopover({ m, members, onClose }) {
  const D = window.KredeshData;
  const readBy = m.readBy || [];
  const memberIds = (members || []).filter(id => id !== 'me');
  const rows = memberIds.map(id => {
    const u = D.byId(D.users, id);
    const r = readBy.find(x => x.user === id);
    return { u, read: !!r, at: r?.at };
  });
  const readCount = rows.filter(r => r.read).length;

  return (
    <div onClick={e => e.stopPropagation()} style={{
      position: 'absolute', top: '100%', right: 0,
      marginTop: 6, width: 260,
      background: 'var(--bg-1)', border: '1px solid var(--line-2)',
      borderRadius: 11, overflow: 'hidden',
      boxShadow: '0 14px 40px rgba(0,0,0,0.55)',
      zIndex: 12,
    }}>
      <div style={{ padding: '10px 13px 8px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.6, fontFamily: 'var(--mono)' }}>Message info</div>
        <div style={{ marginTop: 4, fontSize: 13, fontWeight: 600 }}>
          <span style={{ color: 'var(--read)' }}>{readCount}</span>
          <span style={{ color: 'var(--ink-2)' }}> of {rows.length} read</span>
        </div>
      </div>
      <div style={{ maxHeight: 260, overflow: 'auto' }}>
        {rows.map(({ u, read, at }) => u && (
          <div key={u.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 13px',
            borderBottom: '1px solid var(--line)',
          }}>
            <Avatar user={u} size={26} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--ink-0)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>
                {read ? `Read · ${at}` : 'Delivered'}
              </div>
            </div>
            <ReadTicks read={read} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ReadTicks({ read }) {
  return (
    <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
      <path d="M4 6l2 2 4-5" stroke={read ? 'var(--read)' : 'rgba(233,237,239,0.6)'} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M8 6l2 2 4-5" stroke={read ? 'var(--read)' : 'rgba(233,237,239,0.6)'} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

function getNameColor(fromId) {
  const palette = ['#FFB020','#06CF9C','#3B82F6','#A78BFA','#F472B6','#F15C6D','#00A884'];
  let h = 0;
  for (let i = 0; i < (fromId || '').length; i++) h = (h * 31 + fromId.charCodeAt(i)) | 0;
  return palette[Math.abs(h) % palette.length];
}

function DocAttachment({ a }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '9px 11px',
      background: 'rgba(0,0,0,0.18)',
      borderRadius: 7,
    }}>
      <div style={{
        width: 28, height: 34, borderRadius: 4,
        background: 'linear-gradient(180deg, #182229, #0F1A20)',
        border: '1px solid var(--line-2)',
        display: 'grid', placeItems: 'center',
      }}>
        <span className="mono" style={{ fontSize: 8, color: '#6FE3C2', fontWeight: 700 }}>PDF</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-0)' }}>{a.name}</div>
        <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{a.size}</div>
      </div>
      <Icons.download size={15} stroke="var(--ink-2)" />
    </div>
  );
}

function VoiceWaveform({ v, sent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 200, padding: '4px 4px 2px' }}>
      <button style={{
        width: 26, height: 26, borderRadius: 999,
        background: sent ? 'rgba(255,255,255,0.18)' : 'var(--green)',
        border: 'none', display: 'grid', placeItems: 'center',
      }}>
        <Icons.play size={11} stroke={sent ? '#fff' : '#0B141A'} fill={sent ? '#fff' : '#0B141A'} sw={0}/>
      </button>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2, height: 20 }}>
        {v.waveform.map((h, i) => (
          <div key={i} style={{
            width: 2, height: Math.max(3, h),
            background: i < 9 ? (sent ? '#fff' : 'var(--green-2)') : (sent ? 'rgba(255,255,255,0.35)' : 'var(--ink-4)'),
            borderRadius: 1,
          }} />
        ))}
      </div>
      <span className="mono" style={{ fontSize: 11, color: sent ? 'rgba(255,255,255,0.7)' : 'var(--ink-2)' }}>{v.dur}</span>
    </div>
  );
}

// AI extract — special inline "system" card
function ExtractBubble({ m, tasks }) {
  return (
    <div style={{
      alignSelf: 'center',
      maxWidth: '78%',
      padding: '11px 14px',
      background: 'rgba(0,168,132,0.10)',
      border: '1px solid rgba(6,207,156,0.28)',
      borderRadius: 10,
      margin: '6px 0',
      boxShadow: '0 1px 0.5px rgba(11,20,26,0.13)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9 }}>
        <Icons.spark size={13} stroke="#6FE3C2" />
        <span style={{ fontSize: 12, fontWeight: 700, color: '#6FE3C2' }}>Kredesh extracted {m.fields} fields · created {m.tasks} tasks</span>
        <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginLeft: 'auto' }}>{m.at}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {(tasks || []).map(t => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '5px 7px', borderRadius: 6, background: 'rgba(11,20,26,0.4)' }}>
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

// ────────────────────────────────────────────────────────────────
// RIGHT — extraction panel
// ────────────────────────────────────────────────────────────────
function ExtractionPanel({ chat, setRoute }) {
  const D = window.KredeshData;
  // Fields extracted from the actual WHS 24 OPERATIONS thread (c1)
  const fields = [
    { label: 'Container',       value: 'FSCU8065100',                    icon: 'pkg'   },
    { label: 'Size',            value: '12m',                            icon: 'truck' },
    { label: 'ISO',             value: 'ISO68750',                       icon: 'pkg'   },
    { label: 'Destination',     value: 'F24 wrhs · for Tristar',         icon: 'pin2'  },
    { label: 'Transporter',     value: 'African Steer',                  icon: 'truck' },
    { label: 'Linehaul',        value: 'Joeys Linehaul',                 icon: 'truck' },
    { label: 'Driver',          value: 'Eugene',                         icon: 'user'  },
    { label: 'Horse',           value: 'CT17549',                        icon: 'truck' },
    { label: 'Trailer 1',       value: 'CT26295',                        icon: 'truck' },
    { label: 'Trailer 2',       value: 'CT26343',                        icon: 'truck' },
    { label: 'Driver cell',     value: '072 611 7096',                   icon: 'user'  },
    { label: 'Driver ID',       value: '8201205299080',                  icon: 'shield'},
    { label: 'ETA',             value: '08h45',                          icon: 'clock' },
    { label: 'Cargo · Joeys',   value: 'SLES → Tristar, Prospecton',     icon: 'pkg'   },
    { label: 'Tomorrow plan',   value: '2× 20ft Allied · 1× 20ft Prime · 1× 20ft Slackwax · 1× Caustic Soda', icon: 'pkg' },
    { label: 'Unpack teams',    value: '2 booked',                       icon: 'users' },
    { label: 'Customer visit',  value: 'Tronox · DBN · Thu–Fri (TBC)',   icon: 'user'  },
    { label: 'Incident',        value: 'Drums collapsed',                icon: 'warn', tone: 'warn' },
    { label: 'Allied #1',       value: 'At warehouse ✓',                 icon: 'check' },
    { label: 'Allied #2',       value: 'On route',                       icon: 'truck', tone: 'warn' },
  ];
  const chatTasks = D.tasks.filter(t => t.chat === chat.id);

  return (
    <aside style={{
      width: 340, flexShrink: 0,
      background: 'var(--bg-1)',
      borderLeft: '1px solid var(--line)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-2)' }}>
        <Icons.spark size={15} stroke="#6FE3C2" />
        <span style={{ fontSize: 14, fontWeight: 600 }}>Extracted data</span>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 14px 18px' }}>
        <SectionLabel>{fields.length} fields</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
          {fields.map((f, i) => {
            const Ico = Icons[f.icon];
            const color = f.tone === 'warn' ? '#FCD68A' : '#6FE3C2';
            return (
              <div key={i} style={{
                display: 'flex', gap: 10, alignItems: 'flex-start',
                padding: '9px 11px',
                background: 'var(--bg-2)', border: '1px solid var(--line)',
                borderRadius: 9,
              }}>
                <Ico size={14} stroke={color} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 2 }}>{f.label}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-0)', fontWeight: 500, lineHeight: 1.35, wordBreak: 'break-word' }}>{f.value}</div>
                </div>
                <Icons.copy size={12} stroke="var(--ink-4)" />
              </div>
            );
          })}
        </div>

        <SectionLabel right={<Pill tone="green">{chatTasks.length}</Pill>}>Auto-tasks</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {chatTasks.map(t => {
            const a = D.byId(D.users, t.assignee);
            return (
              <button key={t.id} onClick={() => setRoute({ screen: 'tasks', taskId: t.id })} style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '9px 11px', textAlign: 'left',
                background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 9,
                cursor: 'pointer', width: '100%',
              }}>
                <TaskCheckbox status={t.status} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, color: t.status === 'complete' ? 'var(--ink-3)' : 'var(--ink-0)', textDecoration: t.status === 'complete' ? 'line-through' : 'none', lineHeight: 1.35 }}>
                    {t.title}
                  </div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>
                    {a?.initials || '—'} · {t.due}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 18, padding: '11px 12px', background: 'var(--bg-2)', border: '1px dashed var(--line-2)', borderRadius: 10, display: 'flex', gap: 9, alignItems: 'flex-start' }}>
          <Icons.spark size={13} stroke="#6FE3C2" />
          <div style={{ fontSize: 11.5, color: 'var(--ink-2)', lineHeight: 1.5 }}>
            Tasks are created automatically from the conversation. Tap any field to copy it, or open the Tasks tab to mark them complete.
          </div>
        </div>
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

// ── helpers ──
function sampleMessages(chat) {
  const D = window.KredeshData;
  if (chat.kind === 'group') {
    return [
      { kind: 'system', text: 'Today' },
      { id: 'gm1', from: 'u2', at: 'Yesterday 16:31', segments: [{ t: '3 trucks waiting on yard assignment — anyone available?' }] },
      { id: 'gm2', from: 'u1', at: 'Yesterday 16:34', segments: [{ t: 'I can take T-619. What\'s the bay?' }] },
      { id: 'gm3', from: 'me', at: 'Yesterday 16:38', segments: [{ t: 'I\'ll grab T-881 and T-442. Pushing to bay 14 and 16.' }], status: 'read' },
      { id: 'gm4', from: 'u4', at: 'Yesterday 16:40', segments: [{ t: 'Copy. All three assigned ✅' }] },
    ];
  }
  const other = D.byId(D.users, chat.with) || D.users[1];
  return [
    { kind: 'system', text: 'Today' },
    { id: 'sm1', from: other.id, at: '10:55', segments: [{ t: chat.preview }] },
    { id: 'sm2', from: 'me', at: '11:02', segments: [{ t: 'Got it — assigning a task for follow-up.' }], status: 'read' },
  ];
}

function parseEntities(text) {
  if (!text) return [];
  const out = [];
  // Container: FSCU8065100 or 4-letter + 7 digits (ISO 6346 ish)
  const cont = text.match(/\b[A-Z]{4}\d{6,7}\b/);
  if (cont) out.push({ kind: 'Container', value: cont[0] });
  // Vehicle/trailer plate: CT17549, CT26295
  const plate = text.match(/\b(CT|GP|ZN|NP|EC|FS|WC|NW|LP)\d{4,6}\b/);
  if (plate) out.push({ kind: 'Vehicle', value: plate[0] });
  // ETA: 08h45 / 8h45
  const eta = text.match(/\b\d{1,2}h\d{2}\b/i);
  if (eta) out.push({ kind: 'ETA', value: eta[0] });
  // Size: 20ft, 40ft, 12m
  const size = text.match(/\b(20|40)\s*ft\b|\b\d{1,2}\s*m\b/i);
  if (size) out.push({ kind: 'Size', value: size[0] });
  // ISO doc
  const iso = text.match(/\bISO\d{4,6}\b/i);
  if (iso) out.push({ kind: 'ISO', value: iso[0] });
  // ID (13 digits)
  const id = text.match(/\b\d{13}\b/);
  if (id) out.push({ kind: 'ID', value: id[0] });
  // Cell (SA: 10 digits starting 0)
  const cell = text.match(/\b0\d{9}\b/);
  if (cell) out.push({ kind: 'Cell', value: cell[0] });
  return out;
}

Object.assign(window, { ChatsScreen });
