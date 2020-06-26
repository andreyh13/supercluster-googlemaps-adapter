import { Builder } from './builder';
import { FeatureCluster } from './cluster';
import { PROP_HIDDEN } from './constants';
import { ClustererHelper } from './helper';
import { IDimension, IStyle, ISums } from './interfaces';
import Supercluster from 'supercluster';

const SIZES = [53, 56, 66, 78, 90];
const hashFeatures: Map<string | number, google.maps.Data.Feature> = new Map();
const hashFeaturesReplace: Map<string | number, google.maps.Data.Feature> = new Map();

export class SuperClusterAdapter extends google.maps.OverlayView {
  private pMap: google.maps.Map;
  private pGridSize: number;
  private pMinClusterSize: number;
  private pMinZoom: number;
  private pMaxZoom: number;
  private pClassName: string;
  private pStyles: IStyle[];
  private pImagePath: string;
  private pImageExtension: string;
  private pZoomOnClick: boolean;
  private pAverageCenter: boolean;
  private pDataLayer: google.maps.Data;
  private pFeatures: google.maps.Data.Feature[] = [];
  private pClusters: FeatureCluster[] = [];
  private pReady: boolean = false;
  private pPrevZoom: number = 1;
  private pZoomChangedListener: google.maps.MapsEventListener | null = null;
  private pIdleListener: google.maps.MapsEventListener | null = null;
  private pFirstIdle: boolean = true;
  private pTilesReady: boolean = false;
  private pChanges: number = 0;
  private pReadyForFiltering = false;
  private pCalculator: (features: google.maps.Data.Feature[], numStyles: number) => ISums;

  constructor(build: Builder) {
    super();
    this.pMap = build.map;
    this.pGridSize = build.gridSize;
    this.pMinClusterSize = build.minClusterSize;
    this.pMaxZoom = build.maxZoom;
    this.pClassName = build.className;
    this.pStyles = build.styles;
    this.pImagePath = build.imagePath;
    this.pImageExtension = build.imageExtension;
    this.pZoomOnClick = build.zoomOnClick;
    this.pAverageCenter = build.averageCenter;
    this.pDataLayer = build.map?.data ?? new google.maps.Data();
    this.pCalculator = this.calculator_;
    this.init_();
  }

  /* ---- Getters ---- */
  get map() {
    return this.pMap;
  }

  get gridSize() {
    return this.pGridSize;
  }

  get minClusterSize() {
    return this.pMinClusterSize;
  }

  get maxZoom() {
    return this.pMaxZoom;
  }

  get className() {
    return this.pClassName;
  }

  get styles() {
    return this.pStyles;
  }

  set styles(styles: IStyle[]) {
    this.pStyles = styles;
  }

  get calculator() {
    return this.pCalculator;
  }

  set calculator(calc) {
    this.pCalculator = calc;
  }

  get imagePath() {
    return this.pImagePath;
  }

  get imageExtension() {
    return this.pImageExtension;
  }

  get isZoomOnClick() {
    return this.pZoomOnClick;
  }

  get isAverageCenter() {
    return this.pAverageCenter;
  }

  get dataLayer() {
    return this.pDataLayer;
  }

  get clusters() {
    return this.pClusters;
  }

  get numFeatures() {
    // Returns number of not hidden features
    const availableFeatures = this.features.filter(feature => !feature.getProperty(PROP_HIDDEN));
    return availableFeatures.length;
  }

  get hasFeatures() {
    // Returns true if there is at least one not hidden feature
    return this.numFeatures > 0;
  }

  get features() {
    // Returns sorted collection of all features
    if (this.pChanges) {
      if (this.shouldUseInsertionSort_()) {
        this.sortFeatures_();
      } else {
        this.pFeatures.sort((a, b) => ClustererHelper.featureCenter(a).lng() - ClustererHelper.featureCenter(b).lng());
      }
      this.pChanges = 0;
    }
    return this.pFeatures;
  }

