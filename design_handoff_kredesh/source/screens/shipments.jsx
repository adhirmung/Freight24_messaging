// Shipments — list + detail
function ShipmentsScreen({ route, setRoute }) {
  const D = window.KredeshData;
  const [selectedId, setSelectedId] = React.useState(route.shipmentId || 's1');
  const [tab, setTab] = React.useState('active'); // active | delivered | quoting

  const filterFor = {
    active: s => ['in_transit', 'at_pickup', 'delayed'].includes(s.status),
    delivered: s => s.status === 'delivered',
    quoting: s => s.status === 'quoting',
  };
  const visible = D.shipments.filter(filterFor[tab]);
  const selected = D.shipments.find(s => s.id === selectedId) || D.shipments[0];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <TopBar title="Shipments" subtitle={`${D.shipments.length} loads tracked`} right={
        <div style={{ display: 'flex', gap: 8 }}>
          <SearchInput placeholder="Search PRO, customer, route…" wide />
          <Btn primary size="sm" icon={<Icons.plus size={13} />}>New shipment</Btn>
        </div>
      } />

      <div style={{ padding: '0 22px', display: 'flex', alignItems: 'center', gap: 24, borderBottom: '1px solid var(--line)', background: 'var(--bg-1)' }}>
        {[
          { id: 'active', label: 'Active', count: D.shipments.filter(filterFor.active).length },
          { id: 'delivered', label: 'Delivered', count: D.shipments.filter(filterFor.delivered).length },
          { id: 'quoting', label: 'Quoting', count: D.shipments.filter(filterFor.quoting).length },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '12px 0',
            background: 'transparent', border: 'none',
            borderBottom: '2px solid', borderBottomColor: tab === t.id ? 'var(--brand)' : 'transparent',
            color: tab === t.id ? 'var(--ink-0)' : 'var(--ink-2)',
            fontSize: 13.5, fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            {t.label} <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{t.count}</span>
          </button>
        ))}
      </div>

      <div style={{ flex: 1, display: 'flex', minHeight: 0, background: 'var(--bg-0)' }}>
        <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px' }}>
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '170px 1fr 160px 140px 100px 130px',
              gap: 14, padding: '10px 14px',
              background: 'var(--bg-1)', borderBottom: '1px solid var(--line)',
              fontSize: 10.5, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.6, fontFamily: 'var(--mono)',
            }}>
              <div>PRO</div><div>Route</div><div>Equipment</div><div>ETA</div><div>Pallets</div><div>Status</div>
            </div>
            {visible.map(s => (
              <ShipmentRow key={s.id} s={s} active={selectedId === s.id} onClick={() => setSelectedId(s.id)} />
            ))}
          </div>
        </div>
        <ShipmentDetail s={selected} setRoute={setRoute} />
      </div>
    </div>
  );
}

function ShipmentRow({ s, active, onClick }) {
  const statusInfo = {
    in_transit: { tone: 'cyan', label: 'In transit' },
    at_pickup: { tone: 'blue', label: 'At pickup' },
    delivered: { tone: 'ok', label: 'Delivered' },
    delayed: { tone: 'bad', label: 'Delayed' },
    quoting: { tone: 'warn', label: 'Quoting' },
  }[s.status];
  return (
    <div onClick={onClick} style={{
      display: 'grid', gridTemplateColumns: '170px 1fr 160px 140px 100px 130px',
      gap: 14, padding: '12px 14px',
      borderBottom: '1px solid var(--line)',
      background: active ? 'var(--bg-3)' : 'transparent',
      cursor: 'pointer', alignItems: 'center',
    }}>
      <div className="mono" style={{ fontSize: 11.5, color: '#67E8F9', fontWeight: 600 }}>{s.pro}</div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{s.customer}</div>
        <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
          {s.origin} <Icons.arrow size={11} stroke="var(--ink-4)" /> {s.dest}
          {s.alert && <Pill tone="warn" style={{ marginLeft: 6 }}>{s.alert}</Pill>}
        </div>
        <div style={{ marginTop: 6, width: 200, height: 3, background: 'var(--bg-3)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: (s.progress * 100) + '%', height: '100%', background: s.status === 'delayed' ? 'var(--warn)' : s.status === 'delivered' ? 'var(--ok)' : 'var(--brand)' }} />
        </div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-1)' }}>{s.equip}</div>
      <div className="mono" style={{ fontSize: 12, color: 'var(--ink-1)' }}>{s.eta}</div>
      <div className="mono" style={{ fontSize: 12, color: 'var(--ink-1)' }}>{s.pallets || '—'}</div>
      <div><Pill tone={statusInfo.tone}>{statusInfo.label}</Pill></div>
    </div>
  );
}

function ShipmentDetail({ s, setRoute }) {
  if (!s) return null;
  return (
    <aside style={{
      width: 360, flexShrink: 0,
      borderLeft: '1px solid var(--line)',
      background: 'var(--bg-1)',
      display: 'flex', flexDirection: 'column',
      overflow: 'auto',
    }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)' }}>
        <div className="mono" style={{ fontSize: 11, color: '#67E8F9', fontWeight: 700, marginBottom: 6 }}>{s.pro}</div>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{s.customer}</h3>
        <div style={{ marginTop: 4, fontSize: 12.5, color: 'var(--ink-2)' }}>{s.origin} → {s.dest} · {s.miles} mi</div>
      </div>

      <MapPanel s={s} />

      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <DetailRow label="Status" value={<Pill tone={s.status === 'delivered' ? 'ok' : s.status === 'delayed' ? 'bad' : 'cyan'}>{s.status.replace('_', ' ')}</Pill>} />
        <DetailRow label="ETA" value={<span className="mono">{s.eta}</span>} />
        <DetailRow label="Equipment" value={s.equip} />
        <DetailRow label="Weight" value={<span className="mono">{s.weight}</span>} />
        <DetailRow label="Pallets" value={<span className="mono">{s.pallets || '—'}</span>} />
        {s.tempSet && <DetailRow label="Temp set" value={<span className="mono" style={{ color: '#67E8F9' }}>{s.tempSet}</span>} />}
        <DetailRow label="Carrier" value={s.carrier} />
        <DetailRow label="Driver" value={s.driver} />
        <DetailRow label="Rate" value={<span className="mono" style={{ color: 'var(--ink-0)' }}>{s.rate}</span>} />

        <div style={{ height: 1, background: 'var(--line)' }} />

        <SectionLabel>Documents</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { name: 'BOL_' + s.pro.replace(/\D/g, '') + '.pdf', type: 'BOL', size: '212 KB', verified: true },
            { name: 'rate_confirmation.pdf', type: 'Rate Con', size: '88 KB', verified: true },
            ...(s.status === 'delivered' ? [{ name: 'POD_signed.png', type: 'POD', size: '1.2 MB', verified: true }] : []),
          ].map((d, i) => <DocAttachment key={i} a={d} />)}
        </div>

        <div style={{ height: 1, background: 'var(--line)' }} />

        <SectionLabel>Linked thread</SectionLabel>
        <button onClick={() => setRoute({ screen: 'inbox', threadId: 't1' })} style={{
          padding: 12, background: 'var(--bg-2)', border: '1px solid var(--line)',
          borderRadius: 9, textAlign: 'left', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center',
        }}>
          <Icons.inbox size={16} stroke="var(--ink-2)" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>Northbound Freight · Load #{s.pro}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>5 messages · 8 fields extracted</div>
          </div>
          <Icons.arrow size={14} stroke="var(--ink-2)" />
        </button>
      </div>
    </aside>
  );
}

