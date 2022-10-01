import { useState, useEffect } from "react";

export function useLocation() {
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(position.coords);
      },
      null,
      { enableHighAccuracy: true } as any
    );
  }, []);

  return location;
}
