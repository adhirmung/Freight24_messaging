// App — auth gate + simple routing
function App() {
  const D = window.KredeshData;
  const me = D.users.find(u => u.isMe);

  const [auth, setAuth] = React.useState(() => {
    try { return localStorage.getItem('kredesh-auth') === '1'; } catch (e) { return false; }
  });
  const [route, setRoute] = React.useState(() => {
    try {
      const r = localStorage.getItem('kredesh-route');
      return r ? JSON.parse(r) : { screen: 'chats', chatId: 'c1' };
    } catch (e) { return { screen: 'chats', chatId: 'c1' }; }
  });

  React.useEffect(() => {
    try { localStorage.setItem('kredesh-route', JSON.stringify(route)); } catch (e) {}
  }, [route]);

  const signIn = () => {
    try { localStorage.setItem('kredesh-auth', '1'); } catch (e) {}
    setAuth(true);
  };
  const signOut = () => {
    try { localStorage.removeItem('kredesh-auth'); } catch (e) {}
    setAuth(false);
  };
  window.__signOut = signOut;

  if (!auth) return <AuthScreen onAuth={signIn} />;

  let body = null;
  switch (route.screen) {
    case 'chats':  body = <ChatsScreen route={route} setRoute={setRoute} user={me} />; break;
    case 'tasks':  body = <TasksScreen route={route} setRoute={setRoute} user={me} />; break;
    case 'eta':    body = <EtaScreen   route={route} setRoute={setRoute} />; break;
    case 'admin':  body = <AdminScreen />; break;
    default:       body = <ChatsScreen route={route} setRoute={setRoute} user={me} />;
  }

  return (
    <div style={{
      display: 'flex', height: '100vh',
      background: 'var(--bg-0)', color: 'var(--ink-0)',
      overflow: 'hidden',
    }}>
      <Rail route={route} setRoute={setRoute} user={me} />
      <div style={{ flex: 1, display: 'flex', minWidth: 0, overflow: 'hidden' }}>
        {body}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
