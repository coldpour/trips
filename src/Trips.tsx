import { useTripList } from "./useTripList";
import { calcScore } from "./util/expenseTotal";
import { Link } from "react-router";
import { TripSummary } from "./TripSummary";

export function Trips() {
  const { data: trips, error, isLoading, refetch } = useTripList();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return (
      <div>
        {error.message === "TypeError: Failed to fetch" ? (
          <p style={{ color: "red" }}>Failed to fetch</p>
        ) : (
          <pre style={{ color: "red" }}>
            Error: {JSON.stringify(error, null, 2)}
          </pre>
        )}
        <button onClick={() => refetch()}>Try again</button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: "8px", flexDirection: "column", paddingTop: "8px" }}>
      <Link to="/new" style={{ color: "inherit" }}>
        <button>Plan</button>
      </Link>
      {trips
        .sort((a, b) => (calcScore(a) < calcScore(b) ? 1 : -1))
        .map((trip) => (
          <Link to={`/${trip.id}`} key={trip.id} style={{ color: "inherit" }}>
            <TripSummary {...trip} />
          </Link>
        ))}
    </div>
  );
}
