import { useEffect, useState } from 'react';
import { fetchAuthSession, subscribeAuth } from './client.js';
import { sessionUser } from './session.js';

export function useSession() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    let generation = 0;
    async function load() {
      const request = ++generation;
      try {
        const result = sessionUser(await fetchAuthSession());
        if (active && request === generation) setUser(result);
      } catch {
        if (active && request === generation) setUser(null);
      } finally {
        if (active && request === generation) setLoading(false);
      }
    }
    const stop = subscribeAuth(load);
    load();
    return () => {
      active = false;
      stop();
    };
  }, []);
  return { user, isAdmin: user?.isAdmin === true, loading };
}
