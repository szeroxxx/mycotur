import { Loader } from "@googlemaps/js-api-loader";
import { GOOGLE_MAPS_API_KEY } from "./googleMapsConfig";

class GoogleMapsLoader {
  private static instance: GoogleMapsLoader;
  private loader: Loader;
  private isLoaded: boolean = false;
  private loadPromise: Promise<void> | null = null;
  private loadError: Error | null = null;

  private constructor() {
    this.loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: "weekly",
      libraries: ["places", "geometry", "routes"],
    });
  }

  public static getInstance(): GoogleMapsLoader {
    if (!GoogleMapsLoader.instance) {
      GoogleMapsLoader.instance = new GoogleMapsLoader();
    }
    return GoogleMapsLoader.instance;
  }

  public async load(): Promise<void> {
    if (this.isLoaded) {
      return Promise.resolve();
    }

    if (this.loadError) {
      throw this.loadError;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this.loader.load()
      .then(() => {
        this.isLoaded = true;
      })
      .catch((error) => {
        this.loadError = error;
        this.loadPromise = null; 
        throw error;
      });

    return this.loadPromise;
  }

  public isGoogleMapsLoaded(): boolean {
    return this.isLoaded && typeof window !== 'undefined' && !!window.google;
  }

  public reset(): void {
    this.isLoaded = false;
    this.loadPromise = null;
    this.loadError = null;
  }
}

export const googleMapsLoader = GoogleMapsLoader.getInstance();
