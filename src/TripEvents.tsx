import { useEffect, useMemo, useState } from "react";
import { getLocationQuery } from "./util/location";

type EventSummary = {
  id: string;
  name: string;
  url: string;
  startLabel: string;
  endLabel?: string;
  priceLabel?: string;
  imageUrl?: string;
  venueLabel?: string;
  startTimestamp: number;
  dayKey: string;
  priceScore: number;
};

type EventsState =
  | { status: "idle" }
  | { status: "loading" }
  | {
      status: "ready";
      ticketmasterEvents: EventSummary[];
      ticketmasterError?: string;
    }
  | { status: "error"; message: string };

const formatEventDate = (dateTime: string) => {
  const parsed = new Date(dateTime);
  if (Number.isNaN(parsed.getTime())) return dateTime;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatEventLocalDate = (date: string) => {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatPriceRange = (priceRange?: { min?: number; max?: number; currency?: string }) => {
  if (!priceRange || priceRange.min === undefined || priceRange.max === undefined) {
    return undefined;
  }
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: priceRange.currency || "USD",
    maximumFractionDigits: 0,
  });
  if (priceRange.min === priceRange.max) {
    return formatter.format(priceRange.min);
  }
  return `${formatter.format(priceRange.min)}–${formatter.format(priceRange.max)}`;
};

const formatOffset = (offsetMinutes: number) => {
  const sign = offsetMinutes <= 0 ? "-" : "+";
  const absMinutes = Math.abs(offsetMinutes);
  const hours = String(Math.floor(absMinutes / 60)).padStart(2, "0");
  const minutes = String(absMinutes % 60).padStart(2, "0");
  return `${sign}${hours}:${minutes}`;
};

const getTimeZoneOffsetMinutes = (date: Date, timeZone: string) => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const lookup = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );
  const asUtc = Date.UTC(
    Number(lookup.year),
    Number(lookup.month) - 1,
    Number(lookup.day),
    Number(lookup.hour),
    Number(lookup.minute),
    Number(lookup.second),
  );
  return (asUtc - date.getTime()) / 60000;
};

