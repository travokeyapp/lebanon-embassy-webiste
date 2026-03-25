import { getImageProps, type ImageProps } from "next/image";

export default function HydrationSafeImage(props: ImageProps) {
  const { props: imageProps } = getImageProps(props);

  return <img {...imageProps} suppressHydrationWarning />;
}
