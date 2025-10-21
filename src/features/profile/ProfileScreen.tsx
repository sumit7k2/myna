import React, { useMemo, useState } from 'react';
import { YStack, H2, Paragraph, Button, XStack, SizableText, Separator } from 'tamagui';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useSessionStore } from '@/state/session';

const GET_USER = gql`
  query GetUser($username: String!) {
    user(username: $username) {
      id
      username
      name
      bio
      followersCount
      followingCount
      viewerIsFollowing
    }
  }
`;

const TOGGLE_FOLLOW = gql`
  mutation ToggleFollow($userId: ID!) {
    toggleFollow(userId: $userId) {
      id
      viewerIsFollowing
      followersCount
    }
  }
`;

export function UserProfileView({ username }: { username: string }) {
  const { data, loading } = useQuery(GET_USER, { variables: { username } });
  const user = data?.user;
  const [toggle] = useMutation(TOGGLE_FOLLOW);
  const [activeTab, setActiveTab] = useState<'posts' | 'threads' | 'collections'>('posts');

  if (loading && !user) {
    return (
      <YStack f={1} p="$4">
        <Paragraph>Loading…</Paragraph>
      </YStack>
    );
  }

  if (!user) {
    return (
      <YStack f={1} p="$4">
        <Paragraph>User not found</Paragraph>
      </YStack>
    );
  }

  const onToggleFollow = () => {
    toggle({
      variables: { userId: user.id },
      optimisticResponse: {
        toggleFollow: {
          __typename: 'User',
          id: user.id,
          viewerIsFollowing: !user.viewerIsFollowing,
          followersCount: user.followersCount + (user.viewerIsFollowing ? -1 : 1)
        }
      }
    });
  };

  return (
    <YStack f={1} p="$4" gap="$3">
      <H2>{user.name}</H2>
      <Paragraph>@{user.username}</Paragraph>
      {user.bio ? <Paragraph>{user.bio}</Paragraph> : null}
      <XStack ai="center" gap="$3">
        <SizableText testID="followers-count">{user.followersCount} Followers</SizableText>
        <SizableText>{user.followingCount} Following</SizableText>
      </XStack>

      <XStack gap="$2">
        {/* Follow button only for other users; parent decides */}
        <FollowButton
          following={user.viewerIsFollowing}
          onPress={onToggleFollow}
        />
        <Button testID="share-profile" onPress={() => console.log('share', user.username)}>
          Share
        </Button>
      </XStack>

      <Separator />
      <XStack gap="$2">
        <Button testID="tab-posts" size="$2" onPress={() => setActiveTab('posts')}>
          Posts
        </Button>
        <Button testID="tab-threads" size="$2" onPress={() => setActiveTab('threads')}>
          Threads
        </Button>
        <Button testID="tab-collections" size="$2" onPress={() => setActiveTab('collections')}>
          Collections
        </Button>
      </XStack>
      <YStack testID="tab-content">
        {activeTab === 'posts' && <Paragraph>Posts tab</Paragraph>}
        {activeTab === 'threads' && <Paragraph>Threads tab</Paragraph>}
        {activeTab === 'collections' && <Paragraph>Collections tab</Paragraph>}
      </YStack>
    </YStack>
  );
}

function FollowButton({ following, onPress }: { following: boolean; onPress: () => void }) {
  const label = following ? 'Unfollow' : 'Follow';
  return (
    <Button testID="follow-btn" accessibilityLabel={label} onPress={onPress}>
      {following ? 'Following' : 'Follow'}
    </Button>
  );
}

export default function ProfileScreen() {
  const me = useSessionStore((s) => s.user);
  const username = useMemo(() => me?.username ?? 'jdoe', [me?.username]);

  // For the self profile, show edit button instead of follow
  const { data } = useQuery(GET_USER, { variables: { username } });
  const user = data?.user;

  return (
    <YStack f={1} p="$4" gap="$3">
      {user ? (
        <>
          <H2>{user.name}</H2>
          <Paragraph>@{user.username}</Paragraph>
          {user.bio ? <Paragraph>{user.bio}</Paragraph> : null}
          <XStack ai="center" gap="$3">
            <SizableText testID="followers-count">{user.followersCount} Followers</SizableText>
            <SizableText>{user.followingCount} Following</SizableText>
          </XStack>
          <XStack gap="$2">
            <Button testID="edit-profile" onPress={() => console.log('edit-profile')}>
              Edit Profile
            </Button>
            <Button testID="share-profile" onPress={() => console.log('share', user.username)}>
              Share
            </Button>
          </XStack>
          <Separator />
          <XStack gap="$2">
            <Button size="$2">Posts</Button>
            <Button size="$2">Threads</Button>
            <Button size="$2">Collections</Button>
          </XStack>
        </>
      ) : (
        <Paragraph>Loading…</Paragraph>
      )}
    </YStack>
  );
}
