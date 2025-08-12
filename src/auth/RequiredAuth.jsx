import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { fetchAuthSession } from "@aws-amplify/auth";

export default function RequireAuth({ children }) {
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const session = await fetchAuthSession();
        const hasIdToken = Boolean(session?.tokens?.idToken);
        if (alive) {
          setSignedIn(hasIdToken);
        }
      } catch {
        if (alive) setSignedIn(false);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (loading) return null; // or a spinner

  // Not logged in → send to /login and remember where we came from
  if (!signedIn) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname || "/cart",
          message: "You need to log in first",
        }}
      />
    );
  }

  return children;
}
