# Deep linking: posts and profiles

This app is configured to support deep linking into posts and user profiles from both universal/app links.

What works out of the box
- App scheme: expotsstarter://
- Universal link domain (example): https://expo-ts-starter.example
- Supported routes:
  - Post detail: /post/:id (aliases: /posts/:id, /p/:id)
  - User profile: /user/:username (aliases: /users/:username, /u/:username, /profile/:username, /profiles/:username)
  - Tabs: /home, /topics, /notifications, /profile

Implementation overview
- src/navigation/linking.ts exports a React Navigation linking config and small helpers:
  - extractPathFromUrl(url): normalizes http(s) and custom scheme URLs
  - parseDeepLink(url): parses into a route target
  - handleDeepLink(url, { resolvers, fallbackTab }): resolves a route target and optionally falls back to a tab (default: Home) when content doesn’t exist
- A custom getStateFromPath is provided to support the alias paths above while keeping the default behavior for other routes.

Associations and platform setup (placeholder)
- iOS: Add Associated Domains entitlements for your domain (e.g. applinks:your.domain). Configure the app scheme (already set to expotsstarter in app.config.ts). Add apple-app-site-association on your domain.
- Android: Add intent filters for VIEW with autoVerify=true for your domain and for your app scheme. Host the assetlinks.json file on your domain.
- Web: Ensure your router and server produce the same paths (e.g. /post/:id and /user/:username) or redirect your aliases to canonical paths.

Testing deep links
- Unit tests: See src/test/linkingHelpers.test.ts for coverage of URL parsing and fallback behavior.
- Manual testing with Expo:
  - npx uri-scheme open expotsstarter://post/123 --ios
  - npx uri-scheme open expotsstarter://u/jdoe --android
  - open https://expo-ts-starter.example/post/123 on a device where your app is associated

Customization
- Update deepLinkPrefixes in src/navigation/linking.ts to match your domains.
- If you want different fallback behavior, pass fallbackTab to handleDeepLink or adjust the logic.
- If you introduce new alias paths, extend parseDeepLink accordingly.
