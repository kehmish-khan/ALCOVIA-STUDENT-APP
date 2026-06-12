import { useState, useEffect } from 'react'
import { Task, TaskStatus, Subject, Chapter } from '../../../shared/types'
import { getAllTasks, saveTask } from '../storage/taskStorage'
import { addTaskToQueue } from '../storage/pendingQueue'
import { calculateChapterProgress, calculateSubjectProgress } from '../utils/progress'
import { generateId } from '../utils/uuid'
import { getDeviceId } from '../utils/deviceId'
import { incrementClock } from '../utils/logicalClock'
import { STUDENT_ID } from '../../../shared/constants'
import { loadData, STORAGE_KEYS } from '../storage/database'

export const useSyllabus = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])

  // Load tasks, subjects, chapters on mount
  useEffect(() => {
    loadTasks()
    loadSubjectsAndChapters()
  }, [])

  const loadTasks = async () => {
    const allTasks = await getAllTasks()
    setTasks(allTasks)
  }

  const loadSubjectsAndChapters = async () => {
    const storedSubjects = await loadData<Subject[]>(STORAGE_KEYS.SUBJECTS)
    const storedChapters = await loadData<Chapter[]>(STORAGE_KEYS.CHAPTERS)
    setSubjects(storedSubjects ?? [])
    setChapters(storedChapters ?? [])
  }

  // Update task status
  const updateTaskStatus = async (
    taskId: string,
    newStatus: TaskStatus
  ) => {
    const deviceId = await getDeviceId()

    const taskIndex = tasks.findIndex(t => t.taskId === taskId)
    if (taskIndex < 0) return

    const existingTask = tasks[taskIndex]

    const updatedTask: Task = {
      ...existingTask,
      status: newStatus,
      deviceId,
      logicalClock: incrementClock(existingTask.logicalClock),
      updatedAt: Date.now(),
      isSynced: false
    }

    // Update local state immediately — offline first
    const updatedTasks = [...tasks]
    updatedTasks[taskIndex] = updatedTask
    setTasks(updatedTasks)

    // Save to storage and add to pending queue
    await saveTask(updatedTask)
    await addTaskToQueue(updatedTask)
  }

  // Get tasks for a specific chapter
  const getChapterTasks = (chapterId: string): Task[] => {
    return tasks.filter(
      t => t.chapterId === chapterId && !t.isDeleted
    )
  }

  // Get progress for a chapter
  const getChapterProgress = (chapterId: string): number => {
    const chapterTasks = getChapterTasks(chapterId)
    return calculateChapterProgress(chapterTasks)
  }

  // Get progress for a subject by subjectId
  const getSubjectProgress = (subjectId: string): number => {
    const subjectChapterIds = chapters
      .filter(c => c.subjectId === subjectId)
      .map(c => c.chapterId)
    const progressList = subjectChapterIds.map(id => getChapterProgress(id))
    return calculateSubjectProgress(progressList)
  }

  // Soft-delete a task
  const deleteTask = async (taskId: string): Promise<void> => {
    const deviceId = await getDeviceId()
    const taskIndex = tasks.findIndex(t => t.taskId === taskId)
    if (taskIndex < 0) return

    const existingTask = tasks[taskIndex]
    const deletedTask: Task = {
      ...existingTask,
      isDeleted: true,
      deviceId,
      logicalClock: incrementClock(existingTask.logicalClock),
      updatedAt: Date.now(),
      isSynced: false
    }

    const updatedTasks = [...tasks]
    updatedTasks[taskIndex] = deletedTask
    setTasks(updatedTasks)

    await saveTask(deletedTask)
    await addTaskToQueue(deletedTask)
  }

  return {
    tasks,
    subjects,
    chapters,
    loadTasks,
    updateTaskStatus,
    deleteTask,
    getChapterTasks,
    getChapterProgress,
    getSubjectProgress
  }
}