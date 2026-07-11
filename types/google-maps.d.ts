export {};

interface GoogleMapsAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface GoogleMapsPlaceResult {
  address_components?: GoogleMapsAddressComponent[];
}

interface GoogleMapsEventListener {
  remove: () => void;
}

interface GoogleMapsAutocomplete {
  addListener: (eventName: "place_changed", handler: () => void) => GoogleMapsEventListener;
  getPlace: () => GoogleMapsPlaceResult;
}

interface GoogleMapsAutocompleteOptions {
  componentRestrictions?: { country: string | string[] };
  fields?: string[];
  types?: string[];
}

declare global {
  interface Window {
    google?: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            options?: GoogleMapsAutocompleteOptions
          ) => GoogleMapsAutocomplete;
        };
        event: {
          removeListener: (listener: GoogleMapsEventListener) => void;
        };
      };
    };
  }
}
