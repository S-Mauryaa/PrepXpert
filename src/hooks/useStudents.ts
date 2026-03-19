import { useState, useEffect, useCallback } from 'react';
import { Student, Payment } from '../types';
import { MOCK_STUDENTS, MOCK_SUBJECT_FEES } from '../constants';
import { calculateDueDate, isOverdue } from '../utils/dateUtils';


const STORAGE_KEY = 'coaching_pro_students';

function generateId(): string {
  return 'stu_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
}

function generateStudentId(): string {
  const year = new Date().getFullYear();
  const num = Math.floor(Math.random() * 900) + 100;
  return `STU-${year}-${num}`;
}

function loadStudents(): Student[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Student[];
      // Data Upgrade / Repair Step
      return parsed.map(s => {
        try {
          // 1. Ensure dates are ISO formatted
          const fixDate = (dateStr: string | undefined, fallback: string) => {
            if (!dateStr) return fallback;
            if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return dateStr.substring(0, 10);
            try {
              const d = new Date(dateStr);
              if (!isNaN(d.getTime())) return d.toISOString().substring(0, 10);
            } catch(e) {}
            return fallback;
          };

          // 2. Recalculate dynamic fields safely
          const updatedSubjectDueDates: Record<string, string> = {};
          const updatedSubjectStatuses: Record<string, string> = {};
          const payments = s.payments || [];
          const subjects = s.subjects || [];

          subjects.forEach(sub => {
            const totalPaidForSub = payments.filter(p => p.subjects.includes(sub)).reduce((sum, p) => sum + p.amount, 0);
            const subjectFeeMatch = MOCK_SUBJECT_FEES.find(sf => sf.name.toLowerCase() === sub.toLowerCase());
            const subFee = subjectFeeMatch ? subjectFeeMatch.baseFee : (s.monthlyFee / (subjects.length || 1));
            
            const fullMonthsPaid = Math.floor(totalPaidForSub / subFee);
            updatedSubjectDueDates[sub] = calculateDueDate(s.admissionDate || '', fullMonthsPaid);
            updatedSubjectStatuses[sub] = isOverdue(updatedSubjectDueDates[sub]) ? 'Pending' : 'Paid';
          });

          const allDueDates = Object.values(updatedSubjectDueDates);
          const globalDueDate = allDueDates.length > 0 
            ? allDueDates.reduce((earliest, current) => (current < earliest ? current : earliest))
            : calculateDueDate(s.admissionDate || '', payments.length);

          return {
            ...s,
            admissionDate: fixDate(s.admissionDate, new Date().toISOString().substring(0, 10)),
            dob: fixDate(s.dob, '2000-01-01'),
            dueDate: globalDueDate,
            subjects: subjects,
            payments: payments,
            monthlyFee: Number(s.monthlyFee) || 0,
            studentId: s.studentId || generateStudentId(),
            subjectDueDates: updatedSubjectDueDates,
            subjectStatuses: updatedSubjectStatuses,
            enrollmentStatus: s.enrollmentStatus || 'Active',
          };
        } catch (innerError) {
          console.error(`Failed to repair student record for ${s.name || 'unknown'}:`, innerError);
          return s; // Return original if repair fails for this specific student
        }
      });
    }
  } catch (e) {
    console.error('Critical error loading students from localStorage:', e);
  }
  
  // ONLY seed mock data if nothing exists in localStorage
  if (localStorage.getItem(STORAGE_KEY) === null) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_STUDENTS));
    return [...MOCK_STUDENTS];
  }

  // If we reach here, data exists but might be corrupted or parsing failed. 
  // Return empty instead of overwriting with mock data to allow for recovery.
  return [];
}

function saveStudents(students: Student[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  } catch (e) {
    console.error('Failed to save students to localStorage:', e);
  }
}

