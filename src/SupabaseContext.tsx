import { createContext, useContext, useEffect, useState } from "react";
import {createClient} from "@supabase/supabase-js";

export const supabase = createClient(
  "https://tnyckutfhrdjqqhixswv.supabase.co",
  "sb_publishable_qm1auNuQQuk7saokdh5lTw_I4aU5AU3",
);
const SupabaseContext = createContext(null);

export function SupabaseProvider({ children }) {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // oxlint-disable-next-line no-floating-promises
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);
  return <SupabaseContext.Provider value={{session}}>{children}</SupabaseContext.Provider>;
}

export function useSupabase() {
  return useContext(SupabaseContext);
}

export function SignOut() {
  const [loading, setLoading] = useState(false);
  return (
    <button
      className="sign-out"
      disabled={loading}
      onClick={async () => {
        try {
          setLoading(true);
          await supabase.auth.signOut();
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }}
    >
      Sign out
    </button>
  );
}