import { useParams, Link } from "react-router";
import { useSharedTripList } from "./useTripListList";
import { ScoreComparison } from "./ScoreComparison";
import { Trip } from "./types/Trip";
import { TypicalWeather } from "./TypicalWeather";
import { TripEvents } from "./TripEvents";
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
    <div className="trip-card" style={{ position: "relative" }}>
      <div className="trip-card-header">
        <div className="trip-card-score">{calcScore(props)}</div>
        <div className="trip-card-title">
          <Link
            className="trip-card-title-link"
            to={`/shared/${props.shareToken}/${props.id}`}
          >
            {props.name}
          </Link>
        </div>
      </div>
      <div className="trip-card-details">
        <div>
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Fun</span>
          <strong>{props.fun}/10</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Nights</span>
          <strong>{calcNights(props)}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Cost</span>
          <strong>{formatCurrency(expenseTotal(props))}</strong>
        </div>
      </div>
      <div className="trip-card-top-actions">
        <Link
          className="trip-card-link"
          to={`/shared/${props.shareToken}/${props.id}`}
        >
          Details
        </Link>
      </div>
    </div>
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

function ReadOnlyTripDetails(props: Trip & { shareToken: string; allTrips: Trip[] }) {
  const {
    name,
    fun,
    adults,
    children,
    entertainment,
    arrive,
    depart,
    flightCostPerSeat,
    flightCost,
    taxiOrRentalCar,
    skiPassPerDay,
    childcare,
    lodgingTotal,
    lodgingPerNight,
    lodgingPerPersonPerNight,
    lodging_url,
    flight_url,
  } = props;
  const tripScore = calcScore(props);

  return (
    <div className='trip-details'>
      <h1 style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>{name}</h1>
      
      <div className="form-section">
        <h3 className="form-section-header">Basic Information</h3>
        <div className="travel-dates">
          <Input name="arrive" defaultValue={arrive} type="date" label="Arrival Date" disabled />
          <Input name="depart" defaultValue={depart} type="date" label="Departure Date" disabled />
        </div>
        <Input name="nights" defaultValue={calcNights(props)} label="Number of Nights" disabled />
        <TypicalWeather name={name} startDate={arrive} endDate={depart} />
        <TripEvents name={name} startDate={arrive} endDate={depart} />
      </div>

      <div className="form-section">
        <h3 className="form-section-header">Travelers</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
          <Input name="adults" defaultValue={adults} label="Adults" disabled />
          <Input name="children" defaultValue={children} label="Children" disabled />
        </div>
        <div className="calculated-value" style={{ marginTop: 'var(--space-md)' }}>
          Total Travelers: {calcTravelers(props)}
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-header">Travel Costs</h3>
        <Input name="flightCost" defaultValue={flightCost} label="Total Flight Cost" disabled />
        <Input name="flightCostPerSeat" defaultValue={flightCostPerSeat} label="Flight Cost Per Seat" disabled />
        <div className="flight-url-row">
          <Input name="flight_url" defaultValue={flight_url} type="url" label="Flight URL (Optional)" disabled />
          {flight_url && (
            <a
              href={flight_url}
              target="_blank"
              rel="noopener noreferrer"
              className="search-link"
            >
              ✈️ Open flight link →
            </a>
          )}
        </div>
        <Input name="taxiOrRentalCar" defaultValue={taxiOrRentalCar} label="Taxi or Rental Car Total" disabled />
        <div className="calculated-value" style={{ marginTop: 'var(--space-md)' }}>
          Total Travel: {formatCurrency(calcTravel(props))}
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-header">Lodging</h3>
        <Input name="lodgingTotal" defaultValue={lodgingTotal} label="Total Lodging Cost" disabled />
        <Input name="lodgingPerNight" defaultValue={lodgingPerNight} label="Cost Per Night" disabled />
        <Input
          name="lodgingPerPersonPerNight"
          defaultValue={lodgingPerPersonPerNight}
          label="Cost Per Person Per Night"
          disabled
        />
        {lodging_url && (
          <a
            href={lodging_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="search-link"
            style={{ display: 'inline-flex', marginTop: 'var(--space-sm)' }}
          >
            🔗 Open lodging link →
          </a>
        )}
        <div className="calculated-value" style={{ marginTop: 'var(--space-md)' }}>
          Total Lodging: {formatCurrency(calcLodgingTotal(props))}
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-header">Activities & Entertainment</h3>
        <Input name="entertainment" defaultValue={entertainment} label="Entertainment Total" disabled />
        <Input name="skiPassPerDay" defaultValue={skiPassPerDay} label="Ski Pass Per Day" disabled />
        <Input name="childcare" defaultValue={childcare} label="Childcare Total" disabled />
      </div>

      <div className="form-section">
        <h3 className="form-section-header">Trip Evaluation</h3>
        <div className="calculated-value highlight" style={{ fontSize: '24px', marginBottom: 'var(--space-lg)' }}>
          Total Cost: {formatCurrency(expenseTotal(props))}
        </div>
        <Input name="fun" defaultValue={fun} label="Fun Rating" disabled />
        {tripScore > 0 ? (
          <div className="calculated-value highlight" style={{ fontSize: '24px', marginTop: 'var(--space-lg)' }}>
            Trip Score: {tripScore}
          </div>
        ) : null}
      </div>
      
      <ScoreComparison currentTrip={props} trips={props.allTrips} />

      <div className="form-footer">
        <Link to={`/shared/${props.shareToken}`} className="btn-secondary">
          ← Back to List
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
      <div className="banner info">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-sm)' }}>
          <span>📋</span>
          <span>You're viewing a shared trip (read-only)</span>
        </div>
      </div>
      <ReadOnlyTripDetails {...trip} shareToken={shareToken!} allTrips={data.trips} />
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
      <div className="banner info">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-sm)' }}>
          <span>📋</span>
          <span>You're viewing a shared trip list (read-only)</span>
        </div>
      </div>

      {/* Header */}
      <div style={{ padding: 'var(--space-xl) var(--space-lg)', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ marginBottom: 'var(--space-sm)' }}>{data.tripList.name}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
          {data.trips.length} {data.trips.length === 1 ? "trip" : "trips"} shared with you
        </p>
      </div>

      {/* Controls */}
      <div style={{ padding: 'var(--space-lg)' }}>
        <div className="controls-bar">
          <label className="input-label" style={{ marginBottom: 0, minWidth: '200px' }}>
            <div>Filter</div>
            <input
              className="input-field"
              type="text"
              placeholder="Search by name..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </label>

          <label className="input-label" style={{ marginBottom: 0, minWidth: '150px' }}>
            <div>Sort By</div>
            <select className="input-field" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="score">Score (Best Value)</option>
              <option value="name">Name (A-Z)</option>
              <option value="cost">Cost (Low to High)</option>
            </select>
          </label>
        </div>

        {/* Trip list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)", marginTop: "var(--space-lg)" }}>
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