  /* ---- Public methods ---- */
  public setVisible(v: boolean): void {
    if (!v) {
      this.removeEventListeners_();
      this.resetViewport_();
      this.dataLayer.setMap(null);
      this.setMap(null);
    } else {
      this.dataLayer.setMap(this.pMap);
      this.setMap(this.pMap);
    }
  }

  public getTotalClusters(): number {
    return this.pClusters.length;
  }

  public getClustererBounds(): google.maps.LatLngBounds {
    const clustererBounds = new google.maps.LatLngBounds();
    if (this.getTotalClusters() > 0) {
      for (const cluster of this.clusters) {
        clustererBounds.union(cluster.getBounds());
      }
    }
    return clustererBounds;
  }

  public getFeaturesBounds(): google.maps.LatLngBounds {
    const featuresBounds = new google.maps.LatLngBounds();
    for (const feature of this.features) {
      if (!feature.getProperty(PROP_HIDDEN)) {
        featuresBounds.union(ClustererHelper.featureBounds(feature));
      }
    }
    return featuresBounds;
  }

  public getExtendedBounds(bounds: google.maps.LatLngBounds): google.maps.LatLngBounds {
    const projection = this.getProjection();
    if (bounds.getNorthEast().lng() < bounds.getSouthWest().lng()) {
      bounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(bounds.getSouthWest().lat(), -179.0),
        new google.maps.LatLng(bounds.getNorthEast().lat(), 179.0),
      );
    } else {
      // Convert the points to pixels and the extend out by the grid size.
      const trPix = projection.fromLatLngToDivPixel(bounds.getNorthEast());
      trPix.x += this.gridSize;
      trPix.y -= this.gridSize;

      const blPix = projection.fromLatLngToDivPixel(bounds.getSouthWest());
      blPix.x -= this.gridSize;
      blPix.y += this.gridSize;

      // Extend the bounds to contain the new bounds.
      const ne = projection.fromDivPixelToLatLng(trPix);
      const sw = projection.fromDivPixelToLatLng(blPix);

      if (ne.lat() > bounds.getNorthEast().lat() && ne.lng() > bounds.getNorthEast().lng()) {
        bounds.extend(ne);
      }
      if (sw.lat() < bounds.getSouthWest().lat() && sw.lng() < bounds.getSouthWest().lng()) {
        bounds.extend(sw);
      }
    }
    return bounds;
  }

  public getFeatureDimensions(feature: google.maps.Data.Feature): IDimension {
    const projection = this.getProjection();
    const featureBounds = ClustererHelper.featureBounds(feature);
    const tr = projection.fromLatLngToDivPixel(featureBounds.getNorthEast());
    const bl = projection.fromLatLngToDivPixel(featureBounds.getSouthWest());
    return {
      xsize: tr.x - bl.x,
      ysize: bl.y - tr.y,
    };
  }

  public addFeatureOrAlternativeToDataLayer(feature: google.maps.Data.Feature): void {
    if (feature.getGeometry().getType() !== 'Point') {
      const dim = this.getFeatureDimensions(feature);
      if (dim.xsize < this.gridSize * 0.5 && dim.ysize < this.gridSize * 0.5) {
        const alternative = hashFeaturesReplace.has(feature.getId())
          ? hashFeaturesReplace.get(feature.getId())
          : feature;
        this.dataLayer.add(alternative ?? feature);
      } else {
        this.dataLayer.add(feature);
      }
    } else {
      this.dataLayer.add(feature);
    }
  }

  public removeFeatureAndAlternativeFromDataLayer(feature: google.maps.Data.Feature): void {
    this.removeFeatureFromDataLayer_(feature);
    if (feature.getGeometry().getType() !== 'Point') {
      const alternative = hashFeaturesReplace.has(feature.getId()) ? hashFeaturesReplace.get(feature.getId()) : feature;
      this.removeFeatureFromDataLayer_(alternative ?? feature);
    }
  }

  public redraw(): void {
    const oldClusters = this.clusters.slice();
    this.clusters.length = 0;

    if (this.hasFeatures) {
      this.createClusters_();
    } else {
      for (const feature of this.features) {
        this.removeFeatureAndAlternativeFromDataLayer(feature);
      }
    }

    // Remove the old clusters.
    // Do it in a timeout so the other clusters have been drawn first.
    window.requestAnimationFrame(() => {
      for (const oCluster of oldClusters) {
        oCluster.remove();
      }
      oldClusters.length = 0;
    });
  }

  public destroy(): void {
    this.resetViewport_();
    this.removeEventListeners_();
    for (const feature of this.features) {
      this.removeFeatureAndAlternativeFromDataLayer(feature);
    }
    this.dataLayer.setMap(null);
    this.pStyles = [];
    this.pFeatures = [];
    this.pClusters = [];
  }

  /* ---- google.maps.Data methods wrappers ---- */
  public add(feature: google.maps.Data.Feature | google.maps.Data.FeatureOptions): google.maps.Data.Feature {
    const f = this.dataLayer.add(feature);
    this.dataLayer.remove(f);
    this.pFeatures.push(f);
    hashFeatures.set(f.getId(), f);
    this.createAlternativePointFeature_(f);
    this.pChanges += 1;
    this.onAdd();
    return f;
  }

  public addGeoJson(geoJson: object, options?: google.maps.Data.GeoJsonOptions): google.maps.Data.Feature[] {
    const features = this.dataLayer.addGeoJson(geoJson, options);
    if (features.length) {
      for (const f of features) {
        this.dataLayer.remove(f);
        hashFeatures.set(f.getId(), f);
        this.createAlternativePointFeature_(f);
      }
      this.pFeatures.push(...features);
      this.pChanges += features.length;
      this.onAdd();
    }
    return features;
  }

  public contains(feature: google.maps.Data.Feature): boolean {
    return this.pFeatures.findIndex(f => f.getId() === feature.getId()) !== -1;
  }

  public forEach(callback: (feature: google.maps.Data.Feature) => void): void {
    return this.features.forEach(callback);
  }

  public getControlPosition(): google.maps.ControlPosition {
    return this.dataLayer.getControlPosition();
  }

  public getControls(): google.maps.DrawingMode[] {
    return this.dataLayer.getControls();
  }

  public getDrawingMode(): google.maps.DrawingMode | null {
    return this.dataLayer.getDrawingMode();
  }

  public getFeatureById(id: string | number): google.maps.Data.Feature | null {
    if (hashFeatures.has(id)) {
      return hashFeatures.get(id) ?? null;
    }
    return this.features.find(feature => feature.getId() === id) ?? null;
  }

  public getStyle(): google.maps.Data.StylingFunction | google.maps.Data.StyleOptions {
    return this.dataLayer.getStyle();
  }

  public loadGeoJson(
    url: string,
    options?: google.maps.Data.GeoJsonOptions,
    callback?: (features: google.maps.Data.Feature[]) => void,
  ): void {
    return this.dataLayer.loadGeoJson(url, options, features => {
      if (features.length) {
        for (const f of features) {
          this.dataLayer.remove(f);
          hashFeatures.set(f.getId(), f);
          this.createAlternativePointFeature_(f);
        }
        this.pFeatures.push(...features);
        this.pChanges += features.length;
      }
      if (callback) {
        callback(features);
      }
      this.onAdd();
    });
  }

  public overrideStyle(feature: google.maps.Data.Feature, style: google.maps.Data.StyleOptions): void {
    return this.dataLayer.overrideStyle(feature, style);
  }

  public remove(feature: google.maps.Data.Feature): void {
    const index = this.pFeatures.findIndex(f => f.getId() === feature.getId());
    if (index !== -1) {
      this.removeFeatureAndAlternativeFromDataLayer(feature);
      this.pFeatures.splice(index, 1);
      hashFeatures.delete(feature.getId());
      if (feature.getGeometry().getType() !== 'Point') {
        hashFeaturesReplace.delete(feature.getId());
      }
      this.pChanges += 1;
    }
  }

  public revertStyle(feature?: google.maps.Data.Feature | undefined): void {
    return this.dataLayer.revertStyle(feature);
  }

  public setControlPosition(controlPosition: google.maps.ControlPosition): void {
    return this.dataLayer.setControlPosition(controlPosition);
  }

  public setControls(controls: google.maps.DrawingMode[] | null): void {
    return this.dataLayer.setControls(controls);
  }

  public setDrawingMode(drawingMode: google.maps.DrawingMode | null): void {
    return this.dataLayer.setDrawingMode(drawingMode);
  }

  public setStyle(style: google.maps.Data.StylingFunction | google.maps.Data.StyleOptions): void {
    return this.dataLayer.setStyle(style);
  }

  public toGeoJson(callback: (json: object) => void): void {
    return this.dataLayer.toGeoJson(callback);
  }

  /* ---- google.maps.OverlayView interface methods ---- */
  public onAdd(): void {
    if (!this.getMap()) {
      return this.onRemove();
    }

    this.dataLayer.setMap(this.getMap() as google.maps.Map);
    this.pPrevZoom = this.getMap().getZoom();
    // Add the map event listeners
    if (!this.pZoomChangedListener) {
      this.pZoomChangedListener = google.maps.event.addListener(this.getMap(), 'zoom_changed', () => {
        const zoom = this.pMap.getZoom();
        if (this.pPrevZoom !== zoom) {
          this.pPrevZoom = zoom;
          this.resetViewport_();
        }
      });
    }
    if (!this.pIdleListener) {
      this.pIdleListener = google.maps.event.addListener(this.getMap(), 'idle', () => {
        if (!this.pFirstIdle) {
          this.redraw();
        } else {
          this.pFirstIdle = this.numFeatures === 0;
          google.maps.event.trigger(this.pMap, 'tilesLoadedFirst');
        }
      });
    }
    this.setReady_(true);
  }

  public onRemove(): void {
    this.removeEventListeners_();
    this.dataLayer.setMap(null);
    this.setReady_(false);
  }

  /* tslint:disable*/
  public draw(): void {}
  /* tslint:enable*/

  /* ---- Builder pattern implementation ---- */
  static get Builder(): typeof Builder {
    return Builder;
  }

  private resetViewport_(): void {
    for (const cluster of this.pClusters) {
      cluster.remove();
    }
    this.pClusters = [];
  }

  private setReady_(ready: boolean): void {
    this.pReady = ready;
    if (ready) {
      if (this.hasFeatures && this.pFirstIdle && this.pTilesReady) {
        this.createClusters_();
        this.pFirstIdle = false;
        this.pReadyForFiltering = true;
      }
    }
  }

  private sortClusters_(): void {
    for (let i = 1, j: number, tmp: FeatureCluster, tmpLng: number, length = this.pClusters.length; i < length; ++i) {
      tmp = this.pClusters[i];
      tmpLng = tmp
        .getBounds()
        .getCenter()
        .lng();
      for (
        j = i - 1;
        j >= 0 &&
        this.pClusters[j]
          .getBounds()
          .getCenter()
          .lng() > tmpLng;
        --j
      ) {
        this.pClusters[j + 1] = this.pClusters[j];
      }
      this.pClusters[j + 1] = tmp;
    }
  }

  private sortFeatures_(): void {
    for (
      let i = 1, j: number, tmp: google.maps.Data.Feature, tmpLng: number, length = this.pFeatures.length;
      i < length;
      ++i
    ) {
      tmp = this.features[i];
      tmpLng = ClustererHelper.featureCenter(tmp).lng();
      for (j = i - 1; j >= 0 && ClustererHelper.featureCenter(this.pFeatures[j]).lng() > tmpLng; --j) {
        this.pFeatures[j + 1] = this.pFeatures[j];
      }
      this.pFeatures[j + 1] = tmp;
    }
  }

  private shouldUseInsertionSort_(): boolean {
    if (this.pChanges > 300 || !this.pFeatures.length) {
      return false;
    } else {
      return this.pChanges / this.pFeatures.length < 0.2;
    }
  }

  private indexLowerBoundLng_(lng: number): number {
    // It's a binary search algorithm
    let it: number;
    let step: number;
    let first: number = 0;
    let count = this.features.length;
    while (count > 0) {
      step = Math.floor(count / 2);
      it = first + step;
      if (ClustererHelper.featureCenter(this.features[it]).lng() < lng) {
        first = ++it;
        count -= step + 1;
      } else {
        count = step;
      }
    }
    return first;
  }

  private createClusters_(): void {
    if (!this.pReady || !this.getMap()) {
      return;
    }

    const mapBounds = (this.getMap() as google.maps.Map).getBounds() ?? new google.maps.LatLngBounds();
    const extendedBounds = this.getExtendedBounds(mapBounds);
    // Binary search for the first interesting feature
    const firstIndex = this.indexLowerBoundLng_(extendedBounds.getSouthWest().lng());
    const workingClusterList = this.pClusters.slice(0);
    for (let i = firstIndex, l = this.features.length; i < l; ++i) {
      const feature = this.features[i];
      if (ClustererHelper.featureCenter(feature).lng() > extendedBounds.getNorthEast().lng()) {
        break;
      }
      if (
        ClustererHelper.featureCenter(feature).lat() > extendedBounds.getSouthWest().lat() &&
        ClustererHelper.featureCenter(feature).lat() < extendedBounds.getNorthEast().lat()
      ) {
        if (feature.getProperty(PROP_HIDDEN)) {
          this.removeFeatureAndAlternativeFromDataLayer(feature);
        } else {
          let clusterFound = false;
          let cluster: FeatureCluster;
          for (let j = 0, ll = workingClusterList.length; j < ll; ++j) {
            cluster = workingClusterList[j];

            // If the cluster is far away the current marker
            // we can remove it from the list of active clusters
            // because we will never reach it again
            if (cluster.clusterBounds.getNorthEast().lng() < ClustererHelper.featureCenter(feature).lng()) {
              workingClusterList.splice(j, 1);
              --j;
              --ll;
              continue;
            }

            if (cluster.isFeatureInClusterBounds(feature)) {
              cluster.addFeature(feature);
              clusterFound = true;
              break;
            }
          }

          // If the feature doesn't fit in any cluster,
          // we must create a brand new cluster.
          if (!clusterFound) {
            const newCluster = new FeatureCluster(this.pMap, ClustererHelper.featureCenter(feature));
            newCluster.addFeature(feature);
            this.pClusters.push(newCluster);
            workingClusterList.push(newCluster);
          }
        }
      }
    }
  }

  private init_(): void {
    this.setupStyles_();
    if (this.pMap) {
      google.maps.event.addListenerOnce(this.pMap, 'tilesLoadedFirst', () => {
        this.pTilesReady = true;
        if (this.pReady) {
          this.setReady_(this.pReady);
        }
      });
      this.setMap(this.pMap);
    }
  }

  private setupStyles_(): void {
    if (this.pStyles.length) {
      return;
    }
    SIZES.forEach((size, i) => {
      this.pStyles.push({
        height: size,
        url: this.pImagePath + (i + 1) + '.' + this.pImageExtension,
        width: size,
      });
    });
  }

  private calculator_(features: google.maps.Data.Feature[], numStyles: number): ISums {
    let index = 0;
    let dv = features.length;
    while (dv !== 0) {
      dv = Math.floor(dv / 10);
      index++;
    }

    index = Math.min(index, numStyles);
    return {
      index,
      text: `${features.length}`,
    };
  }

  private removeEventListeners_(): void {
    this.pZoomChangedListener?.remove();
    this.pIdleListener?.remove();
  }

  private removeFeatureFromDataLayer_(feature: google.maps.Data.Feature): void {
    if (this.dataLayer?.contains(feature)) {
      this.dataLayer.remove(feature);
    }
  }

  private createAlternativePointFeature_(feature: google.maps.Data.Feature) {
    if (feature.getGeometry().getType() !== 'Point') {
      const featureProperties: any = {
        icon: 'ICON_ALTERNATIVE',
      };
      feature.forEachProperty((value, name) => {
        featureProperties[name] = value;
      });
      const f = new google.maps.Data.Feature({
        geometry: ClustererHelper.featureCenter(feature),
        id: feature.getId(),
        properties: featureProperties,
      });
      hashFeaturesReplace.set(feature.getId(), f);
    }
  }
}
