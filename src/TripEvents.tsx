import { useEffect, useMemo, useState } from "react";

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
  endTimestamp: number;
};

type EventsState =
  | { status: "idle" }
  | { status: "loading" }
  | {
      status: "ready";
      ticketmasterEvents: EventSummary[];
      eventbriteEvents: EventSummary[];
      ticketmasterError?: string;
      eventbriteError?: string;
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

const mergePriceRange = (current?: string, next?: string) => current || next;

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

const formatLabelFromTimestamp = (value: number, fallback?: string) => {
  if (!Number.isFinite(value)) return fallback ?? "";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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
  const [state, setState] = useState<EventsState>({ status: "idle" });
  const baseTextStyle = {
    marginTop: "var(--space-md)",
    fontSize: "14px",
    fontWeight: 500,
    color: "var(--text-secondary)",
  } as const;

  useEffect(() => {
    if (!name || !normalized) {
      setState({ status: "idle" });
      return;
    }

    let isActive = true;
    const controller = new AbortController();
    const load = async () => {
      try {
        setState({ status: "loading" });
        const geoUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
        geoUrl.searchParams.set("name", name);
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
        const ticketmasterEventsByName = new Map<string, EventSummary>();
        let totalPages = 1;
        let ticketmasterError: string | undefined;

        try {
          ticketmasterEventsUrl.searchParams.set("keyword", name);
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
              const startTimestamp = toTimestamp(
                eventStartDateTime,
                startLocalDate,
              );
              const endTimestamp = toTimestamp(
                eventStartDateTime,
                endLocalDate || startLocalDate,
              );
              const images = event?.images || [];
              const image =
                images.find((img: any) => img.ratio === "16_9") || images[0];
              const priceRange = event?.priceRanges?.[0];
              const nameKey = event.name || event.id;
              const existing = ticketmasterEventsByName.get(nameKey);
              const priceLabel = formatPriceRange(priceRange);
              if (!existing) {
                ticketmasterEventsByName.set(nameKey, {
                  id: event.id,
                  name: event.name,
                  url: event.url,
                  startLabel: startLocalDate
                    ? formatEventLocalDate(startLocalDate)
                    : formatEventDate(eventStartDateTime),
                  endLabel: endLocalDate
                    ? formatEventLocalDate(endLocalDate)
                    : undefined,
                  priceLabel,
                  imageUrl: image?.url,
                  venueLabel: event?._embedded?.venues?.[0]?.name,
                  startTimestamp,
                  endTimestamp,
                });
              } else {
                const nextStart = Math.min(existing.startTimestamp, startTimestamp);
                const nextEnd = Math.max(existing.endTimestamp, endTimestamp);
                ticketmasterEventsByName.set(nameKey, {
                  ...existing,
                  startTimestamp: nextStart,
                  endTimestamp: nextEnd,
                  startLabel: formatLabelFromTimestamp(
                    nextStart,
                    existing.startLabel,
                  ),
                  endLabel:
                    nextEnd === nextStart
                      ? undefined
                      : formatLabelFromTimestamp(nextEnd, existing.endLabel),
                  priceLabel: mergePriceRange(existing.priceLabel, priceLabel),
                  imageUrl: existing.imageUrl || image?.url,
                  venueLabel:
                    existing.venueLabel || event?._embedded?.venues?.[0]?.name,
                });
              }
            });

            if (!isActive) return;
            setState({
              status: "ready",
              ticketmasterEvents: Array.from(ticketmasterEventsByName.values()),
              eventbriteEvents: [],
            });
          }
        } catch (eventError) {
          if (eventError instanceof Error && eventError.name === "AbortError") {
            return;
          }
          ticketmasterError = "Ticketmaster events unavailable.";
        }

        const eventbriteEventsByName = new Map<string, EventSummary>();
        let eventbriteError: string | undefined;
        try {
          const eventbriteUrl = new URL(
            "/api/eventbrite",
            window.location.origin,
          );
          eventbriteUrl.searchParams.set("q", name);
          eventbriteUrl.searchParams.set("location.latitude", location.latitude);
          eventbriteUrl.searchParams.set("location.longitude", location.longitude);
          eventbriteUrl.searchParams.set("location.within", "30mi");
          eventbriteUrl.searchParams.set(
            "start_date.range_start",
            startDateTime,
          );
          eventbriteUrl.searchParams.set("start_date.range_end", endDateTime);
          eventbriteUrl.searchParams.set("expand", "venue");

          const response = await fetch(eventbriteUrl.toString(), {
            signal: controller.signal,
          });
          if (!response.ok) {
            throw new Error("Failed to fetch events");
          }
          const data = await response.json();
          const items = data?.events ?? [];
          items.forEach((event: any) => {
            const eventStartDateTime = event?.start?.local;
            const eventEndDateTime = event?.end?.local;
            const startTimestamp = toTimestamp(eventStartDateTime);
            const endTimestamp = toTimestamp(eventEndDateTime);
            const logoUrl = event?.logo?.url;
            const nameKey = event?.name?.text || event?.id;
            const existing = eventbriteEventsByName.get(nameKey);
            const priceLabel = event?.is_free ? "Free" : undefined;
            const startLabel = eventStartDateTime
              ? formatEventDate(eventStartDateTime)
              : "";
            const endLabel =
              eventEndDateTime && eventEndDateTime !== eventStartDateTime
                ? formatEventDate(eventEndDateTime)
                : undefined;

            if (!existing) {
              eventbriteEventsByName.set(nameKey, {
                id: event.id,
                name: event?.name?.text,
                url: event.url,
                startLabel,
                endLabel,
                priceLabel,
                imageUrl: logoUrl,
                venueLabel: event?.venue?.name,
                startTimestamp,
                endTimestamp,
              });
            } else {
              const nextStart = Math.min(existing.startTimestamp, startTimestamp);
              const nextEnd = Math.max(existing.endTimestamp, endTimestamp);
              eventbriteEventsByName.set(nameKey, {
                ...existing,
                startTimestamp: nextStart,
                endTimestamp: nextEnd,
                startLabel: formatLabelFromTimestamp(
                  nextStart,
                  existing.startLabel,
                ),
                endLabel:
                  nextEnd === nextStart
                    ? undefined
                    : formatLabelFromTimestamp(nextEnd, existing.endLabel),
                priceLabel: mergePriceRange(existing.priceLabel, priceLabel),
                imageUrl: existing.imageUrl || logoUrl,
                venueLabel: existing.venueLabel || event?.venue?.name,
              });
            }
          });
        } catch (eventError) {
          if (eventError instanceof Error && eventError.name === "AbortError") {
            return;
          }
          eventbriteError = "Eventbrite events unavailable.";
        }

        if (!isActive) return;
        const ticketmasterEvents = Array.from(ticketmasterEventsByName.values());
        const eventbriteEvents = Array.from(eventbriteEventsByName.values());
        if (
          ticketmasterEvents.length === 0 &&
          eventbriteEvents.length === 0 &&
          ticketmasterError &&
          eventbriteError
        ) {
          setState({ status: "error", message: "Events unavailable right now." });
          return;
        }
        setState({
          status: "ready",
          ticketmasterEvents,
          eventbriteEvents,
          ticketmasterError,
          eventbriteError,
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
  }, [name, normalized]);

  if (!normalized || !name) return null;

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

  if (state.status === "ready" || state.status === "loading") {
    if (
      state.status === "ready" &&
      state.ticketmasterEvents.length === 0 &&
      state.eventbriteEvents.length === 0 &&
      !state.ticketmasterError &&
      !state.eventbriteError
    ) {
      return (
        <div className="calculated-value" style={baseTextStyle}>
          No major events found for these dates.
        </div>
      );
    }
    const allEvents = state.status === "ready"
      ? [...state.ticketmasterEvents, ...state.eventbriteEvents]
      : [];
    const isSingleEvent =
      state.status === "ready" && allEvents.length === 1;
    return (
      <div
        className={`calculated-value trip-events-section${isSingleEvent ? " trip-events-section--single" : ""}`}
        style={baseTextStyle}
      >
        {state.ticketmasterEvents.length > 0 ? (
          <div style={{ marginBottom: "12px" }}>
            <div style={{ marginBottom: "6px" }}>Events from Ticketmaster:</div>
            <div className="trip-events-carousel">
              <div className={`trip-events-track${isSingleEvent ? " trip-events-track--single" : ""}`}>
                {state.ticketmasterEvents.map((event) => (
                  <a
                    key={event.id}
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
                        {event.priceLabel ? (
                          <span>{event.priceLabel}</span>
                        ) : null}
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
        ) : null}
        {state.eventbriteEvents.length > 0 ? (
          <div>
            <div style={{ marginBottom: "6px" }}>Events from Eventbrite:</div>
            <div className="trip-events-carousel">
              <div className={`trip-events-track${isSingleEvent ? " trip-events-track--single" : ""}`}>
                {state.eventbriteEvents.map((event) => (
                  <a
                    key={event.id}
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
                        {event.priceLabel ? (
                          <span>{event.priceLabel}</span>
                        ) : null}
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
        ) : null}
      </div>
    );
  }

  return null;
}
