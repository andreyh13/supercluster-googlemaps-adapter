import { Builder } from './builder';
import { ClustererHelper } from './helper';
import { IDimension, IStyle, ISums } from './interfaces';
import Supercluster from 'supercluster';

const SIZES = [53, 56, 66, 78, 90];
const hashFeatures: Map<string | number, google.maps.Data.Feature> = new Map();

export class SuperClusterAdapter extends google.maps.OverlayView {
  private pMap: google.maps.Map;
  private pRadius: number;
  private pMinZoom: number;
  private pMaxZoom: number;
  private pClassName: string;
  private pStyles: IStyle[];
  private pImagePath: string;
  private pImageExtension: string;
  private pZoomOnClick: boolean;
  private pDataLayer: google.maps.Data;
  private pFeatures: google.maps.Data.Feature[] = [];
  private pReady = false;
  private pZoomChangedListener: google.maps.MapsEventListener | null = null;
  private pIdleListener: google.maps.MapsEventListener | null = null;
  private pFirstIdle = true;
  private pTilesReady = false;
  private pIndex: Supercluster;

  constructor(build: Builder) {
    super();
    this.pMap = build.map;
    this.pRadius = build.radius;
    this.pMaxZoom = build.maxZoom;
    this.pMinZoom = build.minZoom;
    this.pClassName = build.className;
    this.pStyles = build.styles;
    this.pImagePath = build.imagePath;
    this.pImageExtension = build.imageExtension;
    this.pZoomOnClick = build.zoomOnClick;
    this.pDataLayer = build.map?.data ?? new google.maps.Data();
    this.pIndex = new Supercluster({
      minZoom: this.pMinZoom,
      maxZoom: this.pMaxZoom,
      radius: this.pRadius
    });

    this.init_();
  }

  /* ---- Getters ---- */
  get map() {
    return this.pMap;
  }

  get radius() {
    return this.pRadius;
  }

  get maxZoom() {
    return this.pMaxZoom;
  }

  get minZoom() {
    return this.pMinZoom;
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

  get imagePath() {
    return this.pImagePath;
  }

  get imageExtension() {
    return this.pImageExtension;
  }

  get isZoomOnClick() {
    return this.pZoomOnClick;
  }

  get dataLayer() {
    return this.pDataLayer;
  }

  get numFeatures() {
    return this.features.length;
  }

  get hasFeatures() {
    return this.numFeatures > 0;
  }

  get features() {
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

  public getFeaturesBounds(): google.maps.LatLngBounds {
    const featuresBounds = new google.maps.LatLngBounds();
    for (const feature of this.features) {
      featuresBounds.union(ClustererHelper.featureBounds(feature));
    }
    return featuresBounds;
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

  public addFeatureToDataLayer(feature: google.maps.Data.Feature): void {
    this.dataLayer.add(feature);
  }

  public removeFeatureFromDataLayer(feature: google.maps.Data.Feature): void {
    this.removeFeatureFromDataLayer_(feature);
  }

  public redraw(): void {
    if (this.hasFeatures) {
      this.createClusters_();
    } else {
      for (const feature of this.features) {
        this.removeFeatureFromDataLayer(feature);
      }
    }
  }

  public destroy(): void {
    this.resetViewport_();
    this.removeEventListeners_();
    for (const feature of this.features) {
      this.removeFeatureFromDataLayer(feature);
    }
    this.dataLayer.setMap(null);
    this.pStyles = [];
    this.pFeatures = [];
  }

  public addGeoJson(geoJson: object): void {

  }

  public getStyle(): google.maps.Data.StylingFunction | google.maps.Data.StyleOptions {
    return this.dataLayer.getStyle();
  }

  public overrideStyle(feature: google.maps.Data.Feature, style: google.maps.Data.StyleOptions): void {
    return this.dataLayer.overrideStyle(feature, style);
  }

  public revertStyle(feature?: google.maps.Data.Feature | undefined): void {
    return this.dataLayer.revertStyle(feature);
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
    // Add the map event listeners
    if (!this.pZoomChangedListener) {
      this.pZoomChangedListener = google.maps.event.addListener(this.getMap(), 'zoom_changed', () => {
        const zoom = this.pMap.getZoom();
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
  public draw(): void { }
  /* tslint:enable*/

  /* ---- Builder pattern implementation ---- */
  static get Builder(): typeof Builder {
    return Builder;
  }

  private resetViewport_(): void {
  }

  private setReady_(ready: boolean): void {
    this.pReady = ready;
    if (ready) {
      if (this.hasFeatures && this.pFirstIdle && this.pTilesReady) {
        this.createClusters_();
        this.pFirstIdle = false;
      }
    }
  }

  private sortClusters_(): void {
  }

  private sortFeatures_(): void {
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
}
