import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { googleMapsLoader } from "@/utils/googleMapsLoader";
import { ActivityData } from "@/hooks/useActivitiesData";
import { createActivityUrl } from "@/utils/urlHelpers";

interface GoogleMapComponentProps {
  locations: ActivityData[];
  selectedLocation: ActivityData | null;
  onMarkerClick: (location: ActivityData) => void;
}

const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({
  locations,
  selectedLocation,
  onMarkerClick,
}) => {
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<{ [key: string]: google.maps.Marker }>({});
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const defaultCenter = { lat: 40.4168, lng: -3.7038 };

  useEffect(() => {
    const initializeMap = async () => {
      if (!mapRef.current || isLoaded) return;
      try {
        await googleMapsLoader.load();

        let initialCenter = defaultCenter;
        if (locations.length > 0) {
          const validLocation = locations.find(
            (loc) => !isNaN(loc.lat) && !isNaN(loc.lon)
          );
          if (validLocation) {
            initialCenter = { lat: validLocation.lat, lng: validLocation.lon };
          }
        }
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: initialCenter,
          zoom: 12,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
        });
        const infoWindow = new google.maps.InfoWindow();
        mapInstanceRef.current = mapInstance;
        infoWindowRef.current = infoWindow;
        setIsLoaded(true);
      } catch (error) {
        console.error("Error loading Google Maps:", error);
      }
    };

    initializeMap();
  }, [locations.length]);

  const clearMarkers = useCallback(() => {
    Object.values(markersRef.current).forEach((marker) => {
      marker.setMap(null);
    });
    markersRef.current = {};
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    clearMarkers();

    if (locations.length === 0) {
      mapInstanceRef.current.setCenter(defaultCenter);
      mapInstanceRef.current.setZoom(12);
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    let validLocationCount = 0;

    locations.forEach((loc) => {
      if (isNaN(loc.lat) || isNaN(loc.lon)) {
        console.warn(
          `Skipping marker for "${loc.title}" due to invalid coordinates: lat=${loc.lat}, lon=${loc.lon}`
        );
        return;
      }
      const position = { lat: loc.lat, lng: loc.lon };
      const marker = new google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: loc.title,
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
              <svg width="36" height="43" viewBox="0 0 36 43" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 0C27.9411 0 36 8.05887 36 18C36 26.654 29.8925 33.8799 21.7529 35.6064L17.6289 42.75L13.3867 35.4023C5.68087 33.3649 0 26.3463 0 18C0 8.05887 8.05887 0 18 0Z" fill="#050505"/>
              <path d="M15 16.9997C15 17.7954 15.3161 18.5584 15.8787 19.121C16.4413 19.6836 17.2044 19.9997 18 19.9997C18.7956 19.9997 19.5587 19.6836 20.1213 19.121C20.6839 18.5584 21 17.7954 21 16.9997C21 16.2041 20.6839 15.441 20.1213 14.8784C19.5587 14.3158 18.7956 13.9997 18 13.9997C17.2044 13.9997 16.4413 14.3158 15.8787 14.8784C15.3161 15.441 15 16.2041 15 16.9997Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M23.657 22.6567L19.414 26.8997C19.039 27.2743 18.5306 27.4848 18.0005 27.4848C17.4704 27.4848 16.962 27.2743 16.587 26.8997L12.343 22.6567C11.2242 21.5379 10.4623 20.1124 10.1537 18.5606C9.84504 17.0087 10.0035 15.4002 10.609 13.9384C11.2145 12.4767 12.2399 11.2272 13.5555 10.3482C14.8711 9.46918 16.4178 9 18 9C19.5822 9 21.1289 9.46918 22.4445 10.3482C23.7601 11.2272 24.7855 12.4767 25.391 13.9384C25.9965 15.4002 26.155 17.0087 25.8463 18.5606C25.5377 20.1124 24.7758 21.5379 23.657 22.6567Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
          `),
          scaledSize: new google.maps.Size(25, 41),
          anchor: new google.maps.Point(12, 41),
        },
      });
      marker.addListener("click", () => {
        onMarkerClick(loc);

        if (infoWindowRef.current) {
          const infoWindowId = `info-window-${loc.id}`;
          infoWindowRef.current.setContent(`
            <div id="${infoWindowId}" style="padding: 8px; min-width: 200px; cursor: pointer; transition: background-color 0.2s ease;">
              <h3 style="margin: 0 0 4px 0; font-weight: 600; color: #443f3f;">${loc.title}</h3>
              <p style="margin: 0; font-size: 14px; color: #645c5a;">${loc.location}</p>
            </div>
          `);
          infoWindowRef.current.open(mapInstanceRef.current, marker);

          google.maps.event.addListenerOnce(
            infoWindowRef.current,
            "domready",
            () => {
              const infoWindowElement = document.getElementById(infoWindowId);
              if (infoWindowElement) {
                infoWindowElement.addEventListener("click", () => {
                  const activityUrl = createActivityUrl(loc.title, loc.uuid);
                  router.push(activityUrl);
                });

                infoWindowElement.addEventListener("mouseenter", () => {
                  infoWindowElement.style.backgroundColor = "#f9f9f9";
                });
                infoWindowElement.addEventListener("mouseleave", () => {
                  infoWindowElement.style.backgroundColor = "transparent";
                });
              }
            }
          );
        }
      });

      markersRef.current[loc.id] = marker;
      bounds.extend(position);
      validLocationCount++;
    });

    if (validLocationCount > 1) {
      mapInstanceRef.current.fitBounds(bounds, {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50,
      });
    } else if (validLocationCount === 1) {
      const validLocation = locations.find(
        (loc) => !isNaN(loc.lat) && !isNaN(loc.lon)
      );
      if (validLocation) {
        mapInstanceRef.current.setCenter({
          lat: validLocation.lat,
          lng: validLocation.lon,
        });
        mapInstanceRef.current.setZoom(14);
      }
    }
  }, [locations, isLoaded, clearMarkers, onMarkerClick, router]);

  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current || !selectedLocation) return;

    if (isNaN(selectedLocation.lat) || isNaN(selectedLocation.lon)) {
      return;
    }

    const position = { lat: selectedLocation.lat, lng: selectedLocation.lon };

    mapInstanceRef.current.panTo(position);
    mapInstanceRef.current.setZoom(14);
    const marker = markersRef.current[selectedLocation.id];
    if (marker && infoWindowRef.current) {
      const infoWindowId = `info-window-${selectedLocation.id}`;
      infoWindowRef.current.setContent(`
        <div id="${infoWindowId}" style="padding: 8px; min-width: 200px; cursor: pointer; transition: background-color 0.2s ease;">
          <h3 style="margin: 0 0 4px 0; font-weight: 600; color: #443f3f;">${selectedLocation.title}</h3>
          <p style="margin: 0; font-size: 14px; color: #645c5a;">${selectedLocation.location}</p>
        </div>
      `);
      infoWindowRef.current.open(mapInstanceRef.current, marker);

      google.maps.event.addListenerOnce(
        infoWindowRef.current,
        "domready",
        () => {
          const infoWindowElement = document.getElementById(infoWindowId);
          if (infoWindowElement) {
            infoWindowElement.addEventListener("click", () => {
              const activityUrl = createActivityUrl(
                selectedLocation.title,
                selectedLocation.uuid
              );
              router.push(activityUrl);
            });
            infoWindowElement.addEventListener("mouseenter", () => {
              infoWindowElement.style.backgroundColor = "#f9f9f9";
            });
            infoWindowElement.addEventListener("mouseleave", () => {
              infoWindowElement.style.backgroundColor = "transparent";
            });
          }
        }
      );
    }
  }, [selectedLocation, isLoaded, router]);

  return (
    <>
      <div
        ref={mapRef}
        style={{ height: "100%", width: "100%" }}
        className="rounded-lg"
      />

      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgba(229,114,0)] mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Cargando mapa...</p>
          </div>
        </div>
      )}
    </>
  );
};

export default GoogleMapComponent;
