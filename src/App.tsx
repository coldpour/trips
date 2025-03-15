// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import './App.css';
import {
  CellContext,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ReactNode } from 'react';

const trips: Trip[] = [
  {
    description: 'Hotel no kids',
    fun: 5,
    destination: 'Park City',
    arrive: new Date('2/16/2025'),
    depart: new Date('2/19/2025'),
    adults: 2,
    lodgingPerPersonPerNight: 316,
    flightPerSeat: 500,
  },
  {
    description: 'Hotel w/ kids - hilton',
    fun: 5,
    destination: 'Park City',
    arrive: new Date('2/14/2025'),
    depart: new Date('2/19/2025'),
    adults: 2,
    children: 2,
    lodgingPerPersonPerNight: 183,
    flightPerSeat: 800,
    childcare: 900,
  },
  {
    description: 'Mexico',
    fun: 10,
    destination: 'Mexico',
    arrive: new Date('9/12/2024'),
    depart: new Date('9/14/2024'),
    adults: 2,
    lodgingPerNight: 1200,
    flightPerSeat: 500,
    dinner: 500,
    taxi: 180,
  },
  {
    description: 'Mike and Katie in HI',
    fun: 10,
    destination: 'Mexico',
    arrive: new Date('9/12/2024'),
    depart: new Date('9/14/2024'),
    adults: 2,
    lodging: 1500,
    flightPerSeat: 600,
    dinner: 500,
    taxi: 300,
  },
  {
    description: 'MKCC',
    fun: 10,
    destination: 'Big Sky',
    arrive: new Date('2/9/2025'),
    depart: new Date('2/12/2025'),
    adults: 2,
    lodgingPerNight: 700,
    flightPerSeat: 400,
    skiPassPerDay: 160,
    dinner: 250,
  },
  {
    description: 'Corley house no kids',
    fun: 5,
    destination: 'Park City',
    arrive: new Date('2/14/2025'),
    depart: new Date('2/19/2025'),
    adults: 2,
    lodgingPerPersonPerNight: 150,
    flightPerSeat: 500,
  },
  {
    description: 'Corley house w/ kids',
    fun: 5,
    destination: 'Park City',
    arrive: new Date('2/14/2025'),
    depart: new Date('2/19/2025'),
    adults: 2,
    children: 2,
    lodgingPerPersonPerNight: 150,
    flight: 1000,
  },
  {
    description: 'Mike and Katie in Whistler',
    destination: 'Canada',
    nights: 3,
    adults: 2,
    children: 0,
    lodgingPerPersonPerNight: 150,
    dinner: 250,
    fun: 10,
  },
  {
    description: 'North Carolina for ThxGvng',
    destination: 'NC',
    startDate: new Date('11/20/2024'),
    endDate: new Date('11/27/2024'),
    adults: 2,
    children: 2,
    lodging: 0,
    taxi: 756,
    fun: 1,
    flightPerSeat: 800,
  },
  {
    description: 'Xmas',
    destination: 'New York',
    startDate: new Date('12/20/2025'),
    endDate: new Date('12/27/2025'),
    adults: 2,
    children: 2,
    lodgingPerNight: 600,
    childcare: 400,
    taxi: 800,
    flightPerSeat: 800,
    fun: 7,
  },
  {
    description: 'KVH in Italy with Karen',
    destination: 'Italy',
    nights: 7,
    adults: 1,
    children: 0,
    lodging: 1400,
    childcare: 250,
    dinner: 1000,
    taxi: 300,
    fun: 10,
  },
  {
    description: 'Hotel in Seattle',
    destination: 'Washington',
    nights: 2,
    adults: 2,
    lodging: 500,
    dinner: 500,
    fun: 10,
  },
  {
    description: 'CPS ski Eldora',
    destination: 'Colorado',
    nights: 3,
    adults: 2,
    lodging: 0,
    taxi: 100,
    fun: 7,
    skiPass: 600,
  },
];

const millisPerDay = 1000 * 60 * 60 * 24;

function calculateTripLength(start: Date, end: Date): number {
  return Math.ceil((end.getTime() - start.getTime()) / millisPerDay);
}

const aggregatedTrips: AggregatedTrip[] = trips.map((trip) => {
  const travelers = trip.adults + (trip.children || 0);
  const nights =
    'nights' in trip
      ? trip.nights
      : 'startDate' in trip
        ? calculateTripLength(trip.startDate, trip.endDate)
        : calculateTripLength(trip.arrive, trip.depart);
  const lodging =
    'lodging' in trip
      ? trip.lodging
      : 'lodgingPerNight' in trip
        ? trip.lodgingPerNight
        : trip.lodgingPerPersonPerNight * travelers * nights;

  const flight =
    'flight' in trip
      ? (trip.flight ?? 0)
      : 'flightPerSeat' in trip
        ? (trip.flightPerSeat ?? 0) * travelers
        : 0;
  const skiPass =
    'skiPass' in trip
      ? (trip.skiPass ?? 0)
      : 'skiPassPerDay' in trip
        ? (trip.skiPassPerDay ?? 0) * nights * trip.adults
        : 0;
  const cost =
    lodging +
    flight +
    (trip.childcare || 0) +
    (trip.dinner || 0) +
    skiPass +
    (trip.taxi || 0);
  return {
    ...trip,
    travelers,
    skiPass,
    flight,
    nights,
    lodging,
    cost,
    funPerDollar: Math.round((trip.fun / cost) * 10000),
  };
});

