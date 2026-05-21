// Settings — minimal but believable
function SettingsScreen({ user }) {
  const [tab, setTab] = React.useState('profile'); // profile | notifications | ai | security

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <TopBar title="Settings" subtitle="Account, notifications, AI extraction preferences." />

      <div style={{ flex: 1, display: 'flex', minHeight: 0, background: 'var(--bg-0)' }}>
        {/* sub-nav */}
        <div style={{ width: 220, borderRight: '1px solid var(--line)', background: 'var(--bg-1)', padding: '14px 10px' }}>
          {[
            { id: 'profile', label: 'Profile', icon: Icons.user },
            { id: 'notifications', label: 'Notifications', icon: Icons.bell },
            { id: 'ai', label: 'AI extraction', icon: Icons.spark },
            { id: 'security', label: 'Security & devices', icon: Icons.lock },
            { id: 'integrations', label: 'Integrations', icon: Icons.link },
          ].map(it => {
            const active = tab === it.id;
            return (
              <button key={it.id} onClick={() => setTab(it.id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 11px', borderRadius: 7,
                background: active ? 'var(--bg-3)' : 'transparent',
                border: '1px solid', borderColor: active ? 'var(--line-2)' : 'transparent',
                color: active ? 'var(--ink-0)' : 'var(--ink-2)',
                fontSize: 13, fontWeight: 500, textAlign: 'left',
              }}>
                <it.icon size={15} stroke={active ? 'var(--brand)' : 'var(--ink-2)'} />
                {it.label}
              </button>
            );
          })}
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px', maxWidth: 720 }}>
          {tab === 'profile' && <ProfilePanel user={user} />}
          {tab === 'notifications' && <NotifPanel />}
          {tab === 'ai' && <AIPanel />}
          {tab === 'security' && <SecurityPanel />}
          {tab === 'integrations' && <IntegrationsPanel />}
        </div>
      </div>
    </div>
  );
}

function FormRow({ label, hint, children, vertical }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: vertical ? '1fr' : '220px 1fr', gap: vertical ? 8 : 24,
      padding: '14px 0',
      borderBottom: '1px solid var(--line)',
    }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
        {hint && <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 4, lineHeight: 1.5 }}>{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function SettingsHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{title}</h2>
      {sub && <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--ink-2)' }}>{sub}</p>}
    </div>
  );
}

function TextInput({ value, ...rest }) {
  return <input defaultValue={value} {...rest} style={{
    width: '100%', padding: '9px 11px',
    background: 'var(--bg-2)', border: '1px solid var(--line-2)',
    borderRadius: 8, color: 'var(--ink-0)', fontSize: 13, outline: 'none',
  }} />;
}

function Toggle({ on: initialOn, label, sub }) {
  const [on, setOn] = React.useState(initialOn);
  return (
    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 9, cursor: 'pointer' }}>
      <div>
        <div style={{ fontSize: 13, color: 'var(--ink-0)' }}>{label}</div>
        {sub && <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>{sub}</div>}
      </div>
      <button onClick={() => setOn(!on)} style={{
        width: 34, height: 20, padding: 2, borderRadius: 999,
        background: on ? 'var(--brand)' : 'var(--bg-3)',
        border: '1px solid', borderColor: on ? 'var(--brand-2)' : 'var(--line-2)',
        position: 'relative', cursor: 'pointer',
      }}>
        <span style={{
          position: 'absolute', top: 2, left: on ? 16 : 2,
          width: 14, height: 14, borderRadius: 999, background: '#fff',
          transition: 'left .15s ease',
        }} />
      </button>
    </label>
  );
}

