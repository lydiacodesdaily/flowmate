import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { StatsScreen } from '../StatsScreen';
import * as sessionService from '../../services/sessionService';

// Mock the theme hook
jest.mock('../../theme', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        background: '#FFFFFF',
        surface: '#F5F5F5',
        text: '#000000',
        textSecondary: '#666666',
        textTertiary: '#999999',
        border: '#E0E0E0',
        primary: '#007AFF',
      },
    },
  }),
}));

// Mock the WeeklyChart component
jest.mock('../../components/WeeklyChart', () => ({
  WeeklyChart: () => null,
}));

// Mock the SessionHistory component
jest.mock('../../components/SessionHistory', () => ({
  SessionHistory: () => null,
}));

// Mock formatFocusTime from shared package
jest.mock('@flowmate/shared', () => ({
  formatFocusTime: (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  },
}));

describe('StatsScreen', () => {
  const mockNavigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    // Don't resolve the promises yet to see loading state
    jest.spyOn(sessionService, 'getTodayStats').mockImplementation(() => new Promise(() => {}));
    jest.spyOn(sessionService, 'getWeekStats').mockImplementation(() => new Promise(() => {}));
    jest.spyOn(sessionService, 'getThisWeekSummary').mockImplementation(() => new Promise(() => {}));
    jest.spyOn(sessionService, 'getAllTimeStats').mockImplementation(() => new Promise(() => {}));
    jest.spyOn(sessionService, 'groupSessionsByDay').mockImplementation(() => new Promise(() => {}));

    const { getByText } = render(<StatsScreen navigation={mockNavigation} route={{} as any} />);

    expect(getByText('loading stats...')).toBeTruthy();
  });

  it('should display stats after loading', async () => {
    jest.spyOn(sessionService, 'getTodayStats').mockResolvedValue({
      totalMinutes: 50,
      breakMinutes: 10,
      completedCount: 2,
      partialCount: 0,
      skippedCount: 0,
      breakCount: 1,
    });
    jest.spyOn(sessionService, 'getWeekStats').mockResolvedValue([
      { date: '2025-12-25', focusTimeMinutes: 50, sessionsCompleted: 2 },
    ]);
    jest.spyOn(sessionService, 'getThisWeekSummary').mockResolvedValue({
      daysActive: 3,
      totalMinutes: 150,
      totalSessions: 6,
    });
    jest.spyOn(sessionService, 'getAllTimeStats').mockResolvedValue({
      totalFocusTime: 300,
      totalSessions: 12,
      daysActive: 5,
    });
    jest.spyOn(sessionService, 'groupSessionsByDay').mockResolvedValue([]);

    const { getByText } = render(<StatsScreen navigation={mockNavigation} route={{} as any} />);

    await waitFor(() => {
      expect(getByText('your progress')).toBeTruthy();
    });

    // Check today's stats
    expect(getByText('today')).toBeTruthy();
    expect(getByText('50m')).toBeTruthy();

    // Check this week stats
    expect(getByText('this week')).toBeTruthy();
    expect(getByText('2h 30m')).toBeTruthy(); // 150 minutes

    // Check all time stats
    expect(getByText('all time')).toBeTruthy();
    expect(getByText('5h')).toBeTruthy(); // 300 minutes
  });

  it('should display zero stats when no data is available', async () => {
    jest.spyOn(sessionService, 'getTodayStats').mockResolvedValue({
      totalMinutes: 0,
      breakMinutes: 0,
      completedCount: 0,
      partialCount: 0,
      skippedCount: 0,
      breakCount: 0,
    });
    jest.spyOn(sessionService, 'getWeekStats').mockResolvedValue([]);
    jest.spyOn(sessionService, 'getThisWeekSummary').mockResolvedValue({
      daysActive: 0,
      totalMinutes: 0,
      totalSessions: 0,
    });
    jest.spyOn(sessionService, 'getAllTimeStats').mockResolvedValue({
      totalFocusTime: 0,
      totalSessions: 0,
      daysActive: 0,
    });
    jest.spyOn(sessionService, 'groupSessionsByDay').mockResolvedValue([]);

    const { getByText, getAllByText } = render(
      <StatsScreen navigation={mockNavigation} route={{} as any} />
    );

    await waitFor(() => {
      expect(getByText('your progress')).toBeTruthy();
    });

    // Check that zeros are displayed
    const zeroTexts = getAllByText('0');
    expect(zeroTexts.length).toBeGreaterThan(0);
  });

  it('should call goBack when back button is pressed', async () => {
    jest.spyOn(sessionService, 'getTodayStats').mockResolvedValue({
      totalMinutes: 0,
      breakMinutes: 0,
      completedCount: 0,
      partialCount: 0,
      skippedCount: 0,
      breakCount: 0,
    });
    jest.spyOn(sessionService, 'getWeekStats').mockResolvedValue([]);
    jest.spyOn(sessionService, 'getThisWeekSummary').mockResolvedValue({
      daysActive: 0,
      totalMinutes: 0,
      totalSessions: 0,
    });
    jest.spyOn(sessionService, 'getAllTimeStats').mockResolvedValue({
      totalFocusTime: 0,
      totalSessions: 0,
      daysActive: 0,
    });
    jest.spyOn(sessionService, 'groupSessionsByDay').mockResolvedValue([]);

    const { getByText } = render(<StatsScreen navigation={mockNavigation} route={{} as any} />);

    await waitFor(() => {
      expect(getByText('your progress')).toBeTruthy();
    });

    const backButtonText = getByText('← back');
    fireEvent.press(backButtonText);

    expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
  });

  it('should render section titles correctly', async () => {
    jest.spyOn(sessionService, 'getTodayStats').mockResolvedValue({
      totalMinutes: 0,
      breakMinutes: 0,
      completedCount: 0,
      partialCount: 0,
      skippedCount: 0,
      breakCount: 0,
    });
    jest.spyOn(sessionService, 'getWeekStats').mockResolvedValue([]);
    jest.spyOn(sessionService, 'getThisWeekSummary').mockResolvedValue({
      daysActive: 0,
      totalMinutes: 0,
      totalSessions: 0,
    });
    jest.spyOn(sessionService, 'getAllTimeStats').mockResolvedValue({
      totalFocusTime: 0,
      totalSessions: 0,
      daysActive: 0,
    });
    jest.spyOn(sessionService, 'groupSessionsByDay').mockResolvedValue([]);

    const { getByText } = render(<StatsScreen navigation={mockNavigation} route={{} as any} />);

    await waitFor(() => {
      expect(getByText('today')).toBeTruthy();
      expect(getByText('this week')).toBeTruthy();
      expect(getByText('last 7 days')).toBeTruthy();
      expect(getByText('all time')).toBeTruthy();
    });
  });

  it('should render stat labels correctly', async () => {
    jest.spyOn(sessionService, 'getTodayStats').mockResolvedValue({
      totalMinutes: 0,
      breakMinutes: 0,
      completedCount: 0,
      partialCount: 0,
      skippedCount: 0,
      breakCount: 0,
    });
    jest.spyOn(sessionService, 'getWeekStats').mockResolvedValue([]);
    jest.spyOn(sessionService, 'getThisWeekSummary').mockResolvedValue({
      daysActive: 0,
      totalMinutes: 0,
      totalSessions: 0,
    });
    jest.spyOn(sessionService, 'getAllTimeStats').mockResolvedValue({
      totalFocusTime: 0,
      totalSessions: 0,
      daysActive: 0,
    });
    jest.spyOn(sessionService, 'groupSessionsByDay').mockResolvedValue([]);

    const { getByText } = render(<StatsScreen navigation={mockNavigation} route={{} as any} />);

    await waitFor(() => {
      expect(getByText('focus time')).toBeTruthy();
      expect(getByText('sessions')).toBeTruthy();
      expect(getByText('days')).toBeTruthy();
    });
  });
});
