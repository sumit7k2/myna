# Performance hygiene

This project includes some performance-focused defaults:

- FlashList usage with keyExtractor and estimatedItemSize set
- Memoized `renderItem` callbacks to avoid re-renders
- Background image prefetch with `expo-image` to improve scroll performance
- Cached images via a tiny `<CachedImage />` component that uses disk cache by default

## FlashList best practices

- Always set `estimatedItemSize`
- Provide a stable `keyExtractor`
- Memoize `renderItem` with `useCallback`
- Avoid heavy inline functions/closures in list rows; use memoized components when possible

See `FeedList.tsx` and `NotificationsScreen.tsx` for examples.

## Image prefetching and caching

- Use `usePrefetchImages([...uris])` to pre-warm the cache for content you know you'll need soon
- Use the `<CachedImage />` component for images; it sets `cachePolicy="disk"` and `contentFit="cover"`

See `src/hooks/prefetch.ts` and `src/components/CachedImage.tsx`.
