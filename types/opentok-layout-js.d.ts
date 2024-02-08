declare module 'opentok-layout-js' {
  type alignOptions = 'start' | 'center' | 'end';

  export type AnimateProps = { duration: number, easing: string, complete?: () => void }
  export type Animate = boolean | AnimateProps
  export type OnLayout = (element: HTMLElement, dimensions: { width: number, height: number, top: number, left: number }) => void

  export type Options = {
    alignItems?: alignOptions;
    animate?: Animate;
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
    fixedRatioClass?: string;
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
    evenRows?: boolean;
    onLayout?: OnLayout,
    window?: Window;
  };

  export type Element = {
    big: boolean;
    height: number;
    width: number;
    fixedRatio?: boolean;
  };

  export type Box = {
    height: number;
    left: number;
    top: number;
    width: number;
  };

  export type GetLayoutRes = { boxes: Array<Box>, areas: { small?: Box, big?: Box } }

  type GetLayout = (elements: Array<Element>) => GetLayoutRes;

  export type LayoutContainer = {
    getLayout: GetLayout;
    layout: () => void;
  };

  export default function initLayoutContainer(...args: [HTMLElement | string, Options] | [Options]): LayoutContainer;
}
