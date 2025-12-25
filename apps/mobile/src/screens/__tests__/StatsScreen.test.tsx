import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { StatsScreen } from '../StatsScreen';
import { statsService } from '../../services/statsService';
import type { UserStats } from '@flowmate/shared';

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

// Mock formatFocusTime from shared package
jest.mock('@flowmate/shared', () => ({
  formatFocusTime: (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
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
    const { getByText } = render(<StatsScreen navigation={mockNavigation} route={{} as any} />);

    expect(getByText('loading stats...')).toBeTruthy();
  });

  it('should display stats after loading', async () => {
    const mockStats: UserStats = {
      dailyStats: [
        { date: '2025-12-25', focusTimeMinutes: 50, sessionsCompleted: 2 },
      ],
      currentStreak: 3,
      longestStreak: 7,
      totalFocusTime: 300,
      totalSessions: 12,
    };

    jest.spyOn(statsService, 'getStats').mockResolvedValue(mockStats);
    jest.spyOn(statsService, 'getTodayStats').mockResolvedValue({
      date: '2025-12-25',
      focusTimeMinutes: 50,
      sessionsCompleted: 2,
    });
    jest.spyOn(statsService, 'getWeekStats').mockResolvedValue([
      { date: '2025-12-25', focusTimeMinutes: 50, sessionsCompleted: 2 },
    ]);

    const { getByText } = render(<StatsScreen navigation={mockNavigation} route={{} as any} />);

    await waitFor(() => {
      expect(getByText('your progress')).toBeTruthy();
    });

    // Check today's stats
    expect(getByText('today')).toBeTruthy();
    expect(getByText('50m')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();

    // Check streaks
    expect(getByText('streaks')).toBeTruthy();
    expect(getByText('3')).toBeTruthy(); // current streak
    expect(getByText('7')).toBeTruthy(); // longest streak

    // Check all time stats
    expect(getByText('all time')).toBeTruthy();
    expect(getByText('5h 0m')).toBeTruthy(); // 300 minutes
    expect(getByText('12')).toBeTruthy(); // total sessions
    expect(getByText('1')).toBeTruthy(); // days active
  });

  it('should display zero stats when no data is available', async () => {
    const mockStats: UserStats = {
      dailyStats: [],
      currentStreak: 0,
      longestStreak: 0,
      totalFocusTime: 0,
      totalSessions: 0,
    };

    jest.spyOn(statsService, 'getStats').mockResolvedValue(mockStats);
    jest.spyOn(statsService, 'getTodayStats').mockResolvedValue(null);
    jest.spyOn(statsService, 'getWeekStats').mockResolvedValue([]);

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
    const mockStats: UserStats = {
      dailyStats: [],
      currentStreak: 0,
      longestStreak: 0,
      totalFocusTime: 0,
      totalSessions: 0,
    };

    jest.spyOn(statsService, 'getStats').mockResolvedValue(mockStats);
    jest.spyOn(statsService, 'getTodayStats').mockResolvedValue(null);
    jest.spyOn(statsService, 'getWeekStats').mockResolvedValue([]);

    const { getByText } = render(<StatsScreen navigation={mockNavigation} route={{} as any} />);

    await waitFor(() => {
      expect(getByText('your progress')).toBeTruthy();
    });

    const backButtonText = getByText('← back');
    // Fire the press event on the parent TouchableOpacity
    fireEvent.press(backButtonText);

    expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
  });

  it('should display formatted focus time correctly for hours and minutes', async () => {
    const mockStats: UserStats = {
      dailyStats: [{ date: '2025-12-25', focusTimeMinutes: 125, sessionsCompleted: 5 }],
      currentStreak: 1,
      longestStreak: 1,
      totalFocusTime: 125,
      totalSessions: 5,
    };

    jest.spyOn(statsService, 'getStats').mockResolvedValue(mockStats);
    jest.spyOn(statsService, 'getTodayStats').mockResolvedValue({
      date: '2025-12-25',
      focusTimeMinutes: 125,
      sessionsCompleted: 5,
    });
    jest.spyOn(statsService, 'getWeekStats').mockResolvedValue([
      { date: '2025-12-25', focusTimeMinutes: 125, sessionsCompleted: 5 },
    ]);

    const { getAllByText } = render(<StatsScreen navigation={mockNavigation} route={{} as any} />);

    await waitFor(() => {
      // 125 minutes = 2h 5m - appears in both today and all time sections
      const focusTimes = getAllByText('2h 5m');
      expect(focusTimes.length).toBeGreaterThan(0);
    });
  });

  it('should render section titles correctly', async () => {
    const mockStats: UserStats = {
      dailyStats: [],
      currentStreak: 0,
      longestStreak: 0,
      totalFocusTime: 0,
      totalSessions: 0,
    };

    jest.spyOn(statsService, 'getStats').mockResolvedValue(mockStats);
    jest.spyOn(statsService, 'getTodayStats').mockResolvedValue(null);
    jest.spyOn(statsService, 'getWeekStats').mockResolvedValue([]);

    const { getByText } = render(<StatsScreen navigation={mockNavigation} route={{} as any} />);

    await waitFor(() => {
      expect(getByText('today')).toBeTruthy();
      expect(getByText('streaks')).toBeTruthy();
      expect(getByText('last 7 days')).toBeTruthy();
      expect(getByText('all time')).toBeTruthy();
    });
  });

  it('should render streak emojis', async () => {
    const mockStats: UserStats = {
      dailyStats: [],
      currentStreak: 5,
      longestStreak: 10,
      totalFocusTime: 0,
      totalSessions: 0,
    };

    jest.spyOn(statsService, 'getStats').mockResolvedValue(mockStats);
    jest.spyOn(statsService, 'getTodayStats').mockResolvedValue(null);
    jest.spyOn(statsService, 'getWeekStats').mockResolvedValue([]);

    const { getByText } = render(<StatsScreen navigation={mockNavigation} route={{} as any} />);

    await waitFor(() => {
      expect(getByText('🔥')).toBeTruthy();
      expect(getByText('⭐')).toBeTruthy();
    });
  });

  it('should render stat labels correctly', async () => {
    const mockStats: UserStats = {
      dailyStats: [],
      currentStreak: 0,
      longestStreak: 0,
      totalFocusTime: 0,
      totalSessions: 0,
    };

    jest.spyOn(statsService, 'getStats').mockResolvedValue(mockStats);
    jest.spyOn(statsService, 'getTodayStats').mockResolvedValue(null);
    jest.spyOn(statsService, 'getWeekStats').mockResolvedValue([]);

    const { getByText } = render(<StatsScreen navigation={mockNavigation} route={{} as any} />);

    await waitFor(() => {
      expect(getByText('focus time')).toBeTruthy();
      expect(getByText('sessions')).toBeTruthy();
      expect(getByText('total focus time')).toBeTruthy();
      expect(getByText('total sessions')).toBeTruthy();
      expect(getByText('days active')).toBeTruthy();
      expect(getByText('current')).toBeTruthy();
      expect(getByText('longest')).toBeTruthy();
    });
  });
});
