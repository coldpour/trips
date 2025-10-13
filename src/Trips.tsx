import { useTripList } from "./useTripList";
import { expenseTotal } from "./util/expenseTotal";
import { Link } from "react-router";

export function Trips() {
  const {
    data: trips,
    error,
    isLoading,
    refetch,
  } = useTripList();

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
    <div>
      {trips.map((trip) => (
        <Link to={`/${trip.id}`} key={trip.id}>
          <h3>
            {trip.name} ${expenseTotal(trip)}
          </h3>
          <pre>{JSON.stringify(trip, null, 2)}</pre>
        </Link>
      ))}
    </div>
  );
}
