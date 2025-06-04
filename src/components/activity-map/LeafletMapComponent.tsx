import React, { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/router";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { ActivityData } from "@/hooks/useActivitiesData";
import { createActivityUrl } from "@/utils/urlHelpers";

const DefaultIcon = L.icon({
  iconUrl: icon.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface LeafletMapComponentProps {
  locations: ActivityData[];
  selectedLocation: ActivityData | null;
  onMarkerClick: (location: ActivityData) => void;
}

const LeafletMapComponent: React.FC<LeafletMapComponentProps> = ({
  locations,
  selectedLocation,
  onMarkerClick,
}) => {
  const router = useRouter();
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const [map, setMap] = useState<L.Map | null>(null);
  const defaultCenter = useMemo<[number, number]>(() => [40.4168, -3.7038], []);

  useEffect(() => {
    if (!mapRef.current) {
      let initialCenter = defaultCenter;
      if (locations.length > 0) {
        const validLocation = locations.find(
          (loc) => !isNaN(loc.lat) && !isNaN(loc.lon)
        );
        if (validLocation) {
          initialCenter = [validLocation.lat, validLocation.lon];
        }
      }

      const mapInstance = L.map("map", {
        center: initialCenter as L.LatLngExpression,
        zoom: 12,
        zoomControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstance);

      mapRef.current = mapInstance;
      setMap(mapInstance);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map) return;

    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    if (locations.length === 0) {
      map.setView(defaultCenter, 12);
      return;
    }

    const bounds = L.latLngBounds([]);
    let validLocationCount = 0;

    locations.forEach((loc) => {
      if (isNaN(loc.lat) || isNaN(loc.lon)) {
        console.warn(
          `Skipping marker for "${loc.title}" due to invalid coordinates: lat=${loc.lat}, lon=${loc.lon}`
        );
        return;
      }
      const position = [loc.lat, loc.lon] as [number, number];
      const popupId = `leaflet-popup-${loc.id}`;
      const marker = L.marker(position, { icon: DefaultIcon }).addTo(map)
        .bindPopup(`
          <div id="${popupId}" style="cursor: pointer; padding: 4px;">
            <h3 class="font-medium">${loc.title}</h3>
            <p class="text-sm">${loc.location}</p>
          </div>
        `);

      marker.on("click", () => {
        onMarkerClick(loc);
      });

      marker.on("popupopen", () => {
        const popupElement = document.getElementById(popupId);
        if (popupElement) {
          popupElement.addEventListener("click", () => {
            const activityUrl = createActivityUrl(loc.title, loc.uuid);
            router.push(activityUrl);
          });

          popupElement.addEventListener("mouseenter", () => {
            popupElement.style.backgroundColor = "#f9f9f9";
          });
          popupElement.addEventListener("mouseleave", () => {
            popupElement.style.backgroundColor = "transparent";
          });
        }
      });

      markersRef.current[loc.id] = marker;
      bounds.extend(position);
      validLocationCount++;
    });
    if (validLocationCount > 1) {
      map.fitBounds(bounds, {
        padding: [50, 50],
        animate: true,
        duration: 1,
      });
    } else if (validLocationCount === 1) {
      const validLocation = locations.find(
        (loc) => !isNaN(loc.lat) && !isNaN(loc.lon)
      );
      if (validLocation) {
        map.setView([validLocation.lat, validLocation.lon], 14);
      }
    } else {
      map.setView(defaultCenter, 12);
    }
  }, [locations, map, defaultCenter, onMarkerClick, router]);

  useEffect(() => {
    if (!map || !selectedLocation) return;

    if (isNaN(selectedLocation.lat) || isNaN(selectedLocation.lon)) {
      console.warn(
        `Cannot center map on selected location "${selectedLocation.title}" due to invalid coordinates`
      );
      return;
    }

    map.setView([selectedLocation.lat, selectedLocation.lon], 14, {
      animate: true,
      duration: 1,
    });

    const marker = markersRef.current[selectedLocation.id];
    if (marker) {
      marker.openPopup();
    }
  }, [selectedLocation, map]);

  const handleZoomIn = () => {
    if (map) map.zoomIn();
  };

  const handleZoomOut = () => {
    if (map) map.zoomOut();
  };

  return (
    <>
      <div id="map" style={{ height: "100%", width: "100%" }}></div>
      <div className="absolute top-4 right-4 z-[1000]">
        <div className="flex flex-col gap-2 bg-[rgba(194,91,52)] rounded-md shadow-md">
          <button
            className="p-2 hover:bg-[#cc6600] rounded-t-md border-b"
            onClick={handleZoomIn}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
          </button>
          <button
            className="p-2 hover:bg-[#cc6600] rounded-b-md"
            onClick={handleZoomOut}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default LeafletMapComponent;
