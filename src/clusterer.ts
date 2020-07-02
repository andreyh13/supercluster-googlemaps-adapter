import { Builder } from './builder';
import { ClustererHelper } from './helper';
import { IStyle } from './interfaces';
import Supercluster from 'supercluster';
import * as GeoJSON from 'geojson';

const SIZES = [53, 56, 66, 78, 90];

export class SuperClusterAdapter {
  private pMap: google.maps.Map;
  private pRadius: number;
  private pMinZoom: number;
  private pMaxZoom: number;
  private pClassName: string;
  private pStyles: IStyle[];
  private pImagePath: string;
  private pImageExtension: string;
  private pZoomOnClick: boolean;
  private pDataLayerDeafult: google.maps.Data;
  private pDataLayer: google.maps.Data;
  private pFeatures: google.maps.Data.Feature[] = [];
  private pReady = false;
  private pZoomChangedListener: google.maps.MapsEventListener | null = null;
  private pIdleListener: google.maps.MapsEventListener | null = null;
  private pIndex: Supercluster;

  constructor(build: Builder) {
    this.pMap = build.map;
    this.pRadius = build.radius;
    this.pMaxZoom = build.maxZoom;
    this.pMinZoom = build.minZoom;
    this.pClassName = build.className;
    this.pStyles = build.styles;
    this.pImagePath = build.imagePath;
    this.pImageExtension = build.imageExtension;
    this.pZoomOnClick = build.zoomOnClick;
    this.pDataLayerDeafult = build.map?.data;
    this.pDataLayer = new google.maps.Data();
    this.pIndex = new Supercluster({
      minZoom: this.pMinZoom,
      maxZoom: this.pMaxZoom,
      radius: this.pRadius
    });
    this.init();
  }

  /* ---- Getters ---- */
  get map(): google.maps.Map {
    return this.pMap;
  }

  get radius(): number {
    return this.pRadius;
  }

  get maxZoom(): number {
    return this.pMaxZoom;
  }

  get minZoom(): number {
    return this.pMinZoom;
  }

  get className(): string {
    return this.pClassName;
  }

  get styles(): IStyle[] {
    return this.pStyles;
  }

  set styles(styles: IStyle[]) {
    this.pStyles = styles;
  }

  get imagePath(): string {
    return this.pImagePath;
  }

  get imageExtension(): string {
    return this.pImageExtension;
  }

  get isZoomOnClick(): boolean {
    return this.pZoomOnClick;
  }

  get dataLayer(): google.maps.Data {
    return this.pDataLayer;
  }

  get numFeatures(): number {
    // TODO
    return this.features.length;
  }

  get hasFeatures(): boolean {
    return this.numFeatures > 0;
  }

  get features(): google.maps.Data.Feature[] {
    // TODO
    return this.pFeatures;
  }

  /* ---- Public methods ---- */
  public setVisible(v: boolean): void {
    if (!v) {
      this.removeEventListeners();
      this.dataLayer.setMap(null);
    } else {
      this.addEventListeners();
      this.dataLayer.setMap(this.pMap);
    }
  }

  public getFeaturesBounds(): google.maps.LatLngBounds {
    const featuresBounds = new google.maps.LatLngBounds();
    for (const feature of this.features) {
      featuresBounds.union(ClustererHelper.featureBounds(feature));
    }
    return featuresBounds;
  }

  private addFeatureToDataLayer(feature: google.maps.Data.Feature): void {
    this.dataLayer.add(feature);
  }

  private removeFeatureFromDataLayer(feature: google.maps.Data.Feature): void {
    if (this.dataLayer?.contains(feature)) {
      this.dataLayer.remove(feature);
    }
  }

  public destroy(): void {
    this.removeEventListeners();
    for (const feature of this.features) {
      this.removeFeatureFromDataLayer(feature);
    }
    this.dataLayer.setMap(null);
    this.pStyles = [];
    this.pFeatures = [];
  }

  public addGeoJson(geoJson: Supercluster.PointFeature<Supercluster.AnyProps>[]): void {
    this.pIndex.load(geoJson);
    this.addEventListeners();
  }

  public drawClusters(clusters: (Supercluster.ClusterFeature<Supercluster.AnyProps> | Supercluster.PointFeature<Supercluster.AnyProps>)[]): void {
    this.clearFeatures();
    for (const feature of clusters) {
      
    }
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

  // eslint-disable-next-line @typescript-eslint/ban-types
  public toGeoJson(callback: (json: object) => void): void {
    return this.dataLayer.toGeoJson(callback);
  }

  /* ---- Builder pattern implementation ---- */
  static get Builder(): typeof Builder {
    return Builder;
  }

  private getClusters(): void {
    if (!this.pReady || !this.map) {
      return;
    }

    const mapBounds = this.map.getBounds() ?? new google.maps.LatLngBounds();
    const zoom = this.map.getZoom() ?? 0;

    if (!mapBounds.isEmpty() && zoom) {
      const bbox: GeoJSON.BBox = [
        mapBounds.getSouthWest().lng(),
        mapBounds.getSouthWest().lat(),
        mapBounds.getNorthEast().lng(),
        mapBounds.getNorthEast().lat()
      ];
      const clusters = this.pIndex.getClusters(bbox, zoom);
    }
  }

  private init(): void {
    this.setupStyles();
  }

  private setupStyles(): void {
    if (this.pStyles.length) {
      return;
    }
    SIZES.forEach((size, i) => {
      this.pStyles.push({
        height: size,
        url: `${this.pImagePath}${(i + 1)}.${this.pImageExtension}`,
        width: size,
      });
    });
  }

  private addEventListeners(): void {
    if (!this.map) {
      return;
    }
    if (!this.pZoomChangedListener) {
      this.pZoomChangedListener = google.maps.event.addListener(this.map, 'zoom_changed', () => {
        this.getClusters();
      });
    }
    if (!this.pIdleListener) {
      this.pIdleListener = google.maps.event.addListener(this.map, 'idle', () => {
        this.getClusters();
      });
    }
  }

  private removeEventListeners(): void {
    if (this.pZoomChangedListener) {
      this.pZoomChangedListener.remove();
    }
    if (this.pIdleListener) {
      this.pIdleListener.remove();
    }
  }

  private clearFeatures(): void {
    this.dataLayer.forEach(feature => this.dataLayer.remove(feature));
  }

  private superclusterFeatureToGmapsFeature(scfeature: Supercluster.ClusterFeature<Supercluster.AnyProps> | Supercluster.PointFeature<Supercluster.AnyProps>): google.maps.Data.Feature {
    
  }
}
