// ETA dashboard — live from Supabase, auto-extracted from chats
function EtaScreen({ route, setRoute }) {
  const [etas, setEtas] = React.useState([]);
  const [tab, setTab]   = React.useState('today');
  const [search, setSearch] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const computeWhenLabel = (eta_date) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const d     = new Date(eta_date + 'T00:00:00');
    const diff  = Math.round((d - today) / 86400000);
    if (diff === 0) return 'today';
    if (diff === 1) return 'tomorrow';
    if (diff < 0)  return 'today'; // past — keep on today tab as overdue
    const names = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    return names[d.getDay()];
  };

  const computeMins = (eta_date, at) => {
    if (!at || at === '—') return null;
    const parts = at.replace('h', ':').split(':');
    if (parts.length < 2) return null;
    const h = parseInt(parts[0], 10), m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return null;
    const etaDt = new Date(eta_date + 'T00:00:00');
    etaDt.setHours(h, m, 0, 0);
    return Math.round((etaDt - new Date()) / 60000);
  };

  const rowToEta = (row) => ({
    ...row,
    when:    computeWhenLabel(row.eta_date),
    mins:    computeMins(row.eta_date, row.at),
    chat:    row.chat_id,
  });

  // ── Load from Supabase ─────────────────────────────────────────────────────

  React.useEffect(() => {
    setLoading(true);
    sb.from('etas')
      .select('*')
      .order('eta_date', { ascending: true })
      .then(({ data }) => {
        if (data) setEtas(data.map(rowToEta));
        setLoading(false);
      });
  }, []);

  // ── Real-time subscription ─────────────────────────────────────────────────

  React.useEffect(() => {
    const channel = sb.channel('etas_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'etas' }, (payload) => {
        setEtas(prev => [...prev, rowToEta(payload.new)]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'etas' }, (payload) => {
        setEtas(prev => prev.map(e => e.id === payload.new.id ? rowToEta(payload.new) : e));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'etas' }, (payload) => {
        setEtas(prev => prev.filter(e => e.id !== payload.old.id));
      })
      .subscribe();
    return () => sb.removeChannel(channel);
  }, []);

  // ── Status update ──────────────────────────────────────────────────────────

  const updateStatus = async (id, status) => {
    await sb.from('etas').update({ status }).eq('id', id);
    // real-time UPDATE will fire and update state automatically
  };

  const deleteEta = async (id) => {
    await sb.from('etas').delete().eq('id', id);
  };

  // ── Filtering ──────────────────────────────────────────────────────────────

  const q = search.toLowerCase();
  const filtered = etas.filter(e =>
    !q || (e.what + e.customer + e.vehicle + (e.detail || '')).toLowerCase().includes(q)
  );

  const groups = {
    today:    filtered.filter(e => e.when === 'today'),
    tomorrow: filtered.filter(e => e.when === 'tomorrow'),
    week:     filtered.filter(e => !['today','tomorrow'].includes(e.when)),
  };

  const visible = groups[tab] || [];

  const todayItems = etas.filter(e => e.when === 'today');
  const counts = {
    arrived:   todayItems.filter(x => x.status === 'arrived').length,
    enroute:   todayItems.filter(x => x.status === 'enroute').length,
    scheduled: todayItems.filter(x => x.status === 'scheduled').length,
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flex: 1, minWidth: 0 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: 'var(--bg-0)' }}>

        {/* Top bar */}
        <div style={{
          padding: '12px 22px',
          background: 'var(--bg-2)', borderBottom: '1px solid var(--line)',
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>ETA Dashboard</h1>
              <Pill tone="green"><span className="live-dot" style={{ marginRight: 4 }} /> Live</Pill>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 3 }}>
              Auto-extracted from chats · {etas.length} scheduled
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '6px 11px',
            background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 8, minWidth: 240,
          }}>
            <Icons.search size={13} stroke="var(--ink-3)" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search container, customer, vehicle…"
              style={{ flex: 1, background: 'none', border: 'none', color: 'var(--ink-0)', fontSize: 12.5, outline: 'none' }} />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ padding: '0 22px', display: 'flex', alignItems: 'center', gap: 22, borderBottom: '1px solid var(--line)', background: 'var(--bg-2)' }}>
          {[
            { id: 'today',    label: 'Today',     count: groups.today.length },
            { id: 'tomorrow', label: 'Tomorrow',  count: groups.tomorrow.length },
            { id: 'week',     label: 'This week', count: groups.week.length },
          ].map(t => {
            const on = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: '11px 0', background: 'transparent', border: 'none',
                borderBottom: '2px solid', borderBottomColor: on ? 'var(--green-2)' : 'transparent',
                color: on ? 'var(--ink-0)' : 'var(--ink-2)',
                fontSize: 13, fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', gap: 7, cursor: 'pointer',
              }}>
                {t.label}
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{t.count}</span>
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: 'auto', padding: '18px 22px' }}>
          {loading && (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
              Loading ETAs…
            </div>
          )}

          {!loading && tab === 'today' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 18, maxWidth: 720 }}>
              <EtaMiniStat label="Arrived"   value={counts.arrived}   tone="green" />
              <EtaMiniStat label="On route"  value={counts.enroute}   tone="warn" />
              <EtaMiniStat label="Scheduled" value={counts.scheduled} tone="neutral" />
            </div>
          )}

          {!loading && tab === 'today' && (
            <EtaTodayTimeline items={visible} setRoute={setRoute} onStatus={updateStatus} onDelete={deleteEta} />
          )}
          {!loading && tab !== 'today' && (
            <EtaSimpleList items={visible} setRoute={setRoute} tab={tab} onStatus={updateStatus} onDelete={deleteEta} />
          )}

          {!loading && visible.length === 0 && (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--ink-3)' }}>
              <Icons.clock size={28} stroke="var(--ink-4)" />
              <div style={{ marginTop: 12, fontSize: 13 }}>
                {etas.length === 0
                  ? 'No ETAs yet — send messages with arrival times in a chat and they\'ll appear here automatically.'
                  : 'No arrivals match.'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EtaMiniStat({ label, value, tone }) {
  const colors = { green: '#6FE3C2', warn: '#FCD68A', bad: '#FCA5A5', neutral: 'var(--ink-0)' };
  return (
    <div className="card" style={{ padding: 14 }}>
      <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: 0.6, textTransform: 'uppercase' }}>{label}</div>
      <div className="mono" style={{ fontSize: 28, fontWeight: 600, color: colors[tone] || 'var(--ink-0)', marginTop: 6, letterSpacing: -0.5 }}>{value}</div>
    </div>
  );
}

