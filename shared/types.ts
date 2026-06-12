export type TaskStatus='not_started'|'in_progress'|'done'
export interface Subject{
    subjectId:string
    studentId:string
    title:string

}

export interface Chapter{
    chapterId:string
    subjectId:string
    title:string

}
export interface Task {
    taskId:string
    studentId:string 
    subjectId:string
    chapterId:string
    title:string
    status:TaskStatus


    deviceId:string
    logicalClock:number
    updatedAt:number
    isDeleted:boolean
    isSynced:boolean
    
}

export type SessionStatus='in_progress'|'success'|'abandoned'
export type FailReason='give_up'|'app_switch'

export interface FocusSession{
    sessionId: string
    studentId:string
    deviceId:string 
    targetDuration:number
    actualDuration:number 
    status:SessionStatus
    failReason:FailReason|null

    startedAt: number
    completedAt:number|null 

    rewardGranted:boolean
    notificationSent:boolean 

    isSynced:boolean 

}

export interface StudentState{
    studentId:string
    coins:number
    focusStreak:number 
    lastFocusDate:string
    todayFocusMinutes:number 

}

export interface DeviceSyncState{
    deviceId:string
    studentId:string 
    lastSeenClock:number 

}

export interface SyncRequest{
    studentId:string 
    deviceId: string 
    lastSeenClock: number
    pendingTasks:Task[]
    pendingSessions:FocusSession[]

}

export interface SyncResponse{
    tasks:Task[]
    sessions:FocusSession[] 
    studentState:StudentState
    newLastSeenClock:number 

}

