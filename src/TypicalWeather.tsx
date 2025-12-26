import { useEffect, useMemo, useState } from "react";

type WeatherSummary = {
  locationName: string;
  avgHigh: number;
  avgLow: number;
  precipTotal: number;
  days: number;
  precipLabel: string;
  hottestMonth: string;
  hottestValue: number;
  coldestMonth: string;
  coldestValue: number;
  wettestMonth: string;
  wettestValue: number;
  driestMonth: string;
  driestValue: number;
};

type WeatherState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; data: WeatherSummary }
  | { status: "error"; message: string };

const roundToOne = (value: number) => Math.round(value * 10) / 10;

function formatMonthSpanFromDays(days: number) {
  if (!Number.isFinite(days) || days <= 0) {
    return "this period";
  }
  if (days < 28) {
    return `${days} day${days === 1 ? "" : "s"}`;
  }
  const monthEstimate = Math.max(1, Math.round(days / 30));
  if (monthEstimate === 1) {
    return "1 month";
  }
  return `${monthEstimate} months`;
}

function describePrecip(totalInches: number, days: number) {
  if (days <= 0) {
    return { label: "unknown", emoji: "🤷" };
  }
  const perDay = totalInches / days;
  if (perDay < 0.05) return { label: "pretty dry", emoji: "☀️" };
  if (perDay < 0.15) return { label: "a light drizzle", emoji: "🌦️" };
  if (perDay < 0.35) return { label: "some showers", emoji: "🌧️" };
  return { label: "rainy", emoji: "⛈️" };
}

function normalizeDates(startDate?: string | null, endDate?: string | null) {
  if (!startDate) return null;
  if (!endDate) return { startDate, endDate: startDate };
  return endDate < startDate
    ? { startDate: endDate, endDate: startDate }
    : { startDate, endDate };
}