function EtaTodayTimeline({ items, setRoute, onStatus, onDelete }) {
  const sorted = [...items].sort((a, b) => (a.mins ?? 9999) - (b.mins ?? 9999));
  let nowInserted = false;
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {sorted.length === 0 && (
        <div style={{ padding: '28px 20px', color: 'var(--ink-3)', fontSize: 13, textAlign: 'center' }}>
          No arrivals for today yet.
        </div>
      )}
      {sorted.map((it, idx) => {
        const showNow = !nowInserted && (it.mins ?? 0) >= 0;
        if (showNow) nowInserted = true;
        return (
          <React.Fragment key={it.id}>
            {showNow && <EtaNowLine />}
            <EtaRow it={it} setRoute={setRoute} last={idx === sorted.length - 1} onStatus={onStatus} onDelete={onDelete} />
          </React.Fragment>
        );
      })}
      {!nowInserted && <EtaNowLine label="No more arrivals today" muted />}
    </div>
  );
}

function EtaNowLine({ label, muted }) {
  const now = new Date();
  const t = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px',
      background: muted ? 'transparent' : 'rgba(0,168,132,0.08)',
      borderTop: '1px dashed', borderBottom: '1px dashed',
      borderColor: muted ? 'var(--line)' : 'rgba(6,207,156,0.45)',
    }}>
      <span className="live-dot" />
      <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: muted ? 'var(--ink-3)' : '#6FE3C2', letterSpacing: 0.4 }}>
        {label || `NOW · ${t}`}
      </span>
      <div style={{ flex: 1, height: 1, background: muted ? 'transparent' : 'rgba(6,207,156,0.25)' }} />
    </div>
  );
}

