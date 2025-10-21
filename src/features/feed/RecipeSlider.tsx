import React from 'react';
import { Modal } from 'react-native';
import { YStack, XStack, Button, Paragraph } from 'tamagui';
import { useRecipeStore } from '@/state/recipe';

export default function RecipeSlider() {
  const slider = useRecipeStore((s) => s.slider);
  const close = useRecipeStore((s) => s.closeSlider);
  const next = useRecipeStore((s) => s.next);
  const prev = useRecipeStore((s) => s.prev);
  const entities = useRecipeStore((s) => s.entities);

  const currentId = slider.ids[slider.index];
  const current = currentId ? entities[currentId] : undefined;

  return (
    <Modal visible={slider.open} onRequestClose={close} animationType="slide" presentationStyle="fullScreen">
      <YStack f={1} p="$4" gap="$3" bg="$bg">
        <XStack ai="center" jc="space-between">
          <Button onPress={close}>Close</Button>
          <Paragraph>
            {slider.index + 1}/{Math.max(slider.ids.length, 1)}
          </Paragraph>
        </XStack>
        <YStack f={1} jc="center" ai="center" gap="$3">
          <Paragraph>{current?.title || current?.content || 'No content'}</Paragraph>
        </YStack>
        <XStack ai="center" jc="space-between">
          <Button onPress={prev} accessibilityLabel="Previous">
            Prev
          </Button>
          <Button onPress={next} accessibilityLabel="Next">
            Next
          </Button>
        </XStack>
      </YStack>
    </Modal>
  );
}
