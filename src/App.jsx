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
    return (
      <div>
        <div>Welcome back, {session.user.email}</div>
        <SignOut />
        <Trips />
      </div>
    );
  }
}

function Trips() {
  const [loading, setLoading] = useState(false);
  const [trips, setTrips] = useState([]);
  const [error, setError] = useState(null);

  useEffect( () => {
    async function fetchTrips() {


    try {
      setLoading(true);
      const { data, error } = await supabase.from("trips").select("*");
      if (error) setError(error);
      setTrips(data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }}
    fetchTrips();
  }, []);

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && (
        <pre style={{ color: "red" }}>
          Error: {JSON.stringify(error, null, 2)}
        </pre>
      )}
      {trips.map((trip) => (
        <div key={trip.id}>
          <h3>{trip.name}</h3>
          <pre>{JSON.stringify(trip, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
}

function SignOut() {
  const [loading, setLoading] = useState(false);
  return (
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
          autoComplete="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label>
        Password
        <input
          type="password"
          autoComplete="current-password"
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
