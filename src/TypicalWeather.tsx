import { useEffect, useMemo, useState } from "react";

type WeatherSummary = {
  locationName: string;
  avgHigh: number;
  avgLow: number;
  precipTotal: number;
  days: number;
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
  return { label: "wetter days", emoji: "⛈️" };
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

        const climateUrl = new URL("https://climate-api.open-meteo.com/v1/climate");
        climateUrl.searchParams.set("latitude", location.latitude);
        climateUrl.searchParams.set("longitude", location.longitude);
        climateUrl.searchParams.set("start_date", normalized.startDate);
        climateUrl.searchParams.set("end_date", normalized.endDate);
        climateUrl.searchParams.set(
          "daily",
          "temperature_2m_max,temperature_2m_min,precipitation_sum",
        );
        climateUrl.searchParams.set("temperature_unit", "fahrenheit");
        climateUrl.searchParams.set("precipitation_unit", "inch");

        const climateResponse = await fetch(climateUrl.toString(), {
          signal: controller.signal,
        });
        if (!climateResponse.ok) {
          throw new Error("Failed to fetch climate data");
        }
        const climateData = await climateResponse.json();
        const daily = climateData?.daily;
        const highs = daily?.temperature_2m_max || [];
        const lows = daily?.temperature_2m_min || [];
        const precip = daily?.precipitation_sum || [];

        if (!highs.length || !lows.length) {
          throw new Error("Missing climate data");
        }

        const avgHigh =
          highs.reduce((sum: number, value: number) => sum + value, 0) /
          highs.length;
        const avgLow =
          lows.reduce((sum: number, value: number) => sum + value, 0) /
          lows.length;
        const precipTotal = precip.reduce(
          (sum: number, value: number) => sum + value,
          0,
        );

        if (!isActive) return;
        setState({
          status: "ready",
          data: {
            locationName: location.name,
            avgHigh: roundToOne(avgHigh),
            avgLow: roundToOne(avgLow),
            precipTotal: roundToOne(precipTotal),
            days: highs.length,
          },
        });
      } catch (error) {
        if (!isActive) return;
        if ((error as Error).name === "AbortError") return;
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
      <div className="calculated-value" style={baseTextStyle}>
        Loading typical weather...
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
    const { locationName, avgHigh, avgLow, precipTotal, days } = state.data;
    const precip = describePrecip(precipTotal, days);
    const monthSpan = formatMonthSpanFromDays(days);
    const precipAmountLabel = precip.label;
    const precipIntensity = precip.label === "wetter days" ? "a whopping" : "only";
    const lowRounded = Math.round(avgLow);
    const highRounded = Math.round(avgHigh);
    return (
      <div className="calculated-value" style={baseTextStyle}>
        Expect temps {lowRounded}-{highRounded}°F and be{" "}
        {precipAmountLabel}{" "}
        with {precipIntensity} {precipTotal}" of precip over {monthSpan} in{" "}
        {locationName}.
      </div>
    );
  }

  return null;
}
