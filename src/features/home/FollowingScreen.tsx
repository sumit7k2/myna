import React from 'react';
import FeedList from '@/features/feed/FeedList';

export default function FollowingScreen() {
  return <FeedList testID="following-feed" feedType="following" />;
}
