import { SuperClusterAdapter } from './clusterer';

const hashFeatureCenters: Map<string | number, google.maps.LatLng> = new Map();
const hashFeaturesBounds: Map<string | number, google.maps.LatLngBounds> = new Map();
const instances: WeakMap<google.maps.Map, SuperClusterAdapter> = new WeakMap();

export class ClustererHelper {
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
      geom.forEachLatLng(latLng => {
        geomBounds.extend(latLng);
      });
      hashFeaturesBounds.set(feature.getId(), geomBounds);
    }
    const res = hashFeaturesBounds.get(feature.getId());
    return res ? res : new google.maps.LatLngBounds();
  }

  public static isFeatureInBounds(feature: google.maps.Data.Feature, bounds: google.maps.LatLngBounds) {
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

  public static getClusterer(map: google.maps.Map) {
    if (instances.has(map)) {
      return instances.get(map);
    }
    return undefined;
  }

  public static setClusterer(map: google.maps.Map, clusterer: SuperClusterAdapter): void {
    if (instances.has(map)) {
      const prevInstance = instances.get(map);
      prevInstance?.destroy();
      instances.delete(map);
    }
    instances.set(map, clusterer);
  }
}
