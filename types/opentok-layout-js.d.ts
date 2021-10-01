declare module 'opentok-layout-js' {
  type alignOptions = 'start' | 'center' | 'end';

  export type Options = {
    alignItems?: alignOptions;
    animate?: boolean;
    bigAlignItems?: alignOptions;
    bigClass?: string;
    bigFirst?: boolean | 'column' | 'row';
    bigFixedRatio?: boolean;
    bigMaxHeight?: number;
    bigMaxRatio?: number;
    bigMaxWidth?: number;
    bigMinRatio?: number;
    bigPercentage?: number;
    minBigPercentage?: number;
    fixedRatio?: boolean;
    ignoreClass?: string;
    maxHeight?: number;
    maxRatio?: number;
    maxWidth?: number;
    minRatio?: number;
    containerWidth?: number;
    containerHeight?: number;
    smallAlignItems?: alignOptions;
    smallMaxHeight?: number;
    smallMaxWidth?: number;
    scaleLastRow?: boolean;
    bigScaleLastRow?: boolean;
    onLayout?: (element: HTMLElement, dimensions: { width: number, height: number, top: number, left: number }) => void,
    window?: Window;
  };

  type Element = {
    big: boolean;
    height: number;
    width: number;
  };

  type Box = {
    height: number;
    left: number;
    top: number;
    width: number;
  };

  type GetLayout = (elements: Array<Element>) => Array<Box>;

  export type LayoutContainer = {
    getLayout: GetLayout;
    layout: () => void;
  };

  export default function initLayoutContainer(...args: [HTMLElement | string, Options] | [Options]): LayoutContainer;
}
