import { SuperClusterAdapter } from './clusterer';
import {
  RADIUS_DEFAULT,
  MARKER_CLUSTER_IMAGE_EXTENSION,
  MARKER_CLUSTER_IMAGE_PATH_DEFAULT,
  MAX_ZOOM_DEFAULT,
  MIN_ZOOM_DEFAULT,
  ICON_URL_DEFAULT
} from './constants';
import { ClustererHelper } from './helper';
import { IStyle } from './interfaces';
import Supercluster from 'supercluster';

export class Builder {
  private pMap: google.maps.Map;
  private pRadius: number = RADIUS_DEFAULT;
  private pMaxZoom: number = MAX_ZOOM_DEFAULT;
  private pMinZoom: number = MIN_ZOOM_DEFAULT;
  private pStyles: IStyle[] = [];
  private pImagePath: string = MARKER_CLUSTER_IMAGE_PATH_DEFAULT;
  private pImageExtension: string = MARKER_CLUSTER_IMAGE_EXTENSION;
  private pZoomOnClick = true;
  private pCustomMarkerIcon: (pointFeature: Supercluster.PointFeature<Supercluster.AnyProps>) => string;
  private pMarkerClick: (marker: google.maps.Marker, event: google.maps.MouseEvent) => void;
  private pFeatureClick: (event: google.maps.Data.MouseEvent) => void;
  private pFeatureStyle: google.maps.Data.StylingFunction;
  private pServerSideFeatureToSuperCluster: (feature: any) => Supercluster.ClusterFeature<Supercluster.AnyProps> | Supercluster.PointFeature<Supercluster.AnyProps>;

  constructor(map: google.maps.Map) {
    this.pMap = map;
    this.pCustomMarkerIcon = (pointFeature: Supercluster.PointFeature<Supercluster.AnyProps>) => {
      if (pointFeature.properties.iconUrl) {
        return pointFeature.properties.iconUrl as string;
      }
      return ICON_URL_DEFAULT;
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.pMarkerClick = (marker: google.maps.Marker, event: google.maps.MouseEvent) => {
      return;
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.pFeatureClick = (event: google.maps.Data.MouseEvent) => {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.pFeatureStyle = (feature: google.maps.Data.Feature) => {
      return Object.create(null) as google.maps.Data.StyleOptions;
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.pServerSideFeatureToSuperCluster = (feature: any) => {
      const scfeature: Supercluster.PointFeature<Supercluster.AnyProps> = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        },
        properties: {}
      };
      return scfeature;
    };
  }

  public withRadius(radius: number): Builder {
    this.pRadius = radius;
    return this;
  }

  public withMaxZoom(maxZoom: number): Builder {
    this.pMaxZoom = maxZoom;
    return this;
  }

  public withMinZoom(minZoom: number): Builder {
    this.pMinZoom = minZoom;
    return this;
  }

  public withStyles(styles: IStyle[]): Builder {
    this.pStyles = styles;
    return this;
  }

  public withImagePath(imagePath: string): Builder {
    this.pImagePath = imagePath;
    return this;
  }

  public withImageExtension(imageExtension: string): Builder {
    this.pImageExtension = imageExtension;
    return this;
  }

  public withZoomOnClick(zoomOnClick: boolean): Builder {
    this.pZoomOnClick = zoomOnClick;
    return this;
  }

  public withCustomMarkerIcon(customIcon: (pointFeature: Supercluster.PointFeature<Supercluster.AnyProps>) => string): Builder {
    this.pCustomMarkerIcon = customIcon as (pointFeature: Supercluster.PointFeature<Supercluster.AnyProps>) => string;
    return this;
  }

  public withMarkerClick(markerClick: (marker: google.maps.Marker, event: google.maps.MouseEvent) => void): Builder {
    this.pMarkerClick = markerClick;
    return this;
  }

  public withFeatureClick(featureClick: (event: google.maps.Data.MouseEvent) => void): Builder {
    this.pFeatureClick = featureClick;
    return this;
  }

  public withFeatureStyle(featureStyle: google.maps.Data.StylingFunction): Builder {
    this.pFeatureStyle = featureStyle;
    return this;
  }

  public withServerSideFeatureToSuperCluster(transform: (feature: any) => Supercluster.ClusterFeature<Supercluster.AnyProps> | Supercluster.PointFeature<Supercluster.AnyProps>): Builder {
    this.pServerSideFeatureToSuperCluster = transform;
    return this;
  }

  public build(): SuperClusterAdapter {
    const clusterer = new SuperClusterAdapter(this);
    ClustererHelper.setClusterer(this.pMap, clusterer);
    return clusterer;
  }

  get map(): google.maps.Map {
    return this.pMap;
  }

  get radius(): number {
    return this.pRadius ?? RADIUS_DEFAULT;
  }

  get maxZoom(): number {
    return this.pMaxZoom ?? MAX_ZOOM_DEFAULT;
  }

  get minZoom(): number {
    return this.pMinZoom ?? MIN_ZOOM_DEFAULT;
  }

  get styles(): IStyle[] {
    return this.pStyles ?? [];
  }

  get imagePath(): string {
    return this.pImagePath ?? MARKER_CLUSTER_IMAGE_PATH_DEFAULT;
  }

  get imageExtension(): string {
    return this.pImageExtension ?? MARKER_CLUSTER_IMAGE_EXTENSION;
  }

  get zoomOnClick(): boolean {
    return this.pZoomOnClick ?? true;
  }

  get customMarkerIcon(): (pointFeature: Supercluster.PointFeature<Supercluster.AnyProps>) => string {
    return this.pCustomMarkerIcon;
  }

  get markerClick(): (marker: google.maps.Marker, event: google.maps.MouseEvent) => void {
    return this.pMarkerClick;
  }

  get featureClick(): (event: google.maps.Data.MouseEvent) => void {
    return this.pFeatureClick;
  }

  get featureStyle(): google.maps.Data.StylingFunction {
    return this.pFeatureStyle;
  }

  get serverSideFeatureToSuperCluster(): (feature: any) => Supercluster.ClusterFeature<Supercluster.AnyProps> | Supercluster.PointFeature<Supercluster.AnyProps> {
    return this.pServerSideFeatureToSuperCluster;
  }
}
