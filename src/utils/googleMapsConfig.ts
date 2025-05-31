// Google Maps API configuration
export const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyDs1k3FSDwY7F-TMMY50SS2BWxpkxB2GEY";
export const GOOGLE_PLACES_API_URL = "https://maps.googleapis.com/maps/api/place/autocomplete/json";

// Target regions in Spain - Valle del Tiétar, La Moraña, Valle de Amblés, Sierra de Gredos, Alberche Pinares
export const TARGET_REGIONS = [
  "Valle del Tiétar",
  "La Moraña", 
  "Valle de Amblés",
  "Sierra de Gredos",
  "Alberche Pinares"
];

// Bounding box for Ávila province and surrounding areas (approximate coordinates)
export const SPAIN_BOUNDS = {
  southwest: { lat: 39.8, lng: -5.8 },
  northeast: { lat: 41.2, lng: -4.0 }
};

// Province and region keywords to help filter results
export const REGION_KEYWORDS = [
  "Ávila", "Castilla y León", "España", "Spain",
  "Tiétar", "Moraña", "Amblés", "Gredos", "Alberche", "Pinares"
];
