import { Builder } from './builder';
import { ClustererHelper } from './helper';
import { IStyle, IOverlappingMarkerSpiderfier } from './interfaces';
import { SIZES } from './constants';
import Supercluster from 'supercluster';
import * as GeoJSON from 'geojson';

export class SuperClusterAdapter {
  private pMap: google.maps.Map;
  private pRadius: number;
  private pMinZoom: number;
  private pMaxZoom: number;
  private pStyles: IStyle[];
  private pImagePath: string;
  private pImageExtension: string;
  private pZoomOnClick: boolean;
  private pDataLayerDefault: google.maps.Data;
  private pMarkers: google.maps.Marker[];
  private pZoomChangedListener: google.maps.MapsEventListener | null = null;
  private pIdleListener: google.maps.MapsEventListener | null = null;
  private pIndex: Supercluster;
  private pointFeatures: Supercluster.PointFeature<Supercluster.AnyProps>[] = [];
  private pNonPointFeatures: google.maps.Data.Feature[] = [];
  private pCustomMarkerIcon: (pointFeature: Supercluster.PointFeature<Supercluster.AnyProps>) => string;
  private pMarkerClick: (marker: google.maps.Marker, event: google.maps.MouseEvent) => void;
  private pFeatureClick: (event: google.maps.Data.MouseEvent) => void;
  private pFeatureStyle: google.maps.Data.StylingFunction;
  private pServerSideFeatureToSuperCluster: (feature: any) => Supercluster.ClusterFeature<Supercluster.AnyProps> | Supercluster.PointFeature<Supercluster.AnyProps>;
  private pOverlapMarkerSpiderfier: IOverlappingMarkerSpiderfier | null;

  constructor(build: Builder) {
    this.pMap = build.map;
    this.pRadius = build.radius;
    this.pMaxZoom = build.maxZoom;
    this.pMinZoom = build.minZoom;
    this.pStyles = build.styles;
    this.pImagePath = build.imagePath;
    this.pImageExtension = build.imageExtension;
    this.pZoomOnClick = build.zoomOnClick;
    this.pDataLayerDefault = build.map?.data ?? new google.maps.Data();
    this.pMarkers = [];
    this.pIndex = new Supercluster({
      minZoom: this.pMinZoom,
      maxZoom: this.pMaxZoom,
      radius: this.pRadius
    });
    this.pCustomMarkerIcon = build.customMarkerIcon;
    this.pMarkerClick = build.markerClick;
    this.pFeatureClick = build.featureClick;
    this.pFeatureStyle = build.featureStyle;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.pServerSideFeatureToSuperCluster = build.serverSideFeatureToSuperCluster;
    this.pOverlapMarkerSpiderfier = build.overlapMarkerSpiderfier;
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

  get numFeatures(): number {
    return this.features.length;
  }

  get hasFeatures(): boolean {
    return this.numFeatures > 0;
  }

  get features(): Supercluster.PointFeature<Supercluster.AnyProps>[] {
    return this.pointFeatures;
  }

  /* ---- Public methods ---- */
  public setVisible(v: boolean): void {
    if (!v) {
      this.removeEventListeners();
      this.hideMarkers();
      this.pDataLayerDefault.setMap(null);
    } else {
      this.addEventListeners();
      this.showMarkers();
      this.pDataLayerDefault.setMap(this.pMap);
    }
  }

  public getFeaturesBounds(): google.maps.LatLngBounds {
    const featuresBounds = new google.maps.LatLngBounds();
    for (const nonPointFeature of this.pNonPointFeatures) {
      featuresBounds.union(ClustererHelper.featureBounds(nonPointFeature));
    }
    for (const pointFeature of this.features) {
      featuresBounds.extend({
        lat: pointFeature.geometry.coordinates[1],
        lng: pointFeature.geometry.coordinates[0]
      });
    }
    return featuresBounds;
  }

  public destroy(): void {
    this.removeEventListeners();
    this.removeFeaturesFromDataLayers();
    this.removeMarkers();
    this.pStyles = [];
    this.pNonPointFeatures = [];
    this.pointFeatures = [];
  }

  public load(geoJson: GeoJSON.FeatureCollection): void {
    if (this.pointFeatures.length || this.pNonPointFeatures.length) {
      // eslint-disable-next-line no-console
      console.error("There are loaded data in supercluster adapter already");
    }

    const otherFeaturesCollection: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: []
    };
    if (geoJson && geoJson.type === 'FeatureCollection' && geoJson.features && geoJson.features.length) {
      for (const feature of geoJson.features) {
        if (feature.type === 'Feature' && feature.geometry) {
          if (feature.geometry.type === 'Point') {
            this.pointFeatures.push(feature as Supercluster.PointFeature<Supercluster.AnyProps>);
          } else {
            otherFeaturesCollection.features.push(feature);
          }
        }
      }
    }

    this.pIndex.load(this.pointFeatures);
    this.pNonPointFeatures = this.pDataLayerDefault.addGeoJson(otherFeaturesCollection);
    this.getClusters();
    this.addEventListeners();
  }

