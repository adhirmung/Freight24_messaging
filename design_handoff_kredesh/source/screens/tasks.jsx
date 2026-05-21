// Tasks — instruction list extracted from chats
function TasksScreen({ route, setRoute, user }) {
  const D = window.KredeshData;
  const [tasks, setTasks] = React.useState(D.tasks || []);
  const [tab, setTab] = React.useState('today');
  const [search, setSearch] = React.useState('');

  // Load tasks from Supabase on mount
  React.useEffect(() => {
    sb.from('tasks').select('*').order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          const mapped = data.map(t => ({
            ...t, chat: t.chat_id, extractedFrom: t.extracted_from, assignee: 'me',
          }));
          setTasks(mapped);
          D.tasks = mapped;
        }
      });
  }, []);

  const buckets = {
    today:    tasks.filter(t => t.status === 'pending' && /today/i.test(t.due)),
    upcoming: tasks.filter(t => t.status === 'pending' && !/today/i.test(t.due)),
    overdue:  tasks.filter(t => t.status === 'incomplete' || t.overdue),
    done:     tasks.filter(t => t.status === 'complete'),
  };
  const counts = Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, v.length]));

  const visible = (buckets[tab] || []).filter(t => !search ||
    (t.title + (t.extractedFrom || '') + (t.due || '')).toLowerCase().includes(search.toLowerCase())
  );

  const toggle = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newStatus = task.status === 'complete' ? 'pending' : 'complete';
    await sb.from('tasks').update({ status: newStatus }).eq('id', id);
    setTasks(ts => ts.map(t => t.id === id ? ({
      ...t,
      status: newStatus,
      completedAt: newStatus === 'complete' ? 'Just now' : null,
    }) : t));
  };

  const deleteTask = async (id) => {
    await sb.from('tasks').delete().eq('id', id);
    setTasks(ts => ts.filter(t => t.id !== id));
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: 'var(--bg-0)' }}>
      {/* Top bar */}
      <div style={{
        padding: '12px 22px',
        background: 'var(--bg-2)', borderBottom: '1px solid var(--line)',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>Tasks</h1>
            <Pill tone="green"><span className="live-dot" style={{ marginRight: 4 }} /> Auto-extracted</Pill>
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 3 }}>
            Action items pulled from chats · {tasks.length} total · {counts.overdue} overdue
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7, padding: '6px 11px',
          background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 8, minWidth: 240,
        }}>
          <Icons.search size={13} stroke="var(--ink-3)" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search task, container, customer…"
            style={{ flex: 1, background: 'none', border: 'none', color: 'var(--ink-0)', fontSize: 12.5, outline: 'none' }} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: '0 22px', display: 'flex', alignItems: 'center', gap: 22, borderBottom: '1px solid var(--line)', background: 'var(--bg-2)' }}>
        {[
          { id: 'today',    label: 'Today',    count: counts.today,    color: 'var(--green-2)' },
          { id: 'upcoming', label: 'Upcoming', count: counts.upcoming, color: 'var(--green-2)' },
          { id: 'overdue',  label: 'Overdue',  count: counts.overdue,  color: 'var(--bad)' },
          { id: 'done',     label: 'Done',     count: counts.done,     color: 'var(--ink-3)' },
        ].map(t => {
          const on = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '11px 0', background: 'transparent', border: 'none',
              borderBottom: '2px solid', borderBottomColor: on ? t.color : 'transparent',
              color: on ? 'var(--ink-0)' : 'var(--ink-2)',
              fontSize: 13, fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 7, cursor: 'pointer',
            }}>
              {t.label}
              <span className="mono" style={{ fontSize: 10.5, fontWeight: 700, color: on ? t.color : 'var(--ink-3)' }}>{t.count}</span>
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: 'auto', padding: '18px 22px' }}>
        {tab === 'today' && <TaskMiniStats tasks={tasks} />}
        <TaskInstructionList items={visible} setRoute={setRoute} onToggle={toggle} onDelete={deleteTask} />
        {visible.length === 0 && (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--ink-3)' }}>
            <Icons.check size={28} stroke="var(--ink-4)" />
            <div style={{ marginTop: 12, fontSize: 13 }}>Nothing in this lane.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function TaskMiniStats({ tasks }) {
  const t = {
    high:    tasks.filter(x => x.status === 'pending' && x.priority === 'high').length,
    overdue: tasks.filter(x => x.overdue || x.status === 'incomplete').length,
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 18, maxWidth: 480 }}>
      <TaskMiniBox label="High priority" value={t.high}    tone="warn" />
      <TaskMiniBox label="Overdue"       value={t.overdue} tone="bad" />
    </div>
  );
}

function TaskMiniBox({ label, value, tone }) {
  const colors = { green: '#6FE3C2', warn: '#FCD68A', bad: '#FCA5A5' };
  return (
    <div className="card" style={{ padding: 14 }}>
      <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: 0.6, textTransform: 'uppercase' }}>{label}</div>
      <div className="mono" style={{ fontSize: 28, fontWeight: 600, color: colors[tone] || 'var(--ink-0)', marginTop: 6, letterSpacing: -0.5 }}>{value}</div>
    </div>
  );
}