const columnHelper = createColumnHelper<AggregatedTrip>();

function formatDateOutput(info: CellContext<AggregatedTrip, Date>) {
  const date = info.getValue();
  const value = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
  return <div style={{ textAlign: 'right' }}>{value}</div>;
}

function LeftAlign(info: CellContext<AggregatedTrip, ReactNode>) {
  return <div style={{ textAlign: 'left' }}>{info.getValue()}</div>;
}
function RightAlign(info: CellContext<AggregatedTrip, ReactNode>) {
  return <div style={{ textAlign: 'right' }}>{info.getValue()}</div>;
}

const columns = [
  columnHelper.accessor('description', {
    header: () => 'Description',
    cell: LeftAlign,
  }),
  columnHelper.accessor('fun', {
    header: () => 'Fun',
    cell: (info: CellContext<AggregatedTrip, number>) => info.getValue(),
  }),
  columnHelper.accessor('funPerDollar', {
    header: () => 'Fun/$',
  }),
  columnHelper.accessor('cost', {
    header: () => 'Cost',
  }),
  columnHelper.accessor('destination', {
    header: 'Location',
  }),
  columnHelper.accessor(
    (row) =>
      'arrive' in row
        ? row.arrive
        : 'startDate' in row
          ? row.startDate
          : undefined,
    {
      header: 'Arrive',
      cell: formatDateOutput,
    },
  ),
  columnHelper.accessor(
    (row) =>
      'depart' in row ? row.depart : 'endDate' in row ? row.endDate : undefined,
    {
      header: 'Depart',
      cell: formatDateOutput,
    },
  ),
  columnHelper.accessor((row) => row.nights, {
    id: 'nights',
    header: 'Nights',
    cell: (info) => <i>{info.getValue()}</i>,
  }),
  columnHelper.accessor('adults', {
    header: () => 'Adults',
    cell: (info) => info.renderValue(),
  }),
  columnHelper.accessor('children', {
    header: () => 'Children',
    sortUndefined: -1,
  }),
  columnHelper.accessor('travelers', {
    header: 'Travelers',
  }),
  columnHelper.accessor('lodging', {
    header: 'Lodging',
    cell: RightAlign,
  }),
  columnHelper.accessor('flight', {
    header: 'Flight',
    cell: RightAlign,
  }),
  columnHelper.accessor((row) => ('skiPass' in row ? row.skiPass : undefined), {
    header: 'Ski Pass',
    cell: RightAlign,
  }),
  columnHelper.accessor((row) => ('dinner' in row ? row.dinner : undefined), {
    header: 'Dinner',
    cell: RightAlign,
  }),
  columnHelper.accessor(
    (row) => ('childcare' in row ? row.childcare : undefined),
    {
      header: 'Childcare',
      cell: RightAlign,
    },
  ),
  columnHelper.accessor((row) => ('taxi' in row ? row.taxi : undefined), {
    header: 'Taxi',
    cell: RightAlign,
  }),
];

function App() {
  const table = useReactTable({
    columns,
    data: aggregatedTrips,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <>
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <th key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? 'cursor-pointer select-none'
                            : ''
                        }
                        onClick={header.column.getToggleSortingHandler()}
                        title={
                          header.column.getCanSort()
                            ? header.column.getNextSortingOrder() === 'asc'
                              ? 'Sort ascending'
                              : header.column.getNextSortingOrder() === 'desc'
                                ? 'Sort descending'
                                : 'Clear sort'
                            : undefined
                        }
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽',
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => {
            return (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  return (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div>{table.getRowModel().rows.length.toLocaleString()} Rows</div>
      <pre>{JSON.stringify(table.getState().sorting, null, 2)}</pre>
    </>
  );
}

export default App;

type StayOption =
  | { nights: number }
  | { startDate: Date; endDate: Date }
  | { arrive: Date; depart: Date };

type LodgingOption =
  | { lodging: number }
  | { lodgingPerNight: number }
  | { lodgingPerPersonPerNight: number };

type FlightOption = { flight?: number } | { flightPerSeat?: number };
type SkiPassOption = { skiPass?: number } | { skiPassPerDay?: number };

interface BaseTrip {
  description: string;
  destination: string;
  adults: number;
  children?: number;
  childcare?: number;
  dinner?: number;
  taxi?: number;
  fun: number;
}

type Trip = StayOption &
  LodgingOption &
  BaseTrip &
  FlightOption &
  SkiPassOption;

type AggregatedTrip = BaseTrip &
  StayOption & {
    travelers: number;
    nights: number;
    lodging: number;
    cost: number;
    flight: number;
    funPerDollar: number;
  };
