import { useMemo } from "react";
import { calcEventbriteLink } from "./util/expenseTotal";

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
  const ticketmasterUrl = useMemo(() => {
    if (!normalized || !name) return null;
    const base = "https://www.ticketmaster.com/discover";
    const url = new URL(base);
    url.searchParams.set("keyword", name);
    url.searchParams.set("startDate", normalized.startDate);
    url.searchParams.set("endDate", normalized.endDate);
    return url.toString();
  }, [name, normalized]);
  const eventbriteUrl = useMemo(() => {
    if (!normalized || !name) return null;
    return calcEventbriteLink({
      name,
      arrive: normalized.startDate,
      depart: normalized.endDate,
    });
  }, [name, normalized]);

  if (!normalized || !name) return null;

  const baseTextStyle = {
    marginTop: "var(--space-md)",
    fontSize: "14px",
    fontWeight: 500,
    color: "var(--text-secondary)",
  } as const;

  return (
    <div className="calculated-value trip-events-section" style={baseTextStyle}>
      <div className="search-links" style={{ marginTop: 0 }}>
        {ticketmasterUrl ? (
          <a
            className="search-link"
            href={ticketmasterUrl}
            target="_blank"
            rel="noreferrer"
          >
            🎟️ Search Ticketmaster
          </a>
        ) : null}
        {eventbriteUrl ? (
          <a
            className="search-link"
            href={eventbriteUrl}
            target="_blank"
            rel="noreferrer"
          >
            🎟️ Search Eventbrite
          </a>
        ) : null}
      </div>
    </div>
  );
}
