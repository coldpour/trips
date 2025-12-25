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
};

type EventsState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; events: EventSummary[] }
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

const buildDateTime = (date: string, isEnd: boolean) =>
  `${date}T${isEnd ? "23:59:59" : "00:00:00"}Z`;

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
    if (!startDate) return null;
    if (!endDate) return { startDate, endDate: startDate };
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
        const eventsUrl = new URL("/api/ticketmaster", window.location.origin);
        eventsUrl.searchParams.set("keyword", name);
        eventsUrl.searchParams.set("startDateTime", buildDateTime(normalized.startDate, false));
        eventsUrl.searchParams.set("endDateTime", buildDateTime(normalized.endDate, true));
        eventsUrl.searchParams.set("size", "6");
        eventsUrl.searchParams.set("sort", "date,asc");

        const response = await fetch(eventsUrl.toString(), {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        const data = await response.json();
        const items = data?._embedded?.events ?? [];
        const events = items.map((event: any) => {
          const startDateTime = event?.dates?.start?.dateTime;
          const startLocalDate = event?.dates?.start?.localDate;
          const endLocalDate = event?.dates?.end?.localDate;
          const images = event?.images || [];
          const image = images.find((img: any) => img.ratio === "16_9") || images[0];
          const priceRange = event?.priceRanges?.[0];
          return {
            id: event.id,
            name: event.name,
            url: event.url,
            startLabel: startLocalDate
              ? formatEventLocalDate(startLocalDate)
              : formatEventDate(startDateTime),
            endLabel: endLocalDate ? formatEventLocalDate(endLocalDate) : undefined,
            priceLabel: formatPriceRange(priceRange),
            imageUrl: image?.url,
            venueLabel: event?._embedded?.venues?.[0]?.name,
          };
        });

        if (!isActive) return;
        setState({ status: "ready", events });
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

  if (state.status === "loading") {
    return (
      <div className="calculated-value" style={baseTextStyle}>
        Loading events near your dates...
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="calculated-value" style={baseTextStyle}>
        {state.message}
      </div>
    );
  }

  if (state.status === "ready") {
    if (state.events.length === 0) {
      return (
        <div className="calculated-value" style={baseTextStyle}>
          No major events found for these dates.
        </div>
      );
    }
    const shouldLoop = state.events.length > 1;
    const eventsForLoop = shouldLoop ? [...state.events, ...state.events] : state.events;
    const animationDuration = `${Math.max(20, state.events.length * 6)}s`;
    return (
      <div className="calculated-value" style={baseTextStyle}>
        <div style={{ marginBottom: "6px" }}>Events near your dates:</div>
        <div className="trip-events-carousel">
          <div
            className="trip-events-track"
            style={shouldLoop ? { animationDuration } : undefined}
            data-looping={shouldLoop ? "true" : "false"}
          >
            {eventsForLoop.map((event, index) => (
              <a
                key={`${event.id}-${index}`}
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
