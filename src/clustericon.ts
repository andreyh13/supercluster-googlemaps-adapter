import { SuperClusterAdapter } from './clusterer';
import { CLASS_NAME_DEFAULT } from './constants';
import { ClustererHelper } from './helper';
import { IStyle, ISums } from './interfaces';

export class FeatureClusterIcon extends google.maps.OverlayView {
  private id: number;
  private map: google.maps.Map | null = null;
  private div: HTMLDivElement | null = null;
  private visible: boolean = false;
  private center: google.maps.LatLng | null = null;
  private sums: ISums | null = null;
  private width: number = 0;
  private height: number = 0;
  private url: string = '';
  private backgroundPosition: string = '0 0';
  private anchor: number[] | null = null;
  private textColor: string = 'black';
  private textSize: number = 11;

  constructor(map: google.maps.Map, id: number) {
    super();
    this.id = id;
    this.map = map;
    this.setMap(map);
  }

  public setSums(value: ISums): void {
    this.sums = value;
    if (this.div) {
      this.div.innerHTML = value.text;
    }
    this.useStyle_();
  }

  public setCenter(value: google.maps.LatLng) {
    this.center = value;
  }

  public hide(): void {
    if (this.div) {
      this.div.style.display = 'none';
    }
    this.visible = false;
  }

  public show(): void {
    if (this.div && this.center) {
      const pos = this.getPosFromLatLng_(this.center);
      this.div.style.cssText = this.createCss_(pos);
      this.div.style.display = '';
    }
    this.visible = true;
  }

  public remove(): void {
    this.center = null;
    this.map = null;
    this.setMap(null);
  }

  /* ---- google.maps.OverlayView interface methods ---- */
  public onAdd(): void {
    this.div = document.createElement('DIV') as HTMLDivElement;
    if (this.visible && this.center) {
      const pos = this.getPosFromLatLng_(this.center);
      this.div.style.cssText = this.createCss_(pos);
      this.div.innerHTML = this.text;
      this.div.className = this.className + ' ' + this.classId;
    }
    const panes = this.getPanes();
    panes.overlayMouseTarget.appendChild(this.div);
    google.maps.event.addDomListener(this.div, 'click', () => this.triggerClusterClick_());
  }

  public draw(): void {
    if (this.visible && this.center && this.div) {
      const pos = this.getPosFromLatLng_(this.center);
      this.div.style.top = pos.y + 'px';
      this.div.style.left = pos.x + 'px';
    }
  }

  public onRemove(): void {
    if (this.div && this.div.parentNode) {
      this.hide();
      google.maps.event.clearListeners(this.div, 'click');
      google.maps.event.clearInstanceListeners(this.div);
      this.div.parentNode.removeChild(this.div);
      this.div = null;
    }
  }
  /* ----End: google.maps.OverlayView interface methods ---- */

  private triggerClusterClick_() {
    if (this.clusterer?.isZoomOnClick && this.cluster && this.getMap()) {
      if (this.getMap() instanceof google.maps.Map) {
        (this.getMap() as google.maps.Map).fitBounds(this.cluster.getBounds(), 5);
      }
    }
  }

  private getPosFromLatLng_(latLng: google.maps.LatLng) {
    const pos = this.getProjection().fromLatLngToDivPixel(latLng);
    pos.x -= Math.floor(this.width / 2);
    pos.y -= Math.floor(this.height / 2);
    return pos;
  }

  private createCss_(pos: google.maps.Point): string {
    const style = [
      `background-image:url(${this.url});`,
      `background-size: contain;`,
      `background-position: ${this.backgroundPosition};`,
      `cursor:pointer; top: ${pos.y}px; left: ${pos.x}px; color: ${this.textColor};`,
      `position:absolute; font-size: ${this.textSize}px; font-family: Roboto,Arial,sans-serif; font-weight: bold;`,
    ];
    if (this.hasAnchor) {
      if (this.anchorH > 0 && this.anchorH < this.height) {
        style.push(`height: ${this.height - this.anchorH}px; padding-top: ${this.anchorH}px;`);
      } else {
        style.push(`height: ${this.height}px; line-height: ${this.height}px;`);
      }
      if (this.anchorW > 0 && this.anchorW < this.width) {
        style.push(`width: ${this.width - this.anchorW}px; padding-left: ${this.anchorW}px;`);
      } else {
        style.push(`width: ${this.width}px; text-align: center;`);
      }
    } else {
      style.push(
        `height: ${this.height}px; line-height: ${this.height}px; width: ${this.width}px; text-align: center;`,
      );
    }
    return style.join('');
  }

  private useStyle_(): void {
    let index = Math.max(0, this.index - 1);
    if (this.styles?.length) {
      index = Math.min(this.styles.length - 1, index);
      const style: IStyle = this.styles[index];
      this.url = style.url;
      this.height = style.height;
      this.width = style.width;
      this.textColor = style.textColor || 'black';
      this.anchor = style.anchor ?? null;
      this.textSize = style.textSize || 11;
      this.backgroundPosition = style.backgroundPosition || '0 0';
    }
  }

  get className(): string {
    return this.clusterer?.className ?? CLASS_NAME_DEFAULT;
  }

  get classId(): string {
    return `${this.className}-${this.id}`;
  }

  get clusterer(): SuperClusterAdapter | undefined {
    return (this.map && ClustererHelper.getClusterer(this.map)) ?? undefined;
  }

  get cluster() {
    return this.clusterer?.clusters.find(cluster => cluster.getId() === this.id);
  }

  get styles(): IStyle[] {
    return this.clusterer?.styles ?? [];
  }

  get padding(): number {
    return this.clusterer?.gridSize ?? 0;
  }

  get text(): string {
    return this.sums?.text ?? '';
  }

  get index(): number {
    return this.sums?.index ?? 0;
  }

  get hasAnchor() {
    return this.anchor !== null && this.anchor.length > 1;
  }

  get anchorH() {
    if (this.hasAnchor) {
      return this.anchor?.[0] ?? 0;
    }
    return 0;
  }

  get anchorW() {
    if (this.hasAnchor) {
      return this.anchor?.[1] ?? 0;
    }
    return 0;
  }
}