function ProfilePanel({ user }) {
  return (
    <div>
      <SettingsHeader title="Profile" sub="How you appear across the Kredesh workspace." />
      <FormRow label="Display name">
        <TextInput value="Avery Chen" />
      </FormRow>
      <FormRow label="Email"><TextInput value="avery.chen@kredesh.co" disabled /></FormRow>
      <FormRow label="Role" hint="Set by your administrator. Changes require an admin action."><TextInput value="Ops Manager" disabled /></FormRow>
      <FormRow label="Team"><TextInput value="Operations · Portland HQ" /></FormRow>
      <FormRow label="Time zone"><TextInput value="America/Los_Angeles · PT (UTC −7)" /></FormRow>
      <FormRow label="Avatar" vertical>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Avatar user={user} size={56} />
          <Btn size="sm">Upload new</Btn>
          <Btn size="sm" ghost>Remove</Btn>
        </div>
      </FormRow>
      <div style={{ marginTop: 18 }}><Btn primary>Save changes</Btn></div>
    </div>
  );
}

function NotifPanel() {
  return (
    <div>
      <SettingsHeader title="Notifications" sub="Choose what wakes you up." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '16px 0' }}>
        <Toggle on label="Task assigned to me" sub="Send me a push + email." />
        <Toggle on label="Mentioned in a thread" sub="Push, email, and a desk badge." />
        <Toggle on label="Incident or reroute alert" sub="Always notify, even on Do Not Disturb." />
        <Toggle label="New shipment created" sub="Off by default — turn on if you manage intake." />
        <Toggle on label="Daily morning digest" sub="One email at 06:00 PT with overnight summary." />
        <Toggle label="Carrier replied to my message" />
      </div>
      <FormRow label="Quiet hours" hint="No pushes outside these hours unless flagged urgent.">
        <div style={{ display: 'flex', gap: 8 }}>
          <TextInput value="20:00" />
          <TextInput value="06:00" />
        </div>
      </FormRow>
    </div>
  );
}

function AIPanel() {
  const [apiKey, setApiKey] = React.useState(() => {
    try { return localStorage.getItem('kredesh-claude-key') || ''; } catch { return ''; }
  });
  const [keySaved, setKeySaved] = React.useState(false);
  const [showKey, setShowKey] = React.useState(false);
  const [threshold, setThreshold] = React.useState(84);

  const saveKey = () => {
    try { localStorage.setItem('kredesh-claude-key', apiKey.trim()); } catch {}
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2200);
  };

  return (
    <div>
      <SettingsHeader title="AI extraction" sub="What Kredesh pulls from your messages and how aggressively." />

      {/* Claude API key — required for real extraction */}
      <FormRow label="Claude API key" hint="Required for WhatsApp import extraction and thread re-analysis. Get your key at console.anthropic.com. Stored in browser localStorage only — never sent to any server except api.anthropic.com.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--bg-2)', border: '1px solid var(--line-2)', borderRadius: 8, overflow: 'hidden' }}>
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => { setApiKey(e.target.value); setKeySaved(false); }}
                placeholder="sk-ant-api03-…"
                style={{ flex: 1, padding: '9px 11px', background: 'none', border: 'none', color: 'var(--ink-0)', fontSize: 13, outline: 'none', fontFamily: 'var(--mono)' }}
              />
              <button onClick={() => setShowKey(v => !v)} style={{ background: 'none', border: 'none', color: 'var(--ink-3)', padding: '0 10px', cursor: 'pointer', display: 'flex' }}>
                <Icons.eye size={14} stroke="var(--ink-3)" />
              </button>
            </div>
            <Btn primary size="sm" onClick={saveKey}>{keySaved ? '✓ Saved' : 'Save'}</Btn>
          </div>
          {apiKey && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--ok)', display: 'inline-block' }} />
              <span style={{ color: 'var(--ink-3)' }}>Key configured · {apiKey.length} chars · used for WhatsApp import + thread re-analysis</span>
            </div>
          )}
          {!apiKey && (
            <div style={{ fontSize: 11.5, color: 'var(--ink-4)' }}>
              Without a key, WhatsApp import will parse messages but skip AI extraction.
            </div>
          )}
        </div>
      </FormRow>

      <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Toggle on label="Extract structured fields from messages" sub="PROs, container IDs, addresses, equipment, time windows, etc." />
        <Toggle on label="Auto-create tasks from action items" sub="One task per actionable item in inbound messages." />
        <Toggle on label="Transcribe voice notes" sub="Whisper-based ASR. Stored encrypted, deleted after 90 days." />
        <Toggle label="Suggest replies in composer" sub="Inline ⌥/ suggestions while you type." />
      </div>
      <FormRow label="Confidence threshold" hint="Below this, the system asks you to review instead of auto-applying.">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="range" min="60" max="99" value={threshold} onChange={e => setThreshold(+e.target.value)} style={{ flex: 1, accentColor: 'var(--brand)' }} />
          <span className="mono" style={{ width: 38, textAlign: 'right' }}>{threshold}%</span>
        </div>
      </FormRow>
      <FormRow label="Excluded threads" hint="Threads where extraction is off (e.g. legal counsel).">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span className="chip">#legal-counsel ×</span>
          <span className="chip">DM · Hana Park ×</span>
          <Btn size="sm" ghost icon={<Icons.plus size={12} />}>Add</Btn>
        </div>
      </FormRow>
    </div>
  );
}

