import { GOOGLE_MAPS_API_KEY, TARGET_REGIONS,  REGION_KEYWORDS } from './googleMapsConfig';

export interface GooglePlaceSuggestion {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export interface LocationSuggestion {
  display_name: string;
  display_place: string;
  display_address: string;
  place_id: string;
  lat: string;
  lon: string;
  address: {
    name: string;
    state?: string;
    country?: string;
    city?: string;
  };
}

class GooglePlacesService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Check if a place description contains any of the target regions
   */  private isInTargetRegion(description: string): boolean {
    const lowerDescription = description.toLowerCase();
    
    // First check for exact region matches
    const exactMatch = TARGET_REGIONS.some(region => 
      lowerDescription.includes(region.toLowerCase())
    );
    
    if (exactMatch) return true;
    
    // If no exact match, check if the location is in Ávila region
    const inAvila = lowerDescription.includes('ávila') || 
                   lowerDescription.includes('avila');
    
    // If location is in Ávila, also check for partial region matches
    if (inAvila) {
      return REGION_KEYWORDS.some(keyword => 
        lowerDescription.includes(keyword.toLowerCase())
      );
    }
    
    return false;
  }
  /**
   * Get place details including coordinates
   */
  private async getPlaceDetails(placeId: string): Promise<{ lat: number; lng: number } | null> {
    try {
      const response = await fetch(`/api/places/details?place_id=${placeId}`);
      if (!response.ok) throw new Error('Failed to fetch place details');
      
      const data = await response.json();
      if (data.result?.geometry?.location) {
        return {
          lat: data.result.geometry.location.lat,
          lng: data.result.geometry.location.lng
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching place details:', error);
      // Return default coordinates for the region if API fails
      return { lat: 40.5, lng: -5.0 };
    }
  }

  /**
   * Search for places using Google Places Autocomplete API
   */  async searchPlaces(query: string): Promise<LocationSuggestion[]> {
    if (query.length < 3) return [];

    try {
      // Add region context to the query if it doesn't include region keywords
      let enhancedQuery = query;
      if (!TARGET_REGIONS.some(region => query.toLowerCase().includes(region.toLowerCase()))) {
        enhancedQuery = `${query} Ávila`;
      }
      
      // Use your backend API endpoint to avoid CORS issues
      const response = await fetch(`/api/places/autocomplete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },        body: JSON.stringify({
          input: enhancedQuery,
          types: 'geocode', // Only geographical locations
          language: 'es' // Spanish language
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.predictions) return [];

      // Filter results to only include our target regions
      const filteredPredictions = data.predictions.filter((prediction: GooglePlaceSuggestion) => 
        this.isInTargetRegion(prediction.description)
      );      // Convert Google Places format to our LocationSuggestion format
      const suggestions: LocationSuggestion[] = [];
      
      for (const prediction of filteredPredictions.slice(0, 5)) {
        // Get coordinates for each place (simplified approach)
        let coordinates = { lat: 40.5, lng: -5.0 }; // Default coordinates for the region
        
        try {
          const detailedCoords = await this.getPlaceDetails(prediction.place_id);
          if (detailedCoords) {
            coordinates = detailedCoords;
          }
        } catch (error) {
          console.error('Error getting coordinates for', prediction.description, error);
        }
        
        suggestions.push({
          display_name: prediction.description,
          display_place: prediction.structured_formatting.main_text,
          display_address: prediction.structured_formatting.secondary_text || '',
          place_id: prediction.place_id,
          lat: coordinates.lat.toString(),
          lon: coordinates.lng.toString(),
          address: {
            name: prediction.structured_formatting.main_text,
            state: 'Castilla y León',
            country: 'España',
            city: prediction.structured_formatting.main_text
          }
        });
      }

      return suggestions;
    } catch (error) {
      console.error('Error searching places:', error);
      return [];
    }
  }
}

export const googlePlacesService = new GooglePlacesService(GOOGLE_MAPS_API_KEY);
