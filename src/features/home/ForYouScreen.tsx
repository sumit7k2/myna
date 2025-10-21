import React from 'react';
import FeedList from '@/features/feed/FeedList';

export default function ForYouScreen() {
  return <FeedList testID="forYou-feed" feedType="forYou" />;
}
