import { ROOT_TABS, ROOT_STACK_SCREENS } from '@/navigation/RootNavigator';
import { linking, deepLinkPrefixes } from '@/navigation/linking';

describe('Navigator tree', () => {
  it('matches snapshot for structure, tabs, and linking', () => {
    const shape = {
      rootStack: ROOT_STACK_SCREENS,
      tabs: ROOT_TABS,
      linking: {
        prefixes: deepLinkPrefixes,
        config: linking.config,
      },
    };
    expect(shape).toMatchInlineSnapshot(`
      Object {
        "linking": Object {
          "config": Object {
            "screens": Object {
              "Compose": "compose",
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
            },
          },
          "prefixes": Array [
            "expotsstarter://",
            "https://expo-ts-starter.example",
          ],
        },
        "rootStack": Array [
          "RootTabs",
          "Compose",
          "PostDetail",
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
