declare module "react-lazy-load-image-component" {
  import type { ComponentType, ImgHTMLAttributes, ReactElement } from "react";

  export type LazyLoadImageProps = ImgHTMLAttributes<HTMLImageElement> & {
    src: string;
    threshold?: number;
    useIntersectionObserver?: boolean;
    placeholder?: ReactElement;
  };

  export const LazyLoadImage: ComponentType<LazyLoadImageProps>;
}
