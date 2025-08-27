// src/auth/useSession.js
import { fetchAuthSession } from "@aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import { useEffect, useState } from "react";

export function useSession() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const session = await fetchAuthSession();        // ID token with claims
      const id = session?.tokens?.idToken;
      const p = id?.payload ?? {};
      setUser({
        sub: p.sub,
        email: p.email,
        username: p["cognito:username"] || p["preferred_username"] || p.email,
      });
      setIsAdmin((p["cognito:groups"] || []).includes("admin"));
    } catch {
      setUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const un = Hub.listen("auth", load);  // refresh on sign-in/out
    return () => un();
  }, []);

  return { user, isAdmin, loading };
}
