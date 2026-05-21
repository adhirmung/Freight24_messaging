// Inbox — left list of threads + main pane = ThreadView
function InboxScreen({ route, setRoute, user }) {
  const D = window.KredeshData;
  const [filter, setFilter] = React.useState('all');
  const [q, setQ] = React.useState('');
  const [showWhatsAppImport, setShowWhatsAppImport] = React.useState(false);

  const activeId = route.threadId || 't1';
  const active = D.threads.find(t => t.id === activeId) || D.threads[0];

  const filtered = D.threads.filter(t => {
    if (filter === 'unread' && !t.unread) return false;
    if (filter === 'carriers' && t.kind !== 'carrier' && t.kind !== 'broker') return false;
    if (filter === 'drivers' && t.kind !== 'driver') return false;
    if (filter === 'warehouse' && t.kind !== 'warehouse') return false;
    if (filter === 'channels' && t.kind !== 'channel') return false;
    if (q && !(t.title + ' ' + t.preview).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flex: 1, minWidth: 0 }}>
      {/* WhatsApp Import Modal */}
      {showWhatsAppImport && (
        <WhatsAppImportModal
          onClose={() => setShowWhatsAppImport(false)}
          onImport={({ threadId }) => {
            setRoute({ screen: 'inbox', threadId });
            setShowWhatsAppImport(false);
          }}
        />
      )}

      {/* Thread list */}
      <div style={{
        width: 308, flexShrink: 0,
        borderRight: '1px solid var(--line)',
        background: 'var(--bg-1)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Inbox</h2>
            <div style={{ display: 'flex', gap: 4 }}>
              <button title="Filter" style={iconBtn}><Icons.filter size={14} stroke="var(--ink-2)" /></button>
              <button
                title="Import from WhatsApp"
                onClick={() => setShowWhatsAppImport(true)}
                style={{ ...iconBtn, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 6 }}
              >
                <WhatsAppIcon size={14} />
              </button>
              <button title="New message" style={iconBtn}><Icons.plus size={14} stroke="var(--ink-2)" /></button>
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '6px 9px',
            background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 7,
          }}>
            <Icons.search size={13} stroke="var(--ink-3)" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search messages, PROs, addresses…"
              style={{ flex: 1, background: 'none', border: 'none', color: 'var(--ink-0)', fontSize: 12.5, outline: 'none' }} />
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 4, padding: '8px 10px', borderBottom: '1px solid var(--line)', overflowX: 'auto' }}>
          {[
            { id: 'all', label: 'All' },
            { id: 'unread', label: 'Unread' },
            { id: 'carriers', label: 'Carriers' },
            { id: 'drivers', label: 'Drivers' },
            { id: 'warehouse', label: 'Warehouse' },
            { id: 'channels', label: 'Channels' },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              style={{
                padding: '4px 9px', borderRadius: 6,
                background: filter === f.id ? 'var(--bg-3)' : 'transparent',
                color: filter === f.id ? 'var(--ink-0)' : 'var(--ink-2)',
                border: '1px solid', borderColor: filter === f.id ? 'var(--line-2)' : 'transparent',
                fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap',
              }}>{f.label}</button>
          ))}
        </div>

        {/* Thread items */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {filtered.map(t => <ThreadRow key={t.id} t={t} active={t.id === activeId} onClick={() => setRoute({ screen: 'inbox', threadId: t.id })} />)}
          {filtered.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>No threads match.</div>
          )}
        </div>
      </div>

      {/* Thread view */}
      <ThreadView thread={active} user={user} />
    </div>
  );
}

const iconBtn = {
  width: 26, height: 26, display: 'grid', placeItems: 'center',
  background: 'transparent', border: '1px solid transparent',
  borderRadius: 6, color: 'var(--ink-2)',
};

function ThreadRow({ t, active, onClick }) {
  const D = window.KredeshData;
  const w = t.with ? D.byId(D.users, t.with) : null;
  const kindLabel = {
    carrier: 'Carrier', driver: 'Driver', warehouse: 'Warehouse', broker: 'Broker',
    channel: 'Channel', dm: 'DM',
  }[t.kind] || '—';
  const kindTone = {
    carrier: 'warn', driver: 'cyan', warehouse: 'purple', broker: 'blue', channel: 'neutral', dm: 'neutral',
  }[t.kind] || 'neutral';

  return (
    <button onClick={onClick}
      style={{
        display: 'block', width: '100%',
        padding: '11px 14px', textAlign: 'left',
        background: active ? 'var(--bg-3)' : 'transparent',
        border: 'none',
        borderLeft: '2px solid', borderLeftColor: active ? 'var(--brand)' : 'transparent',
        borderBottom: '1px solid var(--line)',
        cursor: 'pointer',
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
        {w ? <Avatar user={w} size={26} /> : (
          <div style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--bg-3)', display: 'grid', placeItems: 'center', color: 'var(--ink-2)', fontFamily: 'var(--mono)', fontSize: 14 }}>#</div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {t.pinned && <Icons.pin size={11} stroke="var(--ink-3)" />}
            <span style={{ fontSize: 13, fontWeight: t.unread ? 700 : 600, color: t.alert ? '#FCA5A5' : 'var(--ink-0)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {t.title}
            </span>
          </div>
        </div>
        <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', flexShrink: 0 }}>{t.lastAt}</span>
      </div>

      <div style={{
        fontSize: 12.5, color: t.unread ? 'var(--ink-1)' : 'var(--ink-3)',
        lineHeight: 1.45,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {t.preview}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 7 }}>
        <Pill tone={kindTone}>{kindLabel}</Pill>
        {(t.tags || []).slice(0, 2).map(tg => (
          <span key={tg} className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', padding: '1px 6px', borderRadius: 4, background: 'var(--bg-3)' }}>#{tg}</span>
        ))}
        <div style={{ flex: 1 }} />
        {t.unread > 0 && (
          <span className="mono" style={{ fontSize: 10, fontWeight: 700, color: '#fff', background: t.alert ? 'var(--bad)' : 'var(--brand)', padding: '1px 6px', borderRadius: 999 }}>{t.unread}</span>
        )}
      </div>
    </button>
  );
}

Object.assign(window, { InboxScreen });
