import { useState } from "react";
import "./App.css";
import {
  SignOut,
  supabase,
  SupabaseProvider,
  useSupabase,
} from "./SupabaseContext";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
} from "@tanstack/react-query";
import { BrowserRouter, Link, Route, Routes, useNavigate } from "react-router";
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
    return (
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    );
  } else {
    return (
      <div>
        <div className="header">
          <div>{session.user.email}</div>
          <SignOut />
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
        if (resp.error.code === "invalid_credentials") {
          setError("Invalid credentials.");
        }
        if (resp.error.code === "email_not_confirmed") {
          setError("Please confirm your email address.");
        }
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
    <div>
      <h3>Plan your next adventure...</h3>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          alignItems: "flex-end",
        }}
      >
        <label style={{ display: "flex", gap: "8px" }}>
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
        <label style={{ display: "flex", gap: "8px" }}>
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
      <Link to={"/register"}>Create account</Link>
    </div>
  );
}

function Register() {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState(defaultPassword);
  const navigate = useNavigate();
  const { mutate, isPending, error } = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.auth.signUp({ email, password });
      console.log({ data });
      if (error) throw error;
    },
    onSuccess: () => {
      navigate("/");
    },
  });

  return (
    <div>
      <h3>Wanna have some fun?</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutate();
        }}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          alignItems: "flex-end",
        }}
      >
        <label style={{ display: "flex", gap: "8px" }}>
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
        <label style={{ display: "flex", gap: "8px" }}>
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button type="submit" disabled={isPending}>
          Create account
        </button>
      </form>
      {error && (
        <pre style={{ color: "red" }}>
          Error: {JSON.stringify(error, null, 2)}
        </pre>
      )}
      <Link to={"/"}>Login</Link>
    </div>
  );
}
