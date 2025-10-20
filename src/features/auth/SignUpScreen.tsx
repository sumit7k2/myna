import React, { useState } from 'react';
import { YStack, H2, Paragraph, Input, Button } from 'tamagui';
import { gql, useMutation } from '@apollo/client';
import { useSessionStore } from '@/state/session';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/navigation/types';

const SIGNUP_MUTATION = gql`
  mutation SignUp($email: String!, $password: String!, $name: String!) {
    signup(email: $email, password: $password, name: $name) {
      tokens { accessToken refreshToken }
      user { id username name avatarUrl }
    }
  }
`;

export default function SignUpScreen({ navigation }: NativeStackScreenProps<AuthStackParamList, 'SignUp'>) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [signUpMutation, { loading }] = useMutation(SIGNUP_MUTATION);
  const signup = useSessionStore((s) => s.signup);

  async function onSubmit() {
    setError(null);
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
      setError('Please enter a valid email');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    try {
      const { data } = await signUpMutation({ variables: { name: name.trim(), email, password } });
      const payload = data?.signup;
      if (payload) {
        await signup(payload.user, payload.tokens);
      }
    } catch (e: any) {
      setError(e?.message || 'Sign up failed');
    }
  }

  return (
    <YStack f={1} p="$4" gap="$3">
      <H2>Sign Up</H2>
      {error ? <Paragraph color="$red10">{error}</Paragraph> : null}
      <Input placeholder="Name" value={name} onChangeText={setName} />
      <Input placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <Input placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button disabled={loading} onPress={onSubmit}>Create Account</Button>
      <Button variant="outlined" onPress={() => navigation.goBack()}>Back to Login</Button>
    </YStack>
  );
}
