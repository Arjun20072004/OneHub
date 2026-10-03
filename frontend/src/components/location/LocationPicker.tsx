import { useEffect, useState } from "react";
import { Crosshair, LoaderCircle, MapPin, Search, X } from "lucide-react";

import { popularLocations, searchLocations, useLocationStore, type LocationOption } from "../../store/locationStore";
import "./LocationPicker.css";

export default function LocationPicker() {
  const open = useLocationStore((state) => state.isPickerOpen);
  const status = useLocationStore((state) => state.status);
  const closePicker = useLocationStore((state) => state.closePicker);
  const setLocation = useLocationStore((state) => state.setLocation);
  const detectLocation = useLocationStore((state) => state.detectLocation);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        setResults(await searchLocations(query.trim(), controller.signal));
      } catch {
        if (!controller.signal.aborted) setResults([]);
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, 400);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [open, query]);

  if (!open) return null;

  const chooseLocation = (location: LocationOption) => {
    setLocation(location);
    closePicker();
    setQuery("");
  };

  const useCurrentLocation = async () => {
    const resolved = await detectLocation();
    if (resolved) closePicker();
  };

  return (
    <div className="location-picker-backdrop" role="presentation" onMouseDown={closePicker}>
      <section className="location-picker" role="dialog" aria-modal="true" aria-labelledby="location-picker-title" onMouseDown={(event) => event.stopPropagation()}>
        <header><div><span className="eyebrow">Your location</span><h2 id="location-picker-title">Choose where you are</h2><p>We use this to show services available near you.</p></div><button type="button" onClick={closePicker} aria-label="Close location picker"><X size={19} /></button></header>
        <button className="location-picker__current" type="button" onClick={() => void useCurrentLocation()} disabled={status === "locating"}>
          {status === "locating" ? <LoaderCircle className="location-picker__spin" size={19} /> : <Crosshair size={19} />}<span><strong>{status === "locating" ? "Finding your precise location…" : "Use my current location"}</strong><small>Allow location access for the best nearby results.</small></span>
        </button>
        <label className="location-picker__search"><Search size={18} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search city, area or landmark" /><span>{isSearching && <LoaderCircle className="location-picker__spin" size={16} />}</span></label>
        {results.length > 0 && <div className="location-picker__results">{results.map((location) => <button type="button" key={location.id} onClick={() => chooseLocation(location)}><MapPin size={17} /><span>{location.label}</span></button>)}</div>}
        {!query && <div className="location-picker__popular"><span>Popular locations</span><div>{popularLocations.map((location) => <button type="button" key={location.id} onClick={() => chooseLocation(location)}><MapPin size={15} /> {location.label}</button>)}</div></div>}
      </section>
    </div>
  );
}
