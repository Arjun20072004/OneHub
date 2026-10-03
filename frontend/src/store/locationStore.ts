import { create } from "zustand";

export type LocationOption = {
  id: string;
  label: string;
  coordinates?: { latitude: number; longitude: number };
};

type LocationSource = "default" | "automatic" | "manual";
type LocationStatus = "idle" | "locating" | "ready" | "denied" | "unavailable";

type LocationState = {
  location: LocationOption;
  source: LocationSource;
  status: LocationStatus;
  isPickerOpen: boolean;
  openPicker: () => void;
  closePicker: () => void;
  setLocation: (location: LocationOption) => void;
  detectLocation: () => Promise<boolean>;
};

const LOCATION_KEY = "onehub_location";
const detectingLocation: LocationOption = { id: "detecting", label: "Detecting your location…" };

export const popularLocations: LocationOption[] = [
  { id: "madhapur-hyderabad", label: "Madhapur, Hyderabad" },
  { id: "warangal-telangana", label: "Warangal, Telangana" },
  { id: "mumbai-maharashtra", label: "Mumbai, Maharashtra" },
  { id: "chennai-tamil-nadu", label: "Chennai, Tamil Nadu" },
];

function getSavedLocation(): { location: LocationOption; source: "automatic" | "manual" } | null {
  try {
    const saved = localStorage.getItem(LOCATION_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved) as LocationOption | { location: LocationOption; source: "automatic" | "manual" };
    return "location" in parsed ? parsed : { location: parsed, source: "manual" };
  } catch {
    return null;
  }
}

function persistLocation(location: LocationOption, source: "automatic" | "manual") {
  localStorage.setItem(LOCATION_KEY, JSON.stringify({ location, source }));
}

function locationLabel(address: Record<string, string | undefined>) {
  const locality = address.neighbourhood || address.suburb || address.city_district || address.village || address.town || address.city;
  const city = address.city || address.town || address.municipality || address.county || address.state_district;
  return [locality, city].filter((item, index, values) => item && values.indexOf(item) === index).join(", ") || "Your current location";
}

async function reverseGeocode(latitude: number, longitude: number): Promise<LocationOption> {
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, { headers: { "Accept-Language": "en" } });
  if (!response.ok) throw new Error("Unable to resolve location");
  const data = await response.json() as { address?: Record<string, string | undefined> };
  return { id: `${latitude},${longitude}`, label: locationLabel(data.address || {}), coordinates: { latitude, longitude } };
}

export async function searchLocations(query: string, signal?: AbortSignal): Promise<LocationOption[]> {
  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&countrycodes=in&q=${encodeURIComponent(query)}`, { signal, headers: { "Accept-Language": "en" } });
  if (!response.ok) return [];
  const data = await response.json() as Array<{ place_id: number; lat: string; lon: string; address?: Record<string, string | undefined>; display_name: string }>;
  return data.map((place) => ({
    id: String(place.place_id),
    label: locationLabel(place.address || {}) || place.display_name.split(",").slice(0, 2).join(","),
    coordinates: { latitude: Number(place.lat), longitude: Number(place.lon) },
  }));
}

const savedLocation = getSavedLocation();

export const useLocationStore = create<LocationState>((set) => ({
  location: savedLocation?.location || detectingLocation,
  source: savedLocation?.source || "default",
  status: savedLocation ? "ready" : "idle",
  isPickerOpen: false,
  openPicker: () => set({ isPickerOpen: true }),
  closePicker: () => set({ isPickerOpen: false }),
  setLocation: (location) => {
    persistLocation(location, "manual");
    set({ location, source: "manual", status: "ready" });
  },
  detectLocation: () => new Promise((resolve) => {
    if (!navigator.geolocation) {
      set({ status: "unavailable", location: { id: "choose-location", label: "Choose your location" } });
      resolve(false);
      return;
    }

    set({ status: "locating", location: detectingLocation });
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const location = await reverseGeocode(coords.latitude, coords.longitude);
          persistLocation(location, "automatic");
          set({ location, source: "automatic", status: "ready" });
          resolve(true);
        } catch {
          const location = { id: `${coords.latitude},${coords.longitude}`, label: "Your current location", coordinates: { latitude: coords.latitude, longitude: coords.longitude } };
          persistLocation(location, "automatic");
          set({ location, source: "automatic", status: "ready" });
          resolve(true);
        }
      },
      () => {
        set({ status: "denied", location: { id: "choose-location", label: "Choose your location" } });
        resolve(false);
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 300_000 },
    );
  }),
}));
