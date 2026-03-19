import { useState, useEffect } from 'react';
import { Course, Lesson } from '../types';

const COURSES_KEY = 'coaching_courses';
const LESSONS_KEY = 'coaching_lessons';
const CLASSES_KEY = 'coaching_classes';

export const useContent = () => {
  const [classes, setClasses] = useState<string[]>(() => {
    const saved = localStorage.getItem(CLASSES_KEY);
    if (saved) return JSON.parse(saved);
    return ['Class 9', 'Class 10', 'Class 11', 'Class 12'];
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem(COURSES_KEY);
    if (saved) return JSON.parse(saved);
    return [
      { id: 'CRS-1', subjectName: 'Physics', class: 'Class 10', description: 'Laws of motion, gravitation, and energy.' },
      { id: 'CRS-2', subjectName: 'Mathematics', class: 'Class 12', description: 'Calculus, Vectors, and 3D Geometry.' },
      { id: 'CRS-3', subjectName: 'Chemistry', class: 'Class 9', description: 'Atoms, molecules, and chemical reactions.' },
    ];
  });

  const [lessons, setLessons] = useState<Lesson[]>(() => {
    const saved = localStorage.getItem(LESSONS_KEY);
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'LSN-1', courseId: 'CRS-1', title: 'Chapter 1: Units and Measurements',
        type: 'topic-based', topics: [
          { id: 'TP-1', title: 'Introduction', youtubeId: 'kKKM8Y-u7ds', description: 'Overview of physics and measurements.' },
          { id: 'TP-2', title: 'SI Units', youtubeId: '2XP1E7R_sN4', description: 'Understanding the International System of Units.' }
        ]
      },
      {
        id: 'LSN-2', courseId: 'CRS-2', title: 'Calculus One-Shot',
        type: 'one-shot', youtubeId: 'N2PpRnFqnqY',
        description: 'Complete revision of Differentiation and Integration.',
        driveUrl: 'https://docs.google.com/viewer?srcid=1_notes'
      },
      {
        id: 'LSN-3', courseId: 'CRS-3', title: 'Atoms & Molecules',
        type: 'topic-based', topics: [
          { id: 'TP-3', title: 'Atomic Theory', youtubeId: 'kKKM8Y-u7ds' }
        ]
      },
    ];
  });

  // Persist to localStorage
  useEffect(() => { localStorage.setItem(CLASSES_KEY, JSON.stringify(classes)); }, [classes]);
  useEffect(() => { localStorage.setItem(COURSES_KEY, JSON.stringify(courses)); }, [courses]);
  useEffect(() => { localStorage.setItem(LESSONS_KEY, JSON.stringify(lessons)); }, [lessons]);

  // Sync across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CLASSES_KEY && e.newValue) setClasses(JSON.parse(e.newValue));
      if (e.key === COURSES_KEY && e.newValue) setCourses(JSON.parse(e.newValue));
      if (e.key === LESSONS_KEY && e.newValue) setLessons(JSON.parse(e.newValue));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addClass = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || classes.includes(trimmed)) return false;
    setClasses([...classes, trimmed]);
    return true;
  };

  const deleteClass = (name: string) => {
    // Remove class and all its courses/lessons
    const classCoursesIds = courses.filter(c => c.class === name).map(c => c.id);
    setClasses(classes.filter(c => c !== name));
    setCourses(courses.filter(c => c.class !== name));
    setLessons(lessons.filter(l => !classCoursesIds.includes(l.courseId)));
  };

  const addCourse = (course: Omit<Course, 'id'>) => {
    const newCourse = { ...course, id: `CRS-${Date.now()}` };
    setCourses([...courses, newCourse]);
    return newCourse;
  };

  const deleteCourse = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
    setLessons(lessons.filter(l => l.courseId !== id));
  };

  const addLesson = (courseId: string): Lesson => {
    const newLesson: Lesson = {
      id: `LSN-${Date.now()}`,
      courseId,
      title: 'New Lesson',
      description: '',
      type: 'topic-based',
      topics: []
    };
    setLessons(prev => [...prev, newLesson]);
    return newLesson;
  };

  const deleteLesson = (id: string) => {
    setLessons(lessons.filter(l => l.id !== id));
  };

  const updateLesson = (id: string, updates: Partial<Lesson>) => {
    setLessons(lessons.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const updateCourse = (id: string, updates: Partial<Course>) => {
    setCourses(courses.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  return {
    classes,
    courses,
    lessons,
    addClass,
    deleteClass,
    addCourse,
    updateCourse,
    deleteCourse,
    addLesson,
    deleteLesson,
    updateLesson
  };
};
