import React, { useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { useSyllabus } from '../../hooks/useSyllabus'
import { Subject, Chapter } from '../../../../shared/types'

// Hardcoded subjects and chapters — no backend needed for structure
const SUBJECTS: Subject[] = [
  { subjectId: 'sub_1', studentId: 'student_1', title: 'Mathematics' },
  { subjectId: 'sub_2', studentId: 'student_1', title: 'Physics' },
  { subjectId: 'sub_3', studentId: 'student_1', title: 'Chemistry' }
]

const CHAPTERS: Chapter[] = [
  { chapterId: 'ch_1', subjectId: 'sub_1', title: 'Algebra' },
  { chapterId: 'ch_2', subjectId: 'sub_1', title: 'Calculus' },
  { chapterId: 'ch_3', subjectId: 'sub_2', title: 'Mechanics' },
  { chapterId: 'ch_4', subjectId: 'sub_2', title: 'Thermodynamics' },
  { chapterId: 'ch_5', subjectId: 'sub_3', title: 'Organic Chemistry' },
  { chapterId: 'ch_6', subjectId: 'sub_3', title: 'Inorganic Chemistry' }
]

const SyllabusScreen = ({ navigation }: any) => {
  const { getSubjectProgress, getChapterProgress, loadTasks } = useSyllabus()

  useFocusEffect(
    useCallback(() => {
      loadTasks()
    }, [])
  )

  // Get chapters for a subject
  const getChaptersForSubject = (subjectId: string): Chapter[] => {
    return CHAPTERS.filter(c => c.subjectId === subjectId)
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Syllabus</Text>

      {SUBJECTS.map(subject => {
        const chapters = getChaptersForSubject(subject.subjectId)
        const subjectProgress = getSubjectProgress(subject.subjectId)

        return (
          <View key={subject.subjectId} style={styles.subjectCard}>

            {/* Subject header */}
            <View style={styles.subjectHeader}>
              <Text style={styles.subjectTitle}>{subject.title}</Text>
              <Text style={styles.progressText}>{subjectProgress}%</Text>
            </View>

            {/* Subject progress bar */}
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${subjectProgress}%` }]}
              />
            </View>

            {/* Chapters list */}
            {chapters.map(chapter => {
              const chapterProgress = getChapterProgress(chapter.chapterId)
              return (
                <TouchableOpacity
                  key={chapter.chapterId}
                  style={styles.chapterRow}
                  onPress={() => navigation.navigate('Chapter', {
                    chapter,
                    subject
                  })}
                >
                  <Text style={styles.chapterTitle}>{chapter.title}</Text>
                  <Text style={styles.chapterProgress}>{chapterProgress}%</Text>
                </TouchableOpacity>
              )
            })}

          </View>
        )
      })}

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
  subjectCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  subjectTitle: {
    fontSize: 18,
    fontWeight: '600'
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5'
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 3
  },
  chapterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#ebebeb'
  },
  chapterTitle: {
    fontSize: 15,
    color: '#333'
  },
  chapterProgress: {
    fontSize: 15,
    color: '#666'
  }
})

export default SyllabusScreen