// Admin — user management with invite flow
function AdminScreen() {
  const D = window.KredeshData;
  const [employees, setEmployees] = React.useState(D.employees);
  const [tab, setTab] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [showInvite, setShowInvite] = React.useState(false);

  const counts = {
    active: employees.filter(e => e.status === 'active').length,
    invited: employees.filter(e => e.status === 'invited').length,
    suspended: employees.filter(e => e.status === 'suspended').length,
  };
  const visible = employees.filter(e => {
    if (tab === 'invited' && e.status !== 'invited') return false;
    if (tab === 'suspended' && e.status !== 'suspended') return false;
    if (search && !(e.name + e.email + e.role).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const addInvite = (inv) => {
    setEmployees([{
      id: 'e' + (employees.length + 1),
      name: inv.name || inv.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase()),
      email: inv.email, role: inv.role,
      status: 'invited', lastActive: '—', joined: 'Invited just now',
    }, ...employees]);
    setShowInvite(false);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: 'var(--bg-0)' }}>
      {/* Top bar */}
      <div style={{
        padding: '14px 22px',
        background: 'var(--bg-2)', borderBottom: '1px solid var(--line)',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{ flex: 1 }}>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', letterSpacing: 0.6, textTransform: 'uppercase' }}>Admin</div>
          <h1 style={{ margin: '2px 0 0', fontSize: 17, fontWeight: 600 }}>User management</h1>
        </div>
        <Btn primary icon={<Icons.plus size={14} stroke="#0B141A" sw={2.4}/>} onClick={() => setShowInvite(true)}>Invite user</Btn>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '20px 22px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 18, maxWidth: 720 }}>
          <Stat label="Active" value={counts.active} tone="green" />
          <Stat label="Pending invites" value={counts.invited} tone="warn" />
          <Stat label="Suspended" value={counts.suspended} tone="bad" />
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 7 }}>
            {[
              { id: 'all', label: 'All', count: employees.length },
              { id: 'invited', label: 'Invites', count: counts.invited },
              { id: 'suspended', label: 'Suspended', count: counts.suspended },
            ].map(t => {
              const on = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  padding: '5px 11px',
                  background: on ? 'var(--bg-3)' : 'transparent',
                  border: '1px solid', borderColor: on ? 'var(--line-2)' : 'transparent',
                  color: on ? 'var(--ink-0)' : 'var(--ink-2)',
                  borderRadius: 5, fontSize: 12, fontWeight: 600,
                }}>{t.label} <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginLeft: 4 }}>{t.count}</span></button>
              );
            })}
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '6px 11px',
            background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 8,
            minWidth: 260,
          }}>
            <Icons.search size={13} stroke="var(--ink-3)" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, role…"
              style={{ flex: 1, background: 'none', border: 'none', color: 'var(--ink-0)', fontSize: 12.5, outline: 'none' }} />
          </div>
        </div>

        {/* User table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1.6fr 1fr 130px 110px 28px',
            gap: 12, padding: '10px 14px',
            background: 'var(--bg-2)', borderBottom: '1px solid var(--line)',
            fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.6, fontFamily: 'var(--mono)',
          }}>
            <div>Name</div><div>Role</div><div>Last active</div><div>Status</div><div></div>
          </div>
          {visible.map(e => (
            <div key={e.id} style={{
              display: 'grid', gridTemplateColumns: '1.6fr 1fr 130px 110px 28px',
              gap: 12, padding: '11px 14px',
              borderBottom: '1px solid var(--line)', alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 999,
                  background: e.status === 'invited' ? 'var(--bg-3)' : colorOf(e.id),
                  border: e.status === 'invited' ? '1px dashed var(--line-2)' : 'none',
                  display: 'grid', placeItems: 'center',
                  fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700,
                  color: e.status === 'invited' ? 'var(--ink-3)' : '#0B141A',
                }}>
                  {initialsOf(e.name)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.name}</div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.email}</div>
                </div>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-1)' }}>{e.role}</div>
              <div className="mono" style={{ fontSize: 11.5, color: 'var(--ink-2)' }}>{e.lastActive}</div>
              <div>
                {e.status === 'active' && <Pill tone="green"><span className="dot" style={{ background: '#06CF9C' }} /> Active</Pill>}
                {e.status === 'invited' && <Pill tone="warn">Invited</Pill>}
                {e.status === 'suspended' && <Pill tone="bad">Suspended</Pill>}
              </div>
              <button style={hdrBtn2} title="More"><Icons.more size={14} stroke="var(--ink-2)" /></button>
            </div>
          ))}
          {visible.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>No users match.</div>
          )}
        </div>
      </div>

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} onInvite={addInvite} roles={D.roles} />}
    </div>
  );
}

const hdrBtn2 = {
  width: 26, height: 26, display: 'grid', placeItems: 'center',
  background: 'transparent', border: 'none',
  borderRadius: 6, color: 'var(--ink-2)', cursor: 'pointer',
};

function initialsOf(name) {
  return name.split(' ').slice(0, 2).map(s => s[0]).join('').toUpperCase();
}
function colorOf(id) {
  const palette = ['#00A884','#06CF9C','#A78BFA','#F472B6','#FFB020','#3B82F6','#F15C6D'];
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return palette[Math.abs(h) % palette.length];
}

function Stat({ label, value, tone }) {
  const colors = { green: '#6FE3C2', warn: '#FCD68A', bad: '#FCA5A5' };
  return (
    <div className="card" style={{ padding: 14 }}>
      <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: 0.6, textTransform: 'uppercase' }}>{label}</div>
      <div className="mono" style={{ fontSize: 28, fontWeight: 600, color: colors[tone] || 'var(--ink-0)', marginTop: 6, letterSpacing: -0.5 }}>{value}</div>
    </div>
  );
}

function InviteModal({ onClose, onInvite, roles }) {
  const [emails, setEmails] = React.useState('owen.tahan@kredesh.co');
  const [role, setRole] = React.useState('Dispatcher');
  const emailList = emails.split(/[\s,;]+/).filter(Boolean);

  const send = () => {
    emailList.forEach(em => onInvite({ email: em, role }));
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(7,11,14,0.7)',
      backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 50, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 'min(540px, 100%)',
        background: 'var(--bg-1)', border: '1px solid var(--line-2)',
        borderRadius: 14, overflow: 'hidden',
        boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--green-soft)', border: '1px solid rgba(6,207,156,0.4)', display: 'grid', placeItems: 'center' }}>
            <Icons.mail size={15} stroke="#6FE3C2" />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Invite a teammate</h3>
            <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>They'll receive an email with a setup link.</div>
          </div>
          <button onClick={onClose} style={{ ...hdrBtn2, fontSize: 16 }}>✕</button>
        </div>

        <div style={{ padding: '20px 22px' }}>
          <label style={{ display: 'block', marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-1)', marginBottom: 7 }}>Work emails</div>
            <textarea value={emails} onChange={e => setEmails(e.target.value)} rows={3}
              placeholder="name@kredesh.co"
              style={{
                width: '100%', padding: '10px 12px',
                background: 'var(--bg-2)', border: '1px solid var(--line-2)',
                borderRadius: 9, color: 'var(--ink-0)', fontSize: 13,
                fontFamily: 'var(--mono)', outline: 'none', resize: 'vertical',
              }} />
            <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 6 }}>
              Separate by comma or new line. Only <span className="mono" style={{ color: 'var(--ink-1)' }}>@kredesh.co</span> domains accepted.
            </div>
          </label>

          {emailList.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
              {emailList.map((em, i) => (
                <span key={i} className="chip"><Icons.mail size={11} stroke="#6FE3C2" /> {em}</span>
              ))}
            </div>
          )}

          <label style={{ display: 'block' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-1)', marginBottom: 7 }}>Role</div>
            <select value={role} onChange={e => setRole(e.target.value)} style={{
              width: '100%', padding: '10px 12px',
              background: 'var(--bg-2)', border: '1px solid var(--line-2)',
              borderRadius: 9, color: 'var(--ink-0)', fontSize: 13, outline: 'none',
            }}>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
        </div>

        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1 }} />
          <Btn ghost onClick={onClose}>Cancel</Btn>
          <Btn primary onClick={send} icon={<Icons.send size={13} stroke="#0B141A" sw={2}/>}>
            Send {emailList.length} {emailList.length === 1 ? 'invite' : 'invites'}
          </Btn>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AdminScreen });
