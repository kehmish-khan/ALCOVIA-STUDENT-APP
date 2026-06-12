import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { useSyllabus } from '../../hooks/useSyllabus'
import { Task, TaskStatus } from '../../../../shared/types'
import { generateId } from '../../utils/uuid'
import { getDeviceId } from '../../utils/deviceId'
import { saveTask } from '../../storage/taskStorage'
import { addTaskToQueue } from '../../storage/pendingQueue'
import { STUDENT_ID } from '../../../../shared/constants'

const STATUS_OPTIONS: TaskStatus[] = ['not_started', 'in_progress', 'done']

const STATUS_LABELS: Record<TaskStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  done: 'Done'
}

const STATUS_COLORS: Record<TaskStatus, string> = {
  not_started: '#999',
  in_progress: '#F59E0B',
  done: '#10B981'
}

const ChapterScreen = ({ route, navigation }: any) => {
  const { chapter, subject } = route.params
  const { getChapterTasks, updateTaskStatus, loadTasks } = useSyllabus()

  const tasks = getChapterTasks(chapter.chapterId)

  // Add a new task to this chapter
  const addTask = async (title: string) => {
    const deviceId = await getDeviceId()
    const newTask: Task = {
      taskId: generateId(),
      studentId: STUDENT_ID,
      subjectId: subject.subjectId,
      chapterId: chapter.chapterId,
      title,
      status: 'not_started',
      deviceId,
      logicalClock: 1,
      updatedAt: Date.now(),
      isDeleted: false,
      isSynced: false
    }

    await saveTask(newTask)
    await addTaskToQueue(newTask)
    await loadTasks()
  }

  // Cycle through statuses on tap
  const cycleStatus = (task: Task) => {
    const currentIndex = STATUS_OPTIONS.indexOf(task.status)
    const nextIndex = (currentIndex + 1) % STATUS_OPTIONS.length
    updateTaskStatus(task.taskId, STATUS_OPTIONS[nextIndex])
  }

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.subject}>{subject.title}</Text>
      <Text style={styles.title}>{chapter.title}</Text>

      {/* Tasks */}
      {tasks.length === 0 && (
        <Text style={styles.emptyText}>No tasks yet. Add some below.</Text>
      )}

      {tasks.map(task => (
        <TouchableOpacity
          key={task.taskId}
          style={styles.taskRow}
          onPress={() => cycleStatus(task)}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: STATUS_COLORS[task.status] }
            ]}
          />
          <View style={styles.taskInfo}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={[
              styles.statusLabel,
              { color: STATUS_COLORS[task.status] }
            ]}>
              {STATUS_LABELS[task.status]}
            </Text>
          </View>
          <Text style={styles.tapHint}>tap to cycle</Text>
        </TouchableOpacity>
      ))}

      {/* Add sample tasks button — for testing */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => addTask(`Task ${tasks.length + 1}`)}
      >
        <Text style={styles.addButtonText}>+ Add Task</Text>
      </TouchableOpacity>

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff'
  },
  subject: {
    fontSize: 14,
    color: '#666',
    marginTop: 48
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 24
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 10
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12
  },
  taskInfo: {
    flex: 1
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '500'
  },
  statusLabel: {
    fontSize: 12,
    marginTop: 2
  },
  tapHint: {
    fontSize: 11,
    color: '#ccc'
  },
  addButton: {
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4F46E5',
    borderStyle: 'dashed',
    alignItems: 'center',
    marginTop: 8
  },
  addButtonText: {
    color: '#4F46E5',
    fontSize: 15
  }
})

export default ChapterScreen