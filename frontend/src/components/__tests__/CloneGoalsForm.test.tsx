import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CloneGoalsForm from '../CloneGoalsForm';
import ClassService from '../../services/ClassService';
import GoalService from '../../services/GoalService';

jest.mock('../../services/ClassService');
jest.mock('../../services/GoalService');

const mockedClass = ClassService as jest.Mocked<typeof ClassService>;
const mockedGoal = GoalService as jest.Mocked<typeof GoalService>;

describe('CloneGoalsForm', () => {
  beforeEach(() => jest.clearAllMocks());

  test('renders and clones goals successfully', async () => {
    mockedClass.getAllClasses.mockResolvedValueOnce([
      { id: 'c1', topic: 'Source', semester: 1, year: 2025, enrollments: [] },
      { id: 'c2', topic: 'Dest', semester: 1, year: 2025, enrollments: [] },
    ] as any);

    mockedGoal.cloneGoals.mockResolvedValueOnce({ message: 'Goals cloned successfully', clonedGoalsCount: 2 });

    render(<CloneGoalsForm destClassId="c2" onCloneSuccess={count => { /* noop */ }} />);

    // wait for select to populate
    await screen.findByRole('combobox');

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'c1' } });
    fireEvent.click(screen.getByText(/Clone Goals/i));

    await waitFor(() => expect(mockedGoal.cloneGoals).toHaveBeenCalledWith('c1', 'c2'));

    expect(await screen.findByText(/Goals cloned successfully/i)).toBeInTheDocument();
  });
});
