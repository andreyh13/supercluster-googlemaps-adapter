export interface ISums {
  text: string;
  index: number;
}

export interface IStyle {
  url: string;
  height: number;
  width: number;
  textColor?: string;
  anchor?: number[] | null;
  textSize?: number;
  backgroundPosition?: string;
}

export interface IDimension {
  xsize: number;
  ysize: number;
}
