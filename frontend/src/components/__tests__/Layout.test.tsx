import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from '../Layout';

describe('Layout', () => {
  test('renders header and navigation links', () => {
    render(
      <MemoryRouter>
        <Layout>
          <div>Child content</div>
        </Layout>
      </MemoryRouter>
    );

    expect(screen.getByText(/Teaching Assistant/i)).toBeInTheDocument();
    expect(screen.getByText(/Students/i)).toBeInTheDocument();
    expect(screen.getByText(/Classes/i)).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });
});