function SecurityPanel() {
  return (
    <div>
      <SettingsHeader title="Security & devices" sub="Two-factor, sessions, and audit log access." />
      <FormRow label="Two-factor authentication" hint="Required by your admin.">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Pill tone="ok"><Icons.check size={11} stroke="#86EFAC" sw={2.2}/> Enabled</Pill>
          <Btn size="sm" ghost>Reset</Btn>
        </div>
      </FormRow>
      <FormRow label="Password"><Btn size="sm">Change password</Btn></FormRow>
      <FormRow label="Active sessions" vertical>
        <div className="card" style={{ overflow: 'hidden' }}>
          {[
            { device: 'MacBook Pro · Chrome 124', loc: 'Portland, OR', current: true, last: 'Now' },
            { device: 'iPhone 15 · Kredesh app', loc: 'Portland, OR', last: '2h ago' },
            { device: 'iPad · Kredesh app', loc: 'Tualatin DC', last: 'Yesterday' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderBottom: i < 2 ? '1px solid var(--line)' : 'none' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{s.device} {s.current && <Pill tone="ok" style={{ marginLeft: 6 }}>This device</Pill>}</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{s.loc} · {s.last}</div>
              </div>
              {!s.current && <Btn ghost size="sm">Sign out</Btn>}
            </div>
          ))}
        </div>
      </FormRow>
    </div>
  );
}

function IntegrationsPanel() {
  const stuff = [
    { name: 'McLeod TMS', desc: 'Two-way sync of loads and dispatch events.', on: true },
    { name: 'Project44 visibility', desc: 'Aggregated tracking pings from carriers.', on: true },
    { name: 'Samsara fleet', desc: 'Reefer set-point + driver HoS.', on: true },
    { name: 'Google Drive', desc: 'Auto-archive BOLs and PODs to shared folder.', on: false },
    { name: 'Slack', desc: 'Bridge channels — discouraged but supported.', on: false },
    { name: 'QuickBooks', desc: 'Invoice generation on POD capture.', on: true },
  ];
  return (
    <div>
      <SettingsHeader title="Integrations" sub="What Kredesh talks to." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginTop: 16 }}>
        {stuff.map(s => (
          <div key={s.name} className="card" style={{ padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 7, background: 'var(--bg-3)', border: '1px solid var(--line)', display: 'grid', placeItems: 'center' }}>
                  <Icons.link size={14} stroke="var(--ink-1)" />
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{s.name}</div>
              </div>
              {s.on ? <Pill tone="ok">Connected</Pill> : <Btn size="sm">Connect</Btn>}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>{s.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { SettingsScreen });
