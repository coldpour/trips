import { useParams, Link } from "react-router";
import { useSharedTripList } from "./useTripListList";
import { Trip } from "./types/Trip";
import {
  calcLodgingTotal,
  calcNights,
  calcScore,
  calcTravel,
  calcTravelers,
  expenseTotal,
} from "./util/expenseTotal";
import { formatCurrency, capitalizeFirstLetter } from "./util/format";
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

function ReadOnlyTripCard(props: Trip & { shareToken: string }) {
  return (
    <Link to={`/shared/${props.shareToken}/${props.id}`} style={{ textDecoration: "none", color: "inherit" }}>
      <div className="trip-card" style={{ cursor: "pointer" }}>
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
    </Link>
  );
}

function Input({
  name,
  defaultValue,
  htmlFor = name,
  label = capitalizeFirstLetter(name),
  type = "number",
  disabled = false,
}: {
  name: string;
  defaultValue: number | string;
  label?: string;
  htmlFor?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <label className="input-label" htmlFor={htmlFor}>
      <div>{label}</div>
      <input
        id={htmlFor}
        type={type}
        defaultValue={defaultValue}
        name={name}
        min={0}
        className="input-field"
        disabled={disabled}
      />
    </label>
  );
}

function ReadOnlyTripDetails(props: Trip & { shareToken: string }) {
  const {
    name,
    fun,
    adults,
    children,
    entertainment,
    arrive,
    depart,
    flightCostPerSeat,
    taxiOrRentalCar,
    skiPassPerDay,
    childcare,
    lodgingTotal,
    lodgingPerNight,
    lodgingPerPersonPerNight,
    lodging_url,
  } = props;

  return (
    <div className='trip-details'>
      <Input name="name" defaultValue={name} type="text" disabled />

      <div className="travel-dates">
        <Input name="arrive" defaultValue={arrive} type="date" disabled />
        <Input name="depart" defaultValue={depart} type="date" disabled />
      </div>
      <Input name="nights" defaultValue={calcNights(props)} disabled />

      <Input name="adults" defaultValue={adults} disabled />
      <Input name="children" defaultValue={children} disabled />
      <h3>People: {calcTravelers(props)}</h3>

      <Input name="flightCostPerSeat" defaultValue={flightCostPerSeat} disabled />
      <Input name="taxiOrRentalCar" defaultValue={taxiOrRentalCar} disabled />
      <h3>Travel: {formatCurrency(calcTravel(props))}</h3>

      <Input
        name="lodgingPerPersonPerNight"
        defaultValue={lodgingPerPersonPerNight}
        disabled
      />
      <Input name="lodgingPerNight" defaultValue={lodgingPerNight} disabled />
      <Input name="lodgingTotal" defaultValue={lodgingTotal} disabled />
      {lodging_url && (
        <div className="input-label">
          <a
            href={lodging_url} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: "var(--primary-color)", 
              textDecoration: "underline",
              wordBreak: "break-all"
            }}
          >
            Open lodging link →
          </a>
        </div>
      )}
      <h3>Lodging: {formatCurrency(calcLodgingTotal(props))}</h3>

      <Input name="entertainment" defaultValue={entertainment} disabled />
      <Input name="skiPassPerDay" defaultValue={skiPassPerDay} disabled />
      <Input name="childcare" defaultValue={childcare} disabled />
      <h3>Cost: {formatCurrency(expenseTotal(props))}</h3>
      <Input name="fun" defaultValue={fun} disabled />
      <h3>Score: {calcScore(props)}</h3>

      <div className="form-footer space-between">
        <Link to={`/shared/${props.shareToken}`}>
          Back
        </Link>
      </div>
    </div>
  );
}

export function SharedTripDetail() {
  const { shareToken, tripId } = useParams<{ shareToken: string; tripId: string }>();
  const { data, isLoading, error } = useSharedTripList(shareToken);

  if (isLoading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Loading trip details...</p>
      </div>
    );
  }
  if (error || !data) {
    console.log("Error or no data:", { error, data });
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>Trip Not Found</h2>
        <p>This shared link may be invalid or has been revoked.</p>
      </div>
    );
  }

  const trip = data.trips.find((t) => String(t.id) === String(tripId));

  if (!trip) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>Trip Not Found</h2>
        <p>This trip could not be found in the shared list.</p>
      </div>
    );
  }

  return (
    <div>
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
      <ReadOnlyTripDetails {...trip} shareToken={shareToken!} />
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
              <ReadOnlyTripCard
                key={trip.id}
                {...trip}
                shareToken={shareToken!}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