export function TypicalWeather({
  name,
  startDate,
  endDate,
}: {
  name: string;
  startDate?: string | null;
  endDate?: string | null;
}) {
  const normalized = useMemo(
    () => normalizeDates(startDate, endDate),
    [startDate, endDate],
  );
  const [state, setState] = useState<WeatherState>({ status: "idle" });
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

        const buildClimateUrl = (start: string, end: string) => {
          const climateUrl = new URL("https://climate-api.open-meteo.com/v1/climate");
          climateUrl.searchParams.set("latitude", location.latitude);
          climateUrl.searchParams.set("longitude", location.longitude);
          climateUrl.searchParams.set("start_date", start);
          climateUrl.searchParams.set("end_date", end);
          climateUrl.searchParams.set(
            "daily",
            "temperature_2m_max,temperature_2m_min,precipitation_sum",
          );
          climateUrl.searchParams.set("temperature_unit", "fahrenheit");
          climateUrl.searchParams.set("precipitation_unit", "inch");
          return climateUrl.toString();
        };

        const year = new Date(normalized.startDate).getFullYear();
        const yearStart = `${year}-01-01`;
        const yearEnd = `${year}-12-31`;

        const [rangeResponse, annualResponse] = await Promise.all([
          fetch(buildClimateUrl(normalized.startDate, normalized.endDate), {
            signal: controller.signal,
          }),
          fetch(buildClimateUrl(yearStart, yearEnd), {
            signal: controller.signal,
          }),
        ]);
        if (!rangeResponse.ok || !annualResponse.ok) {
          throw new Error("Failed to fetch climate data");
        }
        const rangeData = await rangeResponse.json();
        const annualData = await annualResponse.json();

        const rangeDaily = rangeData?.daily;
        const highs = rangeDaily?.temperature_2m_max || [];
        const lows = rangeDaily?.temperature_2m_min || [];
        const precip = rangeDaily?.precipitation_sum || [];

        const annualDaily = annualData?.daily;
        const annualHighs = annualDaily?.temperature_2m_max || [];
        const annualLows = annualDaily?.temperature_2m_min || [];
        const annualPrecip = annualDaily?.precipitation_sum || [];

        if (!highs.length || !lows.length) {
          throw new Error("Missing climate data");
        }
        if (!annualHighs.length || !annualLows.length) {
          throw new Error("Missing annual climate data");
        }

        const avgHigh =
          highs.reduce((sum: number, value: number) => sum + value, 0) /
          highs.length;
        const avgLow =
          lows.reduce((sum: number, value: number) => sum + value, 0) /
          lows.length;
        const precipTotalRaw = precip.reduce(
          (sum: number, value: number) => sum + value,
          0,
        );
        const annualHigh = Math.max(...annualHighs);
        const annualLow = Math.min(...annualLows);
        const precipLabel = describePrecip(precipTotalRaw, highs.length).label;

        const hottestIndex = annualHighs.findIndex(
          (value: number) => value === annualHigh,
        );
        const coldestIndex = annualLows.findIndex(
          (value: number) => value === annualLow,
        );
        const wettestValue = Math.max(...annualPrecip);
        const driestValue = Math.min(...annualPrecip);
        const wettestIndex = annualPrecip.findIndex(
          (value: number) => value === wettestValue,
        );
        const driestIndex = annualPrecip.findIndex(
          (value: number) => value === driestValue,
        );

        if (!isActive) return;
        setState({
          status: "ready",
          data: {
            locationName: location.name,
            avgHigh: roundToOne(avgHigh),
            avgLow: roundToOne(avgLow),
            precipTotal: roundToOne(precipTotalRaw),
            days: highs.length,
            precipLabel,
            hottestMonth: monthLabelFromDayIndex(hottestIndex),
            hottestValue: roundToOne(annualHigh),
            coldestMonth: monthLabelFromDayIndex(coldestIndex),
            coldestValue: roundToOne(annualLow),
            wettestMonth: monthLabelFromDayIndex(wettestIndex),
            wettestValue: roundToOne(wettestValue),
            driestMonth: monthLabelFromDayIndex(driestIndex),
            driestValue: roundToOne(driestValue),
          },
        });
      } catch (error) {
        if (!isActive) return;
        if (error instanceof Error && error.name === "AbortError") return;
        setState({
          status: "error",
          message: "Typical weather unavailable for these dates.",
        });
      }
    };

    void load();
    return () => {
      isActive = false;
      controller.abort();
    };
  }, [name, normalized]);

  if (!normalized) return null;

  if (state.status === "idle") {
    return (
      <div className="calculated-value" style={baseTextStyle}>
        Add a trip name to see typical weather for these dates.
      </div>
    );
  }

  if (state.status === "loading") {
    return (
      <div className="calculated-value calculated-value-block" style={baseTextStyle}>
        Loading typical weather...
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="calculated-value calculated-value-block" style={baseTextStyle}>
        {state.message}
      </div>
    );
  }

  if (state.status === "ready") {
    const {
      locationName,
      avgHigh,
      avgLow,
      precipTotal,
      days,
      precipLabel,
      hottestMonth,
      hottestValue,
      coldestMonth,
      coldestValue,
      wettestMonth,
      wettestValue,
      driestMonth,
      driestValue,
    } = state.data;
    const monthSpan = formatMonthSpanFromDays(days);
    const lowRounded = Math.round(avgLow);
    const highRounded = Math.round(avgHigh);
    return (
      <div className="calculated-value" style={baseTextStyle}>
        Expect {lowRounded}-{highRounded}°F; {precipLabel} with {precipTotal}" of precip over{" "}
        {monthSpan} in {locationName}.
        <div
          style={{
            marginTop: "var(--space-sm)",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "6px",
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--text-secondary)",
          }}
        >
          <div style={{ padding: "6px 8px" }}>
            🔥 Hottest: {hottestMonth} {Math.round(hottestValue)}°F
          </div>
          <div style={{ padding: "6px 8px" }}>
            🌧️ Wettest: {wettestMonth} {roundToOne(wettestValue)} in/day
          </div>
          <div style={{ padding: "6px 8px" }}>
            ❄️ Coldest: {coldestMonth} {Math.round(coldestValue)}°F
          </div>
          <div style={{ padding: "6px 8px" }}>
            🌵 Driest: {driestMonth} {roundToOne(driestValue)} in/day
          </div>
        </div>
      </div>
    );
  }

  return null;
}
const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function monthLabelFromDayIndex(dayIndex: number) {
  const date = new Date(2025, 0, 1 + dayIndex);
  return monthNames[date.getMonth()];
}
