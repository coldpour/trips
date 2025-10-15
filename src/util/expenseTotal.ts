import { PendingTrip } from "../types/Trip";

export function expenseTotal(trip: PendingTrip) {
  return calcTravel(trip) + calcLodgingTotal(trip) + calcOtherExpenses(trip);
}
export function calcLodgingTotal(trip: PendingTrip) {
  return (
    (trip.lodgingTotal ?? 0) ||
    (trip.lodgingPerNight ?? 0) * calcNights(trip) ||
    (trip.lodgingPerPersonPerNight ?? 0) *
      calcTravelers(trip) *
      calcNights(trip)
  );
}

export function calcTravelers(trip: PendingTrip) {
  return (trip.adults ?? 0) + (trip.children ?? 0);
}

export function calcOtherExpenses(trip: PendingTrip) {
  return (
    (trip.skiPassPerDay ?? 0) * calcNights(trip) * calcTravelers(trip) +
    (trip.childcare ?? 0) +
    (trip.entertainment ?? 0)
  );
}

export function calcNights(trip: PendingTrip) {
  return (trip.nights ?? 0) || calcDaysBetweenDates(trip.arrive, trip.depart);
}

const millisecondsPerDay = 1000 * 60 * 60 * 24;
function calcDaysBetweenDates(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / millisecondsPerDay);
}

export function calcTravel(trip: PendingTrip) {
  return (
    (trip.flightCostPerSeat ?? 0) * calcTravelers(trip) +
    (trip.taxiOrRentalCar ?? 0)
  );
}

export function calcScore(trip: PendingTrip) {
  const cost = expenseTotal(trip);
  if (cost === 0 || isNaN(trip.fun)) return 0;
  return Math.round(((trip.fun ?? 0) * 10000) / cost);
}

export function calcAirbnbLink({
  name,
  arrive,
  depart,
  adults,
  children,
  nights,
}: PendingTrip): string {
  let urlParams = new URLSearchParams();
  urlParams.set("refinement_paths[]", "/homes");
  urlParams.set("date_picker_type", arrive && depart ? "calendar" : "flexible_dates");
  if (adults) urlParams.set("adults", adults.toString());
  if (children) urlParams.set("children", children.toString());
  if (nights)
    urlParams.set(
      "flexible_trip_lengths[]",
      nights < 4 ? "weekend_trip" : nights < 8 ? "one_week" : 'one_month',
    );
  if (arrive) urlParams.set("checkin", arrive);
  if (depart) urlParams.set("checkout", depart);
  return `https://www.airbnb.com/s/${name}/homes?${urlParams.toString()}`;
}
