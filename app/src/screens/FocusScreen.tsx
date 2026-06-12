import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native'
import { useFocusSession } from '../hooks/useFocusSession'
import { MIN_FOCUS_MINUTES, MAX_FOCUS_MINUTES } from '../utils/constants'

// ─── FocusScreen ──────────────────────────────────────────────────────────────

export default function FocusScreen() {
  const [targetMinutes, setTargetMinutes] = useState(25)
  const { session, elapsedSeconds, isRunning, startSession, abandonSession } = useFocusSession()

  const formatTime = (seconds: number): string => {
    // TODO: convert seconds to MM:SS string
    return '00:00'
  }

  if (!session || session.status !== 'in_progress') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Start Focus Session</Text>

        {/* Duration picker */}
        <Text style={styles.label}>Duration (minutes)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={String(targetMinutes)}
          onChangeText={(v) => setTargetMinutes(Number(v))}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={() => startSession(targetMinutes)}
        >
          <Text style={styles.buttonText}>Start</Text>
        </TouchableOpacity>

        {/* TODO: show last session result if any */}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Focus Session</Text>
      <Text style={styles.timer}>{formatTime(elapsedSeconds)}</Text>
      <Text style={styles.label}>
        Target: {session.targetDuration} min
      </Text>

      <TouchableOpacity style={styles.giveUpButton} onPress={() => abandonSession('give_up')}>
        <Text style={styles.buttonText}>Give Up</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title:     { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  timer:     { fontSize: 64, fontWeight: 'bold', marginBottom: 24 },
  label:     { fontSize: 16, marginBottom: 8 },
  input:     { borderWidth: 1, borderColor: '#ccc', padding: 8, width: 100, textAlign: 'center', marginBottom: 16 },
  button:    { backgroundColor: '#4CAF50', padding: 16, borderRadius: 8 },
  giveUpButton: { backgroundColor: '#f44336', padding: 16, borderRadius: 8, marginTop: 32 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
})
