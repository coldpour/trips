import {Trip} from "./types/Trip";
import { calcNights, calcScore, expenseTotal } from "./util/expenseTotal";
import {formatCurrency} from "./util/format";

export function TripSummary(props: Trip) {
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
          gap: '1em',
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