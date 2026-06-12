import { useState } from 'react'
import { clearAllData } from '../storage/database'
import { runSync } from '../sync/syncEngine'

export const useDevPanel = () => {
  const [isNetworkEnabled, setIsNetworkEnabled] = useState(true)
  const [syncLogs, setSyncLogs] = useState<string[]>([])

  // Add a log entry with timestamp
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setSyncLogs(prev => [`[${timestamp}] ${message}`, ...prev])
  }

  // Toggle network on/off
  const toggleNetwork = (enabled: boolean) => {
    setIsNetworkEnabled(enabled)
    addLog(enabled ? 'Network enabled' : 'Network disabled')
  }

  // Manually trigger a sync
  const triggerManualSync = async () => {
    if (!isNetworkEnabled) {
      addLog('Sync skipped — network disabled')
      return
    }

    addLog('Manual sync started')
    await runSync()
    addLog('Manual sync completed')
  }

  // Reset all local data — for testing
  const resetAllData = async () => {
    await clearAllData()
    setSyncLogs([])
    addLog('All local data cleared')
  }

  return {
    isNetworkEnabled,
    syncLogs,
    toggleNetwork,
    triggerManualSync,
    resetAllData,
    addLog
  }
}