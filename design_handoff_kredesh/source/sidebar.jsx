// Sidebar — primary navigation
function Sidebar({ route, setRoute, user }) {
  const D = window.KredeshData;
  const unreadCount = D.threads.reduce((s, t) => s + (t.unread || 0), 0);
  const taskCount = D.tasks.filter(t => t.status === 'pending').length;
  const notifCount = D.notifications.filter(n => !n.read).length;

  const items = [
    { id: 'inbox',     label: 'Inbox',          icon: Icons.inbox, badge: unreadCount },
    { id: 'tasks',     label: 'Tasks',          icon: Icons.tasks, badge: taskCount },
    { id: 'shipments', label: 'Shipments',      icon: Icons.truck },
    { id: 'notifications', label: 'Notifications', icon: Icons.bell, badge: notifCount },
    { id: 'reports',   label: 'Reports',        icon: Icons.chart },
  ];
  const bottomItems = [
    { id: 'settings',  label: 'Settings',       icon: Icons.gear },
    { id: 'admin',     label: 'Admin',          icon: Icons.shield, admin: true },
    { id: 'driver',    label: 'Mobile (driver)', icon: Icons.qr },
  ];

  const NavRow = ({ it }) => {
    const active = route.screen === it.id;
    return (
      <button
        onClick={() => setRoute({ screen: it.id })}
        style={{
          display: 'flex', alignItems: 'center', gap: 11,
          width: '100%', padding: '8px 11px',
          background: active ? 'var(--bg-3)' : 'transparent',
          border: '1px solid', borderColor: active ? 'var(--line-2)' : 'transparent',
          color: active ? 'var(--ink-0)' : 'var(--ink-1)',
          borderRadius: 8,
          fontSize: 13.5, fontWeight: 500,
          textAlign: 'left', position: 'relative',
        }}
      >
        <it.icon size={17} stroke={active ? 'var(--brand)' : 'var(--ink-2)'} />
        <span style={{ flex: 1 }}>{it.label}</span>
        {it.badge ? (
          <span className="mono" style={{
            fontSize: 10.5, fontWeight: 600,
            background: it.id === 'notifications' ? 'var(--bad)' : 'var(--brand)',
            color: '#fff',
            padding: '1px 6px', borderRadius: 999, minWidth: 18, textAlign: 'center',
          }}>{it.badge}</span>
        ) : null}
      </button>
    );
  };

  return (
    <aside style={{
      width: 216, background: 'var(--bg-1)',
      borderRight: '1px solid var(--line)',
      display: 'flex', flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* logo */}
      <div style={{ padding: '14px 14px 10px', display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          background: 'linear-gradient(135deg, #3B82F6, #22D3EE)',
          display: 'grid', placeItems: 'center',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 2px 12px rgba(59,130,246,0.35)',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 10h7l3-3-3-3H2v6Z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round"/>
            <circle cx="4.5" cy="11.5" r="1" fill="#fff"/>
            <circle cx="10" cy="11.5" r="1" fill="#fff"/>
          </svg>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontWeight: 700, fontSize: 14.5, letterSpacing: -0.2 }}>Freight 24 Messaging</div>
          <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: 0.5, textTransform: 'uppercase' }}>Logistics OS</div>
        </div>
      </div>

      {/* org switcher */}
      <button style={{
        margin: '4px 12px 14px', padding: '7px 9px',
        display: 'flex', alignItems: 'center', gap: 9,
        background: 'var(--bg-2)', border: '1px solid var(--line)',
        borderRadius: 8, color: 'var(--ink-1)', textAlign: 'left',
      }}>
        <Icons.building size={15} stroke="var(--ink-2)" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Freight 24 Messaging</div>
          <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)' }}>PDX • Tier 3</div>
        </div>
        <Icons.arrowDown size={12} stroke="var(--ink-3)" />
      </button>

      {/* primary nav */}
      <div style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {items.map(it => <NavRow key={it.id} it={it} />)}
      </div>

      {/* channels */}
      <div style={{ padding: '18px 14px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: 0.8, textTransform: 'uppercase' }}>Channels</span>
        <button style={{ background: 'none', border: 'none', color: 'var(--ink-3)', padding: 2 }} aria-label="Add channel">
          <Icons.plus size={13} />
        </button>
      </div>
      <div style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {D.channels.map(c => (
          <button key={c.id}
            onClick={() => setRoute({ screen: 'inbox', threadId: 't' + (c.alert ? '6' : '5') })}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 11px', background: 'transparent', border: 'none',
              color: c.alert ? '#FCA5A5' : 'var(--ink-1)',
              fontSize: 13, fontWeight: c.unread ? 600 : 400,
              textAlign: 'left', borderRadius: 6,
            }}>
            <span style={{ color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: 14 }}>#</span>
            <span style={{ flex: 1 }}>{c.name}</span>
            {c.alert ? <span className="dot" style={{ background: 'var(--bad)' }} /> : null}
            {c.unread ? (
              <span className="mono" style={{ fontSize: 10, color: 'var(--ink-0)', background: c.alert ? 'var(--bad)' : 'var(--brand)', padding: '1px 5px', borderRadius: 999 }}>{c.unread}</span>
            ) : null}
          </button>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      {/* bottom nav */}
      <div style={{ padding: '0 8px 6px', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {bottomItems.filter(it => !it.admin || user.isAdmin).map(it => <NavRow key={it.id} it={it} />)}
      </div>

      {/* user card */}
      <div style={{
        margin: 10, padding: '9px 10px',
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'var(--bg-2)', border: '1px solid var(--line)',
        borderRadius: 10,
      }}>
        <Avatar user={user} size={30} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name.replace('You — ', '')}</div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{user.role}</div>
        </div>
        <button title="Sign out" onClick={() => window.__signOut?.()} style={{ background: 'none', border: 'none', color: 'var(--ink-3)', padding: 4 }}>
          <Icons.logout size={15} />
        </button>
      </div>
    </aside>
  );
}

function Avatar({ user, size = 32, ring = false }) {
  if (!user) return null;
  return (
    <div style={{
      width: size, height: size, borderRadius: 999,
      background: user.avatar,
      display: 'grid', placeItems: 'center',
      fontFamily: 'var(--mono)', fontSize: size * 0.36, fontWeight: 700, color: '#0B1220',
      flexShrink: 0, position: 'relative',
      boxShadow: ring ? '0 0 0 2px var(--bg-1), 0 0 0 3px var(--brand)' : undefined,
    }}>
      {user.initials}
      {user.status === 'online' && (
        <span style={{
          position: 'absolute', right: -1, bottom: -1,
          width: Math.max(8, size * 0.28), height: Math.max(8, size * 0.28),
          borderRadius: 999, background: 'var(--ok)',
          border: '2px solid var(--bg-1)',
        }} />
      )}
      {user.status === 'away' && (
        <span style={{
          position: 'absolute', right: -1, bottom: -1,
          width: Math.max(8, size * 0.28), height: Math.max(8, size * 0.28),
          borderRadius: 999, background: 'var(--warn)',
          border: '2px solid var(--bg-1)',
        }} />
      )}
    </div>
  );
}

// Top bar of main content area
function TopBar({ title, subtitle, right, breadcrumb }) {
  return (
    <header style={{
      padding: '14px 22px',
      borderBottom: '1px solid var(--line)',
      background: 'var(--bg-1)',
      display: 'flex', alignItems: 'center', gap: 16,
      minHeight: 60,
    }}>
      <div style={{ flex: 1 }}>
        {breadcrumb && <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 3 }}>{breadcrumb}</div>}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600, letterSpacing: -0.2 }}>{title}</h1>
          {subtitle && <span style={{ color: 'var(--ink-2)', fontSize: 13 }}>{subtitle}</span>}
        </div>
      </div>
      {right}
    </header>
  );
}

