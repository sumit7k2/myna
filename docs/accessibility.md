# Accessibility guidelines

We strive for accessible defaults:

- Provide `accessibilityRole` and `accessibilityLabel` on interactive elements (e.g., Pressable, custom buttons)
- Use semantic Tamagui components where possible; RN Buttons already expose accessible semantics
- Ensure key UI actions are reachable without fine motor control
- Verify dynamic type scaling works with system preferences — avoid fixed font sizes where possible

## Current coverage

- Post cards and notification items expose clear `accessibilityLabel`s and appropriate `accessibilityRole="button"`
- Compose input has an `accessibilityLabel`
- Lists group content with headings and clear sections

If you add new components:

- Always consider a meaningful `accessibilityLabel`
- Include roles where the semantics are not obvious
- Prefer scalable text styles; avoid absolute pixel text sizes for long-form content
