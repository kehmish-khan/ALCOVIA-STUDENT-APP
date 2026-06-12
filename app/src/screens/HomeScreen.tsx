import React, { useCallback, useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { getStudentState } from '../storage/studentStorage'
import { runSync } from '../sync/syncEngine'
import { StudentState } from '../../../shared/types'
import { STUDENT_ID } from '../../../shared/constants'

const HomeScreen = ({ navigation }: any) => {
  const [studentState, setStudentState] = useState<StudentState>({
    studentId: STUDENT_ID,
    coins: 0,
    focusStreak: 0,
    lastFocusDate: '',
    todayFocusMinutes: 0
  })

  // On first mount, sync from server then load — ensures web gets server state
  useEffect(() => {
    runSync().then(() => loadState())
  }, [])

  useFocusEffect(
    useCallback(() => {
      loadState()
    }, [])
  )

  const loadState = async () => {
    const state = await getStudentState()
    setStudentState(state)
  }

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Alcovia</Text>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{studentState.coins}</Text>
          <Text style={styles.statLabel}>Coins</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{studentState.focusStreak}</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{studentState.todayFocusMinutes}</Text>
          <Text style={styles.statLabel}>Mins Today</Text>
        </View>
      </View>

      {/* Navigation Buttons */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('FocusSession')}
      >
        <Text style={styles.buttonText}>Start Focus Session</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Syllabus')}
      >
        <Text style={styles.buttonText}>Syllabus</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.devButton}
        onPress={() => navigation.navigate('DevPanel')}
      >
        <Text style={styles.devButtonText}>Dev Panel</Text>
      </TouchableOpacity>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 32,
    marginTop: 48
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    width: '30%'
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4
  },
  button: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  devButton: {
    padding: 12,
    alignItems: 'center',
    marginTop: 8
  },
  devButtonText: {
    color: '#999',
    fontSize: 14
  }
})

export default HomeScreen