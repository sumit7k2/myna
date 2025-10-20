import * as Notifications from 'expo-notifications';

export async function requestNotificationPermission() {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.status !== 'granted') {
    await Notifications.requestPermissionsAsync();
  }
}
