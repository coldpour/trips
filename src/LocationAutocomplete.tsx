import { useEffect, useMemo, useRef, useState } from "react";

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
  const [debouncedValue, setDebouncedValue] = useState("");
  const listId = useMemo(() => `${name}-suggestions`, [name]);
  const justSelected = useRef(false);

  useEffect(() => {
    if (justSelected.current) {
      justSelected.current = false;
      return;
    }
    const timeout = window.setTimeout(() => {
      setDebouncedValue(value);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [value]);

  useEffect(() => {
    const trimmed = debouncedValue.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    void (async () => {
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
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        setSuggestions([]);
      }
    })();
    return () => controller.abort();
  }, [debouncedValue]);

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
        onChange={(e) => {
          const newValue = e.target.value;
          onChange(newValue);
          const selected = suggestions.find((s) => {
            const parts = [s.name, s.admin1, s.country]
              .filter(Boolean)
              .join(", ");
            return parts === newValue;
          });
          if (selected) {
            justSelected.current = true;
            if (onBandsintownCityId) {
              void fetchBandsintownCityId(selected.name).then((cityId) => {
                onBandsintownCityId(cityId);
              });
            }
          }
        }}
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
