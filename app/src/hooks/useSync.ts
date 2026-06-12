import { useState, useEffect } from 'react'
import { runSync } from '../sync/syncEngine'
import { startNetworkMonitor } from '../sync/networkMonitor'
import { SYNC_INTERVAL_MS } from '../../../shared/constants'

export const useSync = () => {
  const [isOnline, setIsOnline] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null)

  // Trigger a manual or automatic sync
  const triggerSync = async () => {
    if (!isOnline || isSyncing) return

    setIsSyncing(true)
    await runSync()
    setIsSyncing(false)
    setLastSyncTime(Date.now())
  }

  useEffect(() => {
    // Watch network status
    // When device comes online — sync immediately
    const unsubscribe = startNetworkMonitor(online => {
      setIsOnline(online)
      if (online) {
        triggerSync()
      }
    })

    // Also sync every SYNC_INTERVAL_MS when online
    const interval = setInterval(() => {
      if (isOnline) {
        triggerSync()
      }
    }, SYNC_INTERVAL_MS)

    // Cleanup when component unmounts
    return () => {
      unsubscribe()
      clearInterval(interval)
    }
  }, [isOnline])

  return {
    isOnline,
    isSyncing,
    lastSyncTime,
    triggerSync
  }
}