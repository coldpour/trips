import { Trip } from "../types/Trip";

export function expenseTotal(trip: Trip) {
  return calcTravel(trip) + calcLodgingTotal(trip) + calcOtherExpenses(trip);
}
export function calcLodgingTotal(trip: Trip) {
  return (
    (trip.lodgingTotal ?? 0) ||
    (trip.lodgingPerNight ?? 0) * calcNights(trip) ||
    (trip.lodgingPerPersonPerNight ?? 0) *
      calcTravelers(trip) *
      calcNights(trip)
  );
}

export function calcTravelers(trip: Trip) {
  return (trip.adults ?? 0) + (trip.children ?? 0);
}

export function calcOtherExpenses(trip: Trip) {
  return (
    trip.skiPassPerDay * calcNights(trip) * calcTravelers(trip) +
    trip.childcare +
    trip.entertainment
  );
}

export function calcNights(trip: Trip) {
  return trip.nights || calcDaysBetweenDates(trip.arrive, trip.depart);
}

const millisecondsPerDay = 1000 * 60 * 60 * 24;
function calcDaysBetweenDates(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / millisecondsPerDay);
}

export function calcTravel(trip: Trip) {
  return trip.flightCostPerSeat * calcTravelers(trip) + trip.taxiOrRentalCar;
}

export function calcScore(trip: Trip) {
  return Math.round((trip.fun * 10000) / expenseTotal(trip));
}
