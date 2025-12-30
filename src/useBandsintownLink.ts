import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "./SupabaseContext";
import { PendingTrip } from "./types/Trip";

const FALLBACK_LINK = "https://www.bandsintown.com/";

const buildBandsintownUrl = (cityId: number, arrive: string, depart: string) => {
  const url = new URL("https://www.bandsintown.com/choose-dates/genre/all-genres");
  url.searchParams.set("city_id", String(cityId));
  url.searchParams.set("date", `${arrive}T00:00:00,${depart}T23:00:00`);
  url.searchParams.set("calendarTrigger", "false");
  return url.toString();
};

export function useBandsintownLink({
  name,
  arrive,
  depart,
}: Pick<PendingTrip, "name" | "arrive" | "depart">) {
  const trimmedName = useMemo(() => (name ?? "").trim(), [name]);
  const cityCandidates = useMemo(() => {
    if (!trimmedName) return [];
    const parts = trimmedName.split(",").map((part) => part.trim()).filter(Boolean);
    if (parts.length < 2) return [trimmedName];
    const city = parts[0];
    const state = parts[1];
    const country = parts[2] ?? "";
    const isUS = /united states|usa|u\.s\.a\.|us/i.test(country);
    if (!isUS) return [trimmedName];
    const stateAbbrev = US_STATE_ABBREV[state] ?? state;
    if (!stateAbbrev) return [trimmedName];
    const candidate = `${city}, ${stateAbbrev}`;
    return candidate === trimmedName ? [trimmedName] : [trimmedName, candidate];
  }, [trimmedName]);
  const enabled = Boolean(trimmedName && arrive && depart);

  const { data } = useQuery({
    queryKey: ["bandsintown-city-id", cityCandidates],
    enabled,
    queryFn: async () => {
      for (const candidate of cityCandidates) {
        const { data: rows, error } = await supabase
          .from("bandsintown_cities")
          .select("city_id")
          .eq("city_name", candidate.replace(/ /g, "%20"))
          .limit(1);
        if (error) {
          continue;
        }
        if (rows && rows.length > 0) {
          const cityId = Number(rows[0].city_id);
          if (Number.isFinite(cityId)) {
            return cityId;
          }
        }
      }
      return null;
    },
    staleTime: 1000 * 60 * 10,
  });

  if (!enabled || !data) {
    return FALLBACK_LINK;
  }
  return buildBandsintownUrl(data, arrive, depart);
}

const US_STATE_ABBREV: Record<string, string> = {
  "Alabama": "AL",
  "Alaska": "AK",
  "Arizona": "AZ",
  "Arkansas": "AR",
  "California": "CA",
  "Colorado": "CO",
  "Connecticut": "CT",
  "Delaware": "DE",
  "Florida": "FL",
  "Georgia": "GA",
  "Hawaii": "HI",
  "Idaho": "ID",
  "Illinois": "IL",
  "Indiana": "IN",
  "Iowa": "IA",
  "Kansas": "KS",
  "Kentucky": "KY",
  "Louisiana": "LA",
  "Maine": "ME",
  "Maryland": "MD",
  "Massachusetts": "MA",
  "Michigan": "MI",
  "Minnesota": "MN",
  "Mississippi": "MS",
  "Missouri": "MO",
  "Montana": "MT",
  "Nebraska": "NE",
  "Nevada": "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  "Ohio": "OH",
  "Oklahoma": "OK",
  "Oregon": "OR",
  "Pennsylvania": "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  "Tennessee": "TN",
  "Texas": "TX",
  "Utah": "UT",
  "Vermont": "VT",
  "Virginia": "VA",
  "Washington": "WA",
  "West Virginia": "WV",
  "Wisconsin": "WI",
  "Wyoming": "WY",
  "District of Columbia": "DC",
};
