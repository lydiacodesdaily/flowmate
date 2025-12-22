import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ModeCardProps {
  title: string;
  description: string;
  icon: string;
  color: string;
  onPress: () => void;
}

export function ModeCard({ title, description, icon, onPress }: ModeCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>{icon}</Text>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EBEBF0',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
  },
  icon: {
    fontSize: 32,
    marginRight: 20,
    opacity: 0.8,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '400',
    color: '#3A3A3C',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  description: {
    fontSize: 14,
    fontWeight: '300',
    color: '#8E8E93',
    lineHeight: 20,
    letterSpacing: 0.2,
  },
});