const buildDateTime = (date: string, isEnd: boolean, timeZone: string) => {
  const [year, month, day] = date.split("-").map(Number);
  const hours = isEnd ? 23 : 0;
  const minutes = isEnd ? 59 : 0;
  const seconds = isEnd ? 59 : 0;
  const utcGuess = Date.UTC(year, month - 1, day, hours, minutes, seconds);
  let offsetMinutes = getTimeZoneOffsetMinutes(new Date(utcGuess), timeZone);
  let adjustedUtc = utcGuess - offsetMinutes * 60000;
  const adjustedOffset = getTimeZoneOffsetMinutes(
    new Date(adjustedUtc),
    timeZone,
  );
  if (adjustedOffset !== offsetMinutes) {
    offsetMinutes = adjustedOffset;
    adjustedUtc = utcGuess - offsetMinutes * 60000;
  }
  const offset = formatOffset(offsetMinutes);
  const timeLabel = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )}:${String(seconds).padStart(2, "0")}`;
  return `${date}T${timeLabel}${offset}`;
};

const toTimestamp = (dateTime?: string, localDate?: string) => {
  if (localDate) {
    const parsed = new Date(`${localDate}T00:00:00`);
    return parsed.getTime();
  }
  if (dateTime) {
    const parsed = new Date(dateTime);
    return parsed.getTime();
  }
  return Number.NaN;
};

export function TripEvents({
  name,
  startDate,
  endDate,
}: {
  name: string;
  startDate?: string | null;
  endDate?: string | null;
}) {
  const normalized = useMemo(() => {
    if (!startDate || !endDate) return null;
    return endDate < startDate
      ? { startDate: endDate, endDate: startDate }
      : { startDate, endDate };
  }, [startDate, endDate]);
  const locationQuery = useMemo(() => getLocationQuery(name), [name]);
  const [debouncedLocationQuery, setDebouncedLocationQuery] = useState("");
  const [state, setState] = useState<EventsState>({ status: "idle" });

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedLocationQuery(locationQuery);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [locationQuery]);
  const baseTextStyle = {
    marginTop: "var(--space-md)",
    fontSize: "14px",
    fontWeight: 500,
    color: "var(--text-secondary)",
  } as const;

  useEffect(() => {
    if (!debouncedLocationQuery || !normalized) {
      setState({ status: "idle" });
      return;
    }

    let isActive = true;
    const controller = new AbortController();
    const load = async () => {
      try {
        setState({ status: "loading" });
        const geoUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
        geoUrl.searchParams.set("name", debouncedLocationQuery);
        geoUrl.searchParams.set("count", "1");
        geoUrl.searchParams.set("language", "en");
        geoUrl.searchParams.set("format", "json");

        const geoResponse = await fetch(geoUrl.toString(), {
          signal: controller.signal,
        });
        if (!geoResponse.ok) {
          throw new Error("Failed to fetch location");
        }
        const geoData = await geoResponse.json();
        const location = geoData?.results?.[0];
        if (!location) {
          throw new Error("Location not found");
        }
        const timezone = location.timezone || "UTC";

        const ticketmasterEventsUrl = new URL(
          "/api/ticketmaster",
          window.location.origin,
        );
        const startDateTime = buildDateTime(
          normalized.startDate,
          false,
          timezone,
        );
        const endDateTime = buildDateTime(
          normalized.endDate,
          true,
          timezone,
        );
        const pageSize = 20;
        const maxPages = 5;
        let totalPages = 1;
        let ticketmasterError: string | undefined;
        const bestByDay = new Map<string, EventSummary>();

        try {
          ticketmasterEventsUrl.searchParams.set("keyword", locationQuery);
          ticketmasterEventsUrl.searchParams.set("startDateTime", startDateTime);
          ticketmasterEventsUrl.searchParams.set("endDateTime", endDateTime);

          for (
            let page = 0;
            page < Math.min(totalPages, maxPages);
            page += 1
          ) {
            ticketmasterEventsUrl.searchParams.set("size", String(pageSize));
            ticketmasterEventsUrl.searchParams.set("sort", "date,asc");
            ticketmasterEventsUrl.searchParams.set("page", String(page));

            const response = await fetch(ticketmasterEventsUrl.toString(), {
              signal: controller.signal,
            });
            if (!response.ok) {
              throw new Error("Failed to fetch events");
            }
            const data = await response.json();
            const items = data?._embedded?.events ?? [];
            totalPages = data?.page?.totalPages ?? 1;
            items.forEach((event: any) => {
              const eventStartDateTime = event?.dates?.start?.dateTime;
              const startLocalDate = event?.dates?.start?.localDate;
              const endLocalDate = event?.dates?.end?.localDate;
              const dayKey =
                startLocalDate || (eventStartDateTime?.split("T")[0] ?? "");
              if (!dayKey) return;
              const startTimestamp = toTimestamp(
                eventStartDateTime,
                startLocalDate,
              );
              const images = event?.images || [];
              const image =
                images.find((img: any) => img.ratio === "16_9") || images[0];
              const priceRange = event?.priceRanges?.[0];
              const priceScore =
                priceRange?.max ?? priceRange?.min ?? 0;
              const nameKey = event.name || event.id;
              const summary: EventSummary = {
                id: event.id,
                name: event.name,
                url: event.url,
                startLabel: startLocalDate
                  ? formatEventLocalDate(startLocalDate)
                  : formatEventDate(eventStartDateTime),
                endLabel: endLocalDate
                  ? formatEventLocalDate(endLocalDate)
                  : undefined,
                priceLabel: formatPriceRange(priceRange),
                imageUrl: image?.url,
                venueLabel: event?._embedded?.venues?.[0]?.name,
                startTimestamp,
                dayKey,
                priceScore,
              };
              const existing = bestByDay.get(dayKey);
              if (!existing || summary.priceScore > existing.priceScore) {
                bestByDay.set(dayKey, summary);
              } else if (summary.priceScore === existing.priceScore) {
                const existingName = existing.name || existing.id;
                if (!existingName && nameKey) {
                  bestByDay.set(dayKey, summary);
                }
              }
            });

            if (!isActive) return;
            const ticketmasterEvents = Array.from(bestByDay.values()).toSorted(
              (a, b) => a.startTimestamp - b.startTimestamp,
            );
            setState({
              status: "ready",
              ticketmasterEvents,
            });
          }
        } catch (eventError) {
          if (eventError instanceof Error && eventError.name === "AbortError") {
            return;
          }
          ticketmasterError = "Ticketmaster events unavailable.";
        }

        if (!isActive) return;
        if (ticketmasterError) {
          setState({ status: "error", message: "Events unavailable right now." });
          return;
        }
        const ticketmasterEvents = Array.from(bestByDay.values()).toSorted(
          (a, b) => a.startTimestamp - b.startTimestamp,
        );
        setState({
          status: "ready",
          ticketmasterEvents,
          ticketmasterError,
        });
      } catch (error) {
        if (!isActive) return;
        if (error instanceof Error && error.name === "AbortError") return;
        setState({
          status: "error",
          message: "Events unavailable right now.",
        });
      }
    };

    void load();
    return () => {
      isActive = false;
      controller.abort();
    };
  }, [debouncedLocationQuery, normalized]);

  if (!normalized || !debouncedLocationQuery) return null;

  if (state.status === "error") {
    return (
      <div className="calculated-value calculated-value-block" style={baseTextStyle}>
        {state.message}
      </div>
    );
  }

  if (state.status === "loading") {
    return (
      <div className="calculated-value calculated-value-block" style={baseTextStyle}>
        Loading events near your dates...
      </div>
    );
  }

  if (state.status === "ready") {
    if (state.ticketmasterEvents.length === 0 && !state.ticketmasterError) {
      return (
        <div className="calculated-value" style={baseTextStyle}>
          No major events found for these dates.
        </div>
      );
    }
    const isSingleEvent = state.ticketmasterEvents.length === 1;
    return (
      <div
        className={`calculated-value trip-events-section${isSingleEvent ? " trip-events-section--single" : ""}`}
        style={baseTextStyle}
      >
        <div style={{ marginBottom: "6px" }}>Events from Ticketmaster:</div>
        <div className="trip-events-carousel">
          <div className={`trip-events-track${isSingleEvent ? " trip-events-track--single" : ""}`}>
            {state.ticketmasterEvents.map((event) => (
              <a
                key={`${event.dayKey}-${event.id}`}
                href={event.url}
                target="_blank"
                rel="noreferrer"
                className="trip-event-card"
              >
                {event.imageUrl ? (
                  <div className="trip-event-image">
                    <img src={event.imageUrl} alt={event.name} />
                  </div>
                ) : null}
                <div className="trip-event-body">
                  <div className="trip-event-title">{event.name}</div>
                  <div className="trip-event-meta">
                    <span>
                      {event.startLabel}
                      {event.endLabel ? ` – ${event.endLabel}` : ""}
                    </span>
                    {event.priceLabel ? <span>{event.priceLabel}</span> : null}
                  </div>
                  {event.venueLabel ? (
                    <div className="trip-event-venue">@ {event.venueLabel}</div>
                  ) : null}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
