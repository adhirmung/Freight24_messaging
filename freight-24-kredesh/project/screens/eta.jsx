// ETA dashboard — chronological view of all expected arrivals & loadouts
function EtaScreen({ route, setRoute }) {
  const D = window.KredeshData;
  const [tab, setTab] = React.useState('today'); // today | tomorrow | week
  const [search, setSearch] = React.useState('');

  const groups = {
    today: D.etas.filter(e => e.when === 'today'),
    tomorrow: D.etas.filter(e => e.when === 'tomorrow'),
    week: D.etas.filter(e => ['thursday', 'friday', 'fri 9'].includes(e.when)),
  };

  const visible = (groups[tab] || []).filter(e =>
    !search || (e.what + e.customer + e.vehicle + e.detail).toLowerCase().includes(search.toLowerCase())
  );

  // Today metrics
  const todayItems = groups.today;
  const counts = {
    arrived: todayItems.filter(x => x.status === 'arrived').length,
    enroute: todayItems.filter(x => x.status === 'enroute').length,
    scheduled: todayItems.filter(x => x.status === 'scheduled').length,
  };

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
              <h1 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>ETA dashboard</h1>
              <Pill tone="green"><span className="live-dot" /> Live</Pill>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 3 }}>Auto-extracted from chats · {D.etas.length} scheduled across the week</div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '6px 11px',
            background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 8, minWidth: 240,
          }}>
            <Icons.search size={13} stroke="var(--ink-3)" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search container, customer, vehicle…"
              style={{ flex: 1, background: 'none', border: 'none', color: 'var(--ink-0)', fontSize: 12.5, outline: 'none' }} />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ padding: '0 22px', display: 'flex', alignItems: 'center', gap: 22, borderBottom: '1px solid var(--line)', background: 'var(--bg-2)' }}>
          {[
            { id: 'today',    label: 'Today',    count: groups.today.length },
            { id: 'tomorrow', label: 'Tomorrow', count: groups.tomorrow.length },
            { id: 'week',     label: 'This week',count: groups.week.length },
          ].map(t => {
            const on = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: '11px 0',
                background: 'transparent', border: 'none',
                borderBottom: '2px solid', borderBottomColor: on ? 'var(--green-2)' : 'transparent',
                color: on ? 'var(--ink-0)' : 'var(--ink-2)',
                fontSize: 13, fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', gap: 7,
                cursor: 'pointer',
              }}>
                {t.label}
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{t.count}</span>
              </button>
            );
          })}
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '18px 22px' }}>
          {tab === 'today' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 18, maxWidth: 720 }}>
              <MiniStat label="Arrived" value={counts.arrived} tone="green" />
              <MiniStat label="On route" value={counts.enroute} tone="warn" />
              <MiniStat label="Scheduled" value={counts.scheduled} tone="neutral" />
            </div>
          )}

          {tab === 'today' ? (
            <TodayTimeline items={visible} setRoute={setRoute} />
          ) : (
            <SimpleList items={visible} setRoute={setRoute} />
          )}

          {visible.length === 0 && (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--ink-3)' }}>
              <Icons.clock size={28} stroke="var(--ink-4)" />
              <div style={{ marginTop: 12, fontSize: 13 }}>No arrivals match.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, tone }) {
  const colors = { green: '#6FE3C2', warn: '#FCD68A', bad: '#FCA5A5', neutral: 'var(--ink-0)' };
  return (
    <div className="card" style={{ padding: 14 }}>
      <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: 0.6, textTransform: 'uppercase' }}>{label}</div>
      <div className="mono" style={{ fontSize: 28, fontWeight: 600, color: colors[tone] || 'var(--ink-0)', marginTop: 6, letterSpacing: -0.5 }}>{value}</div>
    </div>
  );
}

// Today: chronological list with current-time line + per-row time gutter
function TodayTimeline({ items, setRoute }) {
  const sorted = [...items].sort((a, b) => (a.mins ?? 0) - (b.mins ?? 0));
  let nowInserted = false;

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {sorted.map((it, idx) => {
        const showNowLine = !nowInserted && (it.mins ?? 0) >= 0;
        if (showNowLine) nowInserted = true;
        return (
          <React.Fragment key={it.id}>
            {showNowLine && <NowLine />}
            <EtaRow it={it} setRoute={setRoute} last={idx === sorted.length - 1} />
          </React.Fragment>
        );
      })}
      {!nowInserted && <NowLine label="No more arrivals after this point — done for the day" muted />}
    </div>
  );
}

