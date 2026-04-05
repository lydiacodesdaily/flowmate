import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GUIDED_CONFIGS } from '@flowmate/shared';
import type { GuidedSelectionScreenProps } from '../navigation/types';
import { useTheme } from '../theme';
import { useTimerContext } from '../contexts/TimerContext';
import { usePremium } from '../contexts/PremiumContext';
import { hapticService } from '../services/hapticService';
import { useResponsive } from '../hooks/useResponsive';
import { FOCUS_RECIPES, type FocusRecipe } from '../constants/recipes';
export function GuidedSelectionScreen({ navigation }: GuidedSelectionScreenProps) {
  const { theme } = useTheme();
  const { isActive, reset } = useTimerContext();
  const { isPremium, showPaywall } = usePremium();
  const { contentStyle } = useResponsive();
  const insets = useSafeAreaInsets();

  const PREMIUM_MIN_DURATION = 90;

  const handleRecipeSelect = async (recipe: FocusRecipe) => {
    await hapticService.light();

    if (recipe.duration >= PREMIUM_MIN_DURATION && !isPremium) {
      showPaywall();
      return;
    }

    if (isActive) {
      Alert.alert(
        'Active Session in Progress',
        'You have an active timer running. Do you want to end it and start a new session?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'End & Start New',
            style: 'destructive',
            onPress: () => {
              reset();
              navigation.navigate('ActiveTimer', { sessions: GUIDED_CONFIGS[recipe.guidedType] });
            },
          },
        ]
      );
    } else {
      navigation.navigate('ActiveTimer', { sessions: GUIDED_CONFIGS[recipe.guidedType] });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text allowFontScaling={false} style={[styles.backText, { color: theme.colors.textSecondary }]}>←</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.scrollContent, contentStyle]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>guided</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textTertiary }]}>pick a focus recipe</Text>

        {FOCUS_RECIPES.map((recipe) => {
          const isLocked = recipe.duration >= PREMIUM_MIN_DURATION;
          return (
            <TouchableOpacity
              key={recipe.id}
              style={[
                styles.recipeCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  opacity: isLocked ? 0.6 : 1,
                },
              ]}
              onPress={() => handleRecipeSelect(recipe)}
              activeOpacity={0.85}
            >
              <View style={styles.recipeHeader}>
                <View style={styles.recipeTitle}>
                  <Text style={styles.recipeIcon}>{recipe.icon}</Text>
                  <Text style={[styles.recipeName, { color: theme.colors.text }]}>{recipe.name}</Text>
                </View>
                <View style={styles.recipeRight}>
                  <Text style={[styles.recipeDuration, { color: theme.colors.textSecondary }]}>
                    {recipe.duration}m
                  </Text>
                  {isLocked && (
                    <Text style={[styles.premiumBadge, { color: theme.colors.primary }]}>✦</Text>
                  )}
                </View>
              </View>
              <Text style={[styles.recipeDescription, { color: theme.colors.textSecondary }]}>
                {recipe.description}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: 12,
    minWidth: 44,
  },
  backText: {
    fontSize: 24,
    fontWeight: '300',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 32,
    paddingTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '300',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '300',
    marginBottom: 28,
    textAlign: 'center',
    letterSpacing: 0.8,
  },
  recipeCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 12,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recipeTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  recipeDuration: {
    fontSize: 15,
    fontWeight: '300',
    letterSpacing: 0.2,
  },
  recipeDescription: {
    fontSize: 14,
    fontWeight: '300',
    letterSpacing: 0.2,
    marginLeft: 36,
  },
  recipeRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  premiumBadge: {
    fontSize: 12,
  },
});
