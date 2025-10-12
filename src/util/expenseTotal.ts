import { Trip } from "../types/Trip";
export function expenseTotal(trip: Trip) {
  return (
    trip.childcare +
    trip.entertainment +
    trip.lodgingTotal +
    trip.taxiOrRentalCar +
    trip.skiPassPerDay
  );
}