  public drawServerSideCalculatedClusters(features: any[]): void {
    const scfeatures: (Supercluster.ClusterFeature<Supercluster.AnyProps> | Supercluster.PointFeature<Supercluster.AnyProps>)[] = [];
    if (features && features.length) {
      for (const feature of features) {
        const scfeature = this.pServerSideFeatureToSuperCluster(feature);
        scfeatures.push(scfeature);
      }
    }
    this.drawClusters(scfeatures);
  }

  /* ---- Builder pattern implementation ---- */
  static get Builder(): typeof Builder {
    return Builder;
  }

  private getClusters(): void {
    if (!this.map) {
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
      this.drawClusters(clusters);
    }
  }

  private init(): void {
    this.setupStyles();
    this.pDataLayerDefault.addListener('click', this.pFeatureClick);
    if (this.pFeatureStyle) {
      this.pDataLayerDefault.setStyle(this.pFeatureStyle);
    }
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

  private drawClusters(clusters: (Supercluster.ClusterFeature<Supercluster.AnyProps> | Supercluster.PointFeature<Supercluster.AnyProps>)[]): void {
    const mapClusters = this.getClustersMap(this.pMarkers);
    const mapMarkers = this.getMarkersMap(this.pMarkers);
    this.pMarkers.length = 0;

    for (const scfeature of clusters) {
      let marker = this.findExistingMarkerInstance(scfeature, mapClusters, mapMarkers);
      if (!marker) {
        marker = this.superclusterFeatureToGmapsMarker(scfeature);
      }
      this.pMarkers.push(marker);
    }

    // Remove the old clusters.
    for (const oCluster of mapClusters.values()) {
      oCluster.setMap(null);
    }
    for (const oMarker of mapMarkers.values()) {
      oMarker.setMap(null);
      if (this.pOverlapMarkerSpiderfier) {
        this.pOverlapMarkerSpiderfier.forgetMarker(oMarker);
      }
    }
  }

  private getClustersMap(collection: google.maps.Marker[]) {
    const res: Map<number, google.maps.Marker> = new Map<number, google.maps.Marker>();
    for (const marker of collection) {
      if (marker.get("cluster") === true) {
        res.set(marker.get("cluster_id") as number, marker);
      }
    }
    return res;
  }

  private getMarkersMap(collection: google.maps.Marker[]) {
    const res: Map<number | string, google.maps.Marker> = new Map<number | string, google.maps.Marker>();
    for (const marker of collection) {
      if (marker.get("cluster") !== true && marker.get("id")) {
        res.set(marker.get("id"), marker);
      }
    }
    return res;
  }

  private findExistingMarkerInstance(scfeature: Supercluster.ClusterFeature<Supercluster.AnyProps> | Supercluster.PointFeature<Supercluster.AnyProps>, existingClusters: Map<number, google.maps.Marker>, existingMarkers: Map<number | string, google.maps.Marker>): google.maps.Marker | undefined {
    let res;
    if (scfeature.properties.cluster === true) {
      if (existingClusters.has(scfeature.properties.cluster_id)) {
        res = existingClusters.get(scfeature.properties.cluster_id);
        existingClusters.delete(scfeature.properties.cluster_id);
      }
    } else {
      if (scfeature.properties.id && existingMarkers.has(scfeature.properties.id)) {
        res = existingMarkers.get(scfeature.properties.id);
        existingMarkers.delete(scfeature.properties.id);
      }
    }
    return res;
  }

  private clearNonPointFeatures(): void {
    for (const feature of this.pNonPointFeatures) {
      if (this.pDataLayerDefault?.contains(feature)) {
        this.pDataLayerDefault.remove(feature);
      }
    }
  }

  private superclusterFeatureToGmapsMarker(scfeature: Supercluster.ClusterFeature<Supercluster.AnyProps> | Supercluster.PointFeature<Supercluster.AnyProps>): google.maps.Marker {
    const options = this.getMarkerOptions(scfeature);
    const marker = new google.maps.Marker(options);
    this.assignAdditionalProperties(marker, scfeature);
    this.assignEventsToMarker(marker);
    return marker;
  }

  private getMarkerOptions(scfeature: Supercluster.ClusterFeature<Supercluster.AnyProps> | Supercluster.PointFeature<Supercluster.AnyProps>): google.maps.MarkerOptions {
    let options: google.maps.MarkerOptions;
    if (scfeature.properties.cluster === true) {
      options = this.getMarkerOptionsForCluster(scfeature as Supercluster.ClusterFeature<Supercluster.AnyProps>);
    } else {
      options = this.getMarkerOptionsForPoint(scfeature);
    }
    return options;
  }

  private getMarkerOptionsForCluster(scfeature: Supercluster.ClusterFeature<Supercluster.AnyProps>): google.maps.MarkerOptions {
    const options: google.maps.MarkerOptions = {
      position: new google.maps.LatLng(scfeature.geometry.coordinates[1], scfeature.geometry.coordinates[0]),
      map: this.map,
      clickable: this.pZoomOnClick,
      icon: this.getClusterIcon(scfeature),
      label: this.getClusterLabel(scfeature),
      title: `${scfeature.properties.point_count_abbreviated} positions in the cluster`,
      visible: true
    };
    return options;
  }

  private getClusterIcon(scfeature: Supercluster.ClusterFeature<Supercluster.AnyProps>): google.maps.Icon {
    const index = this.getClusterIconIndex(scfeature);
    const style: IStyle = this.styles[index];
    const width = style?.width ?? SIZES[0];
    const height = style?.height ?? SIZES[0];
    const anchorX = style?.anchor?.length ? style.anchor[0] : width / 2;
    const anchorY = style?.anchor && style?.anchor.length > 1 ? style.anchor[1] : height / 2;
    const icon = {
      scaledSize: new google.maps.Size(width, height),
      anchor: new google.maps.Point(anchorX, anchorY),
      url: style.url
    };
    return icon;
  }

  private getClusterIconIndex(scfeature: Supercluster.ClusterFeature<Supercluster.AnyProps>): number {
    let index = 0;
    let dv = scfeature.properties.point_count;
    while (dv !== 0) {
      dv = Math.floor(dv / 10);
      index++;
    }
    return Math.min(index, this.pStyles.length - 1);
  }

  private getClusterLabel(scfeature: Supercluster.ClusterFeature<Supercluster.AnyProps>): google.maps.MarkerLabel {
    const index = this.getClusterIconIndex(scfeature);
    const style: IStyle = this.styles[index];
    const label = {
      color: style?.textColor ?? 'black',
      fontFamily: style?.fontFamily ?? 'Roboto',
      fontSize: `${(style?.textSize ?? 14)}px`,
      fontWeight: style?.fontWeight ?? 'normal',
      text: `${scfeature.properties.point_count_abbreviated}`
    };
    return label;
  }

  private getMarkerOptionsForPoint(scfeature: Supercluster.PointFeature<Supercluster.AnyProps>): google.maps.MarkerOptions {
    const options: google.maps.MarkerOptions = {
      position: new google.maps.LatLng(scfeature.geometry.coordinates[1], scfeature.geometry.coordinates[0]),
      map: this.map,
      clickable: true,
      icon: {
        scaledSize: new google.maps.Size(32, 32),
        url: this.pCustomMarkerIcon(scfeature)
      },
      title: scfeature.properties.name as string ?? "",
      visible: true
    };
    return options;
  }

  private assignAdditionalProperties(marker: google.maps.Marker, scfeature: Supercluster.ClusterFeature<Supercluster.AnyProps> | Supercluster.PointFeature<Supercluster.AnyProps>): void {
    if (scfeature.id) {
      marker.set("id", scfeature.id);
    }
    if (scfeature.properties.cluster === true) {
      marker.set("cluster", true);
      marker.set("cluster_id", scfeature.properties.cluster_id);
    } else {
      if (this.pOverlapMarkerSpiderfier) {
        this.pOverlapMarkerSpiderfier.trackMarker(marker);
      }
    }
  }

  private assignEventsToMarker(marker: google.maps.Marker) {
    if (marker.getClickable()) {
      const eventName: string = this.getClickEventName(marker);
      marker.addListener(eventName, (event) => {
        if (marker.get("cluster") === true) {
          event.stop();
          const evPos = event.latLng;
          const clusterId: number = marker.get("cluster_id") as number;
          const zoom = this.pIndex.getClusterExpansionZoom(clusterId);
          this.map.setOptions({
            center: evPos,
            zoom
          });
        } else {
          this.pMarkerClick(marker, event);
        }
      });
    }
  }

  private getClickEventName(marker: google.maps.Marker): string {
    let eventName = "click";
    if (marker.get("cluster") !== true && this.pOverlapMarkerSpiderfier) {
      eventName = "spider_click";
    }
    return eventName;
  }

  private removeFeaturesFromDataLayers(): void {
    this.clearNonPointFeatures();
  }

  private hideMarkers() {
    if (this.pMarkers && this.pMarkers.length) {
      for (const marker of this.pMarkers) {
        marker.setMap(null);
      }
    }
  }

  private showMarkers(markers: google.maps.Marker[] | undefined = undefined) {
    const markerCollection = markers ?? this.pMarkers;
    if (markerCollection && markerCollection.length) {
      for (const marker of markerCollection) {
        marker.setMap(this.map);
      }
    }
  }

  private removeMarkers() {
    this.hideMarkers();
    this.pMarkers = [];
  }
}
