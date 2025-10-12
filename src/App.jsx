import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import "./App.css";

const supabase = createClient(
  "https://tnyckutfhrdjqqhixswv.supabase.co",
  "sb_publishable_qm1auNuQQuk7saokdh5lTw_I4aU5AU3",
);

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
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

  if (!session) {
    return <Auth />;
  } else {
    return <SignOut />;
  }
}

function SignOut() {
  const [loading, setLoading] = useState(false);
  return (
    <div>
      <div>Logged in!</div>
      <button
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
    </div>
  );
}

const defaultEmail = "";
const defaultPassword = "";
function Auth() {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState(defaultPassword);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    setError("");

    try {
      const resp = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setResponse(resp);
      if (resp.error) {
        if (resp.error.code === "invalid_credentials")
          setError("Invalid credentials.");
      } else {
        setError("");
      }
    } catch (error) {
      setError(`Failed to log in: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <button type="submit" disabled={loading}>
        Log in
      </button>
      <div>{error && <p style={{ color: "red" }}>{error}</p>}</div>
      {response && <pre>{JSON.stringify(response, null, 2)}</pre>}
    </form>
  );
}
