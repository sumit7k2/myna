import React, { useMemo, useState } from 'react';
import { YStack, H2, Paragraph, Button, XStack } from 'tamagui';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useSessionStore } from '@/state/session';

const GET_TOPICS = gql`
  query GetTopics { topics { id name slug } }
`;

const SAVE_TOPICS = gql`
  mutation SaveUserTopics($topicIds: [ID!]!) { saveUserTopics(topicIds: $topicIds) }
`;

export default function OnboardingScreen() {
  const { data } = useQuery(GET_TOPICS);
  const topics = useMemo(() => data?.topics ?? [], [data]);
  const [selected, setSelected] = useState<string[]>([]);
  const [mutate, { loading }] = useMutation(SAVE_TOPICS);
  const complete = useSessionStore((s) => s.completeOnboarding);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function onSave() {
    await mutate({ variables: { topicIds: selected } });
    complete();
  }

  return (
    <YStack f={1} p="$4" gap="$3">
      <H2>Choose your topics</H2>
      <Paragraph>Select at least one topic you're interested in.</Paragraph>
      {topics.map((t: any) => (
        <XStack key={t.id} ai="center" gap="$2">
          <Button size="$3" variant={selected.includes(t.id) ? 'active' : undefined} onPress={() => toggle(t.id)}>
            {selected.includes(t.id) ? 'Selected' : 'Select'}
          </Button>
          <Paragraph>{t.name}</Paragraph>
        </XStack>
      ))}
      <Button disabled={loading || selected.length === 0} onPress={onSave}>Continue</Button>
    </YStack>
  );
}
