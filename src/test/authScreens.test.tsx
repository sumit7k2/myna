import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import App from '@/App';

describe('Auth screens', () => {
  it('validates login form and logs in', async () => {
    const { findByPlaceholderText, findByText, getByText } = render(<App />);

    const emailInput = await findByPlaceholderText('Email');
    const passwordInput = await findByPlaceholderText('Password');

    await act(async () => {
      fireEvent.changeText(emailInput, 'invalid');
      fireEvent.changeText(passwordInput, '123');
      fireEvent.press(getByText('Sign In'));
    });

    expect(await findByText('Please enter a valid email')).toBeTruthy();

    await act(async () => {
      fireEvent.changeText(emailInput, 'user@example.com');
      fireEvent.changeText(passwordInput, '123456');
      fireEvent.press(getByText('Sign In'));
    });

    expect(await findByText('Choose your topics')).toBeTruthy();
  });

  it('navigates to sign up and validates', async () => {
    const { findByText, findByPlaceholderText, getByText } = render(<App />);

    await act(async () => {
      fireEvent.press(getByText('Create an account'));
    });

    expect(await findByText('Sign Up')).toBeTruthy();

    const nameInput = await findByPlaceholderText('Name');
    const emailInput = await findByPlaceholderText('Email');
    const passwordInput = await findByPlaceholderText('Password');

    await act(async () => {
      fireEvent.changeText(nameInput, '');
      fireEvent.changeText(emailInput, 'user@example.com');
      fireEvent.changeText(passwordInput, '123456');
      fireEvent.press(getByText('Create Account'));
    });

    expect(await findByText('Name is required')).toBeTruthy();

    await act(async () => {
      fireEvent.changeText(nameInput, 'Alice');
      fireEvent.press(getByText('Create Account'));
    });

    expect(await findByText('Choose your topics')).toBeTruthy();
  });
});
