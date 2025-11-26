import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GoalsManagement from '../GoalsManagement';
import GoalService from '../../services/GoalService';

jest.mock('../../services/GoalService');
const mocked = GoalService as jest.Mocked<typeof GoalService>;

describe('GoalsManagement component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders empty state and can add a goal', async () => {
    mocked.getGoals.mockResolvedValueOnce([]);
    mocked.addGoal.mockResolvedValueOnce({ id: '1', description: 'Test A', weight: 50, createdAt: new Date().toISOString() } as any);

    render(<GoalsManagement classId="c1" />);

    expect(await screen.findByText(/No goals defined/i)).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Description'), { target: { value: 'New Goal' } });
    fireEvent.change(screen.getByPlaceholderText('Weight'), { target: { value: '20' } });

    mocked.getGoals.mockResolvedValueOnce([{ id: '1', description: 'New Goal', weight: 20, createdAt: new Date().toISOString() } as any]);

    fireEvent.click(screen.getByText('Add Goal'));

    await waitFor(() => expect(mocked.addGoal).toHaveBeenCalledWith('c1', { description: 'New Goal', weight: 20 }));

    expect(await screen.findByText(/New Goal/)).toBeInTheDocument();
  });
});
