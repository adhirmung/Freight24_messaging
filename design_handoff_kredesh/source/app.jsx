// ── Global WA extractor ───────────────────────────────────────────────────────
// Runs at app level — extracts tasks + ETAs from new WhatsApp messages
// regardless of which screen the user is on.
function GlobalExtractor({ sbUser }) {
  React.useEffect(() => {
    if (!sbUser) return;

    const fmtT = (iso) => {
      try { const d = new Date(iso); return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0'); }
      catch { return ''; }
    };

    const channel = sb.channel('global_wa_extractor')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'whatsapp_messages',
      }, async (payload) => {
        const row = payload.new;
        if (!row.body?.trim()) return;

        const today = new Date().toISOString().slice(0, 10);
        const text  = `[${fmtT(row.sent_at)}] ${row.sender}: ${row.body}`;

        try {
          const result = await chatExtractWithClaude(text);

          // ── Tasks (upsert — unique constraint on chat_id+title prevents dups) ──
          if (result.tasks?.length) {
            await sb.from('tasks').upsert(
              result.tasks.map(t => ({
                chat_id:         row.chat_id,
                title:           t.customer || t.title,
                status:          t.status   || 'scheduled',
                priority:        t.priority || 'med',
                due:             t.due      || 'Today',
                extracted_from:  row.sender,
                type:            t.type            || null,
                customer:        t.customer        || null,
                pickup_location: t.pickup_location || null,
                destination:     t.destination     || null,
                vehicle_reg:     t.vehicle_reg     || null,
                trailer_reg:     t.trailer_reg     || null,
                transporter:     t.transporter     || null,
                driver:          t.driver          || null,
                vessel:          t.vessel          || null,
                stack_dates:     t.stack_dates     || null,
                container_size:  t.container_size  || null,
                info:            t.info            || null,
                estimated_date:  t.estimated_date  || null,
              })),
              { onConflict: 'chat_id,title', ignoreDuplicates: true }
            );
          }

          // ── ETAs: merge result.etas + loads + tasks with dates ────────────
          const allEtas = [...(result.etas || [])];

          // Source 1: loads that have a valid time (e.g. "15h00", "14:30")
          for (const load of (result.loads || [])) {
            const raw = (load.eta || '').trim();
            if (!raw || raw === '—') continue;
            const timeMatch = raw.match(/(\d{1,2})[h:](\d{2})/i);
            if (!timeMatch) continue;
            const at = timeMatch[1].padStart(2, '0') + ':' + timeMatch[2];
            allEtas.push({
              what:     load.cargo || load.vehicle || 'Load',
              customer: load.customer || '—',
              vehicle:  load.vehicle  || '—',
              at,
              dest:     '—',
              kind:     load.direction === 'outbound' ? 'outbound' : 'inbound',
              eta_date: today,
              detail:   null,
            });
          }

          // Source 2: structured tasks that have an estimated_date (no duplicate what+date)
          for (const task of (result.tasks || [])) {
            if (!task.estimated_date) continue;
            const name = (task.customer || task.title || '').toLowerCase().trim();
            const alreadyCovered = allEtas.some(e =>
              (e.eta_date === task.estimated_date) &&
              ((e.what || '').toLowerCase().includes(name) || name.includes((e.what || '').toLowerCase()))
            );
            if (alreadyCovered) continue;
            allEtas.push({
              what:     task.customer || task.title || 'Shipment',
              customer: task.customer || '—',
              vehicle:  task.vehicle_reg || '—',
              at:       '—',
              dest:     task.destination || '—',
              kind:     task.type === 'outbound' ? 'outbound' : 'inbound',
              eta_date: task.estimated_date,
              detail:   task.info || null,
            });
          }

          if (allEtas.length) {
            const { data: existingEtas } = await sb.from('etas').select('what, eta_date').eq('chat_id', row.chat_id);
            const seenEtas = new Set((existingEtas || []).map(e => `${(e.what||'').toLowerCase()}|${e.eta_date}`));
            const freshEtas = allEtas.filter(e =>
              !seenEtas.has(`${(e.what||'').toLowerCase()}|${e.eta_date || today}`)
            );
            if (freshEtas.length) {
              await sb.from('etas').insert(freshEtas.map(e => ({
                chat_id:        row.chat_id,
                what:           e.what     || 'Unknown',
                customer:       e.customer || '—',
                vehicle:        e.vehicle  || '—',
                at:             e.at       || '—',
                dest:           e.dest     || '—',
                kind:           e.kind     || 'inbound',
                status:         'scheduled',
                eta_date:       e.eta_date || today,
                detail:         e.detail   || null,
                extracted_from: row.sender,
              })));
            }
          }
        } catch (err) {
          console.warn('GlobalExtractor:', err.message);
        }
      })
      .subscribe();

    return () => sb.removeChannel(channel);
  }, [sbUser?.id]);

  return null;
}

// Main app — Supabase auth gate + routing
function App() {
  const D = window.KredeshData;

  const [sbUser,      setSbUser]      = React.useState(null);
  const [profile,     setProfile]     = React.useState(null);
  const [authLoading, setAuthLoading] = React.useState(true);
  const { isMobile } = useResponsive();

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
    <div className="app-shell" style={{ display: 'flex', background: 'var(--bg-0)', overflow: 'hidden' }}>
      <GlobalExtractor sbUser={sbUser} />
      {!isMobile && <Rail route={route} setRoute={setRoute} user={me} />}
      <div style={{ flex: 1, display: 'flex', minWidth: 0, overflow: 'hidden', paddingBottom: isMobile ? 60 : 0 }}>{body}</div>
      {isMobile && <Rail route={route} setRoute={setRoute} user={me} mobile />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
