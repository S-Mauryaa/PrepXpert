import { Student, Batch, SubjectFee } from './types';

export const MOCK_STUDENTS: Student[] = [
  {
    id: '1',
    name: 'Arjun Sharma',
    studentId: 'STU-2024-001',
    class: 'Class 12',
    subjects: ['Physics', 'Mathematics'],
    monthlyFee: 3300,
    status: 'Paid',
    dueDate: '2024-10-15',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaAEsmCK0qAU2Y367366eR3XcwRFb-mjuII2-YCTIbNI6cnyQc6dkBG0PRjkSTIasSelYu6kuqwibbE2XGUXxIWOK0VG1fhnJULR_GGaaUllGnTxPEQDZ4yVE89BtHUTXlJLxKm6gMqe-bHeB_BcVU0M0uasRog8JhJlukuRiBVlFtDMOcU03JnVYkb_AstMEOzF7tvyjVPaMw8XJK65gGgPxMwKO7ohGhVCrQGRxtWb8sp9elIOaQ-L0YXoacj16geIVchLy1jti4',
    gender: 'Male',
    dob: '2007-05-15',
    admissionDate: '2024-01-02',
    stream: 'Science',
    mobile: '+91 98765 43210',
    parentName: 'Rajesh Sharma',
    parentMobile: '+91 98765 00000',
    address: 'Flat 402, Green Valley Apartments, Sector 12, New Delhi - 110021',
    subjectBatches: {
      'Physics': '04:00 PM - 05:00 PM (Weekdays)'
    }
  },
  {
    id: '2',
    name: 'Priya Verma',
    studentId: 'STU-2024-012',
    class: 'Class 10',
    subjects: ['Science', 'English'],
    monthlyFee: 1800,
    status: 'Pending',
    dueDate: '2024-10-05',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlIbNVyWC7SafjNH-df_taejw3_GIjqU-94RoXEiNjtGl_gRKsyzioudKyAouwS4wMGiLByTsJsn4ZNqVZDFYUh5tgCvRU4zIyYc-LaspLP0QjvQPshk26QKL-sYuNQN_QyXGlKQMqYQqi8tj5Tc6GH8gIdIIF1AmIxFfQNIQbgyj6ijQvMkoU3w3z2Wl0B0CDe2GwMZdOlBZPTs896kqfKzmssiAe-gZtRSpKCUh9EgLN-nRJTQY5F8e_3L-fV93aaDK1V2gZO4_3',
    admissionDate: '2024-10-05',
  },
  {
    id: '3',
    name: 'Rohan Das',
    studentId: 'STU-2024-045',
    class: 'Class 12',
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    monthlyFee: 4800,
    status: 'Paid',
    dueDate: '2024-10-12',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJ18oPYPklR6WhPh8iJY2_EjGQrZZrix3s0WNwuMCW5D5ShJmX-7VgQYQznAkXtEW5LaRt7Il3l6e-bgV4Rb1J6zmFIfK74L4t-mAl3JuveUwJ-BasRmwZe2SS-mmKAVXNw3yAGVdNuTG1KxeRoFTr4F6joopOBYrNtZpkMwO463QRj2qli1dZEs26LQq9JBYC0_2ZybTlCE4YVW0v1inEvaIFuhpp0dn4AbapWRAwigS7_iZLRr-2ujzi69Yj7iEOtKgHYpdisz_1',
    admissionDate: '2024-10-12',
  },
  {
    id: '4',
    name: 'Ananya Gupta',
    studentId: 'STU-2024-008',
    class: 'Class 9',
    subjects: ['Social Science'],
    monthlyFee: 1200,
    status: 'Paid',
    dueDate: '2024-10-20',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBFHnhWazxDYx3bt-QGL3KOyZeugJDjnqALl4ytvkmZWzaRLL5MCB2palQwu3VS9hepfivQg3gMuZEetzOeKSau231gM1mRIeZ-gL_oON2TY95ismpSgmfHoAjia7AkT0QuBArZDd-tiV6VhmCEHEKZD2OnGw3fnVnOE0h90Pnj2VobNvJrkbo4WML8ZAkGqpj6bLlKjWPRyuE4gtc_sg5fSuYEN7s9FT02doegt8pUhWdF7oubK_C5w_RSSSpoIIZRkf6b9mvatw5',
    admissionDate: '2024-10-20',
  },
  {
    id: '5',
    name: 'Ishaan Malik',
    studentId: 'STU-2024-033',
    class: 'Class 11',
    subjects: ['Economics', 'Accountancy'],
    monthlyFee: 2200,
    status: 'Pending',
    dueDate: '2024-10-01',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWoNRygRgcmPflmgtOI83ymlI5U150ffuxFAPNs-aUyPW1rVXrNgcNHxyDvJtYPVzwMcpbQbhPLU28Qdp2lG4x7PvjzNjcKUs-dd6cq2KytIkccPCic4uFzn-7l4l87XOs0bkV6k95MHI0b6nx0czzW1nU3D9gLX_B679pg_m7aSFe8IycMA6ZgdM7AyH3t81MuQjIHcIKa_FRzZP-ijAIB5EO8fEBXH83dbTkSDDBH3HpsyGvoU5Td6d0-zmmPJFXIga-D_Kap5KJ',
    admissionDate: '2024-10-01',
  },
];

export const MOCK_BATCHES: Batch[] = [
  { id: '1', time: '04:00 PM - 05:00 PM', days: 'Weekdays (Mon - Fri)', class: 'Class 12' },
  { id: '2', time: '10:00 AM - 12:00 PM', days: 'Weekends (Sat - Sun)', class: 'Class 10' },
  { id: '3', time: '06:00 PM - 07:30 PM', days: 'Alternate Days (Tue, Thu, Sat)', class: 'Class 11' }
];

export const MOCK_SUBJECT_FEES: SubjectFee[] = [
  { id: '1', name: 'Physics', classes: 'Class 11, Class 12', baseFee: 1500 },
  { id: '2', name: 'Mathematics', classes: 'Class 11, Class 12', baseFee: 1800 },
  { id: '3', name: 'Chemistry', classes: 'Class 11, Class 12', baseFee: 1500 },
  { id: '4', name: 'Biology', classes: 'Class 11, Class 12', baseFee: 1600 },
  { id: '5', name: 'Science', classes: 'Class 9, Class 10', baseFee: 1200 },
  { id: '6', name: 'English', classes: 'Class 9, Class 10, Class 11, Class 12', baseFee: 1000 },
  { id: '7', name: 'Social Science', classes: 'Class 9, Class 10', baseFee: 1200 },
  { id: '8', name: 'Economics', classes: 'Class 11, Class 12', baseFee: 1200 },
  { id: '9', name: 'Accountancy', classes: 'Class 11, Class 12', baseFee: 1500 },
];

