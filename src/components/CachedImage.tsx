import React from 'react';
import { Image } from 'expo-image';
import type { ImageProps } from 'expo-image';

export type CachedImageProps = ImageProps & {
  uri: string;
  width?: number;
  height?: number;
};

export default function CachedImage({ uri, width, height, style, ...rest }: CachedImageProps) {
  return (
    <Image
      source={{ uri }}
      style={[{ width, height, borderRadius: 6 }, style as any]}
      contentFit="cover"
      cachePolicy="disk"
      {...rest}
    />
  );
}
