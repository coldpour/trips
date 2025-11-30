import { useParams } from "react-router";
import { useSharedTripList } from "./useTripListList";
import { Trip } from "./types/Trip";
import { calcNights, calcScore, expenseTotal } from "./util/expenseTotal";
import { formatCurrency } from "./util/format";
import { useMemo, useState } from "react";

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

function ReadOnlyTripCard(props: Trip) {
  return (
    <div className="trip-card">
      <div className="trip-card-header">
        <div>{props.name}</div>
        <div>{calcScore(props)}</div>
      </div>
      <div className="trip-card-details">
        <div>Fun: {props.fun}</div>
        <div>Nights: {calcNights(props)}</div>
        <div>Cost: {formatCurrency(expenseTotal(props))}</div>
      </div>
    </div>
  );
}

export function SharedTripList() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const { data, isLoading, error } = useSharedTripList(shareToken);
  const [sort, setSort] = useState<string>("score");
  const [keyword, setKeyword] = useState("");

  const filteredAndSortedTrips = useMemo(() => {
    if (!data?.trips) return [];
    
    // Filter by keyword
    let filtered = keyword
      ? data.trips.filter((trip) =>
          trip.name?.toLowerCase().includes(keyword.toLowerCase())
        )
      : data.trips;

    // Sort
    const sortBy = sortFn(sort);
    const direction = sortDirection(sort);
    // oxlint-disable-next-line no-array-sort
    return filtered.sort((a, b) => direction(sortBy(a), sortBy(b)));
  }, [keyword, sort, data?.trips]);

  if (isLoading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Loading shared trip list...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>Trip List Not Found</h2>
        <p>This shared link may be invalid or has been revoked.</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div>
      {/* Read-only banner */}
      <div
        style={{
          backgroundColor: "var(--card-bg)",
          padding: "12px 20px",
          borderBottom: "1px solid var(--input-border)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "14px", opacity: 0.8 }}>
          📋 You're viewing a shared trip list (read-only)
        </div>
      </div>

      {/* Header */}
      <div style={{ padding: "20px" }}>
        <h1>{data.tripList.name}</h1>
        <p style={{ opacity: 0.7, marginTop: "8px" }}>
          {data.trips.length} {data.trips.length === 1 ? "trip" : "trips"}
        </p>
      </div>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          flexDirection: "column",
          padding: "0 20px 20px 20px",
        }}
      >
        <div className="stack row">
          <label className="stack sm">
            Filter
            <input
              className="input-field"
              type="text"
              placeholder="Search by name..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
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

        {/* Trip list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "16px" }}>
          {filteredAndSortedTrips.length === 0 ? (
            <p style={{ textAlign: "center", opacity: 0.6, padding: "40px 0" }}>
              No trips found
            </p>
          ) : (
            filteredAndSortedTrips.map((trip) => (
              <ReadOnlyTripCard key={trip.id} {...trip} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
