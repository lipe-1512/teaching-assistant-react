import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ClassList from '../ClassList';
import ClassService from '../../services/ClassService';

jest.mock('../../services/ClassService');
const mockedClass = ClassService as jest.Mocked<typeof ClassService>;

describe('ClassList', () => {
  beforeEach(() => jest.clearAllMocks());

  test('renders classes and manage link', async () => {
    mockedClass.getAllClasses.mockResolvedValueOnce([
      { id: 'c1', topic: 'Test', semester: 1, year: 2025, enrollments: [] }
    ] as any);

    render(
      <MemoryRouter>
        <ClassList />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Test/i)).toBeInTheDocument();
    expect(await screen.findByText(/Manage Goals/i)).toBeInTheDocument();
  });
});
