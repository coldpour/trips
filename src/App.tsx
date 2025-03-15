// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import './App.css';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
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
  children: number;
};

type AggregatedTrip = Trip & {
  travelers: number;
  nights: number;
};

const trips: Trip[] = [
  {
    description: 'Mike and Katie in Whistler',
    destination: 'Canada',
    nights: 3,
    adults: 2,
    children: 0,
  },
  {
    description: 'Xmas',
    destination: 'New York',
    startDate: new Date(2025, 11, 20),
    endDate: new Date(2025, 11, 30),
    adults: 2,
    children: 2,
  },
  {
    description: 'KVH in Italy with Karen',
    destination: 'Italy',
    nights: 7,
    adults: 1,
    children: 0,
  },
  {
    description: 'Hotel in Seattle',
    destination: 'Washington',
    nights: 2,
    adults: 2,
    children: 0,
  },
  {
    description: 'CPS ski Eldora',
    destination: 'Colorado',
    nights: 3,
    adults: 2,
    children: 0,
  },
];

const aggregatedTrips: AggregatedTrip[] = trips.map((trip) => ({
  ...trip,
  travelers: trip.adults + trip.children,
  nights:
    'nights' in trip
      ? trip.nights
      : Math.ceil(
          (trip.endDate.getTime() - trip.startDate.getTime()) /
            (1000 * 60 * 60 * 24),
        ),
}));

const columnHelper = createColumnHelper<AggregatedTrip>();

const columns = [
  columnHelper.accessor('description', {
    cell: (info) => info.getValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor('destination', {
    header: 'Destination',
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor((row) => row.nights, {
    id: 'nights',
    cell: (info) => <i>{info.getValue()}</i>,
    header: () => <span>Nights</span>,
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor('adults', {
    header: () => 'Adults',
    cell: (info) => info.renderValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor('children', {
    header: () => <span>Visits</span>,
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor('travelers', {
    header: 'Travelers',
    footer: (info) => info.column.id,
  }),
];

function App() {
  const table = useReactTable({
    columns,
    data: aggregatedTrips,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(), //order doesn't matter anymore!
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