export function useStudents() {
  const [students, setStudents] = useState<Student[]>(loadStudents);

  // Persist whenever students change
  useEffect(() => {
    saveStudents(students);
  }, [students]);

  // Sync state across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setStudents(loadStudents());
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addStudent = useCallback((studentData: Omit<Student, 'id' | 'studentId'>) => {
    const newStudent: Student = {
      ...studentData,
      id: generateId(),
      studentId: generateStudentId(),
    };
    setStudents(prev => [newStudent, ...prev]);
    return newStudent;
  }, []);

  const updateStudent = useCallback((id: string, studentData: Partial<Student>) => {
    setStudents(prev =>
      prev.map(s => (s.id === id ? { ...s, ...studentData } : s))
    );
  }, []);

  const deleteStudent = useCallback((id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  }, []);

  const addPayment = useCallback((studentId: string, paymentData: Omit<Payment, 'id'>) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        // Prevention Check: Don't allow duplicates for the same month and subject
        const currentPayments = s.payments || [];
        const alreadyPaidSubjects = paymentData.subjects.filter(sub => 
          currentPayments.some(p => p.monthFor === paymentData.monthFor && p.subjects.includes(sub))
        );

        if (alreadyPaidSubjects.length > 0) {
          console.warn(`Attempted duplicate payment for ${alreadyPaidSubjects.join(', ')} in ${paymentData.monthFor}`);
          // For now we just filter out the duplicates. If no subjects left, return original.
          const filteredSubjects = paymentData.subjects.filter(sub => !alreadyPaidSubjects.includes(sub));
          if (filteredSubjects.length === 0) return s;
          
          paymentData = { ...paymentData, subjects: filteredSubjects };
        }

        const newPayment: Payment = { ...paymentData, id: generateId() };
        const updatedPayments = [...currentPayments, newPayment];
        
        // Calculate per-subject due dates based on payment history
        const updatedSubjectDueDates = { ...(s.subjectDueDates || {}) };
        const updatedSubjectStatuses = { ...(s.subjectStatuses || {}) };
        
        s.subjects.forEach(sub => {
          const totalPaidForSub = updatedPayments.filter(p => p.subjects.includes(sub)).reduce((sum, p) => sum + p.amount, 0);
          // Estimate per-subject fee (ideally this would be stored per-student per-subject)
          const subFee = s.monthlyFee / (s.subjects.length || 1); 
          
          const fullMonthsPaid = Math.floor(totalPaidForSub / subFee);
          updatedSubjectDueDates[sub] = calculateDueDate(s.admissionDate, fullMonthsPaid);

          if (!isOverdue(updatedSubjectDueDates[sub])) {
            updatedSubjectStatuses[sub] = 'Paid';
          } else if (totalPaidForSub % subFee > 0) {
            updatedSubjectStatuses[sub] = 'Partial';
          } else {
            updatedSubjectStatuses[sub] = 'Pending';
          }
        });

        // Global due date is the earliest of all subject due dates (if any), otherwise legacy calc
        const allDueDates = Object.values(updatedSubjectDueDates).filter(d => !!d);
        const globalDueDate = allDueDates.length > 0 
          ? allDueDates.reduce((earliest, current) => (current < earliest ? current : earliest))
          : calculateDueDate(s.admissionDate, updatedPayments.length);

        return {
          ...s,
          payments: updatedPayments,
          dueDate: globalDueDate,
          subjectDueDates: updatedSubjectDueDates,
          subjectStatuses: updatedSubjectStatuses,
          status: 'Paid' as any // Legacy status
        };
      }
      return s;
    }));
  }, []);

  const updateAttendance = useCallback((studentId: string, date: string, status: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          attendance: {
            ...(s.attendance || {}),
            [date]: status
          }
        };
      }
      return s;
    }));
  }, []);

  const getStudentById = useCallback((id: string): Student | undefined => {
    return students.find(s => s.id === id);
  }, [students]);

  return {
    students,
    addStudent,
    updateStudent,
    deleteStudent,
    getStudentById,
    addPayment,
    updateAttendance,
  };
}
