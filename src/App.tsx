// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import './App.css';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
} from '@tanstack/react-table';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface Nights {
  nights: number;
}

type Trip = (Nights | DateRange) & {
  description: string;
  destination: string;
  adults: number;
  children?: number;
  lodging: number;
  flight?: number;
  childcare?: number;
  dinner?: number;
  taxi?: number;
  fun: number;
  skiPass?: number;
};

type AggregatedTrip = Trip & {
  travelers: number;
  nights: number;
  cost: number;
  funPerDollar: number;
};

const trips: Trip[] = [
  {
    description: 'Mike and Katie in Whistler',
    destination: 'Canada',
    nights: 3,
    adults: 2,
    children: 0,
    lodging: 450,
    dinner: 250,
    fun: 10,
  },
  {
    description: 'Xmas',
    destination: 'New York',
    startDate: new Date(2025, 11, 20),
    endDate: new Date(2025, 11, 30),
    adults: 2,
    children: 2,
    lodging: 4200,
    childcare: 400,
    taxi: 800,
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

function calculateCost(trip: Trip): number {
  return (
    trip.lodging +
    (trip.flight || 0) +
    (trip.childcare || 0) +
    (trip.dinner || 0) +
    (trip.skiPass || 0) +
    (trip.taxi || 0)
  );
}

const aggregatedTrips: AggregatedTrip[] = trips.map((trip) => {
  const cost = calculateCost(trip);
  return {
    ...trip,
    travelers: trip.adults + (trip.children || 0),
    nights:
      'nights' in trip
        ? trip.nights
        : Math.ceil(
            (trip.endDate.getTime() - trip.startDate.getTime()) /
              (1000 * 60 * 60 * 24),
          ),
    cost: cost,
    funPerDollar: Math.round((trip.fun / cost) * 10000),
  };
});

const columnHelper = createColumnHelper<AggregatedTrip>();

const columns = [
  columnHelper.accessor('description', {
    header: () => 'Description',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('funPerDollar', {
    header: () => 'Fun/$',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('cost', {
    header: () => 'Cost',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('destination', {
    header: 'Destination',
  }),
  columnHelper.accessor((row) => row.nights, {
    id: 'nights',
    cell: (info) => <i>{info.getValue()}</i>,
    header: () => <span>Nights</span>,
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
  }),
  columnHelper.accessor('flight', {
    header: 'Flight',
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
          {table
            .getRowModel()
            .rows.slice(0, 10)
            .map((row) => {
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
