import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native'
import { useDevPanel } from '../../hooks/useDevPanel'
import { useSync } from '../../hooks/useSync'
import { getStudentState } from '../../storage/studentStorage'
import { getAllTasks } from '../../storage/taskStorage'
import { getAllSessions } from '../../storage/sessionStorage'
import { getPendingQueue } from '../../storage/pendingQueue'
import { StudentState, Task, FocusSession } from '../../../../shared/types'

const DevPanelScreen = () => {
  const { isNetworkEnabled, syncLogs, toggleNetwork, triggerManualSync, resetAllData } = useDevPanel()
  const { isOnline, isSyncing } = useSync()

  const [studentState, setStudentState] = useState<StudentState | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [sessions, setSessions] = useState<FocusSession[]>([])
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    loadState()
  }, [])

  const loadState = async () => {
    const state = await getStudentState()
    const allTasks = await getAllTasks()
    const allSessions = await getAllSessions()
    const queue = await getPendingQueue()

    setStudentState(state)
    setTasks(allTasks)
    setSessions(allSessions)
    setPendingCount(queue.tasks.length + queue.sessions.length)
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dev Panel</Text>

      {/* Network Toggle */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Network</Text>
        <View style={styles.row}>
          <Text style={styles.label}>
            {isNetworkEnabled ? '🟢 Online' : '🔴 Offline'}
          </Text>
          <Switch
            value={isNetworkEnabled}
            onValueChange={toggleNetwork}
          />
        </View>
        <Text style={styles.hint}>
          Sync status: {isSyncing ? 'Syncing...' : isOnline ? 'Idle' : 'Offline'}
        </Text>
      </View>

      {/* Sync Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sync Controls</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={async () => {
            await triggerManualSync()
            await loadState()
          }}
        >
          <Text style={styles.buttonText}>Trigger Manual Sync</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dangerButton}
          onPress={async () => {
            await resetAllData()
            await loadState()
          }}
        >
          <Text style={styles.dangerButtonText}>Reset All Local Data</Text>
        </TouchableOpacity>
      </View>

      {/* Current State */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Device State</Text>
        {studentState && (
          <View style={styles.stateBox}>
            <Text style={styles.stateText}>Coins: {studentState.coins}</Text>
            <Text style={styles.stateText}>Streak: {studentState.focusStreak} days</Text>
            <Text style={styles.stateText}>Today: {studentState.todayFocusMinutes} mins</Text>
            <Text style={styles.stateText}>Tasks: {tasks.length}</Text>
            <Text style={styles.stateText}>Sessions: {sessions.length}</Text>
            <Text style={styles.stateText}>Pending sync: {pendingCount} items</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadState}
        >
          <Text style={styles.refreshText}>Refresh State</Text>
        </TouchableOpacity>
      </View>

      {/* Sync Logs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sync Logs</Text>
        {syncLogs.length === 0 && (
          <Text style={styles.hint}>No logs yet</Text>
        )}
        {syncLogs.map((log, index) => (
          <Text key={index} style={styles.logEntry}>{log}</Text>
        ))}
      </View>

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 48,
    marginBottom: 24
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  label: {
    fontSize: 15
  },
  hint: {
    fontSize: 13,
    color: '#999',
    marginTop: 8
  },
  button: {
    backgroundColor: '#4F46E5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600'
  },
  dangerButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff4444'
  },
  dangerButtonText: {
    color: '#ff4444',
    fontWeight: '600'
  },
  stateBox: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8
  },
  stateText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#333'
  },
  refreshButton: {
    padding: 8,
    alignItems: 'center'
  },
  refreshText: {
    color: '#4F46E5',
    fontSize: 14
  },
  logEntry: {
    fontSize: 12,
    color: '#555',
    fontFamily: 'monospace',
    marginBottom: 4
  }
})

export default DevPanelScreen