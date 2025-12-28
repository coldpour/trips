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
  if (trip.flightCostPerSeat) {
    return (
      (trip.flightCostPerSeat ?? 0) * calcTravelers(trip) +
      (trip.taxiOrRentalCar ?? 0)
    );
  }
  if (trip.flightCost) {
    return trip.flightCost + (trip.taxiOrRentalCar ?? 0);
  }
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

export function calcHotelsLink({
  name,
  arrive,
  depart,
  adults,
}: PendingTrip): string {
  let urlParams = new URLSearchParams();
  urlParams.set("destination", name);
  urlParams.set("flexibility", "0_DAY");
  if (arrive) {
    urlParams.set("d1", arrive);
    urlParams.set("startDate", arrive);
  }
  if (depart) {
    urlParams.set("d2", depart);
    urlParams.set("endDate", depart);
  }
  if (adults) urlParams.set("adults", adults.toString());
  urlParams.set("rooms", "1");
  urlParams.set("sort", "RECOMMENDED");
  urlParams.set("useRewards", "false");
  return `https://www.hotels.com/Hotel-Search?${urlParams.toString()}`;
}

export function calcFlightLink(pendingTrip: PendingTrip): string {
  const { name, arrive, depart } = pendingTrip;
  const travelers = calcTravelers(pendingTrip);
  const params = new URLSearchParams();
  
  // Google Flights search query format
  if (arrive && depart) {
    params.set('tfs', `CBwQAhopEgoyMDI1LTAxLTAxagcIARIDU0VBcgcIARIDU0VB`);
    // Simpler approach: use the query parameter
    return `https://www.google.com/travel/flights?q=flights to ${encodeURIComponent(name)}${arrive ? ` on ${arrive}` : ''}${depart && arrive !== depart ? ` return ${depart}` : ''}${travelers > 1 ? ` ${travelers} passengers` : ''}`;
  }
  
  // Fallback to basic search
  return `https://www.google.com/travel/flights?q=flights to ${encodeURIComponent(name)}`;
}

export function calcEventbriteLink({
  name,
  arrive,
  depart,
}: PendingTrip): string {
  const safeName = (name ?? "").trim();
  const slug = safeName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const base = slug
    ? `https://www.eventbrite.com/d/${slug}/events/`
    : "https://www.eventbrite.com/d/online/all-events/";
  const url = new URL(base);
  if (safeName) {
    url.searchParams.set("q", safeName);
  }
  if (arrive) {
    url.searchParams.set("start_date", arrive);
  }
  if (depart) {
    url.searchParams.set("end_date", depart);
  }
  return url.toString();
}

export function calcOpenTableLink({ name, arrive }: PendingTrip): string {
  const safeName = (name ?? "").trim();
  const url = new URL("https://www.opentable.com/s/");
  if (safeName) {
    url.searchParams.set("term", safeName);
  }
  if (arrive) {
    url.searchParams.set("dateTime", `${arrive}T19:00`);
  }
  url.searchParams.set("covers", "2");
  return url.toString();
}

export function calcBandsintownLink({
  name,
  arrive,
  depart,
}: PendingTrip): string {
  const safeName = (name ?? "").trim();
  const url = new URL("https://www.bandsintown.com/search");
  if (safeName) {
    url.searchParams.set("query", safeName);
    url.searchParams.set("loc", safeName);
  }
  if (arrive || depart) {
    url.searchParams.set(
      "date",
      [arrive, depart].filter(Boolean).join(",") || "upcoming"
    );
  }
  url.searchParams.set("type", "upcoming");
  return url.toString();
}

export function calcSongkickLink({
  name,
  arrive,
  depart,
}: PendingTrip): string {
  const safeName = (name ?? "").trim();
  const url = new URL("https://www.songkick.com/search");
  if (safeName) {
    url.searchParams.set("query", safeName);
    url.searchParams.set("location", safeName);
  }
  if (arrive && depart) {
    url.searchParams.set("min_date", arrive);
    url.searchParams.set("max_date", depart);
  }
  url.searchParams.set("type", "upcoming");
  return url.toString();
}
