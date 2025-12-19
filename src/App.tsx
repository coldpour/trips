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
import { SharedTripList, SharedTripDetail } from "./SharedTripList";

const queryClient = new QueryClient();

export default function App() {
  return (
    <SupabaseProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter basename="/trips">
          <AuthenticatedApp />
        </BrowserRouter>
      </QueryClientProvider>
    </SupabaseProvider>
  );
}

function AuthenticatedApp() {
  const { session } = useSupabase();

  return (
    <Routes>
      <Route path="/shared/:shareToken" element={<SharedTripList />} />
      <Route path="/shared/:shareToken/:tripId" element={<SharedTripDetail />} />
      
      {!session ? (
        <>
          <Route path="/register" element={<Register />} />
          <Route
            path="*"
            element={
              <div>
                <div className="hero">
                  <h1>FunTrips</h1>
                </div>
                <Auth />
                <div className="footer">
                  <h5>Feedback welcome</h5>
                  <div className="stack row">
                    <Link
                      target="_blank"
                      className="login-link"
                      to={"https://github.com/coldpour/trips"}
                    >
                      github
                    </Link>
                    <a
                      className="login-link"
                      href="mailto:coldpour@gmail.com?subject=FunTrips Feedback&body=I've been using FunTrips and I'd like to share some feedback."
                    >
                      email
                    </a>
                  </div>
                </div>
              </div>
            }
          />
        </>
      ) : (
        <>
          <Route
            path="*"
            element={
              <div>
                <div className="header">
                  <div className="hero" style={{ textAlign: 'left', padding: '0' }}>
                    <h2 style={{ fontSize: '1.75em', margin: 0 }}>FunTrips</h2>
                  </div>
                  <div className="header-user-info">
                    <span>{session.user.email}</span>
                    <div className="stack row" style={{ gap: 'var(--space-sm)' }}>
                      <Link
                        target="_blank"
                        className="login-link"
                        to={"https://github.com/coldpour/trips/issues/new"}
                      >
                        GitHub
                      </Link>
                      <a
                        className="login-link"
                        href="mailto:coldpour@gmail.com?subject=FunTrips Feedback&body=I've been using FunTrips and I'd like to share some feedback."
                      >
                        Email
                      </a>
                      <SignOut />
                    </div>
                  </div>
                </div>

                <Routes>
                  <Route path="/" element={<Trips />} />
                  <Route path="/new" element={<CreateTripRoute />} />
                  <Route path="/:tid" element={<TripRoute />} />
                </Routes>
              </div>
            }
          />
        </>
      )}
    </Routes>
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
    <div className="login-container">
      <h3>Let's get back to it...</h3>
      <form onSubmit={handleSubmit} className="login-form">
        <label className="input-label">
          Email
          <input
            className="input-field"
            type="email"
            autoComplete="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="input-label">
          Password
          <input
            className="input-field"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button type="submit" disabled={loading}>
          Log in
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {response && <pre>{JSON.stringify(response, null, 2)}</pre>}
      </form>

      <h5>Are you new here?</h5>
      <Link to={"/register"} className="login-link">
        Create account
      </Link>
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
    onSuccess: async () => {
      await navigate("/");
    },
  });

  return (
    <div className="login-container">
      <h3>...ready for max fun?</h3>
      <form
        className="login-form"
        onSubmit={(e) => {
          e.preventDefault();
          mutate();
        }}
      >
        <label className="input-label">
          Email
          <input
            className="input-field"
            type="email"
            autoComplete="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="input-label">
          Password
          <input
            className="input-field"
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
      <h5>Pick up where you left off</h5>
      <Link to={"/"} className="login-link">
        Login
      </Link>
    </div>
  );
}
