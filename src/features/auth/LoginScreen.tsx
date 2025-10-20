import React, { useState } from 'react';
import { YStack, H2, Paragraph, Input, Button, XStack } from 'tamagui';
import { gql, useMutation } from '@apollo/client';
import { useSessionStore } from '@/state/session';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/navigation/types';

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      tokens { accessToken refreshToken }
      user { id username name avatarUrl }
    }
  }
`;

export default function LoginScreen({ navigation }: NativeStackScreenProps<AuthStackParamList, 'Login'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loginMutation, { loading }] = useMutation(LOGIN_MUTATION);
  const login = useSessionStore((s) => s.login);

  async function onSubmit() {
    setError(null);
    if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
      setError('Please enter a valid email');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    try {
      const { data } = await loginMutation({ variables: { email, password } });
      const payload = data?.login;
      if (payload) {
        await login(payload.user, payload.tokens);
      }
    } catch (e: any) {
      setError(e?.message || 'Login failed');
    }
  }

  return (
    <YStack f={1} p="$4" gap="$3">
      <H2>Login</H2>
      {error ? <Paragraph color="$red10">{error}</Paragraph> : null}
      <Input placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <Input placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button disabled={loading} onPress={onSubmit}>Sign In</Button>
      <XStack gap="$2">
        <Paragraph>New here?</Paragraph>
        <Button variant="outlined" onPress={() => navigation.navigate('SignUp')}>Create an account</Button>
      </XStack>
    </YStack>
  );
}
