// Driver mobile view — iOS frame showing the on-truck driver app
function DriverScreen() {
  const [view, setView] = React.useState('thread'); // thread | tasks | home
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <TopBar
        title="Mobile · driver app"
        subtitle="Same data, redesigned for the cab. Built for one-thumb dispatch."
        right={(
          <div style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 7 }}>
            {[{ id: 'home', label: 'Home' }, { id: 'thread', label: 'Thread' }, { id: 'tasks', label: 'Tasks' }].map(o => (
              <button key={o.id} onClick={() => setView(o.id)} style={{
                padding: '4px 10px', fontSize: 11, fontWeight: 600,
                background: view === o.id ? 'var(--bg-3)' : 'transparent',
                color: view === o.id ? 'var(--ink-0)' : 'var(--ink-2)',
                border: '1px solid', borderColor: view === o.id ? 'var(--line-2)' : 'transparent',
                borderRadius: 5,
              }}>{o.label}</button>
            ))}
          </div>
        )}
      />

      <div style={{ flex: 1, overflow: 'auto', display: 'grid', placeItems: 'center', padding: 40, background: 'var(--bg-0)' }} className="grid-bg">
        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
          <IOSDevice dark title="Kredesh" width={392} height={832}>
            {view === 'home' && <DriverHome />}
            {view === 'thread' && <DriverThread />}
            {view === 'tasks' && <DriverTasks />}
          </IOSDevice>

          {/* annotations */}
          <div style={{ paddingTop: 60, maxWidth: 320, color: 'var(--ink-2)', fontSize: 13, lineHeight: 1.65 }}>
            <div className="mono" style={{ fontSize: 10.5, color: '#67E8F9', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>
              <span className="live-dot" style={{ display: 'inline-block', marginRight: 6, verticalAlign: 1 }}/> What changes in the cab
            </div>
            <h3 style={{ margin: '0 0 14px', fontSize: 22, fontWeight: 600, color: 'var(--ink-0)', letterSpacing: -0.4, lineHeight: 1.2 }}>
              The same shipment graph, in the palm of a hand.
            </h3>
            <Bullet icon="thermo" title="Big targets, glove-friendly">Every primary action is ≥48px and reachable with one thumb.</Bullet>
            <Bullet icon="mic" title="Voice-first replies">Driver dictates; Kredesh transcribes and posts to the thread.</Bullet>
            <Bullet icon="check" title="One-tap task completion">Tasks the dispatcher pushed appear right at the top — swipe to clear.</Bullet>
            <Bullet icon="qr" title="POD capture in two taps">Snap, sign, send. Auto-attached to the right PRO.</Bullet>
          </div>
        </div>
      </div>
    </div>
  );
}

