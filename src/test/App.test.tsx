import React from 'react';
import { render } from '@testing-library/react-native';
import App from '@/App';

describe('App', () => {
  it('renders auth flow by default', async () => {
    const { findByText } = render(<App />);
    expect(await findByText('Login')).toBeTruthy();
  });
});
