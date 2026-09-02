import { isDemo } from '../config.js';

// Demo identities only unlock local fixtures; they are not credentials.
let demoRole = null;
const listeners = new Set();
const emit = () => listeners.forEach((listener) => listener());
const aws = () => import('aws-amplify/auth');

export async function fetchAuthSession() {
  if (!isDemo) return (await aws()).fetchAuthSession();
  if (!demoRole) return {};
  const payload = {
    sub: `demo-${demoRole}`,
    name: demoRole === 'admin' ? 'Demo administrator' : 'Demo customer',
    email: `${demoRole}@example.invalid`,
    'cognito:groups': demoRole === 'admin' ? ['admin'] : [],
  };
  return { tokens: { idToken: { payload } } };
}
export function enterDemo(role) {
  if (!isDemo || !['customer', 'admin'].includes(role))
    throw new Error('Demo access is unavailable.');
  demoRole = role;
  emit();
}
export async function signOut() {
  if (!isDemo) return (await aws()).signOut();
  demoRole = null;
  emit();
}
export function subscribeAuth(listener) {
  if (isDemo) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
  let active = true;
  let stop;
  import('aws-amplify/utils').then(({ Hub }) => {
    if (active) stop = Hub.listen('auth', listener);
  });
  return () => {
    active = false;
    stop?.();
  };
}
async function liveOnly(method, args) {
  if (isDemo) throw new Error('Use a demo profile; no real account is needed.');
  return (await aws())[method](args);
}
export const signIn = (args) => liveOnly('signIn', args);
export const confirmSignIn = (args) => liveOnly('confirmSignIn', args);
export const signUp = (args) => liveOnly('signUp', args);
export const confirmSignUp = (args) => liveOnly('confirmSignUp', args);
export const resetPassword = (args) => liveOnly('resetPassword', args);
export const confirmResetPassword = (args) => liveOnly('confirmResetPassword', args);
