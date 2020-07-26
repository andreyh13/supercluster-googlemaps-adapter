import { SuperClusterAdapter } from './clusterer';

const hashFeatureCenters: Map<string | number, google.maps.LatLng> = new Map<string | number, google.maps.LatLng>();
const hashFeaturesBounds: Map<string | number, google.maps.LatLngBounds> = new Map<
  string | number,
  google.maps.LatLngBounds
>();
const instances: WeakMap<google.maps.Map, SuperClusterAdapter> = new WeakMap();

export class ClustererHelper {
  private static newId: number = 1;

  public static featureCenter(feature: google.maps.Data.Feature): google.maps.LatLng {
    if (!hashFeatureCenters.has(feature.getId())) {
      const geom = feature.getGeometry();
      if (geom.getType() === 'Point') {
        hashFeatureCenters.set(feature.getId(), (geom as google.maps.Data.Point).get());
      } else {
        hashFeatureCenters.set(feature.getId(), ClustererHelper.featureBounds(feature).getCenter());
      }
    }
    const res = hashFeatureCenters.get(feature.getId());
    return res ? res : ClustererHelper.featureBounds(feature).getCenter();
  }

  public static featureBounds(feature: google.maps.Data.Feature): google.maps.LatLngBounds {
    if (!hashFeaturesBounds.has(feature.getId())) {
      const geom = feature.getGeometry();
      const geomBounds = new google.maps.LatLngBounds();
      geom.forEachLatLng((latLng) => {
        geomBounds.extend(latLng);
      });
      hashFeaturesBounds.set(feature.getId(), geomBounds);
    }
    const res = hashFeaturesBounds.get(feature.getId());
    return res ? res : new google.maps.LatLngBounds();
  }

  public static isFeatureInBounds(feature: google.maps.Data.Feature, bounds: google.maps.LatLngBounds): boolean {
    if (bounds) {
      const geom = feature.getGeometry();
      if (geom.getType() === 'Point') {
        return bounds.contains((geom as google.maps.Data.Point).get());
      } else {
        return bounds.contains(ClustererHelper.featureCenter(feature));
      }
    } else {
      return false;
    }
  }

  public static getClusterer(map: google.maps.Map): SuperClusterAdapter | undefined {
    if (instances.has(map)) {
      return instances.get(map);
    }
    return undefined;
  }

  public static setClusterer(map: google.maps.Map, clusterer: SuperClusterAdapter): void {
    if (instances.has(map)) {
      const prevInstance = instances.get(map);
      if (prevInstance) {
        prevInstance.destroy();
      }
      instances.delete(map);
    }
    instances.set(map, clusterer);
  }

  public static getClusterBounds(map: google.maps.Map, marker: google.maps.Marker, radius: number): google.maps.LatLngBounds {
    const bounds = new google.maps.LatLngBounds();
    if (map && marker && radius) {
      const position = marker.getPosition();
      if (position) {
        const point = ClustererHelper.fromLatLngToPixel(position, map);
        if (point) {
          const swPoint = new google.maps.Point(point.x - radius, point.y - radius);
          const nePoint = new google.maps.Point(point.x + radius, point.y + radius);
          const sw = ClustererHelper.fromPixelToLatLng(swPoint, map);
          const ne = ClustererHelper.fromPixelToLatLng(nePoint, map);
          if (sw) {
            bounds.extend(sw);
          }
          if (ne) {
            bounds.extend(ne);
          }
        }
      }
    }
    return bounds;
  }

  public static getNewId(): number {
    return ++ClustererHelper.newId;
  }

  private static fromLatLngToPixel(position: google.maps.LatLng, map: google.maps.Map) {
    const scale = Math.pow(2, map.getZoom());
    const projection = map.getProjection();
    const bounds = map.getBounds();
    const nw = projection?.fromLatLngToPoint(
      new google.maps.LatLng(
        bounds?.getNorthEast().lat() ?? 0,
        bounds?.getSouthWest().lng() ?? 0
      )
    );
    const point = projection?.fromLatLngToPoint(position);
    return new google.maps.Point(
      Math.floor(((point?.x ?? 0) - (nw?.x ?? 0)) * scale),
      Math.floor(((point?.y ?? 0) - (nw?.y ?? 0)) * scale)
    );
  }

  private static fromPixelToLatLng(pixel: google.maps.Point, map: google.maps.Map) {
    const scale = Math.pow(2, map.getZoom());
    const projection = map.getProjection();
    const bounds = map.getBounds();
    const nw = projection?.fromLatLngToPoint(
      new google.maps.LatLng(
        bounds?.getNorthEast().lat() ?? 0,
        bounds?.getSouthWest().lng() ?? 0
      )
    );
    const point = new google.maps.Point(
      pixel.x / scale + (nw?.x ?? 0),
      pixel.y / scale + (nw?.y ?? 0)
    );
    return projection?.fromPointToLatLng(point);
  }
}
