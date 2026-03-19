export type StudentStatus = 'Paid' | 'Pending' | 'Partial' | 'Unassigned' | '';
export type EnrollmentStatus = 'Active' | 'Left' | 'Completed';

export interface Student {
  id: string;
  name: string;
  studentId: string;
  class: string;
  subjects: string[];
  monthlyFee: number;
  status: StudentStatus;
  enrollmentStatus?: EnrollmentStatus;
  dueDate: string;
  photoUrl?: string;
  gender?: string;
  dob?: string;
  admissionDate: string; // Required for fee logic
  stream?: string;
  mobile?: string;
  parentName?: string;
  parentMobile?: string;
  address?: string;
  subjectBatches?: Record<string, string>;
  subjectStatuses?: Record<string, string>;
  subjectDueDates?: Record<string, string>;
  monthJoined?: string;
  attendance?: Record<string, string>; // date (YYYY-MM-DD) -> status ('present', 'absent', etc.)
  payments?: Payment[]; // Track payment history
}


export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  date: string;
  monthFor: string; // e.g. "January 2026"
  method: string;
  subjects: string[];
  referenceId?: string;
}

export interface Batch {
  id: string;
  time: string;
  days: string;
  class?: string;
}

export interface SubjectFee {
  id: string;
  name: string;
  classes: string;
  baseFee: number;
}

export interface Topic {
  id: string;
  title: string;
  description?: string;
  youtubeId: string;
  driveUrl?: string;
}

export interface OneShotVideo {
  id: string;
  title: string;
  youtubeId: string;
  driveUrl?: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  type: 'topic-based' | 'one-shot';
  // If one-shot (legacy single video)
  youtubeId?: string;
  driveUrl?: string;
  // If one-shot (multiple videos)
  videos?: OneShotVideo[];
  // If topic-based
  topics?: Topic[];
}

export interface Course {
  id: string;
  subjectName: string;
  class: string;
  description?: string;
  thumbnailUrl?: string;
}

export type View = 'dashboard' | 'students' | 'add-student' | 'fees' | 'attendance' | 'settings' | 'student-profile' | 'content-management';

export interface AdminProfile {
  name: string;
  role: string;
  photoUrl?: string;
}
