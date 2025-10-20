import React, { useState } from 'react';
import { YStack, H2, Paragraph, Button, Image as TImage } from 'tamagui';
import * as ImagePicker from 'expo-image-picker';

export default function ComposeScreen() {
  const [image, setImage] = useState<string | null>(null);

  async function pickImage() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!res.canceled) {
      setImage(res.assets[0]?.uri ?? null);
    }
  }

  return (
    <YStack f={1} p="$4" gap="$3">
      <H2>Compose</H2>
      <Paragraph>Write something or add an image.</Paragraph>
      <Button onPress={pickImage}>Pick image</Button>
      {image ? (
        <TImage source={{ uri: image }} width={200} height={200} resizeMode="cover" />
      ) : null}
    </YStack>
  );
}