function MapPanel({ s }) {
  return (
    <div style={{ position: 'relative', height: 160, background: 'var(--bg-3)', borderBottom: '1px solid var(--line)', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox="0 0 360 160" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
        {/* faint grid */}
        <defs>
          <pattern id="g" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" stroke="#1E2A44" strokeWidth="0.5" fill="none" />
          </pattern>
          <linearGradient id="rgrad" x1="0" x2="1">
            <stop offset="0" stopColor="#22D3EE" />
            <stop offset="1" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
        <rect width="360" height="160" fill="url(#g)" />

        {/* faux landmass */}
        <path d="M0,110 Q60,80 140,90 T260,80 T360,100 L360,160 L0,160 Z" fill="#101A2E" opacity="0.7" />
        <path d="M0,120 Q80,100 170,108 T360,118 L360,160 L0,160 Z" fill="#0B1322" opacity="0.85" />

        {/* route */}
        <path d="M30 100 Q 130 30, 220 70 T 330 60" stroke="url(#rgrad)" strokeWidth="2" fill="none" strokeLinecap="round"
          pathLength="100" strokeDasharray={`${s.progress * 100} 100`} />
        <path d="M30 100 Q 130 30, 220 70 T 330 60" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" fill="none" />

        {/* pins */}
        <g transform="translate(30, 100)"><circle r="5" fill="#22D3EE" /><circle r="9" fill="none" stroke="#22D3EE" strokeOpacity="0.4" /></g>
        <g transform="translate(330, 60)"><circle r="5" fill="#0B1220" stroke="#94A3B8" strokeWidth="1.4" /></g>

        {/* truck position */}
        {s.progress > 0 && s.progress < 1 && (
          <g transform={`translate(${30 + 300 * s.progress * 0.7}, ${100 - 60 * s.progress})`}>
            <circle r="12" fill="#3B82F6" fillOpacity="0.2" />
            <circle r="5" fill="#3B82F6" stroke="#0B1220" strokeWidth="1.5" />
          </g>
        )}
      </svg>
      <div style={{ position: 'absolute', top: 10, left: 12, display: 'flex', gap: 6 }}>
        <Pill tone={s.status === 'delayed' ? 'bad' : 'cyan'}>
          <span className="live-dot" style={{ width: 5, height: 5 }} /> Live
        </Pill>
      </div>
      <div style={{ position: 'absolute', bottom: 10, right: 12, display: 'flex', gap: 6 }}>
        <button style={{ width: 26, height: 26, background: 'var(--bg-2)', border: '1px solid var(--line)', color: 'var(--ink-1)', borderRadius: 6, cursor: 'pointer' }}>+</button>
        <button style={{ width: 26, height: 26, background: 'var(--bg-2)', border: '1px solid var(--line)', color: 'var(--ink-1)', borderRadius: 6, cursor: 'pointer' }}>−</button>
      </div>
    </div>
  );
}

Object.assign(window, { ShipmentsScreen });
