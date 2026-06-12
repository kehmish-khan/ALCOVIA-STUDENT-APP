import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { useSyllabus } from '../hooks/useSyllabus'
import { TaskStatus } from '../types'

// ─── SyllabusScreen ───────────────────────────────────────────────────────────

export default function SyllabusScreen() {
  const {
    tasks, subjects, chapters,
    updateTaskStatus, deleteTask,
    getChapterProgress, getSubjectProgress,
  } = useSyllabus()

  const STATUS_CYCLE: TaskStatus[] = ['not_started', 'in_progress', 'done']

  const nextStatus = (current: TaskStatus): TaskStatus => {
    const idx = STATUS_CYCLE.indexOf(current)
    return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
  }

  const statusLabel = (status: TaskStatus): string => {
    // TODO: return readable label
    return status
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Syllabus</Text>

      {subjects.map(subject => (
        <View key={subject.subjectId} style={styles.subject}>
          <Text style={styles.subjectTitle}>{subject.title}</Text>
          <Text style={styles.progress}>
            {Math.round(getSubjectProgress(subject.subjectId) * 100)}%
          </Text>

          {chapters
            .filter(c => c.subjectId === subject.subjectId)
            .map(chapter => (
              <View key={chapter.chapterId} style={styles.chapter}>
                <Text style={styles.chapterTitle}>{chapter.title}</Text>
                <Text style={styles.progress}>
                  {Math.round(getChapterProgress(chapter.chapterId) * 100)}%
                </Text>

                {tasks
                  .filter(t => t.chapterId === chapter.chapterId && !t.isDeleted)
                  .map(task => (
                    <View key={task.taskId} style={styles.task}>
                      <Text style={styles.taskTitle}>{task.title}</Text>

                      {/* Tap to cycle status */}
                      <TouchableOpacity
                        style={styles.statusButton}
                        onPress={() => updateTaskStatus(task.taskId, nextStatus(task.status))}
                      >
                        <Text>{statusLabel(task.status)}</Text>
                      </TouchableOpacity>

                      {/* Delete */}
                      <TouchableOpacity onPress={() => deleteTask(task.taskId)}>
                        <Text style={styles.delete}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
              </View>
            ))}
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container:    { flex: 1, padding: 16 },
  title:        { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  subject:      { marginBottom: 24, backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8 },
  subjectTitle: { fontSize: 18, fontWeight: 'bold' },
  chapter:      { marginTop: 12, paddingLeft: 12 },
  chapterTitle: { fontSize: 16, fontWeight: '600' },
  task:         { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8 },
  taskTitle:    { flex: 1, fontSize: 14 },
  statusButton: { backgroundColor: '#e0e0e0', padding: 6, borderRadius: 4 },
  delete:       { color: '#f44336', fontSize: 16, padding: 4 },
  progress:     { color: '#666', fontSize: 13 },
})
