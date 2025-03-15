import "./App.css";
import { useMemo } from "react";
import { useState } from "react";

interface Trip {
  id: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  adults: number;
  children: number;
}

interface AggregatedTrip extends Trip {
  travelers: number;
  nights: number;
}

const trips: Trip[] = [
  {
    id: "1",
    destination: "Paris",
    startDate: new Date(2024, 5, 16),
    endDate: new Date(2024, 5, 20),
    adults: 1,
    children: 1,
  },
  {
    id: "2",
    destination: "New York",
    startDate: new Date(2024, 6, 5),
    endDate: new Date(2024, 6, 15),
    adults: 1,
    children: 0,
  },
  {
    id: "3",
    destination: "Sydney",
    startDate: new Date(2024, 8, 1),
    endDate: new Date(2024, 8, 14),
    adults: 2,
    children: 3,
  },
];

const aggregatedTrips: AggregatedTrip[] = trips.map((trip) => ({
  ...trip,
  travelers: trip.adults + trip.children,

  nights: Math.ceil(
    (trip.endDate.getTime() - trip.startDate.getTime()) / (1000 * 60 * 60 * 24),
  ),
}));

function App() {
  const [sortField, setSortField] = useState<keyof AggregatedTrip>("travelers");
  const [isAscending, setIsAscending] = useState<boolean>(true);

  const sortedTrips = useMemo(
    () =>
      aggregatedTrips.sort(
        (a, b) =>
          (a[sortField] > b[sortField] ? 1 : -1) * (isAscending ? 1 : -1),
      ),
    [sortField, isAscending],
  );

  const handleSort = (field: keyof AggregatedTrip) => {
    if (field === sortField) {
      setIsAscending(!isAscending);
    } else {
      setSortField(field);
      setIsAscending(true);
    }
  };

  return (
    <>
      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort("destination")}>Destination</th>
            <th onClick={() => handleSort("startDate")}>Start Date</th>
            <th onClick={() => handleSort("endDate")}>End Date</th>
            <th onClick={() => handleSort("adults")}>Adults</th>
            <th onClick={() => handleSort("children")}>Children</th>
            <th onClick={() => handleSort("travelers")}>Travelers</th>
            <th onClick={() => handleSort("nights")}>Nights</th>
          </tr>
        </thead>
        <tbody>
          {sortedTrips.map((trip) => (
            <tr key={trip.id}>
              <td>{trip.destination}</td>
              <td>{trip.startDate.toLocaleDateString()}</td>
              <td>{trip.endDate.toLocaleDateString()}</td>
              <td>{trip.adults}</td>
              <td>{trip.children}</td>
              <td>{trip.travelers}</td>
              <td>{trip.nights}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default App;
