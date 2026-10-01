import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export interface Task {
  id: string | number;
  title: string;
  completed: boolean;
  time?: string;
  dueDate?: string;
  type?: string;
}

interface TaskCardProps {
  task: Task;
  onToggle: (id: string | number) => void;
  variant?: 'home' | 'calendar';
}

const getIconForType = (type: string) => {
  switch (type) {
    case 'Irrigation': return 'water-drop';
    case 'Inspection': return 'psychology';
    case 'Nutrition': return 'science';
    case 'Environment': return 'thermostat';
    default: return 'event';
  }
};

export default function TaskCard({ task, onToggle, variant = 'home' }: TaskCardProps) {
  const timeText = task.time || (task.dueDate ? new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '08:00');

  if (variant === 'calendar') {
    return (
      <TouchableOpacity 
        style={[styles.card, task.completed && styles.cardDone]}
        activeOpacity={0.9}
        onPress={() => onToggle(task.id)}
      >
        <View style={styles.calendarInner}>
          <View style={styles.iconBadge}>
            <MaterialIcons name={getIconForType(task.type || 'Irrigation') as any} size={18} color={COLORS.primaryContainer} />
          </View>
          <View style={styles.calendarInfo}>
            <Text style={[styles.calendarTitle, task.completed && styles.textDone]}>{task.title}</Text>
            <Text style={styles.calendarType}>{task.type || 'Task'}</Text>
          </View>
          <View style={[styles.checkbox, task.completed && styles.checkboxChecked]}>
            {task.completed && <MaterialIcons name="check" size={14} color="#fff" />}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // home variant
  return (
    <TouchableOpacity 
      style={[styles.card, task.completed && styles.cardDone]} 
      activeOpacity={0.8}
      onPress={() => onToggle(task.id)}
    >
      <View style={styles.homeLeft}>
        <View style={[styles.checkbox, task.completed && styles.checkboxChecked]}>
          {task.completed && <MaterialIcons name="check" size={14} color="#fff" />}
        </View>
        <Text style={[styles.homeTitle, task.completed && styles.textDone]} numberOfLines={1}>
          {task.title}
        </Text>
      </View>
      <View style={styles.homeTimeWrap}>
        <Text style={styles.homeTime}>{timeText}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(112, 121, 114, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardDone: {
    borderColor: 'rgba(16, 185, 129, 0.2)',
    backgroundColor: '#f8fdf9',
  },
  textDone: {
    color: COLORS.outline,
    textDecorationLine: 'line-through',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primaryContainer,
    borderColor: COLORS.primaryContainer,
  },
  
  // Home styles
  homeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 10,
  },
  homeTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.onSurface,
  },
  homeTimeWrap: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: 'rgba(112, 121, 114, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    position: 'absolute',
    right: 14,
    top: 12, // adjust based on height
  },
  homeTime: {
    fontSize: 11,
    fontWeight: '500',
    color: '#404943',
  },

  // Calendar styles
  calendarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarInfo: {
    flex: 1,
  },
  calendarTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.onSurface,
    marginBottom: 2,
  },
  calendarType: {
    fontSize: 12,
    color: COLORS.outline,
    fontWeight: '500',
  },
});
