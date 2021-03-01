import * as GeoJSON from 'geojson';

export interface ISuperClusterAdapter {
  map: google.maps.Map;
  radius: number;
  maxZoom: number;
  minZoom: number;
  styles: IStyle[];
  imagePath: string;
  imageExtension: string;
  isZoomOnClick: boolean;
  numFeatures: number;
  hasFeatures: boolean;
  features: GeoJSON.Feature<GeoJSON.Point>[];
  setVisible: (v: boolean) => void;
  setVisibleMarkersAndClusters: (v: boolean) => void;
  setVisibleDataLayerFeatures: (v: boolean) => void;
  getFeaturesBounds: () => google.maps.LatLngBounds;
  destroy: () => void;
  load: (geoJson: GeoJSON.FeatureCollection) => void;
  drawServerSideCalculatedClusters: (features: any[]) => void;
}

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
  trackMarker: (
    marker: google.maps.Marker,
    listener?: (event: google.maps.MouseEvent) => void,
  ) => IOverlappingMarkerSpiderfier;
  addMarker: (
    marker: google.maps.Marker,
    listener?: (event: google.maps.MouseEvent) => void,
  ) => IOverlappingMarkerSpiderfier;
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

export type OverlappingMarkerSpiderfier = IOverlappingMarkerSpiderfier;