import { useState } from "react";
import "./App.css";
import {
  SignOut,
  supabase,
  SupabaseProvider,
  useSupabase,
} from "./SupabaseContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router";
import { Trips } from "./Trips";
import { TripRoute } from "./Trip";
import { CreateTripRoute } from "./CreateTrip";

const queryClient = new QueryClient();

export default function App() {
  return (
    <SupabaseProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthenticatedApp />
        </BrowserRouter>
      </QueryClientProvider>
    </SupabaseProvider>
  );
}

function AuthenticatedApp() {
  const { session } = useSupabase();

  if (!session) {
    return <Auth />;
  } else {
    return (
      <div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            alignItems: "flex-end",
            padding: "8px 0",
          }}
        >
          <SignOut />
          <div>{session.user.email}</div>
        </div>

        <Routes>
          <Route path="/" element={<Trips />} />
          <Route path="/new" element={<CreateTripRoute />} />
          <Route path="/:tid" element={<TripRoute />} />
        </Routes>
      </div>
    );
  }
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
