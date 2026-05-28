// Shipment / Task list — structured cards, editable, live from Supabase
function TasksScreen({ route, setRoute, user }) {
  const D = window.KredeshData;
  const [tasks, setTasks] = React.useState(D.tasks || []);
  const [tab, setTab]     = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [showAdd, setShowAdd] = React.useState(false);

  const rowToTask = (t) => ({ ...t, chat: t.chat_id, extractedFrom: t.extracted_from, assignee: 'me' });

  // ── Load ───────────────────────────────────────────────────────────────────
  React.useEffect(() => {
    sb.from('tasks').select('*').order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) { const m = data.map(rowToTask); setTasks(m); D.tasks = m; }
      });
  }, []);

  // ── Real-time ──────────────────────────────────────────────────────────────
  React.useEffect(() => {
    const ch = sb.channel('tasks_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tasks' }, ({ new: row }) => {
        setTasks(prev => {
          if (prev.find(x => x.id === row.id)) return prev;
          const u = [rowToTask(row), ...prev]; D.tasks = u; return u;
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tasks' }, ({ new: row }) => {
        setTasks(prev => { const u = prev.map(x => x.id === row.id ? rowToTask(row) : x); D.tasks = u; return u; });
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'tasks' }, ({ old: row }) => {
        setTasks(prev => { const u = prev.filter(x => x.id !== row.id); D.tasks = u; return u; });
      })
      .subscribe();
    return () => sb.removeChannel(ch);
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────
  const updateTask = async (id, changes) => {
    await sb.from('tasks').update(changes).eq('id', id);
  };

  const deleteTask = async (id) => {
    await sb.from('tasks').delete().eq('id', id);
  };

  const addTask = async (fields) => {
    await sb.from('tasks').insert({ ...fields, status: fields.status || 'scheduled', priority: 'med' });
    setShowAdd(false);
  };

  // ── Tabs ───────────────────────────────────────────────────────────────────
  const counts = {
    all:      tasks.length,
    inbound:  tasks.filter(t => t.type === 'inbound').length,
    outbound: tasks.filter(t => t.type === 'outbound').length,
    delayed:  tasks.filter(t => t.status === 'delayed').length,
    complete: tasks.filter(t => t.status === 'complete').length,
  };

  const q = search.toLowerCase();
  const filtered = tasks.filter(t => {
    const matchTab =
      tab === 'all'      ? true :
      tab === 'inbound'  ? t.type === 'inbound' :
      tab === 'outbound' ? t.type === 'outbound' :
      tab === 'delayed'  ? t.status === 'delayed' :
      tab === 'complete' ? t.status === 'complete' : true;
    const matchSearch = !q || (
      [t.title, t.customer, t.vehicle_reg, t.transporter, t.driver, t.info, t.pickup_location, t.destination]
        .filter(Boolean).join(' ').toLowerCase().includes(q)
    );
    return matchTab && matchSearch;
  });

  const { isMobile } = useResponsive();

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: 'var(--bg-0)' }}>

      {/* Top bar */}
      <div style={{ padding: '12px 22px', background: 'var(--bg-2)', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>Shipments</h1>
            <Pill tone="green"><span className="live-dot" style={{ marginRight: 4 }} />Live</Pill>
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 3 }}>
            {tasks.length} total · {counts.delayed} delayed
          </div>
        </div>
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 11px', background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 8, minWidth: 200 }}>
            <Icons.search size={13} stroke="var(--ink-3)" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Customer, vehicle, driver…"
              style={{ flex: 1, background: 'none', border: 'none', color: 'var(--ink-0)', fontSize: 12.5, outline: 'none' }} />
          </div>
        )}
        <button onClick={() => { setShowAdd(true); }} style={{
          padding: '7px 16px', background: 'var(--green)', border: 'none', borderRadius: 8,
          color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
        }}>+ Add</button>
      </div>

      {/* Tabs */}
      <div style={{ padding: '0 22px', display: 'flex', alignItems: 'center', gap: isMobile ? 14 : 22, borderBottom: '1px solid var(--line)', background: 'var(--bg-2)', overflowX: 'auto' }}>
        {[
          { id: 'all',      label: 'All' },
          { id: 'inbound',  label: 'Inbound' },
          { id: 'outbound', label: 'Outbound' },
          { id: 'delayed',  label: 'Delayed',  accent: 'var(--bad)' },
          { id: 'complete', label: 'Done' },
        ].map(t => {
          const on = tab === t.id;
          const accent = t.accent || 'var(--green-2)';
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '11px 0', background: 'transparent', border: 'none', flexShrink: 0,
              borderBottom: '2px solid', borderBottomColor: on ? accent : 'transparent',
              color: on ? 'var(--ink-0)' : 'var(--ink-2)', fontSize: 13, fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
            }}>
              {t.label}
              <span className="mono" style={{ fontSize: 10.5, color: on ? accent : 'var(--ink-3)' }}>{counts[t.id]}</span>
            </button>
          );
        })}
      </div>

      {/* Cards */}
      <div style={{ flex: 1, overflow: 'auto', padding: isMobile ? '12px 12px' : '18px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {showAdd && (
          <ShipmentCard task={null} isNew setRoute={setRoute} onSave={addTask} onCancel={() => setShowAdd(false)} onUpdate={updateTask} onDelete={deleteTask} />
        )}
        {filtered.map(t => (
          <ShipmentCard key={t.id} task={t} setRoute={setRoute} onUpdate={updateTask} onDelete={deleteTask} />
        ))}
        {filtered.length === 0 && !showAdd && (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--ink-3)' }}>
            <Icons.inbox size={28} stroke="var(--ink-4)" />
            <div style={{ marginTop: 12, fontSize: 13 }}>No shipments here.</div>
            <button onClick={() => setShowAdd(true)} style={{ marginTop: 14, padding: '7px 16px', background: 'var(--green)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              + Add shipment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Shipment Card ────────────────────────────────────────────────────────────

const SHIPMENT_FIELDS = [
  { key: 'customer',        label: 'Customer' },
  { key: 'pickup_location', label: 'Pickup Location' },
  { key: 'destination',     label: 'To' },
  { key: 'vehicle_reg',     label: 'Vehicle Reg' },
  { key: 'trailer_reg',     label: 'Trailer Reg' },
  { key: 'transporter',     label: 'Transporter' },
  { key: 'driver',          label: 'Driver' },
  { key: 'vessel',          label: 'Vessel' },
  { key: 'stack_dates',     label: 'Stack Dates' },
  { key: 'container_size',  label: 'Container Size' },
  { key: 'estimated_date',  label: 'Estimated Date' },
];

const STATUS_MAP = {
  scheduled: { label: 'Scheduled', color: 'var(--ink-2)',  bg: 'rgba(255,255,255,0.06)', border: 'var(--line)' },
  pending:   { label: 'Pending',   color: '#FCD68A',       bg: 'var(--warn-soft)',        border: 'rgba(255,176,32,0.3)' },
  enroute:   { label: 'En Route',  color: '#6FE3C2',       bg: 'var(--green-soft)',       border: 'rgba(6,207,156,0.25)' },
  arrived:   { label: 'Arrived',   color: '#6FE3C2',       bg: 'var(--green-soft)',       border: 'rgba(6,207,156,0.25)' },
  delayed:   { label: 'Delayed',   color: '#FCA5A5',       bg: 'var(--bad-soft)',         border: 'rgba(241,92,109,0.3)' },
  complete:  { label: 'Complete',  color: '#6FE3C2',       bg: 'var(--green-soft)',       border: 'rgba(6,207,156,0.25)' },
};

const TYPE_MAP = {
  inbound:  { label: 'Inbound',  color: '#6FE3C2' },
  outbound: { label: 'Outbound', color: '#7CC4FF' },
};

// Defined outside ShipmentCard so React doesn't remount on every keystroke
function ShipmentField({ label, value, editing, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div style={{ fontSize: 10, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: 0.6, fontFamily: 'var(--mono)' }}>{label}</div>
      {editing ? (
        <input
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder="—"
          style={{ background: 'var(--bg-3)', border: '1px solid var(--line)', borderRadius: 6, padding: '5px 8px', color: 'var(--ink-0)', fontSize: 13, outline: 'none', width: '100%' }}
        />
      ) : (
        <div style={{ fontSize: 13, color: value ? 'var(--ink-0)' : 'var(--ink-4)' }}>
          {value || '—'}
        </div>
      )}
    </div>
  );
}

function ShipmentCard({ task, isNew, setRoute, onSave, onCancel, onUpdate, onDelete }) {
  const blank = { type: 'inbound', customer: '', pickup_location: '', destination: '', vehicle_reg: '', trailer_reg: '', transporter: '', driver: '', vessel: '', stack_dates: '', container_size: '', info: '', estimated_date: '', status: 'scheduled', title: '' };

  const [expanded,   setExpanded]   = React.useState(!!isNew);
  const [editing,    setEditing]    = React.useState(!!isNew);
  const [draft,      setDraft]      = React.useState(isNew ? blank : { ...task });
  const [saving,     setSaving]     = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);
  const { isMobile } = useResponsive();

  // Keep draft in sync when task updates from real-time (only when not editing)
  React.useEffect(() => {
    if (!editing && task) setDraft({ ...task });
  }, [task, editing]);

  const set = (key, val) => setDraft(d => ({ ...d, [key]: val }));

  const save = async () => {
    setSaving(true);
    const fields = { ...draft, title: draft.customer || draft.title || 'Shipment' };
    if (isNew) { await onSave(fields); }
    else { await onUpdate(task.id, fields); setEditing(false); }
    setSaving(false);
  };

  const cancel = () => {
    if (isNew) { onCancel(); return; }
    setDraft({ ...task });
    setEditing(false);
  };

  const st = STATUS_MAP[draft.status] || STATUS_MAP.scheduled;
  const tp = TYPE_MAP[draft.type]    || TYPE_MAP.inbound;

  const displayName = task?.customer || task?.title || '—';
  const hasStructured = task?.customer || task?.vehicle_reg || task?.pickup_location;


  return (
    <div className="card" style={{ overflow: 'visible' }}>

      {/* ── Header row ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: isMobile ? '11px 12px' : '12px 16px', cursor: editing ? 'default' : 'pointer' }}
        onClick={() => !editing && setExpanded(e => !e)}>

        {/* Type */}
        {editing ? (
          <select value={draft.type} onChange={e => set('type', e.target.value)} onClick={ev => ev.stopPropagation()}
            style={{ padding: '4px 8px', background: 'var(--bg-3)', border: '1px solid var(--line)', borderRadius: 6, color: 'var(--ink-0)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            <option value="inbound">Inbound</option>
            <option value="outbound">Outbound</option>
          </select>
        ) : (
          <span style={{ fontSize: 10, fontWeight: 700, color: tp.color, background: `${tp.color}1A`, padding: '2px 8px', borderRadius: 4, border: `1px solid ${tp.color}40`, flexShrink: 0 }}>
            {tp.label.toUpperCase()}
          </span>
        )}

        {/* Name */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {editing ? (
            <input value={draft.customer} onChange={e => set('customer', e.target.value)} placeholder="Customer name"
              onClick={ev => ev.stopPropagation()}
              style={{ width: '100%', background: 'var(--bg-3)', border: '1px solid var(--line)', borderRadius: 6, padding: '5px 9px', color: 'var(--ink-0)', fontSize: 14, fontWeight: 600, outline: 'none' }} />
          ) : (
            <>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-0)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {displayName}
              </div>
              {!isMobile && hasStructured && (
                <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>
                  {[task?.vehicle_reg, task?.transporter, task?.estimated_date ? `Est: ${task.estimated_date}` : null].filter(Boolean).join(' · ')}
                </div>
              )}
            </>
          )}
        </div>

        {/* Status */}
        {editing ? (
          <select value={draft.status} onChange={e => set('status', e.target.value)} onClick={ev => ev.stopPropagation()}
            style={{ padding: '5px 8px', background: 'var(--bg-3)', border: '1px solid var(--line)', borderRadius: 6, color: 'var(--ink-0)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
            {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        ) : (
          <span style={{ fontSize: isMobile ? 11 : 12, fontWeight: 700, color: st.color, background: st.bg, padding: '3px 10px', borderRadius: 5, border: `1px solid ${st.border}`, whiteSpace: 'nowrap', flexShrink: 0 }}>
            {st.label}
          </span>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }} onClick={ev => ev.stopPropagation()}>
          {editing ? (
            <>
              <button onClick={save} disabled={saving} style={{ padding: '5px 13px', background: 'var(--green)', border: 'none', borderRadius: 6, color: '#fff', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
                {saving ? '…' : 'Save'}
              </button>
              <button onClick={cancel} style={{ padding: '5px 8px', background: 'transparent', border: 'none', color: 'var(--ink-3)', fontSize: 12.5, cursor: 'pointer' }}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { setEditing(true); setExpanded(true); }} title="Edit"
                style={{ width: 28, height: 28, display: 'grid', placeItems: 'center', background: 'transparent', border: 'none', borderRadius: 6, color: 'var(--ink-3)', cursor: 'pointer', fontSize: 15 }}>
                ✎
              </button>
              {confirming ? (
                <>
                  <button onClick={() => onDelete(task.id)} style={{ padding: '3px 8px', fontSize: 11, fontWeight: 600, background: 'var(--bad-soft)', border: '1px solid rgba(241,92,109,0.35)', color: '#FCA5A5', borderRadius: 5, cursor: 'pointer' }}>Delete</button>
                  <button onClick={() => setConfirming(false)} style={{ padding: '3px 6px', fontSize: 11, background: 'transparent', border: 'none', color: 'var(--ink-3)', cursor: 'pointer' }}>✕</button>
                </>
              ) : (
                <button onClick={() => setConfirming(true)} title="Delete"
                  style={{ width: 28, height: 28, display: 'grid', placeItems: 'center', background: 'transparent', border: 'none', borderRadius: 6, color: 'var(--ink-4)', cursor: 'pointer' }}>
                  <Icons.trash size={14} stroke="var(--ink-4)" />
                </button>
              )}
              <span style={{ color: 'var(--ink-4)', fontSize: 13, userSelect: 'none' }}>{expanded ? '▲' : '▼'}</span>
            </>
          )}
        </div>
      </div>

      {/* ── Expanded body ── */}
      {(expanded || editing) && (
        <div style={{ borderTop: '1px solid var(--line)', padding: isMobile ? '12px' : '16px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 10 : '10px 28px' }}>
            {SHIPMENT_FIELDS.map(({ key, label }) => (
              <ShipmentField
                key={key}
                label={label}
                value={editing ? draft[key] : task?.[key]}
                editing={editing}
                onChange={val => set(key, val)}
              />
            ))}
          </div>

          {/* Info / Notes — full width */}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 10, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: 0.6, fontFamily: 'var(--mono)', marginBottom: 5 }}>Info / Notes</div>
            {editing ? (
              <textarea value={draft.info || ''} onChange={e => set('info', e.target.value)}
                placeholder="Additional information…" rows={2}
                style={{ width: '100%', background: 'var(--bg-3)', border: '1px solid var(--line)', borderRadius: 6, padding: '6px 8px', color: 'var(--ink-0)', fontSize: 13, resize: 'vertical', outline: 'none', fontFamily: 'inherit' }} />
            ) : (
              <div style={{ fontSize: 13, color: task?.info ? 'var(--ink-1)' : 'var(--ink-4)', fontStyle: task?.info ? 'normal' : 'italic' }}>
                {task?.info || 'No notes'}
              </div>
            )}
          </div>

          {/* Footer actions */}
          {!editing && (
            <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
              {task?.chat && (
                <button onClick={() => setRoute({ screen: 'chats', chatId: task.chat })} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 11px',
                  background: 'var(--bg-3)', border: '1px solid var(--line-2)',
                  color: 'var(--ink-1)', borderRadius: 7, fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
                }}>
                  <Icons.inbox size={11} stroke="var(--ink-1)" /> Open source chat
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { TasksScreen });
