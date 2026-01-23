import { useEffect, useMemo, useState } from "react";

type LocationSuggestion = {
  id: number;
  name: string;
  admin1?: string;
  country?: string;
};

async function fetchBandsintownCityId(
  cityName: string,
  signal?: AbortSignal,
): Promise<string | null> {
  try {
    console.log("fetching bandsintown city id for", cityName);
    const url = `/api/bandsintown?string=${encodeURIComponent(cityName)}`;
    const response = await fetch(url, { signal });
    if (!response.ok) return null;
    const res = await response.json();
    const data = res.cities;
    if (Array.isArray(data) && data.length > 0 && data[0]?.id) {
      return String(data[0].id);
    }
    return null;
  } catch {
    return null;
  }
}

export function LocationAutocomplete({
  name,
  label,
  value,
  onChange,
  onBandsintownCityId,
  autoFocus,
  disabled,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBandsintownCityId?: (cityId: string | null) => void;
  autoFocus?: boolean;
  disabled?: boolean;
}) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const listId = useMemo(() => `${name}-suggestions`, [name]);

  useEffect(() => {
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
        url.searchParams.set("name", trimmed);
        url.searchParams.set("count", "5");
        url.searchParams.set("language", "en");
        url.searchParams.set("format", "json");
        const response = await fetch(url.toString(), {
          signal: controller.signal,
        });
        if (!response.ok) return;
        const data = await response.json();
        const rawResults = Array.isArray(data?.results) ? data.results : [];
        const results = rawResults
          .filter((item) => item && typeof item === "object")
          .map((item, index) => {
            const id = typeof item.id === "number" ? item.id : Number(item.id) || index;
            const name = typeof item.name === "string" ? item.name : "";
            const admin1 =
              typeof item.admin1 === "string" ? item.admin1 : undefined;
            const country =
              typeof item.country === "string" ? item.country : undefined;
            return { id, name, admin1, country };
          })
          .filter((item) => item.name);
        setSuggestions(results);
        if (results.length > 0 && onBandsintownCityId) {
          const firstCity = results[0].name;
          void fetchBandsintownCityId(firstCity, controller.signal).then(
            (cityId) => {
              console.log("city id", cityId);
              onBandsintownCityId(cityId);
            },
          );
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        setSuggestions([]);
      }
    }, 250);
    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [value]);

  return (
    <label className="input-label">
      {label}
      <input
        className="input-field"
        type="text"
        name={name}
        list={listId}
        autoComplete="off"
        autoFocus={autoFocus}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
      <datalist id={listId}>
        {suggestions.map((suggestion) => {
          const parts = [suggestion.name, suggestion.admin1, suggestion.country]
            .filter(Boolean)
            .join(", ");
          return <option key={suggestion.id} value={parts} />;
        })}
      </datalist>
    </label>
  );
}
