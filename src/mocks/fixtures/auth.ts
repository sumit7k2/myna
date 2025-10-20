export const sampleUser = {
  id: 'u1',
  username: 'jdoe',
  name: 'John Doe',
  avatarUrl: 'https://i.pravatar.cc/100?img=1'
};

export let accessToken = 'access-token-123';
export let refreshToken = 'refresh-token-abc';

export function rotateAccessToken() {
  accessToken = `access-token-${Math.random().toString(36).slice(2)}`;
  return accessToken;
}
