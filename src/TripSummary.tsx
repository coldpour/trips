import { Trip } from "./types/Trip";
import { calcNights, calcScore, expenseTotal } from "./util/expenseTotal";
import { formatCurrency } from "./util/format";
import { deleteTrip, duplicateTrip, moveTripToList } from "./useTripList";
import { Link } from "react-router";
import { useTripListList } from "./useTripListList";

function DeleteButton({ id }: { id: string }) {
  const { mutate, isPending } = deleteTrip(id);
  const handleClick = () => {
    mutate();
  };
  return (
    <button
      className="delete-button"
      onClick={handleClick}
      disabled={isPending}
    >
      delete
    </button>
  );
}

function DuplicateButton({ trip }: { trip: Trip }) {
  const { mutate, isPending } = duplicateTrip();
  const handleClick = () => {
    mutate(trip);
  };
  return (
    <button
      className="duplicate-button"
      onClick={handleClick}
      disabled={isPending}
    >
      duplicate
    </button>
  );
}

function MoveToListDropdown({ trip }: { trip: Trip }) {
  const { data: tripLists } = useTripListList();
  const { mutate, isPending } = moveTripToList(trip.id);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    mutate(value === "" ? null : value);
  };

  return (
    <select
      value={trip.trip_list_id || ""}
      onChange={handleChange}
      disabled={isPending}
      className="btn-sm"
    >
      <option value="">All Trips</option>
      {tripLists?.map((list) => (
        <option key={list.id} value={list.id}>
          {list.name}
        </option>
      ))}
    </select>
  );
}

export function TripSummary(props: Trip) {
  return (
    <div className="trip-card-wrapper">
      <Link to={`/${props.id}`} style={{ color: "inherit", flex: 1, textDecoration: "none" }}>
        <div className="trip-card">
          <div className="trip-card-header">
            <div className="trip-card-name">{props.name}</div>
            <div className="score-badge">{calcScore(props)}</div>
          </div>
          <div className="trip-card-details">
            <div className="trip-metric">
              <span>🎉</span>
              <span className="trip-metric-value">{props.fun}</span>
            </div>
            <div className="trip-metric">
              <span>🌙</span>
              <span className="trip-metric-value">{calcNights(props)}</span>
              <span>nights</span>
            </div>
            <div className="trip-metric">
              <span>💰</span>
              <span className="trip-metric-value">{formatCurrency(expenseTotal(props))}</span>
            </div>
          </div>
        </div>
      </Link>
      <div className="trip-card-actions">
        <MoveToListDropdown trip={props} />
        <DuplicateButton trip={props} />
        <DeleteButton id={props.id} />
      </div>
    </div>
  );
}
