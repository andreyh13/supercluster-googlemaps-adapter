import { SuperClusterAdapter } from './clusterer';
import {
  CLASS_NAME_DEFAULT,
  RADIUS_DEFAULT,
  MARKER_CLUSTER_IMAGE_EXTENSION,
  MARKER_CLUSTER_IMAGE_PATH_DEFAULT,
  MAX_ZOOM_DEFAULT,
  MIN_ZOOM_DEFAULT,
  MIN_CLUSTER_SIZE_DEFAULT,
} from './constants';
import { ClustererHelper } from './helper';
import { IStyle } from './interfaces';

export class Builder {
  private pMap: google.maps.Map;
  private pRadius: number = RADIUS_DEFAULT;
  private pMinClusterSize: number = MIN_CLUSTER_SIZE_DEFAULT;
  private pMaxZoom: number = MAX_ZOOM_DEFAULT;
  private pMinZoom: number = MIN_ZOOM_DEFAULT;
  private pClassName: string = CLASS_NAME_DEFAULT;
  private pStyles: IStyle[] = [];
  private pImagePath: string = MARKER_CLUSTER_IMAGE_PATH_DEFAULT;
  private pImageExtension: string = MARKER_CLUSTER_IMAGE_EXTENSION;
  private pZoomOnClick = true;

  constructor(map: google.maps.Map) {
    this.pMap = map;
  }

  public withRadius(radius: number): Builder {
    this.pRadius = radius;
    return this;
  }

  public withMinClusterSize(minClusterSize: number): Builder {
    this.pMinClusterSize = minClusterSize;
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

  public withClassName(className: string): Builder {
    this.pClassName = className;
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

  get minClusterSize(): number {
    return this.pMinClusterSize ?? MIN_CLUSTER_SIZE_DEFAULT;
  }

  get maxZoom(): number {
    return this.pMaxZoom ?? MAX_ZOOM_DEFAULT;
  }

  get minZoom(): number {
    return this.pMinZoom ?? MIN_ZOOM_DEFAULT;
  }

  get className(): string {
    return this.pClassName ?? CLASS_NAME_DEFAULT;
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
}
