export interface IStyle {
  url: string;
  height: number;
  width: number;
  textColor?: string;
  fontFamily?: string;
  textSize?: number;
  fontWeight?: string;
  anchor?: number[] | null;
}

export interface IOverlappingMarkerSpiderfier {
  trackMarker: (marker: google.maps.Marker, listener?: (event: google.maps.MouseEvent) => void) => IOverlappingMarkerSpiderfier;
  addMarker: (marker: google.maps.Marker, listener?: (event: google.maps.MouseEvent) => void) => IOverlappingMarkerSpiderfier;
  forgetMarker: (marker: google.maps.Marker) => IOverlappingMarkerSpiderfier;
  removeMarker: (marker: google.maps.Marker) => IOverlappingMarkerSpiderfier;
  forgetAllMarkers: () => IOverlappingMarkerSpiderfier;
  removeAllMarkers: () => IOverlappingMarkerSpiderfier;
  getMarkers: () => google.maps.Marker[];
  addListener: (event: string, listenerFunc: (event: any) => void) => void;
  removeListener: (event: string, listenerFunc: (event: any) => void) => void;
  clearListeners: (event: string) => IOverlappingMarkerSpiderfier;
  unspiderfy: () => IOverlappingMarkerSpiderfier;
}