// Generic search bar
function SearchInput({ placeholder = 'Search…', value, onChange, shortcut = '⌘K', wide = false }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '6px 10px',
      background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 8,
      minWidth: wide ? 360 : 240,
    }}>
      <Icons.search size={14} stroke="var(--ink-3)" />
      <input value={value} onChange={e => onChange?.(e.target.value)} placeholder={placeholder}
        style={{ flex: 1, background: 'none', border: 'none', color: 'var(--ink-0)', fontSize: 13, outline: 'none' }} />
      <span className="kbd">{shortcut}</span>
    </div>
  );
}

function Pill({ tone = 'neutral', children, style }) {
  const tones = {
    neutral: { bg: 'var(--bg-3)', fg: 'var(--ink-1)', bd: 'var(--line)' },
    blue:    { bg: 'var(--brand-soft)', fg: '#93C5FD', bd: 'rgba(59,130,246,0.28)' },
    cyan:    { bg: 'var(--cyan-soft)',  fg: '#67E8F9', bd: 'rgba(34,211,238,0.28)' },
    ok:      { bg: 'var(--ok-soft)',    fg: '#86EFAC', bd: 'rgba(34,197,94,0.32)' },
    warn:    { bg: 'var(--warn-soft)',  fg: '#FCD34D', bd: 'rgba(245,158,11,0.32)' },
    bad:     { bg: 'var(--bad-soft)',   fg: '#FCA5A5', bd: 'rgba(239,68,68,0.32)' },
    purple:  { bg: 'rgba(167,139,250,0.14)', fg: '#C4B5FD', bd: 'rgba(167,139,250,0.3)' },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 11, fontWeight: 600, letterSpacing: 0.1,
      padding: '2px 7px 3px', borderRadius: 999,
      background: t.bg, color: t.fg, border: `1px solid ${t.bd}`,
      ...style,
    }}>{children}</span>
  );
}

function Btn({ children, primary, ghost, danger, icon, size = 'md', style, ...rest }) {
  // filter — never let bare boolean style flags pass through to DOM
  void primary; void ghost; void danger;
  const sizes = { sm: { p: '5px 10px', fs: 12 }, md: { p: '8px 13px', fs: 13 }, lg: { p: '11px 18px', fs: 14 } };
  const s = sizes[size];
  let bg = 'var(--bg-3)', fg = 'var(--ink-0)', bd = 'var(--line-2)';
  if (primary) { bg = 'var(--brand)'; fg = '#fff'; bd = 'var(--brand)'; }
  if (ghost)   { bg = 'transparent'; fg = 'var(--ink-1)'; bd = 'transparent'; }
  if (danger)  { bg = 'var(--bad)'; fg = '#fff'; bd = 'var(--bad)'; }
  return (
    <button {...rest} style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: s.p, background: bg, color: fg,
      border: '1px solid ' + bd, borderRadius: 8,
      fontSize: s.fs, fontWeight: 600, lineHeight: 1.2,
      transition: 'transform .08s ease, background .12s ease, border-color .12s ease',
      ...style,
    }}>
      {icon}
      {children}
    </button>
  );
}

Object.assign(window, { Sidebar, Avatar, TopBar, SearchInput, Pill, Btn });
