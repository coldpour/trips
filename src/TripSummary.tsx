import { Trip } from "./types/Trip";
import { calcNights, calcScore, expenseTotal } from "./util/expenseTotal";
import { formatCurrency } from "./util/format";
import { deleteTrip, duplicateTrip } from "./useTripList";
import { Link } from "react-router";

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

export function TripSummary(props: Trip) {
  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      <Link to={`/${props.id}`} style={{ color: "inherit", flex: 1 }}>
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
      </Link>
      <div className="stack">
        <DuplicateButton trip={props} />
        <DeleteButton id={props.id} />
      </div>
    </div>
  );
}
