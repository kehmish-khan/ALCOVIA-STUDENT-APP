import { SyncRequest, SyncResponse } from '../../../shared/types'

// Server URL — change this to your server address
const SERVER_URL = 'http://localhost:3000'

// Send pending changes to server and get back what device missed
export const sendSyncRequest = async (
  request: SyncRequest
): Promise<SyncResponse> => {

  const response = await fetch(`${SERVER_URL}/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  })

  if (!response.ok) {
    throw new Error(`Sync failed with status: ${response.status}`)
  }

  const data: SyncResponse = await response.json()
  return data
}

// Check if server is reachable
export const pingServer = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${SERVER_URL}/ping`)
    return response.ok
  } catch {
    // Server unreachable
    return false
  }
}