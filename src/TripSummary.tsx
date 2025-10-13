import { Trip } from "./types/Trip";
import { calcNights, calcScore, expenseTotal } from "./util/expenseTotal";
import { formatCurrency } from "./util/format";
import { deleteTrip } from "./useTripList";
import { Link } from "react-router";

function DeleteButton({ id }: { id: string }) {
  const { mutate } = deleteTrip(id);
  const handleClick = () => {
    mutate();
  };
  return (
    <button
      style={{ backgroundColor: "#653b3b", color: "white", padding: "4px 8px" }}
      onClick={handleClick}
    >
      delete
    </button>
  );
}

export function TripSummary(props: Trip) {
  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      <Link to={`/${props.id}`} style={{ color: "inherit", flex: 1 }}>
        <div
          style={{
            backgroundColor: "#333",
            padding: "8px",
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            flex: 1,
          }}
        >
          <div
            style={{
              fontSize: "1.25em",
              display: "flex",
              gap: "1em",
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
      </Link>

      <DeleteButton id={props.id} />
    </div>
  );
}
