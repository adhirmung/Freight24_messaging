// Reports
function ReportsScreen() {
  const [range, setRange] = React.useState('7d');

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <TopBar title="Reports" subtitle="Operational performance, extraction quality, on-time rates." right={
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 7 }}>
            {['24h', '7d', '30d', 'QTR'].map(r => (
              <button key={r} onClick={() => setRange(r)} style={{
                padding: '4px 10px', fontSize: 11, fontWeight: 600,
                background: range === r ? 'var(--bg-3)' : 'transparent',
                color: range === r ? 'var(--ink-0)' : 'var(--ink-2)',
                border: '1px solid', borderColor: range === r ? 'var(--line-2)' : 'transparent',
                borderRadius: 5,
              }}>{r}</button>
            ))}
          </div>
          <Btn size="sm" icon={<Icons.download size={13} />}>Export</Btn>
        </div>
      } />

      <div style={{ flex: 1, overflow: 'auto', padding: '18px 22px' }}>
        {/* KPI strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
          <KPI label="On-time delivery" value="94.8%" delta="+1.4 pts" tone="ok" spark={[6,7,8,7,9,8,10,9,11,12]} />
          <KPI label="Avg dwell time" value="47m" delta="−6m" tone="ok" spark={[12,11,10,9,8,9,8,7,7,6]} />
          <KPI label="Loads in flight" value="18" delta="+3" tone="brand" spark={[8,10,12,13,12,14,15,16,17,18]} />
          <KPI label="Messages auto-resolved" value="312" delta="73% of inbound" tone="cyan" spark={[20,30,40,50,60,55,72,80,90,95]} />
        </div>

        {/* Extraction quality */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14, marginBottom: 18 }}>
          <Panel title="Extraction quality" subtitle="By field type · last 7 days">
            <ExtractionChart />
          </Panel>
          <Panel title="Task closeout" subtitle="Time to mark complete">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 0' }}>
              {[
                { team: 'Dispatchers', avg: '4.2m', bar: 0.88, tone: 'ok' },
                { team: 'Drivers', avg: '8.1m', bar: 0.70, tone: 'brand' },
                { team: 'Warehouse', avg: '11.6m', bar: 0.55, tone: 'warn' },
                { team: 'Brokers', avg: '24.3m', bar: 0.28, tone: 'bad' },
                { team: 'Support', avg: '6.4m', bar: 0.78, tone: 'ok' },
              ].map(r => (
                <div key={r.team}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
                    <span style={{ color: 'var(--ink-1)' }}>{r.team}</span>
                    <span className="mono" style={{ color: 'var(--ink-2)' }}>{r.avg}</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-3)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: r.bar * 100 + '%', height: '100%', background: ({ ok: 'var(--ok)', brand: 'var(--brand)', warn: 'var(--warn)', bad: 'var(--bad)' })[r.tone] }} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Loads by status + by carrier */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
          <Panel title="Daily message volume" subtitle="Inbound vs auto-handled">
            <BarChart />
          </Panel>
          <Panel title="Top carriers (on-time %)" subtitle="By PRO volume">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {[
                { name: 'Northbound Freight', loads: 28, ot: 96 },
                { name: 'Cascade Lines', loads: 22, ot: 91 },
                { name: 'BlueRidge Carriers', loads: 18, ot: 89 },
                { name: 'PolarLine LTL', loads: 14, ot: 85 },
                { name: 'Coastal Express', loads: 11, ot: 78 },
              ].map(c => (
                <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--bg-3)', border: '1px solid var(--line)', display: 'grid', placeItems: 'center' }}>
                    <Icons.truck size={14} stroke="var(--ink-2)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{c.loads} loads</div>
                  </div>
                  <div style={{ width: 90, height: 5, background: 'var(--bg-3)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: c.ot + '%', height: '100%', background: c.ot > 90 ? 'var(--ok)' : c.ot > 80 ? 'var(--brand)' : 'var(--warn)' }} />
                  </div>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--ink-1)', width: 36, textAlign: 'right' }}>{c.ot}%</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <Panel title="Lanes heatmap" subtitle="Loads per lane — last 30 days">
          <Heatmap />
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

function KPI({ label, value, delta, tone, spark }) {
  const color = { ok: '#86EFAC', bad: '#FCA5A5', brand: '#93C5FD', cyan: '#67E8F9', warn: '#FCD34D' }[tone] || 'var(--ink-2)';
  const max = Math.max(...spark);
  const min = Math.min(...spark);
  const pts = spark.map((v, i) => {
    const x = (i / (spark.length - 1)) * 100;
    const y = 30 - ((v - min) / (max - min || 1)) * 28 - 1;
    return `${x},${y}`;
  }).join(' ');
  return (
    <div className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span className="mono" style={{ fontSize: 26, fontWeight: 600, color: 'var(--ink-0)', letterSpacing: -0.5, lineHeight: 1 }}>{value}</span>
        <span style={{ fontSize: 11, color }}>{delta}</span>
      </div>
      <svg viewBox="0 0 100 30" preserveAspectRatio="none" style={{ width: '100%', height: 30 }}>
        <polyline points={pts} stroke={color} strokeWidth="1.5" fill="none" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

function ExtractionChart() {
  const fields = [
    { name: 'PRO / Load ID', correct: 100, low: 0 },
    { name: 'Addresses', correct: 98, low: 2 },
    { name: 'Equipment', correct: 96, low: 4 },
    { name: 'Pallets / weight', correct: 95, low: 5 },
    { name: 'Time windows', correct: 92, low: 8 },
    { name: 'Risk signals', correct: 76, low: 24 },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {fields.map(f => (
        <div key={f.name}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
            <span style={{ color: 'var(--ink-1)' }}>{f.name}</span>
            <span className="mono" style={{ color: 'var(--ink-2)' }}>{f.correct}% high confidence</span>
          </div>
          <div style={{ display: 'flex', height: 8, borderRadius: 999, overflow: 'hidden', background: 'var(--bg-3)' }}>
            <div style={{ width: f.correct + '%', background: 'var(--ok)' }} />
            <div style={{ width: f.low + '%', background: 'var(--warn)' }} />
          </div>
        </div>
      ))}
      <div style={{ marginTop: 8, display: 'flex', gap: 14, fontSize: 11, color: 'var(--ink-3)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span className="dot" style={{ background: 'var(--ok)' }}/> High confidence</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span className="dot" style={{ background: 'var(--warn)' }}/> Needs review</span>
      </div>
    </div>
  );
}

function BarChart() {
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const data = [
    [120, 92], [148, 118], [132, 110], [165, 140], [178, 148], [86, 70], [54, 42],
  ];
  const max = 200;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18, height: 160, padding: '12px 0' }}>
        {days.map((d, i) => (
          <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ flex: 1, width: '100%', position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 3, justifyContent: 'center' }}>
              <div style={{ width: 14, height: (data[i][0] / max * 100) + '%', background: 'var(--brand)', borderRadius: 3 }} />
              <div style={{ width: 14, height: (data[i][1] / max * 100) + '%', background: '#22D3EE', borderRadius: 3 }} />
            </div>
            <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{d}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span className="dot" style={{ background: 'var(--brand)' }}/> Inbound</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span className="dot" style={{ background: '#22D3EE' }}/> Auto-handled</span>
      </div>
    </div>
  );
}

function Heatmap() {
  const lanes = [
    'Portland → Seattle', 'Tualatin → Portland', 'Memphis → Denver', 'Boise → Portland', 'Yakima → Portland', 'Reno → Portland', 'Salinas → Seattle'
  ];
  const days = 14;
  // pseudo-random based on idx for stability
  const cell = (l, d) => {
    const v = (Math.sin(l * 7 + d * 3) + 1) / 2;
    return Math.max(0.04, v * 0.9);
  };
  const colorFor = (v) => `rgba(59,130,246,${0.1 + v * 0.85})`;
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '160px repeat(' + days + ', 1fr)', gap: 3 }}>
        <div></div>
        {Array.from({ length: days }).map((_, d) => (
          <div key={d} className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', textAlign: 'center' }}>{d + 1}</div>
        ))}
        {lanes.map((l, i) => (
          <React.Fragment key={l}>
            <div style={{ fontSize: 11.5, color: 'var(--ink-1)', padding: '4px 0' }}>{l}</div>
            {Array.from({ length: days }).map((_, d) => {
              const v = cell(i + 1, d + 1);
              return <div key={d} style={{ height: 18, borderRadius: 3, background: colorFor(v) }} />;
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { ReportsScreen });
