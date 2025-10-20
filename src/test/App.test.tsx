import React from 'react';
import { render } from '@testing-library/react-native';
import App from '@/App';

describe('App', () => {
  it('renders', () => {
    const { getByText } = render(<App />);
    expect(getByText('Home')).toBeTruthy();
  });
});
