import { format, addDays, addMonths, parseISO, isValid } from 'date-fns';

/**
 * Formats a date string to dd/mm/yyyy
 * @param dateString ISO date string or date-like string
 */
export const formatToDDMMYYYY = (dateString: string | undefined): string => {
  if (!dateString) return 'N/A';
  const date = parseISO(dateString);
  if (!isValid(date)) {
    // Try native Date if parseISO fails (for non-ISO strings)
    const nativeDate = new Date(dateString);
    if (!isValid(nativeDate)) return dateString;
    return format(nativeDate, 'dd/MM/yyyy');
  }
  return format(date, 'dd/MM/yyyy');
};

/**
 * Calculates the next due date based on admission date and number of months paid.
 * Rule: 10 days after the monthly anniversary of admission.
 * Example: Admitted Jan 25 -> First month due Feb 4 (Jan 25 + 10 days).
 * @param admissionDate ISO date string
 * @param monthOffset Number of months from admission (0 for first month, 1 for second, etc.)
 */
export const calculateDueDate = (admissionDate: string, monthOffset: number = 0): string => {
  const start = parseISO(admissionDate);
  if (!isValid(start)) return '';
  
  // Anniversary is the base date (e.g., 25th of the month)
  const anniversary = addMonths(start, monthOffset);
  // Due date is 10 days after the anniversary (grace period)
  const dueDate = addDays(anniversary, 10);
  
  return format(dueDate, 'yyyy-MM-dd');
};


/**
 * Gets the month name and year for a specific offset from admission.
 */
export const getMonthForOffset = (admissionDate: string, monthOffset: number): string => {
  const start = parseISO(admissionDate);
  if (!isValid(start)) return '';
  const targetDate = addMonths(start, monthOffset);
  // Returns "Month YYYY" e.g. "February 2026"
  return format(targetDate, 'MMMM yyyy');
};

/**
 * Checks if a due date has passed.
 */
export const isOverdue = (dueDateISO: string): boolean => {
  if (!dueDateISO) return false;
  const due = parseISO(dueDateISO);
  if (!isValid(due)) return false;
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Compare only dates
  return now > due;
};

/**
 * Checks if the monthly anniversary has passed (the date on which the fee cycle starts).
 */
export const isAnniversaryPassed = (admissionDate: string, monthOffset: number): boolean => {
  const start = parseISO(admissionDate);
  if (!isValid(start)) return false;
  const anniversary = addMonths(start, monthOffset);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now > anniversary;
};

/**
 * Returns the alert status for a fee.
 * 'overdue' = After the 10-day grace period.
 * 'pending' = After anniversary reached but within 10-day grace period.
 * 'none' = Before anniversary or already paid.
 */
export const getFeeAlertStatus = (admissionDate: string, monthOffset: number, isPaid: boolean): 'pending' | 'overdue' | 'none' => {
  if (isPaid) return 'none';
  
  const start = parseISO(admissionDate);
  if (!isValid(start)) return 'none';
  
  const anniversary = addMonths(start, monthOffset);
  const dueDate = addDays(anniversary, 10);
  const criticalDate = addDays(dueDate, 10); // 20 days after anniversary
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const dueDateObj = new Date(dueDate);
  dueDateObj.setHours(0, 0, 0, 0);
  
  const criticalDateObj = new Date(criticalDate);
  criticalDateObj.setHours(0, 0, 0, 0);
  
  if (now > criticalDateObj) return 'overdue';
  if (now > dueDateObj) return 'pending';
  
  return 'none';
};

/**
 * Finds the first month offset that has at least one unpaid subject.
 */
export const getFirstUnpaidMonthOffset = (admissionDate: string, subjects: string[], payments: any[] = []): number => {
  if (!admissionDate || !subjects.length) return 0;

  // Check months 0 to 60 (5 years)
  for (let offset = 0; offset < 60; offset++) {
    const month = getMonthForOffset(admissionDate, offset);
    const unpaidInMonth = subjects.some(sub => 
      !payments.some(p => p.monthFor === month && p.subjects.includes(sub))
    );
    
    if (unpaidInMonth) return offset;
  }
  return 0;
};