function Bullet({ icon, title, children }) {
  const Ico = Icons[icon];
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
      <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--bg-2)', border: '1px solid var(--line)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <Ico size={13} stroke="#93C5FD" />
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-0)' }}>{title}</div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 2 }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Driver home ────────────────────────────────────
function DriverHome() {
  return (
    <div style={{ flex: 1, background: '#0A0F1C', color: 'var(--ink-0)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '6px 20px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>Tuesday, May 19</div>
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.4 }}>Hi, Aiyana</div>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: 999, background: '#22C55E', display: 'grid', placeItems: 'center', color: '#0B1220', fontWeight: 700, fontFamily: 'var(--mono)' }}>AW</div>
        </div>
      </div>

      {/* Active load card */}
      <div style={{ margin: '0 16px 14px', padding: 14, background: 'linear-gradient(180deg, rgba(59,130,246,0.15), rgba(15,23,42,0.6))', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span className="mono" style={{ fontSize: 11, color: '#67E8F9', fontWeight: 700 }}>PRO 778‑441920</span>
          <Pill tone="cyan">In transit</Pill>
        </div>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Tualatin DC → Cascade Cold</div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>ETA 13:48 PT · 11 mi left</div>
        <div style={{ marginTop: 10, height: 4, background: 'rgba(0,0,0,0.4)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: '62%', height: '100%', background: 'linear-gradient(90deg, #22D3EE, #3B82F6)' }} />
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <button style={driverBtn}>Navigate</button>
          <button style={{ ...driverBtn, background: 'rgba(255,255,255,0.06)', color: 'var(--ink-0)' }}>Call dispatch</button>
        </div>
      </div>

      {/* Tasks summary */}
      <div style={{ padding: '0 16px', marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Your tasks</h3>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>3 open</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <MobileTask title="Verify reefer set point on T‑442" due="12:30" priority="high" />
          <MobileTask title="Capture POD + temp log at Cascade" due="On arrival" />
          <MobileTask title="Confirm hazmat placards on T‑619" due="15:00" />
        </div>
      </div>

      {/* Recent messages */}
      <div style={{ padding: '0 16px', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Messages</h3>
          <span className="mono" style={{ fontSize: 11, color: '#67E8F9' }}>2 unread</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <MsgPreview name="Avery Chen" body="POD required on delivery — driver should also grab a temp log." at="11:34" unread />
          <MsgPreview name="Dispatch · ops" body="ALERT: I‑84 closure mile 53 EB — reroute via OR‑35" at="08:14" unread alert />
          <MsgPreview name="Tomás Beltrán" body="Trailer T‑881 backed in dock 14. Starting unload of 22 pallets." at="10:58" />
        </div>
      </div>

      {/* Tab bar */}
      <DriverTabBar active="home" />
    </div>
  );
}

const driverBtn = {
  flex: 1, padding: '10px 12px', background: '#3B82F6', color: '#fff',
  border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
  fontFamily: 'var(--ui)',
};

function MobileTask({ title, due, priority }) {
  return (
    <div style={{
      display: 'flex', gap: 11, alignItems: 'center',
      padding: '11px 12px',
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 11,
    }}>
      <div style={{ width: 22, height: 22, borderRadius: 7, border: '1.5px solid var(--ink-3)' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-0)' }}>{title}</div>
        <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>Due {due}</div>
      </div>
      {priority === 'high' && <Pill tone="bad">!</Pill>}
    </div>
  );
}

function MsgPreview({ name, body, at, unread, alert }) {
  return (
    <div style={{
      padding: '10px 12px',
      background: alert ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.03)',
      border: '1px solid', borderColor: alert ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.07)',
      borderRadius: 10,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: alert ? '#FCA5A5' : 'var(--ink-0)' }}>{name}</span>
        <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{at}</span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-2)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{body}</div>
      {unread && <span className="dot" style={{ background: alert ? 'var(--bad)' : 'var(--brand)', position: 'relative', top: -28, left: -4 }} />}
    </div>
  );
}

// ─── Driver thread ────────────────────────────────────
function DriverThread() {
  return (
    <div style={{ flex: 1, background: '#0A0F1C', color: 'var(--ink-0)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '4px 16px 12px', display: 'flex', alignItems: 'center', gap: 11, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <button style={{ background: 'none', border: 'none', color: '#67E8F9', fontSize: 22, fontWeight: 400, padding: 0, lineHeight: 1 }}>‹</button>
        <div style={{ width: 32, height: 32, borderRadius: 999, background: '#3B82F6', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontFamily: 'var(--mono)', fontSize: 12 }}>AC</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Avery Chen</div>
          <div style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>Dispatch · PRO 778‑441920</div>
        </div>
        <button style={{ background: 'none', border: 'none', color: '#67E8F9', padding: 0 }}>
          <Icons.spark size={18} stroke="#67E8F9" />
        </button>
      </div>

      {/* Inline shipment card */}
      <div style={{ margin: '12px 16px 0', padding: 11, background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 11 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span className="mono" style={{ fontSize: 11, color: '#67E8F9', fontWeight: 700 }}>PRO 778‑441920</span>
          <Pill tone="cyan">11 mi left</Pill>
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-0)', fontWeight: 600 }}>Cascade Cold Storage</div>
        <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>1450 N Marine Dr, Portland</div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <DriverMsg from="other" name="Avery" at="11:34" text="POD required on delivery — driver should also grab a temp log." />
        <DriverMsg from="me" at="11:36" text="Copy. Will snap POD + temp log on drop." />
        <DriverMsg from="other" name="Kredesh" at="11:36" text="Auto-tasks updated → POD + temp log added to your queue."
          ai />
        <DriverMsg from="other" name="Avery" at="11:42" text="One thing — detention may run ~1.5 hr at Cascade if dock 4 isn't free. Update on approach." />

        {/* Voice note in thread */}
        <div style={{ alignSelf: 'flex-end', maxWidth: '82%', padding: '8px 12px', background: '#3B82F6', borderRadius: 16, borderBottomRightRadius: 4, color: '#fff', display: 'flex', gap: 8, alignItems: 'center' }}>
          <button style={{ width: 26, height: 26, borderRadius: 999, background: 'rgba(255,255,255,0.2)', border: 'none', display: 'grid', placeItems: 'center', color: '#fff' }}>
            <Icons.play size={11} stroke="#fff" fill="#fff" sw={0}/>
          </button>
          <div style={{ display: 'flex', gap: 1.5, height: 16, alignItems: 'center' }}>
            {[3,5,8,12,9,14,18,15,10,7,11,16,20,14,9,6,8,12,15,10].map((h, i) => (
              <span key={i} style={{ width: 2, height: h, background: 'rgba(255,255,255,0.85)', borderRadius: 1 }} />
            ))}
          </div>
          <span className="mono" style={{ fontSize: 10.5 }}>0:18</span>
        </div>
      </div>

      {/* Composer */}
      <div style={{ padding: '8px 12px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'rgba(255,255,255,0.06)', borderRadius: 22, marginBottom: 8 }}>
          <button style={{ width: 26, height: 26, borderRadius: 999, background: 'none', border: 'none', color: 'var(--ink-2)', padding: 0 }}><Icons.plus size={16}/></button>
          <input placeholder="Message Avery…" style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--ink-0)', fontSize: 14, outline: 'none' }} />
          <button style={{ width: 30, height: 30, borderRadius: 999, background: '#3B82F6', border: 'none', display: 'grid', placeItems: 'center' }}>
            <Icons.mic size={14} stroke="#fff" />
          </button>
        </div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          <QuickReply text="On the dock now" />
          <QuickReply text="Need 15 min" />
          <QuickReply text="Detention started" />
          <QuickReply text="POD captured" />
        </div>
      </div>

      <DriverTabBar active="messages" />
    </div>
  );
}

function DriverMsg({ from, name, at, text, ai }) {
  const isMe = from === 'me';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '82%' }}>
      {!isMe && name && (
        <div style={{ fontSize: 10.5, color: ai ? '#67E8F9' : 'var(--ink-3)', marginBottom: 4, marginLeft: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
          {ai && <Icons.spark size={10} stroke="#67E8F9" />} {name} · <span className="mono">{at}</span>
        </div>
      )}
      <div style={{
        padding: '9px 13px',
        background: isMe ? '#3B82F6' : (ai ? 'rgba(34,211,238,0.1)' : 'rgba(255,255,255,0.06)'),
        color: isMe ? '#fff' : 'var(--ink-0)',
        border: ai ? '1px dashed rgba(34,211,238,0.3)' : 'none',
        fontSize: 13.5, lineHeight: 1.45,
        borderRadius: 16,
        borderBottomLeftRadius: isMe ? 16 : 4,
        borderBottomRightRadius: isMe ? 4 : 16,
      }}>
        {text}
      </div>
      {isMe && <div style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 3, alignSelf: 'flex-end' }}><span className="mono">{at}</span> · <Icons.check size={10} stroke="#67E8F9" sw={2.4}/></div>}
    </div>
  );
}

function QuickReply({ text }) {
  return (
    <button style={{
      padding: '6px 12px', background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.28)',
      borderRadius: 999, color: '#67E8F9', fontSize: 12, fontWeight: 500,
      whiteSpace: 'nowrap', flexShrink: 0,
    }}>{text}</button>
  );
}

// ─── Driver tasks ────────────────────────────────────
function DriverTasks() {
  const [tab, setTab] = React.useState('pending');
  return (
    <div style={{ flex: 1, background: '#0A0F1C', color: 'var(--ink-0)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '4px 16px 12px' }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: -0.4 }}>Tasks</h2>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>5 today · 2 done</div>
      </div>

      <div style={{ padding: '0 16px 12px', display: 'flex', gap: 6 }}>
        {['pending', 'complete', 'incomplete'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '8px 0', textTransform: 'capitalize',
            background: tab === t ? '#3B82F6' : 'rgba(255,255,255,0.05)',
            border: 'none', color: '#fff',
            borderRadius: 9, fontSize: 12, fontWeight: 600,
          }}>{t}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tab === 'pending' && (
          <React.Fragment>
            <MobileTask title="Verify reefer set point on T‑442" due="12:30" priority="high" />
            <MobileTask title="Capture POD + temp log @ Cascade" due="On arrival" />
            <MobileTask title="Confirm hazmat placards on T‑619" due="15:00" />
            <MobileTask title="Reroute via OR‑35 if I‑84 still closed" due="As needed" />
          </React.Fragment>
        )}
        {tab === 'complete' && (
          <React.Fragment>
            <CompletedTask title="Wheels up at Tualatin DC by 14:20" at="11:23"/>
            <CompletedTask title="BOL acknowledged · 24 plt / 38,420 lbs" at="11:33"/>
          </React.Fragment>
        )}
        {tab === 'incomplete' && (
          <div style={{
            padding: '11px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 11,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Icons.warn size={14} stroke="#FCA5A5"/>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: '#FCA5A5' }}>Overdue · 2h</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-0)' }}>Send GPS ping for Salinas → Seattle leg</div>
            <div style={{ marginTop: 9, display: 'flex', gap: 6 }}>
              <button style={{ flex: 1, padding: '7px 0', background: '#3B82F6', border: 'none', color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>Send now</button>
              <button style={{ flex: 1, padding: '7px 0', background: 'rgba(255,255,255,0.06)', border: 'none', color: 'var(--ink-1)', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>Reassign</button>
            </div>
          </div>
        )}
      </div>

      <DriverTabBar active="tasks" />
    </div>
  );
}

function CompletedTask({ title, at }) {
  return (
    <div style={{
      display: 'flex', gap: 11, alignItems: 'center',
      padding: '11px 12px',
      background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.22)',
      borderRadius: 11,
    }}>
      <div style={{ width: 22, height: 22, borderRadius: 7, background: 'var(--ok)', display: 'grid', placeItems: 'center' }}>
        <Icons.check size={12} stroke="#0B1220" sw={2.5}/>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12.5, color: 'var(--ink-2)', textDecoration: 'line-through' }}>{title}</div>
        <div className="mono" style={{ fontSize: 10.5, color: '#86EFAC', marginTop: 2 }}>Closed {at}</div>
      </div>
    </div>
  );
}

function DriverTabBar({ active }) {
  const items = [
    { id: 'home', icon: 'truck', label: 'Load' },
    { id: 'messages', icon: 'inbox', label: 'Messages' },
    { id: 'tasks', icon: 'tasks', label: 'Tasks' },
    { id: 'pod', icon: 'qr', label: 'POD' },
  ];
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-around', padding: '12px 12px 22px',
      background: 'rgba(11,18,32,0.85)', borderTop: '1px solid rgba(255,255,255,0.06)',
      backdropFilter: 'blur(20px)',
    }}>
      {items.map(it => {
        const Ico = Icons[it.icon];
        const on = active === it.id;
        return (
          <button key={it.id} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            background: 'none', border: 'none', color: on ? '#67E8F9' : 'var(--ink-3)',
            padding: 0, fontSize: 9.5,
          }}>
            <Ico size={20} stroke={on ? '#67E8F9' : 'var(--ink-3)'} />
            <span>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

Object.assign(window, { DriverScreen });
