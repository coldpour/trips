import { useState } from "react";
import "./App.css";
import {
  SignOut,
  supabase,
  SupabaseProvider,
  useSupabase,
} from "./SupabaseContext";
import {QueryClientProvider, QueryClient} from "@tanstack/react-query";
import { useTripList } from "./useTripList";
import { Trip } from "./types/Trip";

const queryClient = new QueryClient()

export default function App() {
  return (
    <SupabaseProvider>
      <QueryClientProvider client={queryClient}>
      <AuthenticatedApp />
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
        <div>Welcome back, {session.user.email}</div>
        <SignOut />
        <Trips />
      </div>
    );
  }
}

function expenseTotal(trip: Trip) {
  return (
    trip.childcare +
    trip.entertainment +
    trip.lodgingTotal +
    trip.taxiOrRentalCar +
    trip.skiPassPerDay
  );
}

function Trips() {
  const { data: trips, error, isLoading } = useTripList();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return (<pre style={{ color: "red" }}>
          Error: {JSON.stringify(error, null, 2)}
        </pre>
    )
  }

  return (
    <div>
      {trips.map((trip) => (
        <div key={trip.id}>
          <h3>
            {trip.name} ${expenseTotal(trip)}
          </h3>
          <pre>{JSON.stringify(trip, null, 2)}</pre>
        </div>
      ))}
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