function NowLine({ label, muted }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 16px',
      background: muted ? 'transparent' : 'rgba(0,168,132,0.08)',
      borderTop: '1px dashed', borderBottom: '1px dashed',
      borderColor: muted ? 'var(--line)' : 'rgba(6,207,156,0.45)',
    }}>
      <span className="live-dot" />
      <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: muted ? 'var(--ink-3)' : '#6FE3C2', letterSpacing: 0.4 }}>
        {label || 'NOW · 14:18'}
      </span>
      <div style={{ flex: 1, height: 1, background: muted ? 'transparent' : 'rgba(6,207,156,0.25)' }} />
    </div>
  );
}

function EtaRow({ it, setRoute, last }) {
  const D = window.KredeshData;
  const status = {
    arrived:   { tone: 'green', label: 'Arrived',  fg: '#6FE3C2' },
    enroute:   { tone: 'warn',  label: 'On route', fg: '#FCD68A' },
    scheduled: { tone: 'neutral', label: 'Scheduled', fg: 'var(--ink-2)' },
    delayed:   { tone: 'bad',   label: 'Delayed',  fg: '#FCA5A5' },
  }[it.status] || { tone: 'neutral', label: 'Scheduled', fg: 'var(--ink-2)' };

  const kindColor = it.kind === 'inbound' ? '#6FE3C2' : it.kind === 'outbound' ? '#7CC4FF' : '#C4B5FD';
  const kindLabel = it.kind === 'inbound' ? '↓ Inbound' : it.kind === 'outbound' ? '↑ Outbound' : '◆ Visit';

  const minsLabel = it.mins == null ? '' :
    it.mins < 0 ? `${Math.abs(it.mins)}m ago` :
    it.mins === 0 ? 'Now' :
    it.mins < 60 ? `in ${it.mins}m` :
    `in ${Math.floor(it.mins / 60)}h ${it.mins % 60}m`;

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '72px 1fr 130px 110px 40px',
      gap: 14, padding: '13px 16px',
      borderBottom: last ? 'none' : '1px solid var(--line)',
      alignItems: 'center',
    }}>
      <div>
        <div className="mono" style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink-0)', letterSpacing: -0.5, lineHeight: 1 }}>{it.at}</div>
        {minsLabel && <div className="mono" style={{ fontSize: 10.5, color: status.fg, marginTop: 4 }}>{minsLabel}</div>}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span className="mono" style={{ fontSize: 10, color: kindColor, fontWeight: 700, letterSpacing: 0.5 }}>{kindLabel}</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-0)' }}>{it.what}</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <span><span style={{ color: 'var(--ink-4)' }}>Customer </span>{it.customer}</span>
          <span><span style={{ color: 'var(--ink-4)' }}>To </span>{it.dest}</span>
          {it.vehicle && it.vehicle !== '—' && <span><span style={{ color: 'var(--ink-4)' }}>Vehicle </span><span className="mono">{it.vehicle}</span></span>}
        </div>
        {it.detail && <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 4, fontStyle: 'italic' }}>{it.detail}</div>}
      </div>
      <Pill tone={status.tone}>{status.label}</Pill>
      <button onClick={() => setRoute({ screen: 'chats', chatId: it.chat })} style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '5px 9px',
        background: 'var(--bg-3)', border: '1px solid var(--line-2)',
        color: 'var(--ink-1)', borderRadius: 7, fontSize: 11.5, fontWeight: 600,
        cursor: 'pointer', justifySelf: 'start',
      }}>
        <Icons.inbox size={11} stroke="var(--ink-1)" /> Chat
      </button>
      <button title="More" style={{ width: 26, height: 26, display: 'grid', placeItems: 'center', background: 'transparent', border: 'none', borderRadius: 6, color: 'var(--ink-3)', cursor: 'pointer' }}>
        <Icons.more size={14} stroke="var(--ink-3)" />
      </button>
    </div>
  );
}

function SimpleList({ items, setRoute }) {
  // Group by `when` label
  const byWhen = {};
  items.forEach(it => { (byWhen[it.when] ||= []).push(it); });
  const order = ['tomorrow','thursday','friday','fri 9'];
  const ordered = Object.keys(byWhen).sort((a, b) => order.indexOf(a) - order.indexOf(b));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {ordered.map(when => (
        <div key={when}>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 8 }}>
            {labelOf(when)} · {byWhen[when].length}
          </div>
          <div className="card" style={{ overflow: 'hidden' }}>
            {byWhen[when].map((it, idx) => (
              <EtaRow key={it.id} it={it} setRoute={setRoute} last={idx === byWhen[when].length - 1} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function labelOf(when) {
  return ({
    tomorrow: 'Tomorrow',
    thursday: 'Thursday',
    friday: 'Friday',
    'fri 9': 'Fri 9 Jan',
  })[when] || when;
}

Object.assign(window, { EtaScreen });
