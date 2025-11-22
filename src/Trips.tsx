import { useTripList } from "./useTripList";
import { calcScore, expenseTotal } from "./util/expenseTotal";
import { Link, useSearchParams } from "react-router";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get("s") || "";

  const filteredAndSortedTrips = useMemo(() => {
    // First filter by keyword
    const filtered = keyword
      ? trips?.filter((trip) =>
          trip.name?.toLowerCase().includes(keyword.toLowerCase())
        )
      : trips;

    // Then sort
    const sortBy = sortFn(sort);
    const direction = sortDirection(sort);
    // oxlint-disable-next-line no-array-sort
    return filtered?.sort((a, b) => direction(sortBy(a), sortBy(b)));
  }, [keyword, sort, trips]);

  const handleKeywordChange = (value: string) => {
    setSearchParams(prev => {
      if (value) {
        prev.set("s", value);
      } else {
        prev.delete("s");
      }
      return prev;
    });
  };

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
          Filter
          <input
            className="input-field"
            type="text"
            placeholder="Search by name..."
            value={keyword}
            onChange={(e) => handleKeywordChange(e.target.value)}
          />
        </label>

        <label className="stack sm">
          Sort
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="score">Score</option>
            <option value="name">Name</option>
            <option value="cost">Cost</option>
          </select>
        </label>
      </div>
      {filteredAndSortedTrips.map((trip) => (
        <TripSummary key={trip.id} {...trip} />
      ))}
    </div>
  );
}
