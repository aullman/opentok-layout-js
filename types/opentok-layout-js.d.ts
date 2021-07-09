declare module 'opentok-layout-js' {
  type alignOptions = 'start' | 'center' | 'end';

  export type Options = {
    alignItems?: alignOptions;
    animate?: boolean;
    bigAlignItems?: alignOptions;
    bigClass?: string;
    bigFirst?: boolean | 'column' | 'row';
    bigFixedRatio?: false;
    bigMaxHeight?: number;
    bigMaxRatio?: number;
    bigMaxWidth?: number;
    bigMinRatio?: number;
    bigPercentage?: number;
    fixedRatio?: boolean;
    ignoreClass?: string;
    maxHeight?: number;
    maxRatio?: number;
    maxWidth?: number;
    minRatio?: number;
    smallAlignItems?: alignOptions;
    smallMaxHeight?: number;
    smallMaxWidth?: number;
    scaleLastRow?: boolean;
    bigScaleLastRow?: boolean;
    onLayout?: Function,
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

  export default function initLayoutContainer(
    container: HTMLElement | string,
    opts: Options
  ): LayoutContainer;
}
