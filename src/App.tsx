// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
// noinspection JSUnusedGlobalSymbols

import './App.css';
import {
  CellContext,
  Column,
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  RowData,
  useReactTable,
} from '@tanstack/react-table';
import React, { ReactNode } from 'react';

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
    description: 'Mike Katie Connor Cailee',
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
    description: 'North Carolina for Thx Giving',
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const columns: ColumnDef<AggregatedTrip, any>[] = [
  columnHelper.accessor('description', {
    header: () => 'Description',
    cell: LeftAlign,
  }),
  columnHelper.accessor('fun', {
    header: () => 'Fun',
    cell: (info: CellContext<AggregatedTrip, number>) => info.getValue(),
    enableColumnFilter: false,
  }),
  columnHelper.accessor('funPerDollar', {
    header: () => 'Fun/$',
    enableColumnFilter: false,
  }),
  columnHelper.accessor('cost', {
    header: () => 'Cost',
    enableColumnFilter: false,
  }),
  columnHelper.accessor('destination', {
    header: 'Location',
    filterFn: 'includesString',
    enableColumnFilter: true,
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
      enableColumnFilter: false,
    },
  ),
  columnHelper.accessor(
    (row) =>
      'depart' in row ? row.depart : 'endDate' in row ? row.endDate : undefined,
    {
      header: 'Depart',
      cell: formatDateOutput,
      enableColumnFilter: false,
    },
  ),
  columnHelper.accessor((row) => row.nights, {
    id: 'nights',
    header: 'Nights',
    cell: (info) => <i>{info.getValue()}</i>,
    enableColumnFilter: false,
  }),
  columnHelper.accessor('adults', {
    header: () => 'Adults',
    cell: (info) => info.renderValue(),
    enableColumnFilter: false,
  }),
  columnHelper.accessor('children', {
    header: () => 'Children',
    sortUndefined: -1,
    enableColumnFilter: false,
  }),
  columnHelper.accessor('travelers', {
    header: 'Travelers',
    enableColumnFilter: false,
  }),
  columnHelper.accessor('lodging', {
    header: 'Lodging',
    cell: RightAlign,
    enableColumnFilter: false,
  }),
  columnHelper.accessor('flight', {
    header: 'Flight',
    cell: RightAlign,
    enableColumnFilter: false,
  }),
  columnHelper.accessor((row) => ('skiPass' in row ? row.skiPass : undefined), {
    header: 'Ski Pass',
    cell: RightAlign,
    enableColumnFilter: false,
  }),
  columnHelper.accessor((row) => ('dinner' in row ? row.dinner : undefined), {
    header: 'Dinner',
    cell: RightAlign,
    enableColumnFilter: false,
  }),
  columnHelper.accessor(
    (row) => ('childcare' in row ? row.childcare : undefined),
    {
      header: 'Childcare',
      cell: RightAlign,
      enableColumnFilter: false,
    },
  ),
  columnHelper.accessor((row) => ('taxi' in row ? row.taxi : undefined), {
    header: 'Taxi',
    cell: RightAlign,
    enableColumnFilter: false,
  }),
];

function App() {
  const table = useReactTable({
    columns,
    data: aggregatedTrips,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      sorting: [
        {
          id: 'funPerDollar',
          desc: true,
        },
        {
          id: 'cost',
          desc: false,
        },
      ],
    },
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
                    {header.column.getCanFilter() ? (
                      <div>
                        <Filter column={header.column} />
                      </div>
                    ) : null}
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

declare module '@tanstack/react-table' {
  //allows us to define custom properties for our columns
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: 'text' | 'range' | 'select';
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Filter({ column }: { column: Column<AggregatedTrip, any> }) {
  const columnFilterValue = column.getFilterValue();
  const { filterVariant } = column.columnDef.meta ?? {};

  return filterVariant === 'range' ? (
    <div>
      <div className="flex space-x-2">
        {/* See faceted column filters example for min max values functionality */}
        <DebouncedInput
          type="number"
          value={(columnFilterValue as [number, number])?.[0] ?? ''}
          onChange={(value) =>
            column.setFilterValue((old: [number, number]) => [value, old?.[1]])
          }
          placeholder={`Min`}
          className="w-24 border shadow rounded"
        />
        <DebouncedInput
          type="number"
          value={(columnFilterValue as [number, number])?.[1] ?? ''}
          onChange={(value) =>
            column.setFilterValue((old: [number, number]) => [old?.[0], value])
          }
          placeholder={`Max`}
          className="w-24 border shadow rounded"
        />
      </div>
      <div className="h-1" />
    </div>
  ) : filterVariant === 'select' ? (
    <select
      onChange={(e) => column.setFilterValue(e.target.value)}
      value={columnFilterValue?.toString()}
    >
      {/* See faceted column filters example for dynamic select options */}
      <option value="">All</option>
      <option value="complicated">complicated</option>
      <option value="relationship">relationship</option>
      <option value="single">single</option>
    </select>
  ) : (
    <DebouncedInput
      className="w-36 border shadow rounded"
      onChange={(value) => column.setFilterValue(value)}
      placeholder={`Search...`}
      type="text"
      value={(columnFilterValue ?? '') as string}
    />
    // See faceted column filters example for datalist search suggestions
  );
}

// A typical debounced input react component
function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
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
