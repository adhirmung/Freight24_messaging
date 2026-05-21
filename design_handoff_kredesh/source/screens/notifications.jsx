// Notifications
function NotificationsScreen() {
  const D = window.KredeshData;
  const [tab, setTab] = React.useState('all'); // all | unread | alerts | tasks | mentions
  const [items, setItems] = React.useState(D.notifications);

  const filter = {
    all: () => true,
    unread: n => !n.read,
    alerts: n => n.kind === 'alert',
    tasks: n => n.kind === 'task',
    mentions: n => n.kind === 'mention',
  };
  const visible = items.filter(filter[tab]);

  const markAllRead = () => setItems(items.map(n => ({ ...n, read: true })));

  const kindColor = {
    alert: { bg: 'var(--bad-soft)', fg: '#FCA5A5', bd: 'rgba(239,68,68,0.32)', icon: 'warn' },
    task:  { bg: 'var(--brand-soft)', fg: '#93C5FD', bd: 'rgba(59,130,246,0.28)', icon: 'tasks' },
    doc:   { bg: 'var(--cyan-soft)', fg: '#67E8F9', bd: 'rgba(34,211,238,0.28)', icon: 'doc' },
    mention:{ bg: 'rgba(167,139,250,0.14)', fg: '#C4B5FD', bd: 'rgba(167,139,250,0.32)', icon: 'user' },
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <TopBar title="Notifications" subtitle="System events, mentions, document drops, task assignments." right={
        <Btn size="sm" icon={<Icons.check size={13} sw={2.2} />} onClick={markAllRead}>Mark all read</Btn>
      } />

      <div style={{ padding: '0 22px', display: 'flex', alignItems: 'center', gap: 22, borderBottom: '1px solid var(--line)', background: 'var(--bg-1)' }}>
        {[
          { id: 'all', label: 'All' },
          { id: 'unread', label: 'Unread' },
          { id: 'alerts', label: 'Alerts' },
          { id: 'tasks', label: 'Tasks' },
          { id: 'mentions', label: '@Mentions' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '12px 0', background: 'transparent', border: 'none',
            borderBottom: '2px solid', borderBottomColor: tab === t.id ? 'var(--brand)' : 'transparent',
            color: tab === t.id ? 'var(--ink-0)' : 'var(--ink-2)',
            fontSize: 13.5, fontWeight: 600,
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px', maxWidth: 920, width: '100%', margin: '0 auto' }}>
        {visible.length === 0 && (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--ink-3)' }}>You're all caught up.</div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {visible.map(n => {
            const k = kindColor[n.kind] || kindColor.task;
            const Ico = Icons[k.icon];
            return (
              <div key={n.id} style={{
                padding: '13px 14px',
                background: n.read ? 'var(--bg-2)' : 'var(--bg-3)',
                border: '1px solid', borderColor: n.read ? 'var(--line)' : 'var(--line-2)',
                borderLeft: '3px solid', borderLeftColor: k.fg,
                borderRadius: 10,
                display: 'flex', gap: 12, alignItems: 'flex-start',
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: k.bg, border: '1px solid ' + k.bd, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Ico size={14} stroke={k.fg} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-0)' }}>{n.title}</span>
                    {!n.read && <span className="dot" style={{ background: 'var(--brand)' }} />}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 3, lineHeight: 1.5 }}>{n.body}</div>
                </div>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{n.at}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { NotificationsScreen });
