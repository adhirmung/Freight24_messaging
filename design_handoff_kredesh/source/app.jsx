// Main app — Supabase auth gate + routing
function App() {
  const D = window.KredeshData;

  const [sbUser,      setSbUser]      = React.useState(null);
  const [profile,     setProfile]     = React.useState(null);
  const [authLoading, setAuthLoading] = React.useState(true);

  const loadProfile = React.useCallback(async (userId) => {
    const { data } = await sb.from('profiles').select('*').eq('id', userId).single();
    const base = D.users.find(u => u.isMe) || { avatar: '#00A884', initials: 'ME', status: 'online', isMe: true };
    setProfile(data ? {
      ...base,
      id:       data.id,
      name:     data.name,
      initials: data.initials || data.name.slice(0, 2).toUpperCase(),
      role:     data.role,
      isAdmin:  data.is_admin,
      avatar:   data.avatar_color,
    } : { ...base, isAdmin: true });
    setAuthLoading(false);
  }, []);

  React.useEffect(() => {
    sb.auth.getSession().then(({ data: { session } }) => {
      setSbUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else setAuthLoading(false);
    });

    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      setSbUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else { setProfile(null); setAuthLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, [loadProfile]);

  window.__signOut = () => sb.auth.signOut();

  const [route, setRoute] = React.useState(() => {
    try {
      const r = localStorage.getItem('kredesh-route');
      if (r) {
        const parsed = JSON.parse(r);
        if (parsed.screen === 'inbox') return { screen: 'chats', chatId: parsed.threadId || 'c1' };
        if (['shipments','notifications','reports','settings','driver'].includes(parsed.screen))
          return { screen: 'chats', chatId: 'c1' };
        return parsed;
      }
    } catch {}
    return { screen: 'chats', chatId: 'c1' };
  });

  React.useEffect(() => {
    try { localStorage.setItem('kredesh-route', JSON.stringify(route)); } catch {}
  }, [route]);

  if (authLoading) {
    return (
      <div style={{ height: '100vh', background: 'var(--bg-0)', display: 'grid', placeItems: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--ink-3)' }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg,#06CF9C,#00A884)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
            <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
              <path d="M2 10h7l3-3-3-3H2v6Z" stroke="#0B141A" strokeWidth="1.8" strokeLinejoin="round"/>
              <circle cx="4.5" cy="11.5" r="1" fill="#0B141A"/>
              <circle cx="10" cy="11.5" r="1" fill="#0B141A"/>
            </svg>
          </div>
          <div style={{ fontSize: 13 }}>Loading Freight 24 Messaging…</div>
        </div>
      </div>
    );
  }

  if (!sbUser) return <AuthScreen />;

  const me = profile || D.users.find(u => u.isMe);

  let body = null;
  switch (route.screen) {
    case 'chats':     body = <ChatsScreen     route={route} setRoute={setRoute} user={me} sbUser={sbUser} />; break;
    case 'tasks':     body = <TasksScreen     route={route} setRoute={setRoute} user={me} />; break;
    case 'eta':       body = <EtaScreen       route={route} setRoute={setRoute} />; break;
    case 'admin':     body = <AdminScreen />; break;
    case 'dashboard': body = <DashboardScreen />; break;
    default:          body = <ChatsScreen     route={route} setRoute={setRoute} user={me} sbUser={sbUser} />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-0)', overflow: 'hidden' }}>
      <Rail route={route} setRoute={setRoute} user={me} />
      <div style={{ flex: 1, display: 'flex', minWidth: 0, overflow: 'hidden' }}>{body}</div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
