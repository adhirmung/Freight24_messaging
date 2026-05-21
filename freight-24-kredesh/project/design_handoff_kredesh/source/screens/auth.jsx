// Auth — simple sign-in + sign-up
function AuthScreen({ onAuth }) {
  const [mode, setMode] = React.useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = React.useState('avery.chen@kredesh.co');
  const [pwd, setPwd] = React.useState('••••••••');
  const [showPwd, setShowPwd] = React.useState(false);
  const [name, setName] = React.useState('');
  const [pwd2, setPwd2] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState('');

  const submit = (e) => {
    e?.preventDefault();
    setErr('');
    if (mode === 'signin') {
      if (!email.includes('@')) return setErr('Enter your work email.');
      if (pwd.length < 4) return setErr('Password is too short.');
      setBusy(true);
      setTimeout(() => { setBusy(false); onAuth(); }, 600);
    } else {
      if (!name.trim()) return setErr('Tell us your full name.');
      if (pwd.length < 8) return setErr('Choose a password of at least 8 characters.');
      if (pwd !== pwd2) return setErr('Passwords don\'t match.');
      setBusy(true);
      setTimeout(() => { setBusy(false); onAuth(); }, 700);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(120% 80% at 20% 20%, rgba(0,168,132,0.16), transparent 60%), radial-gradient(80% 70% at 90% 90%, rgba(6,207,156,0.12), transparent 60%), var(--bg-0)',
      display: 'grid', placeItems: 'center', padding: 20,
    }}>
      <div style={{ width: 'min(420px, 100%)' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 28, justifyContent: 'center' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #06CF9C, #00A884)',
            display: 'grid', placeItems: 'center',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 4px 20px rgba(0,168,132,0.45)',
          }}>
            <svg width="22" height="22" viewBox="0 0 14 14" fill="none">
              <path d="M2 10h7l3-3-3-3H2v6Z" stroke="#0B141A" strokeWidth="1.8" strokeLinejoin="round"/>
              <circle cx="4.5" cy="11.5" r="1" fill="#0B141A"/>
              <circle cx="10" cy="11.5" r="1" fill="#0B141A"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 19, letterSpacing: -0.3 }}>Kredesh</div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: 0.8, textTransform: 'uppercase' }}>Internal messaging</div>
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-1)', border: '1px solid var(--line)',
          borderRadius: 14, padding: 26,
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--bg-2)', borderRadius: 10, marginBottom: 22 }}>
            {[
              { id: 'signin', label: 'Sign in' },
              { id: 'signup', label: 'Sign up' },
            ].map(o => (
              <button key={o.id}
                onClick={() => { setMode(o.id); setErr(''); }}
                style={{
                  flex: 1, padding: '7px 10px',
                  background: mode === o.id ? 'var(--bg-3)' : 'transparent',
                  color: mode === o.id ? 'var(--ink-0)' : 'var(--ink-2)',
                  border: 'none',
                  borderRadius: 7, fontSize: 13, fontWeight: 600,
                  cursor: 'pointer',
                }}>{o.label}</button>
            ))}
          </div>

          {mode === 'signin' && (
            <form onSubmit={submit}>
              <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 600, letterSpacing: -0.3 }}>Welcome back</h2>
              <p style={{ margin: '0 0 22px', color: 'var(--ink-2)', fontSize: 13 }}>
                Sign in with your <span className="mono" style={{ color: 'var(--ink-1)' }}>@kredesh.co</span> account.
              </p>

              <Field label="Work email" icon={<Icons.mail size={14} stroke="var(--ink-3)" />}>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
              </Field>
              <Field label="Password" icon={<Icons.lock size={14} stroke="var(--ink-3)" />}
                right={<button type="button" onClick={() => setShowPwd(s => !s)} style={{ background: 'none', border: 'none', color: 'var(--ink-3)', padding: 2, cursor: 'pointer' }}><Icons.eye size={14}/></button>}>
                <input type={showPwd ? 'text' : 'password'} value={pwd} onChange={e => setPwd(e.target.value)} autoComplete="current-password" />
              </Field>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, fontSize: 12.5 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--ink-2)' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: 'var(--green)' }} /> Keep me signed in
                </label>
                <a href="#" style={{ color: '#6FE3C2', textDecoration: 'none' }}>Forgot?</a>
              </div>

              {err && <ErrMsg>{err}</ErrMsg>}

              <Btn primary size="lg" type="submit" style={{ width: '100%', justifyContent: 'center' }} disabled={busy}>
                {busy ? 'Signing in…' : <>Continue <Icons.arrow size={14} stroke="#0B141A"/></>}
              </Btn>

              <p style={{ marginTop: 20, fontSize: 11.5, color: 'var(--ink-3)', textAlign: 'center', lineHeight: 1.5 }}>
                Internal employees only. Account access is provisioned by your administrator.
              </p>
            </form>
          )}

          {mode === 'signup' && (
            <form onSubmit={submit}>
              <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 600, letterSpacing: -0.3 }}>Create your account</h2>
              <p style={{ margin: '0 0 22px', color: 'var(--ink-2)', fontSize: 13 }}>
                Got an invite from your admin? Finish setup below.
              </p>

              <Field label="Work email" icon={<Icons.mail size={14} stroke="var(--ink-3)" />}>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
              </Field>
              <Field label="Full name" icon={<Icons.user size={14} stroke="var(--ink-3)" />}>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Owen Tahan" autoFocus />
              </Field>
              <Field label="Password" icon={<Icons.lock size={14} stroke="var(--ink-3)" />}>
                <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} placeholder="At least 8 characters" />
              </Field>
              <Field label="Confirm password" icon={<Icons.lock size={14} stroke="var(--ink-3)" />}>
                <input type="password" value={pwd2} onChange={e => setPwd2(e.target.value)} placeholder="Repeat password" />
              </Field>

              {err && <ErrMsg>{err}</ErrMsg>}

              <Btn primary size="lg" type="submit" style={{ width: '100%', justifyContent: 'center' }} disabled={busy}>
                {busy ? 'Creating account…' : <>Create account <Icons.arrow size={14} stroke="#0B141A"/></>}
              </Btn>
            </form>
          )}
        </div>

        <div style={{ marginTop: 14, textAlign: 'center', fontSize: 11.5, color: 'var(--ink-3)' }}>
          By continuing you agree to the <a href="#" style={{ color: 'var(--ink-2)' }}>Acceptable Use Policy</a>.
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon, right, children }) {
  return (
    <label style={{ display: 'block', marginBottom: 12 }}>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 6, letterSpacing: 0.2, textTransform: 'uppercase' }}>{label}</div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 12px',
        background: 'var(--bg-2)', border: '1px solid var(--line-2)',
        borderRadius: 9,
      }}>
        {icon}
        {React.Children.map(children, ch => React.cloneElement(ch, {
          style: { flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--ink-0)', fontSize: 14, ...(ch.props.style || {}) }
        }))}
        {right}
      </div>
    </label>
  );
}

function ErrMsg({ children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '8px 11px', marginBottom: 14,
      background: 'var(--bad-soft)', border: '1px solid rgba(241,92,109,0.32)',
      borderRadius: 8, color: '#FCA5A5', fontSize: 12.5,
    }}>
      <Icons.warn size={14} stroke="#FCA5A5" /> {children}
    </div>
  );
}

Object.assign(window, { AuthScreen });
