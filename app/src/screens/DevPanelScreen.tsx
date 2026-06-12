import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { loadTasks, loadSessions, loadStudentState } from '../storage/localStorage'
import { runSync } from '../sync/syncEngine'
import { DEVICE_ID } from '../utils/constants'

// ─── DevPanelScreen ───────────────────────────────────────────────────────────
// Required by spec: toggle offline, trigger scenarios, show device state

interface Props {
  onToggleOffline?: (offline: boolean) => void
  forcedOffline?: boolean
}

export default function DevPanelScreen({ onToggleOffline, forcedOffline = false }: Props) {
  const [deviceState, setDeviceState] = useState<any>(null)
  const [syncLog, setSyncLog] = useState<string[]>([])

  const refreshState = async () => {
    // TODO: load and display current tasks, sessions, studentState
    const tasks = await loadTasks()
    const sessions = await loadSessions()
    const studentState = await loadStudentState()
    setDeviceState({ tasks, sessions, studentState })
  }

  useEffect(() => {
    refreshState()
  }, [])

  const log = (msg: string) => {
    setSyncLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 19)])
  }

  const triggerSync = async () => {
    // TODO: call syncWithServer, log result
    log('Sync triggered manually')
    try {
      await runSync()
      log('Sync complete')
      refreshState()
    } catch (e: any) {
      log(`Sync failed: ${e.message}`)
    }
  }

  const triggerConflictScenario = async () => {
    // TODO: create a task change that will conflict with the other device
    // For demo: mark first task as 'done' with a high logical clock
    log('Conflict scenario triggered')
  }

  const triggerSessionReplay = async () => {
    // TODO: re-send an already-synced session to test idempotency
    log('Session replay triggered — check server logs for dedup')
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dev Panel</Text>
      <Text style={styles.deviceId}>Device: {DEVICE_ID}</Text>

      {/* Online/Offline Toggle */}
      <View style={styles.row}>
        <Text style={styles.label}>
          Network: {forcedOffline ? '🔴 OFFLINE (forced)' : '🟢 ONLINE'}
        </Text>
        <TouchableOpacity
          style={[styles.button, forcedOffline ? styles.online : styles.offline]}
          onPress={() => onToggleOffline?.(!forcedOffline)}
        >
          <Text style={styles.buttonText}>
            {forcedOffline ? 'Go Online' : 'Force Offline'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Manual Sync */}
      <TouchableOpacity style={styles.button} onPress={triggerSync}>
        <Text style={styles.buttonText}>Trigger Sync Now</Text>
      </TouchableOpacity>

      {/* Conflict Scenarios */}
      <TouchableOpacity style={styles.button} onPress={triggerConflictScenario}>
        <Text style={styles.buttonText}>Trigger Conflict Scenario</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={triggerSessionReplay}>
        <Text style={styles.buttonText}>Replay Session (idempotency test)</Text>
      </TouchableOpacity>

      {/* Refresh State */}
      <TouchableOpacity style={styles.button} onPress={refreshState}>
        <Text style={styles.buttonText}>Refresh Device State</Text>
      </TouchableOpacity>

      {/* Current Device State */}
      <Text style={styles.sectionTitle}>Current Device State</Text>
      {deviceState && (
        <View style={styles.stateBox}>
          <Text style={styles.mono}>
            {JSON.stringify(deviceState, null, 2)}
          </Text>
        </View>
      )}

      {/* Sync Log */}
      <Text style={styles.sectionTitle}>Sync Log</Text>
      {syncLog.map((entry, i) => (
        <Text key={i} style={styles.logEntry}>{entry}</Text>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container:    { flex: 1, padding: 16 },
  title:        { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  deviceId:     { fontSize: 12, color: '#666', marginBottom: 16 },
  row:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  label:        { fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 8 },
  button:       { backgroundColor: '#2196F3', padding: 12, borderRadius: 8, marginBottom: 8 },
  online:       { backgroundColor: '#4CAF50' },
  offline:      { backgroundColor: '#f44336' },
  buttonText:   { color: 'white', fontWeight: 'bold', textAlign: 'center' },
  stateBox:     { backgroundColor: '#1e1e1e', padding: 12, borderRadius: 8 },
  mono:         { fontFamily: 'monospace', fontSize: 11, color: '#d4d4d4' },
  logEntry:     { fontSize: 12, color: '#444', marginBottom: 4, fontFamily: 'monospace' },
})
