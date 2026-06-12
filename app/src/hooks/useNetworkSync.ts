import { useState, useEffect, useRef } from 'react'
import NetInfo from '@react-native-community/netinfo'
import { runSync } from '../sync/syncEngine'
import { SYNC_INTERVAL_MS } from '../utils/constants'

// ─── useNetworkSync ───────────────────────────────────────────────────────────
// Monitors real network state + dev panel override
// Triggers sync when coming back online, and on interval while online

export const useNetworkSync = (devPanelOffline: boolean) => {
  const [isOnline, setIsOnline] = useState(false)
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    let syncInterval: ReturnType<typeof setInterval> | null = null

    const startSync = () => {
      runSync()
      if (!syncInterval) {
        syncInterval = setInterval(runSync, SYNC_INTERVAL_MS)
      }
    }

    const stopSync = () => {
      if (syncInterval) {
        clearInterval(syncInterval)
        syncInterval = null
      }
    }

    const unsubscribe = NetInfo.addEventListener(state => {
      const realOnline = !!(state.isConnected && state.isInternetReachable)
      const online = realOnline && !devPanelOffline
      setIsOnline(online)

      if (online) {
        startSync()
      } else {
        stopSync()
      }
    })

    return () => {
      unsubscribe()
      stopSync()
    }
  }, [devPanelOffline])

  return { isOnline }
}
