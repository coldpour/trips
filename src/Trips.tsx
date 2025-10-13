import { useTripList } from "./useTripList";
import { calcNights, calcScore, expenseTotal } from "./util/expenseTotal";
import { Link } from "react-router";
import { Trip } from "./types/Trip";
import { formatCurrency } from "./util/format";

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
    <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
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

function TripSummary(props: Trip) {
  return (
    <div
      style={{
        backgroundColor: "#333",
        padding: "8px",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <div
        style={{
          fontSize: "1.25em",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>{props.name}</div>
        <div>{calcScore(props)}</div>
      </div>
      <div
        style={{
          fontSize: ".65em",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>Fun: {props.fun}</div>
        <div>Nights: {calcNights(props)}</div>
        <div>Cost: {formatCurrency(expenseTotal(props))}</div>
      </div>
    </div>
  );
}
