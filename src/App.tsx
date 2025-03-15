import './App.css';
import {useState} from 'react';

interface Trip {
  id: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  travelers: number;
}

const trips: Trip[] = [
  {
    id: '1',
    destination: 'Paris',
    startDate: new Date(2024, 5, 16),
    endDate: new Date(2024, 5, 20),
    travelers: 2,
  },
  {
    id: '2',
    destination: 'New York',
    startDate: new Date(2024, 6, 5),
    endDate: new Date(2024, 6, 15),
    travelers: 1,
  },
  {
    id: '3',
    destination: 'Sydney',
    startDate: new Date(2024, 8, 1),
    endDate: new Date(2024, 8, 14),
    travelers: 5,
  },
];

function App() {
  const [sortField, setSortField] = useState<keyof Trip>('startDate');

  let sortedTrips = [...trips];
  if (sortField) {
    sortedTrips.sort((a, b) => (a[sortField] > b[sortField] ? 1 : -1));
  }

  return (
    <>

      <table>
        <thead>
        <tr>
          <th >Id</th>
          <th onClick={() => setSortField('destination')}>Destination</th>
          <th onClick={() => setSortField('startDate')}>Start Date</th>
          <th onClick={() => setSortField('endDate')}>End Date</th>
          <th onClick={() => setSortField('travelers')}>Travelers</th>
        </tr>
        </thead>
        <tbody>
        {sortedTrips.map((trip) => (
          <tr key={trip.id}>
            <td>{trip.id}</td>
            <td>{trip.destination}</td>
            <td>{trip.startDate.toLocaleDateString()}</td>
            <td>{trip.endDate.toLocaleDateString()}</td>
            <td>{trip.travelers}</td>
          </tr>
        ))}
        </tbody>
      </table>
    </>
  );
}

export default App;
