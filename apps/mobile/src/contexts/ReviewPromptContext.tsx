import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  initializeFirstLaunch,
  incrementCompletedSessions,
  checkReviewEligibility,
  checkReviewEligibilityDebug,
  markReviewPrompted,
  markReviewDismissed,
  requestNativeReview,
  resetReviewSettings,
} from '../services/reviewService';
import { ReviewPromptModal } from '../components/ReviewPromptModal';

interface ReviewPromptContextType {
  /** Called after a focus session completes to track and potentially trigger prompt */
  onFocusSessionComplete: () => Promise<void>;
  /** Force show the review prompt (for development testing) */
  forceShowPrompt: () => void;
  /** Get debug info about eligibility (development only) */
  getDebugInfo: () => Promise<{
    eligible: boolean;
    reasons: string[];
    settings: {
      firstLaunchTimestamp: number | null;
      completedFocusSessions: number;
      lastPromptedVersion: string | null;
      lastDismissedTimestamp: number | null;
    };
  }>;
  /** Reset all review settings (development only) */
  resetSettings: () => Promise<void>;
}

const ReviewPromptContext = createContext<ReviewPromptContextType | undefined>(undefined);

interface ReviewPromptProviderProps {
  children: ReactNode;
}

export function ReviewPromptProvider({ children }: ReviewPromptProviderProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Initialize first launch timestamp on mount
  useEffect(() => {
    initializeFirstLaunch();
  }, []);

  const onFocusSessionComplete = useCallback(async () => {
    // First increment the session count
    await incrementCompletedSessions();

    // Then check if we should show the prompt
    const isEligible = await checkReviewEligibility();
    if (isEligible) {
      setIsModalVisible(true);
    }
  }, []);

  const handleLeaveReview = useCallback(async () => {
    setIsModalVisible(false);
    await markReviewPrompted();
    await requestNativeReview();
  }, []);

  const handleDismiss = useCallback(async () => {
    setIsModalVisible(false);
    await markReviewDismissed();
  }, []);

  const forceShowPrompt = useCallback(() => {
    setIsModalVisible(true);
  }, []);

  const getDebugInfo = useCallback(async () => {
    return checkReviewEligibilityDebug();
  }, []);

  const resetSettings = useCallback(async () => {
    await resetReviewSettings();
  }, []);

  return (
    <ReviewPromptContext.Provider
      value={{
        onFocusSessionComplete,
        forceShowPrompt,
        getDebugInfo,
        resetSettings,
      }}
    >
      {children}
      <ReviewPromptModal
        visible={isModalVisible}
        onLeaveReview={handleLeaveReview}
        onDismiss={handleDismiss}
      />
    </ReviewPromptContext.Provider>
  );
}

export function useReviewPrompt(): ReviewPromptContextType {
  const context = useContext(ReviewPromptContext);
  if (context === undefined) {
    throw new Error('useReviewPrompt must be used within a ReviewPromptProvider');
  }
  return context;
}
