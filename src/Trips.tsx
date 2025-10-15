import { useTripList } from "./useTripList";
import { calcScore, expenseTotal } from "./util/expenseTotal";
import { Link } from "react-router";
import { TripSummary } from "./TripSummary";
import { useMemo, useState } from "react";
import { Trip } from "./types/Trip";

function sortFn(option: string) {
  switch (option) {
    case "name":
      return (a: Trip) => a.name;
    case "cost":
      return expenseTotal;
    case "score":
    default:
      return calcScore;
  }
}

function descending(a, b) {
  return a < b ? 1 : -1;
}

function ascending(a, b) {
  return a > b ? 1 : -1;
}
function sortDirection(option: string) {
  switch (option) {
    case "name":
      return ascending;
    case "cost":
      return ascending;
    case "score":
    default:
      return descending;
  }
}

export function Trips() {
  const { data: trips, error, isLoading, refetch } = useTripList();
  const [sort, setSort] = useState<string>("score");

  const sortedTrips = useMemo(() => {
    const sortBy = sortFn(sort);
    const direction = sortDirection(sort);
    // oxlint-disable-next-line no-array-sort
    return trips?.sort((a, b) => direction(sortBy(a), sortBy(b)));
  }, [sort, trips]);

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
    <div
      style={{
        display: "flex",
        gap: "8px",
        flexDirection: "column",
        paddingTop: "8px",
      }}
    >
      <div className="stack row">
        <Link to="/new" style={{ color: "inherit" }}>
          <button>Plan</button>
        </Link>

        <label className="stack sm">
          Sort
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="score">Score</option>
            <option value="name">Name</option>
            <option value="cost">Cost</option>
          </select>
        </label>
      </div>
      {sortedTrips.map((trip) => (
        <TripSummary key={trip.id} {...trip} />
      ))}
    </div>
  );
}
