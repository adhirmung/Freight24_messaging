// Shell: thin icon rail (3–4 tabs) + shared primitives
function Rail({ route, setRoute, user }) {
  const D = window.KredeshData;
  const unread = D.chats.reduce((s, c) => s + (c.unread || 0), 0);
  const pending = D.tasks.filter(t => t.status === 'pending').length;

  const items = [
    { id: 'chats',     icon: 'inbox',  label: 'Chats',     badge: unread },
    { id: 'tasks',     icon: 'tasks',  label: 'Tasks',     badge: pending },
    { id: 'eta',       icon: 'clock',  label: 'ETAs' },
    { id: 'dashboard', icon: 'chart',  label: 'Dashboard' },
  ];
  if (user.isAdmin) items.push({ id: 'admin', icon: 'shield', label: 'Admin' });

  return (
    <aside style={{
      width: 64, flexShrink: 0,
      background: 'var(--bg-1)',
      borderRight: '1px solid var(--line)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center',
      padding: '14px 0 14px',
    }}>
      {/* logo */}
      <div title="Freight 24 Messaging" style={{
        width: 38, height: 38, borderRadius: 11,
        background: 'linear-gradient(135deg, #06CF9C, #00A884)',
        display: 'grid', placeItems: 'center', marginBottom: 18,
        boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 2px 10px rgba(0,168,132,0.4)',
      }}>
        <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
          <path d="M2 10h7l3-3-3-3H2v6Z" stroke="#0B141A" strokeWidth="1.8" strokeLinejoin="round"/>
          <circle cx="4.5" cy="11.5" r="1" fill="#0B141A"/>
          <circle cx="10" cy="11.5" r="1" fill="#0B141A"/>
        </svg>
      </div>

      {/* nav items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', alignItems: 'center' }}>
        {items.map(it => {
          const Ico = Icons[it.icon];
          const active = route.screen === it.id;
          return (
            <button key={it.id} onClick={() => setRoute({ screen: it.id })}
              title={it.label}
              style={{
                position: 'relative',
                width: 44, height: 44,
                display: 'grid', placeItems: 'center',
                background: active ? 'var(--bg-3)' : 'transparent',
                border: 'none',
                borderRadius: 11,
                color: active ? 'var(--green-2)' : 'var(--ink-2)',
                cursor: 'pointer',
                transition: 'background .12s ease',
              }}>
              <Ico size={22} stroke={active ? 'var(--green-2)' : 'var(--ink-2)'} />
              {it.badge ? (
                <span className="mono" style={{
                  position: 'absolute', top: 3, right: 3,
                  fontSize: 9.5, fontWeight: 700,
                  background: 'var(--green)', color: '#0B141A',
                  padding: '1px 5px', borderRadius: 999, minWidth: 16, textAlign: 'center',
                  border: '2px solid var(--bg-1)',
                }}>{it.badge}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1 }} />

      {/* user avatar / sign out */}
      <button onClick={() => window.__signOut?.()} title={`${user.name} · sign out`} style={{
        background: 'none', border: 'none', padding: 0, cursor: 'pointer',
      }}>
        <Avatar user={user} size={36} />
      </button>
    </aside>
  );
}

function Avatar({ user, size = 32 }) {
  if (!user) return null;
  return (
    <div style={{
      width: size, height: size, borderRadius: 999,
      background: user.avatar || '#2A3942',
      display: 'grid', placeItems: 'center',
      fontFamily: 'var(--mono)', fontSize: size * 0.36, fontWeight: 700, color: '#0B141A',
      flexShrink: 0, position: 'relative',
    }}>
      {user.initials}
      {user.status === 'online' && (
        <span style={{
          position: 'absolute', right: -1, bottom: -1,
          width: Math.max(8, size * 0.26), height: Math.max(8, size * 0.26),
          borderRadius: 999, background: 'var(--green-2)',
          border: '2px solid var(--bg-1)',
        }} />
      )}
    </div>
  );
}

function Pill({ tone = 'neutral', children, style }) {
  const tones = {
    neutral: { bg: 'var(--bg-3)', fg: 'var(--ink-1)', bd: 'var(--line-2)' },
    green:   { bg: 'var(--green-soft)', fg: '#6FE3C2', bd: 'rgba(6,207,156,0.28)' },
    warn:    { bg: 'var(--warn-soft)',  fg: '#FCD68A', bd: 'rgba(255,176,32,0.32)' },
    bad:     { bg: 'var(--bad-soft)',   fg: '#FCA5A5', bd: 'rgba(241,92,109,0.32)' },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 10.5, fontWeight: 600, letterSpacing: 0.1,
      padding: '2px 7px 3px', borderRadius: 999,
      background: t.bg, color: t.fg, border: `1px solid ${t.bd}`,
      ...style,
    }}>{children}</span>
  );
}

function Btn({ children, primary, ghost, danger, icon, size = 'md', style, ...rest }) {
  const sizes = { sm: { p: '5px 10px', fs: 12 }, md: { p: '8px 13px', fs: 13 }, lg: { p: '11px 18px', fs: 14 } };
  const s = sizes[size] || sizes.md;
  let bg = 'var(--bg-3)', fg = 'var(--ink-0)', bd = 'var(--line-2)';
  if (primary) { bg = 'var(--green)'; fg = '#0B141A'; bd = 'var(--green)'; }
  if (ghost)   { bg = 'transparent'; fg = 'var(--ink-1)'; bd = 'transparent'; }
  if (danger)  { bg = 'var(--bad)';  fg = '#fff'; bd = 'var(--bad)'; }
  return (
    <button {...rest} style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: s.p, background: bg, color: fg,
      border: '1px solid ' + bd, borderRadius: 8,
      fontSize: s.fs, fontWeight: 600, lineHeight: 1.2,
      cursor: 'pointer',
      ...style,
    }}>
      {icon}
      {children}
    </button>
  );
}

function TaskCheckbox({ status, onClick }) {
  const map = {
    complete:   { bg: 'var(--green)',  border: '1.5px solid var(--green)',  icon: <Icons.check size={11} stroke="#0B141A" sw={2.6}/> },
    pending:    { bg: 'transparent',   border: '1.5px solid var(--ink-3)',  icon: null },
    incomplete: { bg: 'transparent',   border: '1.5px solid var(--bad)',    icon: <span style={{ width: 7, height: 7, background: 'var(--bad)', borderRadius: 999 }} /> },
  };
  const s = map[status] || map.pending;
  return (
    <button onClick={onClick} style={{
      width: 18, height: 18, borderRadius: 5,
      background: s.bg, border: s.border,
      display: 'grid', placeItems: 'center', flexShrink: 0,
      cursor: 'pointer', padding: 0,
    }}>
      {s.icon}
    </button>
  );
}

Object.assign(window, { Rail, Avatar, Pill, Btn, TaskCheckbox });