function EtaRow({ it, setRoute, last, onStatus, onDelete }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { isMobile } = useResponsive();

  const statusMap = {
    arrived:   { tone: 'green',   label: 'Arrived',   fg: '#6FE3C2' },
    enroute:   { tone: 'warn',    label: 'On route',  fg: '#FCD68A' },
    scheduled: { tone: 'neutral', label: 'Scheduled', fg: 'var(--ink-2)' },
    delayed:   { tone: 'bad',     label: 'Delayed',   fg: '#FCA5A5' },
  };
  const st = statusMap[it.status] || statusMap.scheduled;
  const kindColor = it.kind === 'inbound' ? '#6FE3C2' : it.kind === 'outbound' ? '#7CC4FF' : '#C4B5FD';
  const kindLabel = it.kind === 'inbound' ? '↓ Inbound' : it.kind === 'outbound' ? '↑ Outbound' : '◆ Visit';
  const minsLabel = it.mins == null ? '' :
    it.mins < 0  ? `${Math.abs(it.mins)}m ago` :
    it.mins === 0 ? 'Now' :
    it.mins < 60  ? `in ${it.mins}m` :
    `in ${Math.floor(it.mins / 60)}h ${it.mins % 60}m`;

  const StatusMenu = () => (
    <div style={{
      position: 'absolute', top: '100%', right: 0, zIndex: 40,
      background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 8,
      padding: 4, minWidth: 140, boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
    }}>
      {['arrived','enroute','scheduled','delayed'].map(s => (
        <button key={s} onClick={() => { onStatus(it.id, s); setMenuOpen(false); }} style={{
          display: 'block', width: '100%', textAlign: 'left',
          padding: '7px 10px', background: it.status === s ? 'var(--bg-3)' : 'transparent',
          border: 'none', borderRadius: 5, color: statusMap[s].fg,
          fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
        }}>
          {statusMap[s].label}
        </button>
      ))}
      <div style={{ height: 1, background: 'var(--line)', margin: '4px 0' }} />
      <button onClick={() => { onDelete(it.id); setMenuOpen(false); }} style={{
        display: 'block', width: '100%', textAlign: 'left',
        padding: '7px 10px', background: 'transparent',
        border: 'none', borderRadius: 5, color: '#FCA5A5',
        fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
      }}>
        Delete
      </button>
    </div>
  );

  if (isMobile) return (
    <div style={{ padding: '12px 14px', borderBottom: last ? 'none' : '1px solid var(--line)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="mono" style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-0)' }}>{it.at}</span>
          {minsLabel && <span className="mono" style={{ fontSize: 10.5, color: st.fg }}>{minsLabel}</span>}
        </div>
        <Pill tone={st.tone}>{st.label}</Pill>
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-0)', marginBottom: 3 }}>
        <span className="mono" style={{ fontSize: 10, color: kindColor, fontWeight: 700, marginRight: 6 }}>{kindLabel}</span>
        {it.what}
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{it.customer} · {it.vehicle}</div>
    </div>
  );

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '72px 1fr 130px 110px 40px',
      gap: 14, padding: '13px 16px',
      borderBottom: last ? 'none' : '1px solid var(--line)',
      alignItems: 'center',
    }}>
      {/* Time */}
      <div>
        <div className="mono" style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink-0)', letterSpacing: -0.5, lineHeight: 1 }}>{it.at}</div>
        {minsLabel && <div className="mono" style={{ fontSize: 10.5, color: st.fg, marginTop: 4 }}>{minsLabel}</div>}
      </div>

      {/* Detail */}
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span className="mono" style={{ fontSize: 10, color: kindColor, fontWeight: 700, letterSpacing: 0.5 }}>{kindLabel}</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-0)' }}>{it.what}</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <span><span style={{ color: 'var(--ink-4)' }}>Customer </span>{it.customer}</span>
          {it.dest && it.dest !== '—' && <span><span style={{ color: 'var(--ink-4)' }}>To </span>{it.dest}</span>}
          {it.vehicle && it.vehicle !== '—' && <span><span style={{ color: 'var(--ink-4)' }}>Vehicle </span><span className="mono">{it.vehicle}</span></span>}
        </div>
        {it.detail && <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 4, fontStyle: 'italic' }}>{it.detail}</div>}
      </div>

      {/* Status pill — click to change */}
      <div style={{ position: 'relative' }}>
        <button onClick={() => setMenuOpen(o => !o)} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        }}>
          <Pill tone={st.tone}>{st.label} ▾</Pill>
        </button>
        {menuOpen && <StatusMenu />}
      </div>

      {/* Jump to chat */}
      {it.chat ? (
        <button onClick={() => setRoute({ screen: 'chats', chatId: it.chat })} style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '5px 9px',
          background: 'var(--bg-3)', border: '1px solid var(--line-2)',
          color: 'var(--ink-1)', borderRadius: 7, fontSize: 11.5, fontWeight: 600,
          cursor: 'pointer', justifySelf: 'start',
        }}>
          <Icons.inbox size={11} stroke="var(--ink-1)" /> Chat
        </button>
      ) : <div />}

      {/* Delete */}
      <button onClick={() => onDelete(it.id)} title="Delete" style={{
        width: 26, height: 26, display: 'grid', placeItems: 'center',
        background: 'transparent', border: 'none', borderRadius: 6,
        color: 'var(--ink-4)', cursor: 'pointer',
      }}>
        <Icons.trash size={14} stroke="var(--ink-4)" />
      </button>
    </div>
  );
}

function EtaSimpleList({ items, setRoute, tab, onStatus, onDelete }) {
  const byWhen = {};
  items.forEach(it => { (byWhen[it.when] = byWhen[it.when] || []).push(it); });
  const dayOrder = ['tomorrow','monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
  const ordered = Object.keys(byWhen).sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
  const labelOf = w => {
    const map = { tomorrow: 'Tomorrow', monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday' };
    return map[w] || w.charAt(0).toUpperCase() + w.slice(1);
  };

  if (items.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {ordered.map(when => (
        <div key={when}>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 8 }}>
            {labelOf(when)} · {byWhen[when].length}
          </div>
          <div className="card" style={{ overflow: 'hidden' }}>
            {byWhen[when].map((it, idx) => (
              <EtaRow key={it.id} it={it} setRoute={setRoute} last={idx === byWhen[when].length - 1} onStatus={onStatus} onDelete={onDelete} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { EtaScreen });
