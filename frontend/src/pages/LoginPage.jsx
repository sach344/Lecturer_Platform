import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Mail, Phone, Lock, User, ArrowRight, RefreshCw, CheckCircle } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const STEPS = { LOGIN: 'login', REGISTER: 'register', OTP: 'otp' };

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(STEPS.LOGIN);
  const [authMethod, setAuthMethod] = useState('email'); // 'email' | 'phone'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userId, setUserId] = useState('');
  const [otp, setOtp] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', emailOrPhone: '' });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function handleLogin(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { emailOrPhone: form.emailOrPhone, password: form.password });
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      if (err.response?.data?.userId) {
        const uid = err.response.data.userId;
        setUserId(uid);
        setStep(STEPS.OTP);

        // 🔥 AUTO RESEND OTP
        await api.post('/auth/resend-otp', { userId: uid });
      }
      else setError(msg);
    } finally { setLoading(false); }
  }

  async function handleRegister(e) {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const payload = { name: form.name, password: form.password };
    if (authMethod === 'email') payload.email = form.email;
    else payload.phone = form.phone;

    const { data } = await api.post('/auth/register', payload);

    setUserId(data.userId);

    if (data.otpForDemo) setSuccess(`Dev OTP: ${data.otpForDemo}`);
    else setSuccess('OTP sent to your ' + authMethod);

    setStep(STEPS.OTP);

  } catch (err) {
    const msg = err.response?.data?.message || 'Registration failed';

    if (msg.includes("already registered")) {
      setStep(STEPS.LOGIN);
    }

    setError(msg);

  } finally {
    setLoading(false);   // 🔥 THIS WAS MISSING
  }
}

  async function handleOTP(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { userId, otpCode: otp.trim()  });
      if (data.token) { login(data.token, data.user); navigate('/'); }
      else { setSuccess('Verified! Please login.'); setStep(STEPS.LOGIN); }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  }

  async function resendOTP() {
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/resend-otp', { userId });
      if (data.otpForDemo) setSuccess(`Dev OTP: ${data.otpForDemo}`);
      else setSuccess('New OTP sent!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #f59e0b, transparent)' }} />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #ec4899, transparent)' }} />
      </div>

      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
            <BookOpen size={28} color="white" />
          </div>
          <h1 className="text-3xl font-display font-bold gradient-text">StudyPlatform</h1>
          <p className="text-slate-400 mt-1 text-sm">by Sachin Sharma</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8">
          {/* Tabs */}
          {step !== STEPS.OTP && (
            <div className="flex rounded-xl overflow-hidden mb-6 p-1" style={{ background: '#0f172a' }}>
              {[STEPS.LOGIN, STEPS.REGISTER].map((s) => (
                <button
                  key={s}
                  onClick={() => { setStep(s); setError(''); setSuccess(''); }}
                  className="flex-1 py-2 text-sm font-medium rounded-lg transition-all"
                  style={step === s ? { background: 'linear-gradient(135deg, #6d28d9, #9d174d)', color: 'white' } : { color: '#94a3b8' }}
                >
                  {s === STEPS.LOGIN ? 'Sign In' : 'Register'}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm text-red-400 border border-red-900" style={{ background: '#2d0a0a' }}>
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm text-green-400 border border-green-900 flex items-center gap-2" style={{ background: '#0a2d12' }}>
              <CheckCircle size={15} /> {success}
            </div>
          )}

          {/* LOGIN FORM */}
          {step === STEPS.LOGIN && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1.5 block">Email or Phone</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input className="input-dark pl-10" placeholder="your@email.com or +91..." value={form.emailOrPhone} onChange={set('emailOrPhone')} required />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input className="input-dark pl-10" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #6d28d9, #9d174d)' }}>
                {loading ? <RefreshCw size={16} className="animate-spin" /> : <><span>Sign In</span><ArrowRight size={16} /></>}
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {step === STEPS.REGISTER && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input className="input-dark pl-10" placeholder="Sachin Sharma" value={form.name} onChange={set('name')} required />
                </div>
              </div>
              {/* Auth method toggle */}
              <div className="flex rounded-xl overflow-hidden p-1" style={{ background: '#0f172a' }}>
                {['email', 'phone'].map((m) => (
                  <button key={m} type="button" onClick={() => setAuthMethod(m)}
                    className="flex-1 py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-all"
                    style={authMethod === m ? { background: '#1e293b', color: '#a78bfa' } : { color: '#64748b' }}>
                    {m === 'email' ? <Mail size={12} /> : <Phone size={12} />}
                    {m === 'email' ? 'Email OTP' : 'Phone'}
                  </button>
                ))}
              </div>
              {authMethod === 'email' ? (
                <div>
                  <label className="text-xs text-slate-400 font-medium mb-1.5 block">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input className="input-dark pl-10" type="email" placeholder="your@email.com" value={form.email} onChange={set('email')} required />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-xs text-slate-400 font-medium mb-1.5 block">Phone Number</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input className="input-dark pl-10" type="tel" placeholder="+91 9999999999" value={form.phone} onChange={set('phone')} required />
                  </div>
                </div>
              )}
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input className="input-dark pl-10" type="password" placeholder="Min. 8 characters" value={form.password} onChange={set('password')} required minLength={6} />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #d97706, #dc2626)' }}>
                {loading ? <RefreshCw size={16} className="animate-spin" /> : <><span>Create Account</span><ArrowRight size={16} /></>}
              </button>
            </form>
          )}

          {/* OTP FORM */}
          {step === STEPS.OTP && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl" style={{ background: '#1e293b' }}>🔐</div>
                <h3 className="font-display font-semibold text-lg">Verify OTP</h3>
                <p className="text-slate-400 text-sm mt-1">Enter the 6-digit code sent to you</p>
              </div>
              <form onSubmit={handleOTP} className="space-y-4">
                <input className="input-dark text-center text-2xl tracking-widest font-mono" placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} required />
                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #059669, #0284c7)' }}>
                  {loading ? <RefreshCw size={16} className="animate-spin" /> : <><CheckCircle size={16} /><span>Verify OTP</span></>}
                </button>
                <button type="button" onClick={resendOTP} disabled={loading}
                  className="w-full text-sm text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1.5 transition-colors">
                  <RefreshCw size={13} /> Resend OTP
                </button>
              </form>
            </div>
          )}
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          🎓 Study Smart. Score Higher. — HPCL IS Officer & NIC Scientist-B Prep
        </p>
      </div>
    </div>
  );
}
