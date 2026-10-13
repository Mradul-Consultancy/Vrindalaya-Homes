import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../Components/Home/Home';

describe('Home Component', () => {
  test('renders headline text correctly', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(screen.getByText('IN VRINDAVAN')).toBeInTheDocument();
    expect(screen.getByText('Explore local property listings')).toBeInTheDocument();
  });

  test('renders Buy and Sell navigation elements', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    const buyLinks = screen.getAllByRole('link', { name: /buy/i });
    expect(buyLinks.length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /sell/i })).toBeInTheDocument();
  });
});