function TaskInstructionList({ items, setRoute, onToggle, onDelete }) {
  if (items.length === 0) return null;
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {items.map((t, idx) => (
        <TaskInstructionRow key={t.id} t={t} setRoute={setRoute} onToggle={onToggle} onDelete={onDelete} last={idx === items.length - 1} />
      ))}
    </div>
  );
}

function TaskInstructionRow({ t, setRoute, onToggle, onDelete, last }) {
  const D = window.KredeshData;
  const assignee = D.byId(D.users, t.assignee);
  const isMine = t.assignee === 'me';
  const [confirming, setConfirming] = React.useState(false);

  const whenMatch = t.due?.match(/(\d{1,2}:\d{2}|\d{1,2}h\d{2}|EOD|TBC)/i);
  const dayMatch  = t.due?.match(/(today|tomorrow|wed|fri|mon|tue|thu|sat|sun)/i);
  const when = whenMatch ? whenMatch[0] : (t.due?.split(' ')[0] || '—');
  const dayLabel = dayMatch ? dayMatch[0] : '';

  const priorityColor = t.priority === 'high' ? '#FCA5A5' : t.priority === 'med' ? '#FCD68A' : 'var(--ink-3)';
  const priorityLabel = t.priority === 'high' ? 'High' : t.priority === 'med' ? 'Med' : 'Low';
  const completed = t.status === 'complete';

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '90px 28px 1fr 130px 116px 40px',
      gap: 14, padding: '13px 16px',
      borderBottom: last ? 'none' : '1px solid var(--line)',
      alignItems: 'center',
      opacity: completed ? 0.62 : 1,
    }}>
      {/* When */}
      <div>
        <div className="mono" style={{
          fontSize: 16, fontWeight: 700,
          color: t.overdue ? '#FCA5A5' : 'var(--ink-0)',
          letterSpacing: -0.5, lineHeight: 1,
        }}>{when}</div>
        {dayLabel && dayLabel.toLowerCase() !== when.toLowerCase() && (
          <div className="mono" style={{ fontSize: 10.5, color: t.overdue ? '#FCA5A5' : 'var(--ink-3)', marginTop: 4, textTransform: 'capitalize' }}>
            {t.overdue ? `${dayLabel} · overdue` : dayLabel}
          </div>
        )}
        {t.overdue && (!dayLabel || dayLabel.toLowerCase() === when.toLowerCase()) && (
          <div className="mono" style={{ fontSize: 10.5, color: '#FCA5A5', marginTop: 4 }}>overdue</div>
        )}
      </div>

      {/* Checkbox */}
      <TaskCheckbox status={t.status} onClick={() => onToggle(t.id)} />

      {/* Title */}
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 600,
          color: completed ? 'var(--ink-3)' : 'var(--ink-0)',
          textDecoration: completed ? 'line-through' : 'none',
          lineHeight: 1.35,
        }}>{t.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 5, flexWrap: 'wrap' }}>
          {t.extractedFrom && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--ink-3)' }}>
              <Icons.spark size={11} stroke="#6FE3C2" />
              from <span className="chip" style={{ marginLeft: -2 }}>{t.extractedFrom}</span>
            </span>
          )}
          {completed && t.completedAt && (
            <span className="mono" style={{ fontSize: 10.5, color: '#6FE3C2' }}>✓ {t.completedAt}</span>
          )}
        </div>
      </div>

      {/* Assignee */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        {assignee && <Avatar user={assignee} size={26} />}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {isMine ? 'You' : (assignee?.name.split(' ')[0] || '—')}
          </div>
          <div className="mono" style={{ fontSize: 10, color: priorityColor, marginTop: 1 }}>{priorityLabel} priority</div>
        </div>
      </div>

      {/* Jump to chat */}
      <button onClick={() => setRoute({ screen: 'chats', chatId: t.chat })} style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '5px 10px',
        background: 'var(--bg-3)', border: '1px solid var(--line-2)',
        color: 'var(--ink-1)', borderRadius: 7, fontSize: 11.5, fontWeight: 600,
        cursor: 'pointer', justifySelf: 'start', whiteSpace: 'nowrap',
      }}>
        <Icons.inbox size={11} stroke="var(--ink-1)" /> Open chat
      </button>

      {/* Delete */}
      <div style={{ justifySelf: 'end', display: 'flex', alignItems: 'center', gap: 4 }}>
        {confirming ? (
          <>
            <button onClick={() => { onDelete(t.id); setConfirming(false); }} style={{
              padding: '3px 8px', fontSize: 11, fontWeight: 600,
              background: 'rgba(252,165,165,0.15)', border: '1px solid rgba(252,165,165,0.35)',
              color: '#FCA5A5', borderRadius: 5, cursor: 'pointer',
            }}>Delete</button>
            <button onClick={() => setConfirming(false)} style={{
              padding: '3px 6px', fontSize: 11,
              background: 'transparent', border: 'none',
              color: 'var(--ink-3)', cursor: 'pointer',
            }}>Cancel</button>
          </>
        ) : (
          <button onClick={() => setConfirming(true)} title="Delete task" style={{
            width: 26, height: 26, display: 'grid', placeItems: 'center',
            background: 'transparent', border: 'none', borderRadius: 6,
            color: 'var(--ink-4)', cursor: 'pointer',
          }}>
            <Icons.trash size={14} stroke="var(--ink-4)" />
          </button>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { TasksScreen });
