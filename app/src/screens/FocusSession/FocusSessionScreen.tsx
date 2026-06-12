import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useFocusSession } from '../../hooks/useFocusSession'
import { MIN_FOCUS_DURATION, MAX_FOCUS_DURATION } from '../../../../shared/constants'

const FocusSessionScreen = ({ navigation }: any) => {
  const [targetMinutes, setTargetMinutes] = useState(25)
  const { session, elapsedSeconds, isRunning, startSession, abandonSession } = useFocusSession()

  // Format seconds into MM:SS display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // Calculate progress percentage
  const progressPercent = session
    ? Math.min((elapsedSeconds / (session.targetDuration * 60)) * 100, 100)
    : 0

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Focus Session</Text>

      {/* Target duration selector — only show before session starts */}
      {!isRunning && !session && (
        <View style={styles.durationSelector}>
          <Text style={styles.label}>Target Duration</Text>
          <View style={styles.durationRow}>
            <TouchableOpacity
              style={styles.durationButton}
              onPress={() => setTargetMinutes(Math.max(MIN_FOCUS_DURATION, targetMinutes - 5))}
            >
              <Text style={styles.durationButtonText}>-</Text>
            </TouchableOpacity>

            <Text style={styles.durationValue}>{targetMinutes} min</Text>

            <TouchableOpacity
              style={styles.durationButton}
              onPress={() => setTargetMinutes(Math.min(MAX_FOCUS_DURATION, targetMinutes + 5))}
            >
              <Text style={styles.durationButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Timer display */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
        {session && (
          <Text style={styles.targetText}>
            Target: {session.targetDuration} min
          </Text>
        )}
        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>
      </View>

      {/* Start button */}
      {!isRunning && !session && (
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => startSession(targetMinutes)}
        >
          <Text style={styles.startButtonText}>Start</Text>
        </TouchableOpacity>
      )}

      {/* Give up button */}
      {isRunning && (
        <TouchableOpacity
          style={styles.giveUpButton}
          onPress={() => {
            abandonSession('give_up')
            navigation.navigate('Home')
          }}
        >
          <Text style={styles.giveUpText}>Give Up</Text>
        </TouchableOpacity>
      )}

      {/* Session result */}
      {session && !isRunning && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>
            {session.status === 'success' ? '🎉 Session Complete!' : '❌ Session Abandoned'}
          </Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.startButtonText}>Back Home</Text>
          </TouchableOpacity>
        </View>
      )}

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 48,
    marginBottom: 32
  },
  durationSelector: {
    alignItems: 'center',
    marginBottom: 32
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24
  },
  durationButton: {
    backgroundColor: '#f5f5f5',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center'
  },
  durationButtonText: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  durationValue: {
    fontSize: 20,
    fontWeight: '600',
    minWidth: 80,
    textAlign: 'center'
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 40
  },
  timerText: {
    fontSize: 64,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums']
  },
  targetText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8
  },
  progressBar: {
    width: 280,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginTop: 16,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 4
  },
  startButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginTop: 16
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600'
  },
  giveUpButton: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ff4444',
    marginTop: 16
  },
  giveUpText: {
    color: '#ff4444',
    fontSize: 18,
    fontWeight: '600'
  },
  resultContainer: {
    alignItems: 'center',
    marginTop: 24
  },
  resultText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24
  }
})

export default FocusSessionScreen