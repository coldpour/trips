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
      style={{
        fontSize: "12px",
        padding: "4px 8px",
        backgroundColor: "var(--input-bg)",
        border: "1px solid var(--input-border)",
        borderRadius: "4px",
        color: "var(--input-text)",
      }}
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
    <div style={{ display: "flex", gap: "var(--space-md)", alignItems: "stretch" }}>
      <Link to={`/${props.id}`} style={{ color: "inherit", flex: 1, textDecoration: 'none' }}>
        <div className="trip-card">
          <div className="trip-card-header">
            <div style={{ flex: 1 }}>{props.name}</div>
            <div>{calcScore(props)}</div>
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
        </div>
      </Link>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', minWidth: '140px' }}>
        <MoveToListDropdown trip={props} />
        <DuplicateButton trip={props} />
        <DeleteButton id={props.id} />
      </div>
    </div>
  );
}
