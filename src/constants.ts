export const CLASS_NAME_DEFAULT = 'cluster';
export const MIN_ZOOM_DEFAULT = 0;
export const MAX_ZOOM_DEFAULT = 19;
export const RADIUS_DEFAULT = 80;
export const MIN_CLUSTER_SIZE_DEFAULT = 2;
export const MARKER_CLUSTER_IMAGE_PATH_DEFAULT = 'https://maps-tools-242a6.firebaseapp.com/clusterer/images/m';
export const MARKER_CLUSTER_IMAGE_EXTENSION = document.implementation.hasFeature(
  'http://www.w3.org/TR/SVG11/feature#Image',
  '1.1',
)
  ? 'svg'
  : 'png';
export const ICON_URL_DEFAULT = "http://maps.google.com/mapfiles/kml/paddle/blu-blank.png";
export const SIZES = [53, 56, 66, 78, 90];
