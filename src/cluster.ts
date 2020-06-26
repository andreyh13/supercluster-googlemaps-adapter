import { SuperClusterAdapter } from './clusterer';
import { FeatureClusterIcon } from './clustericon';
import {
  CLASS_NAME_DEFAULT,
  GRID_SIZE_DEFAULT,
  MAX_ZOOM_DEFAULT,
  MIN_CLUSTER_SIZE_DEFAULT,
  PROP_HIDDEN,
} from './constants';
import { ClustererHelper } from './helper';
import { IDimension } from './interfaces';

export class FeatureCluster {
  private static counter = 0;
  private map: google.maps.Map | null = null;
  private center: google.maps.LatLng | null = null;
  private features: google.maps.Data.Feature[] = [];
  private bounds: google.maps.LatLngBounds = new google.maps.LatLngBounds();
  private id: number;
  private icon: FeatureClusterIcon | null;

  constructor(map: google.maps.Map, center: google.maps.LatLng) {
    this.map = map;
    this.center = center;
    this.id = ++FeatureCluster.counter;
    this.calculateBounds_();
    this.icon = new FeatureClusterIcon(map, this.id);
  }

  get classId(): string {
    return `${this.className}-${this.id}`;
  }

  get clusterer(): SuperClusterAdapter | undefined {
    return (this.map && ClustererHelper.getClusterer(this.map)) ?? undefined;
  }

  get size(): number {
    return this.features.length;
  }

  get minClusterSize(): number {
    return this.clusterer?.minClusterSize ?? MIN_CLUSTER_SIZE_DEFAULT;
  }

  get isAverageCenter(): boolean {
    return this.clusterer?.isAverageCenter ?? true;
  }

  get className(): string {
    return this.clusterer?.className ?? CLASS_NAME_DEFAULT;
  }

  get gridSize(): number {
    return this.clusterer?.gridSize ?? GRID_SIZE_DEFAULT;
  }

  get clusterBounds(): google.maps.LatLngBounds {
    return this.bounds;
  }

  public getBounds(): google.maps.LatLngBounds {
    const bounds = new google.maps.LatLngBounds();
    if (this.center) {
      bounds.extend(this.center);
    }
    for (const feature of this.features) {
      bounds.union(ClustererHelper.featureBounds(feature));
    }
    return bounds;
  }

  public isFeatureInClusterBounds(feature: google.maps.Data.Feature): boolean {
    return this.bounds?.contains(ClustererHelper.featureCenter(feature));
  }

  public addFeature(feature: google.maps.Data.Feature): boolean {
    if (this.isFeatureAlreadyAdded_(feature)) {
      return false;
    }

    if (
      (feature.getGeometry().getType() !== 'Point' && !this.excludeFeatureBySize_(feature)) ||
      feature.getGeometry().getType() === 'Point'
    ) {
      feature.setProperty('clusterID', this.classId);
      this.features.push(feature);
      this.updateClusterCenter_(feature);
      if (this.features.length < this.minClusterSize) {
        this.hideInCluster_(feature);
      } else if (this.features.length === this.minClusterSize) {
        for (const f of this.features) {
          this.showInCluster_(f);
        }
      } else {
        this.showInCluster_(feature);
      }
    } else {
      this.hideInCluster_(feature);
    }
    this.updateIcon();
    return true;
  }

  public remove(): void {
    this.icon?.remove();
    this.icon = null;
    this.features = [];
    delete this.features;
    this.map = null;
    this.center = null;
  }

  public updateIcon(): void {
    const zoom = this.map?.getZoom() ?? 1;
    const mz = this.clusterer?.maxZoom ?? MAX_ZOOM_DEFAULT;
    if (mz && zoom > mz) {
      // The zoom is greater than our max zoom so show all the features of cluster.
      for (const f of this.features) {
        this.hideInCluster_(f);
      }
      return;
    }
    if (this.size < this.minClusterSize) {
      // Min cluster size not yet reached.
      this.icon?.hide();
      return;
    }
    const numStyles = this.clusterer?.styles.length ?? 0;
    const sums = this.clusterer?.calculator(this.features, numStyles);

    if (sums) {
      this.icon?.setSums(sums);
    }
    if (this.center) {
      this.icon?.setCenter(this.center);
    }
    this.icon?.show();
  }

  public getId(): number {
    return this.id;
  }

  private isFeatureAlreadyAdded_(feature: google.maps.Data.Feature) {
    return this.features.indexOf(feature) !== -1;
  }

  private hideInCluster_(feature: google.maps.Data.Feature): void {
    if (feature.getProperty(PROP_HIDDEN)) {
      this.clusterer?.removeFeatureAndAlternativeFromDataLayer(feature);
    } else {
      this.clusterer?.addFeatureOrAlternativeToDataLayer(feature);
    }
  }

  private showInCluster_(feature: google.maps.Data.Feature): void {
    this.clusterer?.removeFeatureAndAlternativeFromDataLayer(feature);
  }

  private updateClusterCenter_(feature: google.maps.Data.Feature): void {
    const centerPoint = ClustererHelper.featureCenter(feature);
    if (!this.center) {
      this.center = centerPoint;
      this.calculateBounds_();
    } else {
      if (this.isAverageCenter) {
        const l = this.features.length + 1;
        const lat = (this.center.lat() * (l - 1) + centerPoint.lat()) / l;
        const lng = (this.center.lng() * (l - 1) + centerPoint.lng()) / l;
        this.center = new google.maps.LatLng(lat, lng);
        this.calculateBounds_();
      }
    }
  }

  private calculateBounds_(): void {
    const mBounds = new google.maps.LatLngBounds();
    if (this.center) {
      mBounds.extend(this.center);
    }
    this.bounds = this.clusterer?.getExtendedBounds(mBounds) ?? mBounds;
  }

  private excludeFeatureBySize_(feature: google.maps.Data.Feature): boolean {
    const dim: IDimension = this.clusterer?.getFeatureDimensions(feature) ?? { xsize: 0, ysize: 0 };
    return Math.abs(dim.xsize) >= this.gridSize || Math.abs(dim.ysize) >= this.gridSize;
  }
}
