export function sessionUser(session) {
  const p = session?.tokens?.idToken?.payload;
  if (!p || typeof p.sub !== 'string' || !p.sub) return null;
  return {
    sub: p.sub,
    name: p.name || p.email || p['cognito:username'] || 'Customer',
    email: p.email,
    isAdmin: Array.isArray(p['cognito:groups']) && p['cognito:groups'].includes('admin'),
  };
}

export function signInStep(result) {
  return result?.isSignedIn ? 'DONE' : result?.nextStep?.signInStep || 'UNKNOWN';
}
