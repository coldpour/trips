export interface Trip {
  id: string;
  name: string;
  fun: number;
  arrive: string | null;
  depart: string | null;
  created_at: string;
  nights: number;
  entertainment: number;
  adults: number;
  children: number | null;
  flightCostPerSeat: number | null;
  taxiOrRentalCar: number | null;
  skiPassPerDay: number | null;
  childcare: number | null;
  lodgingTotal: number | null;
  lodgingPerNight: number | null;
  lodgingPerPersonPerNight: number | null;
  lodging_url: string | null;
  flight_url: string | null;
  trip_list_id: string | null;
}

export type PendingTrip = Omit<Trip, "id"| 'created_at'>
