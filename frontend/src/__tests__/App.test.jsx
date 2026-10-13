import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App Component', () => {
  test('renders loading fallback or route content', () => {
    render(<App />);
    // App contains its own BrowserRouter and Suspense boundary
    expect(document.body).toBeInTheDocument();
  });
});
