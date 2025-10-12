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
}
