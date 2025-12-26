import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

export type SearchPanelType = "flight" | "hotel" | "airbnb";

const PANEL_TITLES: Record<SearchPanelType, string> = {
  flight: "Flight Search",
  hotel: "Hotel Search",
  airbnb: "Airbnb Search",
};

const CAPTURE_LABELS: Record<SearchPanelType, string> = {
  flight: "Use this flight URL",
  hotel: "Use this hotel URL",
  airbnb: "Use this Airbnb URL",
};

type SearchPanelProps = {
  isOpen: boolean;
  initialUrl: string;
  type: SearchPanelType;
  onClose: () => void;
  onCapture: (url: string) => void;
};

export function SearchPanel({
  isOpen,
  initialUrl,
  type,
  onClose,
  onCapture,
}: SearchPanelProps) {
  const [urlInput, setUrlInput] = useState(initialUrl);
  const [iframeUrl, setIframeUrl] = useState(initialUrl);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUrlInput(initialUrl);
      setIframeUrl(initialUrl);
      setDragOffset({ x: 0, y: 0 });
    }
  }, [initialUrl, isOpen]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!dragStartRef.current) return;
      const deltaX = event.clientX - dragStartRef.current.x;
      const deltaY = event.clientY - dragStartRef.current.y;
      setDragOffset({ x: deltaX, y: deltaY });
    };

    const handlePointerUp = () => {
      dragStartRef.current = null;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  const containerClasses = useMemo(
    () =>
      [
        "search-iframe-shell",
        isOpen ? "open" : "",
        type === "hotel" ? "hotel" : "",
      ]
        .filter(Boolean)
        .join(" "),
    [isOpen, type],
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragStartRef.current = {
      x: event.clientX - dragOffset.x,
      y: event.clientY - dragOffset.y,
    };
  };

  const handleCapture = () => {
    if (!urlInput) return;
    onCapture(urlInput);
    onClose();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (urlInput.trim()) {
      setIframeUrl(urlInput.trim());
    }
  };

  return (
    <div className={containerClasses} style={{ transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)` }}>
      <div className="search-iframe-header" ref={headerRef} onPointerDown={handlePointerDown}>
        <div className="search-iframe-title">{PANEL_TITLES[type]}</div>
        <div className="search-iframe-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      <form className="search-iframe-controls" onSubmit={handleSubmit}>
        <label className="input-label" style={{ marginBottom: 0 }}>
          <div>Listing URL</div>
          <input
            className="input-field"
            type="url"
            value={urlInput}
            onChange={(event) => setUrlInput(event.target.value)}
            placeholder="Paste a listing URL to view it here"
          />
        </label>
        <div className="search-iframe-control-buttons">
          <button type="submit" className="btn-primary">
            Load in iframe
          </button>
          <button type="button" className="btn-secondary" onClick={handleCapture}>
            {CAPTURE_LABELS[type]}
          </button>
        </div>
      </form>

      <div className="search-iframe-body">
        <iframe title={PANEL_TITLES[type]} src={iframeUrl} className="search-iframe" loading="lazy" />
      </div>
    </div>
  );
}
