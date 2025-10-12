import { useTripList } from "./useTripList";
import { expenseTotal } from "./util/expenseTotal";
import {Link } from 'react-router'

export function Trips() {
  const { data: trips, error, isLoading } = useTripList();


  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return (
      <pre style={{ color: "red" }}>
        Error: {JSON.stringify(error, null, 2)}
      </pre>
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