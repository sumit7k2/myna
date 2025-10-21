import { ROOT_TABS, ROOT_STACK_SCREENS, AUTH_STACK_SCREENS, ONBOARDING_SCREENS } from '@/navigation/RootNavigator';
import { linking, deepLinkPrefixes } from '@/navigation/linking';

describe('Navigator tree', () => {
  it('matches snapshot for structure, tabs, and linking', () => {
    const shape = {
      rootStack: ROOT_STACK_SCREENS,
      authStack: AUTH_STACK_SCREENS,
      onboarding: ONBOARDING_SCREENS,
      tabs: ROOT_TABS,
      linking: {
        prefixes: deepLinkPrefixes,
        config: linking.config,
      },
    };
    expect(shape).toMatchInlineSnapshot(`
      Object {
        "authStack": Array [
          "Login",
          "SignUp",
        ],
        "linking": Object {
          "config": Object {
            "screens": Object {
              "Compose": "compose",
              "Login": "login",
              "Onboarding": "onboarding",
              "PostDetail": "post/:id",
              "RootTabs": Object {
                "screens": Object {
                  "Home": "home",
                  "Notifications": "notifications",
                  "Profile": "profile",
                  "Topics": "topics",
                },
              },
              "Settings": "settings",
              "SignUp": "signup",
              "UserProfile": "user/:username",
            },
          },
          "prefixes": Array [
            "expotsstarter://",
            "https://expo-ts-starter.example",
          ],
        },
        "onboarding": Array [
          "Onboarding",
        ],
        "rootStack": Array [
          "RootTabs",
          "Compose",
          "PostDetail",
          "UserProfile",
          "Settings",
        ],
        "tabs": Array [
          "Home",
          "Topics",
          "ComposeTrigger",
          "Notifications",
          "Profile",
        ],
      }
    `);
  });
});
