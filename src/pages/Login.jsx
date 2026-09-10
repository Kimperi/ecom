import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { isDemo } from '../config';
import {
  enterDemo,
  signIn,
  confirmSignIn,
  signUp,
  confirmSignUp,
  resetPassword,
  confirmResetPassword,
} from '../auth/client';
import { signInStep } from '../auth/session';
import { safeRedirect } from '../lib/validation';

function DemoLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const choose = (role) => {
    enterDemo(role);
    const destination =
      role === 'admin' ? '/admin' : safeRedirect(location.state?.from || '/collection');
    navigate(destination === '/admin' && role !== 'admin' ? '/collection' : destination, {
      replace: true,
    });
  };
  return (
    <section className="max-w-3xl mx-auto px-6 py-16 min-h-[55vh]">
      <p className="text-sm uppercase tracking-widest text-slate-500">Explore the project</p>
      <h1 className="text-4xl prata-regular mt-3 mb-5">Choose a demo profile</h1>
      <p className="text-slate-600 leading-relaxed mb-8">
        No account, password or AWS access is required. These fictional profiles demonstrate the
        shopping and catalog-management journeys in your browser.
      </p>
      <div className="grid sm:grid-cols-2 gap-5">
        <button
          onClick={() => choose('customer')}
          className="text-left border rounded-xl p-7 hover:bg-slate-50 focus-visible:outline-2"
        >
          <span className="block text-xl font-semibold mb-2">Demo customer</span>
          <span className="text-slate-600">
            Browse the catalog, leave a sample review and try checkout.
          </span>
        </button>
        <button
          onClick={() => choose('admin')}
          className="text-left bg-slate-900 text-white rounded-xl p-7 hover:bg-slate-800 focus-visible:outline-2"
        >
          <span className="block text-xl font-semibold mb-2">Demo administrator</span>
          <span className="text-slate-300">
            Create, edit and remove products in an isolated sample catalog.
          </span>
        </button>
      </div>
      <p className="text-sm text-slate-500 mt-6">
        Profiles, reviews and catalog edits reset on reload. Only the demo cart is saved locally. No
        orders, emails or payments are sent.
      </p>
      <Link to="/collection" className="inline-block underline mt-5">
        Continue browsing without a profile
      </Link>
    </section>
  );
}

function CognitoLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('login');
  const [challenge, setChallenge] = useState('');
  const [values, setValues] = useState({ name: '', email: '', password: '', code: '' });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const change = (event) => setValues((v) => ({ ...v, [event.target.name]: event.target.value }));
  const switchMode = (next) => {
    setMode(next);
    setChallenge('');
    setError('');
    setMessage('');
    setValues((v) => ({ ...v, password: '', code: '' }));
  };

  function acceptSignIn(result) {
    const next = signInStep(result);
    if (next === 'DONE') {
      setValues((v) => ({ ...v, password: '', code: '' }));
      navigate(safeRedirect(location.state?.from || '/'), { replace: true });
    } else if (
      [
        'CONFIRM_SIGN_IN_WITH_TOTP_CODE',
        'CONFIRM_SIGN_IN_WITH_SMS_CODE',
        'CONFIRM_SIGN_IN_WITH_EMAIL_CODE',
        'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED',
      ].includes(next)
    ) {
      setChallenge(next);
      setValues((v) => ({ ...v, password: '', code: '' }));
      setMessage(
        next.includes('PASSWORD')
          ? 'Set the new password required by your account.'
          : 'Enter the verification code for your account.',
      );
    } else {
      throw new Error(
        'This account requires an additional sign-in step not supported by this interface. Contact the administrator.',
      );
    }
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      if (challenge)
        acceptSignIn(
          await confirmSignIn({
            challengeResponse: challenge.includes('PASSWORD') ? values.password : values.code,
          }),
        );
      else if (mode === 'login')
        acceptSignIn(await signIn({ username: values.email, password: values.password }));
      else if (mode === 'signup') {
        await signUp({
          username: values.email,
          password: values.password,
          options: { userAttributes: { email: values.email, name: values.name } },
        });
        setMode('confirm');
        setMessage('Enter the verification code sent to your email.');
        setValues((v) => ({ ...v, password: '' }));
      } else if (mode === 'confirm') {
        await confirmSignUp({ username: values.email, confirmationCode: values.code });
        setMode('login');
        setMessage('Account confirmed. You can now log in.');
      } else if (mode === 'forgot') {
        await resetPassword({ username: values.email });
        setMode('reset');
        setMessage('If eligible, your account will receive a reset code.');
      } else if (mode === 'reset') {
        await confirmResetPassword({
          username: values.email,
          confirmationCode: values.code,
          newPassword: values.password,
        });
        setMode('login');
        setValues((v) => ({ ...v, password: '', code: '' }));
        setMessage('Password changed. You can now log in.');
      }
    } catch {
      setError(
        'Unable to complete this step. Check your details and code, or contact the administrator for unsupported sign-in steps.',
      );
    } finally {
      setBusy(false);
    }
  }
  const needsCode =
    ['confirm', 'reset'].includes(mode) || (challenge && !challenge.includes('PASSWORD'));
  const needsPassword = challenge
    ? challenge.includes('PASSWORD')
    : ['login', 'signup', 'reset'].includes(mode);
  const inputClass = 'border rounded px-3 py-2 w-full';
  return (
    <form onSubmit={submit} className="max-w-md px-6 py-16 mx-auto space-y-5">
      <h1 className="text-3xl prata-regular">
        {challenge
          ? 'Complete sign-in'
          : {
              login: 'Log in',
              signup: 'Create an account',
              confirm: 'Confirm your email',
              forgot: 'Reset password',
              reset: 'Choose a new password',
            }[mode]}
      </h1>
      {mode === 'signup' && (
        <label className="block">
          Full name
          <input
            name="name"
            value={values.name}
            onChange={change}
            required
            maxLength={120}
            autoComplete="name"
            className={inputClass}
          />
        </label>
      )}
      <label className="block">
        Email
        <input
          name="email"
          type="email"
          value={values.email}
          onChange={change}
          required
          autoComplete="username"
          className={inputClass}
          disabled={!!challenge}
        />
      </label>
      {needsPassword && (
        <label className="block">
          Password
          <input
            name="password"
            type="password"
            value={values.password}
            onChange={change}
            required
            autoComplete={mode === 'login' && !challenge ? 'current-password' : 'new-password'}
            className={inputClass}
          />
        </label>
      )}
      {needsCode && (
        <label className="block">
          Verification code
          <input
            name="code"
            value={values.code}
            onChange={change}
            required
            autoComplete="one-time-code"
            className={inputClass}
          />
        </label>
      )}
      {error && (
        <p role="alert" className="text-red-700">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="text-slate-600">
          {message}
        </p>
      )}
      <button
        disabled={busy}
        className="bg-slate-900 text-white rounded px-6 py-3 disabled:opacity-50"
      >
        {busy ? 'Please wait…' : 'Continue'}
      </button>
      <div className="flex flex-wrap gap-4 text-sm">
        <button
          type="button"
          onClick={() => switchMode(mode === 'signup' ? 'login' : 'signup')}
          className="underline"
        >
          {mode === 'signup' ? 'Log in' : 'Create account'}
        </button>
        <button type="button" onClick={() => switchMode('forgot')} className="underline">
          Forgot password?
        </button>
        {challenge && (
          <button type="button" onClick={() => switchMode('login')} className="underline">
            Start again
          </button>
        )}
      </div>
    </form>
  );
}

export default function Login() {
  return isDemo ? <DemoLogin /> : <CognitoLogin />;
}
