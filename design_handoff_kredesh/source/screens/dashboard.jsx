// Dashboard — logistics health, task performance, freight flow
function DashboardScreen() {
  const [tasks, setTasks] = React.useState([]);
  const [loads, setLoads]  = React.useState([]);
  const [updatedAt, setUpdatedAt] = React.useState('—');

  const refresh = React.useCallback(() => {
    Promise.all([
      sb.from('tasks').select('*').order('created_at', { ascending: false }),
      sb.from('loads').select('*').order('created_at', { ascending: false }),
    ]).then(([{ data: tData }, { data: lData }]) => {
      if (tData) setTasks(tData.map(t => ({ ...t, chat: t.chat_id, extractedFrom: t.extracted_from })));
      if (lData) setLoads(lData.map(l => ({ ...l, chat: l.chat_id, loggedAt: l.logged_at })));
      const n = new Date();
      setUpdatedAt(n.getHours().toString().padStart(2,'0') + ':' + n.getMinutes().toString().padStart(2,'0'));
    });
  }, []);

  React.useEffect(() => {
    refresh();
    const id = setInterval(refresh, 15000);
    return () => clearInterval(id);
  }, [refresh]);

  // ── Task metrics ─────────────────────────────────────────────
  const total      = tasks.length;
  const completed  = tasks.filter(t => t.status === 'complete').length;
  const pending    = tasks.filter(t => t.status === 'pending').length;
  const overdue    = tasks.filter(t => t.overdue || t.status === 'incomplete').length;
  const highOpen   = tasks.filter(t => t.priority === 'high'  && t.status !== 'complete').length;
  const medOpen    = tasks.filter(t => t.priority === 'med'   && t.status !== 'complete').length;
  const lowOpen    = tasks.filter(t => t.priority === 'low'   && t.status !== 'complete').length;
  const openIssues = tasks.filter(t => t.status !== 'complete').length;

  const completionRate   = total > 0 ? completed / total : null;
  const overdueRate      = total > 0 ? overdue   / total : 0;
  const highOpenRate     = total > 0 ? highOpen  / total : 0;

  // ── Health score (0-100) ──────────────────────────────────────
  // 60% weight: completion rate | 25%: overdue rate | 15%: high priority backlog
  const health = total === 0 ? null : Math.max(0, Math.min(100, Math.round(
    (completionRate || 0) * 60 +
    (1 - overdueRate)     * 25 +
    (1 - highOpenRate)    * 15
  )));
  const healthTier  = health === null ? null
    : health >= 80 ? 'Healthy' : health >= 60 ? 'Fair' : health >= 40 ? 'At Risk' : 'Critical';
  const healthColor = health === null ? 'var(--ink-3)'
    : health >= 80 ? '#6FE3C2' : health >= 60 ? '#FCD68A' : health >= 40 ? '#FFB020' : '#FCA5A5';
  const healthBg    = health === null ? 'transparent'
    : health >= 80 ? 'rgba(6,207,156,0.08)' : health >= 60 ? 'rgba(252,214,138,0.08)' : health >= 40 ? 'rgba(255,176,32,0.08)' : 'rgba(252,165,165,0.08)';

  // ── Resolution speed ─────────────────────────────────────────
  // Approximation: tasks with 'Yesterday' due that are still incomplete = missed SLA
  const onTimeSLA = total > 0
    ? Math.max(0, Math.round(((total - overdue) / total) * 100))
    : null;

  // ── Loads ────────────────────────────────────────────────────
  const inboundLoads  = loads.filter(l => l.direction === 'inbound');
  const outboundLoads = loads.filter(l => l.direction === 'outbound');
  const statusCounts  = {
    arrived:     loads.filter(l => l.status === 'arrived').length,
    'en route':  loads.filter(l => l.status === 'en route').length,
    'loaded out':loads.filter(l => l.status === 'loaded out').length,
    scheduled:   loads.filter(l => l.status === 'scheduled').length,
  };

  // ── Open issues sorted by priority ───────────────────────────
  const priOrder = { high: 0, med: 1, low: 2 };
  const openTasks = tasks
    .filter(t => t.status !== 'complete')
    .sort((a, b) => (priOrder[a.priority] || 1) - (priOrder[b.priority] || 1));

  const hasData = total > 0 || loads.length > 0;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: 'var(--bg-0)', overflow: 'hidden' }}>

      {/* ── Header ── */}
      <div style={{ padding: '14px 24px', background: 'var(--bg-2)', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: 0.7, textTransform: 'uppercase' }}>Freight 24 Messaging</div>
          <h1 style={{ margin: '2px 0 0', fontSize: 17, fontWeight: 600 }}>Operations Dashboard</h1>
        </div>
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>Updated {updatedAt}</span>
        <button onClick={refresh} title="Refresh"
          style={{ background: 'var(--bg-3)', border: '1px solid var(--line)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center', color: 'var(--ink-2)', fontSize: 12 }}>
          <Icons.refresh size={13} stroke="var(--ink-2)" /> Refresh
        </button>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, overflow: 'auto', padding: '22px 24px 32px' }}>

        {!hasData && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--ink-3)' }}>
            <Icons.chart size={36} stroke="var(--ink-4)" />
            <div style={{ marginTop: 14, fontSize: 15, fontWeight: 600, color: 'var(--ink-2)' }}>No data yet</div>
            <div style={{ marginTop: 6, fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.6 }}>
              Send messages in a group chat and extract them with AI.<br />Tasks and loads will populate here automatically.
            </div>
          </div>
        )}

        {hasData && (
          <>
            {/* ── Row 1: Health + 3 KPI cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 14, marginBottom: 16 }}>

              {/* Health score */}
              <div className="card" style={{ padding: '18px 20px', background: healthBg, borderColor: healthColor + '33', display: 'flex', gap: 18, alignItems: 'center' }}>
                <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
                  <HealthRing value={health} color={healthColor} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="mono" style={{ fontSize: 20, fontWeight: 700, color: healthColor, lineHeight: 1 }}>
                      {health ?? '—'}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 4 }}>Logistics Health</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: healthColor }}>{healthTier ?? 'No data'}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 3 }}>
                    {health !== null
                      ? `${overdue} overdue · ${highOpen} high-priority open`
                      : 'Extract messages to see health'}
                  </div>
                </div>
              </div>

              {/* Completion rate */}
              <DashKPI
                label="Task Completion"
                value={completionRate !== null ? Math.round(completionRate * 100) + '%' : '—'}
                sub={`${completed} of ${total} tasks done`}
                icon="tasks"
                iconColor="#6FE3C2"
                bar={completionRate}
                barColor="#6FE3C2"
              />

              {/* SLA / resolution speed */}
              <DashKPI
                label="Resolved On Time"
                value={onTimeSLA !== null ? onTimeSLA + '%' : '—'}
                sub={overdue > 0 ? `${overdue} past due date` : 'No overdue tasks'}
                icon="clock"
                iconColor={overdue > 0 ? '#FCD68A' : '#6FE3C2'}
                bar={onTimeSLA !== null ? onTimeSLA / 100 : null}
                barColor={overdue > 0 ? '#FCD68A' : '#6FE3C2'}
              />

              {/* Active freight */}
              <DashKPI
                label="Active Freight"
                value={loads.length || '—'}
                sub={loads.length ? `${inboundLoads.length} in · ${outboundLoads.length} out` : 'No loads logged'}
                icon="truck"
                iconColor="#A78BFA"
              />
            </div>

            {/* ── Row 2: Issues + Freight status ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>

              {/* Open issues breakdown */}
              <div className="card" style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <Icons.warn size={14} stroke="#FCD68A" />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Open Issues</span>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginLeft: 'auto' }}>{openIssues} total</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { label: 'High priority', count: highOpen, color: '#FCA5A5', bg: 'rgba(252,165,165,0.1)' },
                    { label: 'Medium priority', count: medOpen, color: '#FCD68A', bg: 'rgba(252,214,138,0.1)' },
                    { label: 'Low priority', count: lowOpen, color: 'var(--ink-3)', bg: 'var(--bg-3)' },
                    { label: 'Overdue / missed', count: overdue, color: '#F15C6D', bg: 'rgba(241,92,109,0.1)' },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 11px', background: row.bg, borderRadius: 8 }}>
                      <span style={{ flex: 1, fontSize: 12.5, color: 'var(--ink-1)' }}>{row.label}</span>
                      <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: row.color }}>{row.count}</span>
                    </div>
                  ))}
                </div>
                {openIssues === 0 && (
                  <div style={{ marginTop: 10, padding: '10px', background: 'rgba(6,207,156,0.08)', border: '1px solid rgba(6,207,156,0.2)', borderRadius: 8, fontSize: 12.5, color: '#6FE3C2', textAlign: 'center' }}>
                    All tasks resolved ✓
                  </div>
                )}
              </div>

              {/* Freight flow status */}
              <div className="card" style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <Icons.truck size={14} stroke="#A78BFA" />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Freight Flow</span>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginLeft: 'auto' }}>{loads.length} loads</span>
                </div>

                {loads.length === 0 ? (
                  <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 12.5, color: 'var(--ink-4)' }}>No loads extracted yet</div>
                ) : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                      <FreightDirectionCard label="Inbound" count={inboundLoads.length} color="#6FE3C2" arrow="↓" />
                      <FreightDirectionCard label="Outbound" count={outboundLoads.length} color="#A78BFA" arrow="↑" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {[
                        { label: 'Arrived',      count: statusCounts['arrived'],     dot: '#6FE3C2' },
                        { label: 'En route',     count: statusCounts['en route'],    dot: '#FCD68A' },
                        { label: 'Loaded out',   count: statusCounts['loaded out'],  dot: '#A78BFA' },
                        { label: 'Scheduled',    count: statusCounts['scheduled'],   dot: 'var(--ink-3)' },
                      ].filter(r => r.count > 0).map(r => (
                        <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 7, height: 7, borderRadius: 999, background: r.dot, flexShrink: 0, display: 'inline-block' }} />
                          <span style={{ flex: 1, fontSize: 12.5, color: 'var(--ink-2)' }}>{r.label}</span>
                          <span className="mono" style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-0)' }}>{r.count}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ── Row 3: Open issues table ── */}
            {openTasks.length > 0 && (
              <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', background: 'var(--bg-2)', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icons.bell size={13} stroke="#FCD68A" />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Unresolved Cases</span>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', background: 'var(--bg-3)', border: '1px solid var(--line)', borderRadius: 999, padding: '1px 7px', marginLeft: 4 }}>
                    {openTasks.length}
                  </span>
                </div>
                {/* Column headers */}
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 110px 110px', gap: 12, padding: '8px 16px', background: 'var(--bg-2)', borderBottom: '1px solid var(--line)', fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.6, fontFamily: 'var(--mono)' }}>
                  <div>Priority</div><div>Task</div><div>Due</div><div>Chat</div>
                </div>
                {openTasks.map(t => {
                  const priColor = t.priority === 'high' ? '#FCA5A5' : t.priority === 'med' ? '#FCD68A' : 'var(--ink-3)';
                  const priBg    = t.priority === 'high' ? 'rgba(252,165,165,0.12)' : t.priority === 'med' ? 'rgba(252,214,138,0.1)' : 'var(--bg-2)';
                  const isOverdue = t.overdue || t.status === 'incomplete';
                  return (
                    <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 110px 110px', gap: 12, padding: '11px 16px', borderBottom: '1px solid var(--line)', alignItems: 'center', background: isOverdue ? 'rgba(241,92,109,0.04)' : 'transparent' }}>
                      <div>
                        <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, background: priBg, fontSize: 10.5, fontWeight: 700, color: priColor, fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {t.priority || 'med'}
                        </span>
                      </div>
                      <div style={{ fontSize: 12.5, color: isOverdue ? '#FCA5A5' : 'var(--ink-0)', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {t.title}
                        {isOverdue && <span style={{ marginLeft: 6, fontSize: 10, color: '#F15C6D', fontWeight: 700 }}>OVERDUE</span>}
                      </div>
                      <div className="mono" style={{ fontSize: 11.5, color: isOverdue ? '#F15C6D' : 'var(--ink-2)' }}>{t.due}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.extractedFrom || '—'}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function HealthRing({ value, color }) {
  const r = 30, cx = 36, cy = 36, stroke = 5;
  const circ = 2 * Math.PI * r;
  const progress = value === null ? 0 : (value / 100) * circ;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-3)" strokeWidth={stroke} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${progress} ${circ}`}
        strokeDashoffset={circ * 0.25}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
    </svg>
  );
}

function DashKPI({ label, value, sub, icon, iconColor, bar, barColor }) {
  const Ico = Icons[icon] || Icons.spark;
  return (
    <div className="card" style={{ padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: iconColor + '18', border: `1px solid ${iconColor}33`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <Ico size={14} stroke={iconColor} />
        </div>
        <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: 0.7, textTransform: 'uppercase', paddingTop: 2 }}>{label}</div>
      </div>
      <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: 'var(--ink-0)', letterSpacing: -0.5, lineHeight: 1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginBottom: bar !== undefined && bar !== null ? 10 : 0 }}>{sub}</div>
      {bar !== null && bar !== undefined && (
        <div style={{ height: 4, background: 'var(--bg-3)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: `${Math.round((bar || 0) * 100)}%`, height: '100%', background: barColor, borderRadius: 999, transition: 'width 0.5s ease' }} />
        </div>
      )}
    </div>
  );
}

function FreightDirectionCard({ label, count, color, arrow }) {
  return (
    <div style={{ padding: '10px 12px', background: color + '0F', border: `1px solid ${color}2A`, borderRadius: 9, textAlign: 'center' }}>
      <div style={{ fontSize: 18, fontWeight: 700, color, fontFamily: 'var(--mono)' }}>{arrow} {count}</div>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{label}</div>
    </div>
  );
}

Object.assign(window, { DashboardScreen });
