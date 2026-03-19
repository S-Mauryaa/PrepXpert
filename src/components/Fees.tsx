import React, { useState } from 'react';
import { CreditCard, Users, AlertCircle, CheckCircle2, IndianRupee, Clock, ArrowRight, X } from 'lucide-react';
import { Student, SubjectFee, Payment } from '../types';
import { formatToDDMMYYYY, calculateDueDate, getMonthForOffset, isOverdue, getFirstUnpaidMonthOffset } from '../utils/dateUtils';

interface FeesProps {
  students: Student[];
  subjectFees: SubjectFee[];
  onAddPayment: (studentId: string, payment: any) => void;
  onViewStudent: (student: Student) => void;
  searchQuery: string;
}

/** Format a month offset as "Mon YYYY", e.g. "Jan 2025" */
function formatMonthFull(admissionDate: string, offset: number): string {
  const raw = getMonthForOffset(admissionDate, offset); // e.g. "Jan 2025" or "Jan"
  // getMonthForOffset might already return year — just return as-is if it does
  return raw;
}

export default function Fees({ students, subjectFees, onAddPayment, onViewStudent, searchQuery }: FeesProps) {
  const [quickPayStudent, setQuickPayStudent] = useState<Student | null>(null);
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState('Cash');
  const [payRefId, setPayRefId] = useState('');
  const [payMonthOffset, setPayMonthOffset] = useState(0);
  const [paySubjects, setPaySubjects] = useState<string[]>([]);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalDues = students.reduce((sum, s) => {
    if (s.enrollmentStatus && s.enrollmentStatus !== 'Active') return sum;
    return sum + (s.monthlyFee || 0);
  }, 0);

  const pendingStudents = students.filter(s => {
    if (s.enrollmentStatus && s.enrollmentStatus !== 'Active') return false;
    return s.subjects.some(sub => {
      const subjectPaymentCount = (s.payments || []).filter(p => p.subjects.includes(sub)).length;
      const dueDate = s.subjectDueDates?.[sub] || calculateDueDate(s.admissionDate, subjectPaymentCount);
      return isOverdue(dueDate);
    });
  });

  const totalPaidThisMonth = students.reduce((sum, s) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyPayments = (s.payments || []).filter(p => {
      const pDate = new Date(p.date);
      return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
    });
    return sum + monthlyPayments.reduce((pSum, p) => pSum + p.amount, 0);
  }, 0);

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-3">
            <CreditCard className="text-blue-900" size={32} />
            Fee Management
          </h2>
          <p className="text-slate-500 font-medium text-sm">Monitor dues, track payments, and manage financial records</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-900 p-6 rounded-2xl text-white shadow-xl shadow-blue-900/20 relative overflow-hidden">
          <div className="relative z-10">
            <IndianRupee className="opacity-20 mb-4" size={32} />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Total Monthly Dues</p>
            <h4 className="text-3xl font-black italic">₹ {totalDues.toLocaleString()}</h4>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold">
              <span className="bg-white/20 px-2 py-0.5 rounded">Active Students</span>
              <span>Based on current assignments</span>
            </div>
          </div>
          <CreditCard className="absolute -bottom-6 -right-6 size-40 opacity-10 rotate-12" />
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <AlertCircle className="text-amber-500 mb-4" size={32} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Pending Fees</p>
          <h4 className="text-3xl font-black text-slate-900">{pendingStudents.length} Students</h4>
          <p className="text-xs text-slate-500 font-medium mt-2">Required immediate follow-up</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <CheckCircle2 className="text-emerald-500 mb-4" size={32} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Paid This Month</p>
          <h4 className="text-3xl font-black text-slate-900">₹ {totalPaidThisMonth.toLocaleString()}</h4>
          <p className="text-xs text-slate-500 font-medium mt-2">Historical data overview</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <Users size={20} className="text-blue-900" />
            Student Due List
          </h3>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black rounded-full border border-amber-100 uppercase tracking-wider">Overdue</span>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full border border-emerald-100 uppercase tracking-wider">Clear</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="p-4">Student Info</th>
                <th className="p-4 text-center">Subjects</th>
                <th className="p-4">Monthly Fee</th>
                <th className="p-4">Unpaid Subjects</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.length > 0 ? filteredStudents.map(student => {
                const unpaidSubjects = student.subjects.filter(sub => {
                  const subjectPaymentCount = (student.payments || []).filter(p => p.subjects.includes(sub)).length;
                  const dueDate = student.subjectDueDates?.[sub] || calculateDueDate(student.admissionDate, subjectPaymentCount);
                  return isOverdue(dueDate);
                });

                return (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                           <img 
                            src={student.photoUrl || `https://picsum.photos/seed/${student.name}/100/100`} 
                            className="w-full h-full object-cover" 
                            alt="" 
                           />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 leading-none mb-1 group-hover:text-blue-900 transition-colors">{student.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{student.studentId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-xs font-black text-slate-600 bg-slate-100 px-2 py-1 rounded-full">{student.subjects.length}</span>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-black text-slate-900">₹ {student.monthlyFee.toLocaleString()}</p>
                    </td>
                    <td className="p-4">
                      {unpaidSubjects.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {unpaidSubjects.map(sub => {
                            const status = student.subjectStatuses?.[sub] || 'Pending';
                            const colorClass = status === 'Partial' ? 'text-blue-600 bg-blue-50 border-blue-100' : 'text-amber-600 bg-amber-50 border-amber-100';
                            return (
                              <span key={sub} className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${colorClass}`}>
                                {sub} ({status})
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                          All Clear
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => onViewStudent(student)}
                          className="p-2 text-slate-400 hover:text-blue-900 hover:bg-white rounded-lg transition-all"
                          title="View Ledger"
                        >
                          <Clock size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            const offset = getFirstUnpaidMonthOffset(student.admissionDate, student.subjects, student.payments || []);
                            const month = getMonthForOffset(student.admissionDate, offset);
                            const unpaidInMonth = student.subjects.filter(sub => 
                              !(student.payments || []).some(p => p.monthFor === month && p.subjects.includes(sub))
                            );

                            setQuickPayStudent(student);
                            setPayAmount(unpaidInMonth.length * (student.monthlyFee / student.subjects.length));
                            setPaySubjects(unpaidInMonth);
                            setPayMonthOffset(offset);
                            setPayRefId('');
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-900 border border-blue-900 text-white rounded-lg text-xs font-black uppercase hover:bg-blue-800 transition-all shadow-sm active:scale-95"
                          title="Quick Payment"
                        >
                          <IndianRupee size={14} />
                          Pay
                        </button>
                        <button 
                          onClick={() => onViewStudent(student)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-black uppercase hover:border-slate-300 transition-all active:scale-95"
                        >
                          Details
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <CreditCard size={48} className="mb-4" />
                      <p className="text-sm font-black uppercase tracking-widest">No students found</p>
                      <p className="text-[10px] font-bold">Try adjusting your search query</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Pay Modal */}
      {quickPayStudent && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <IndianRupee className="text-blue-900" size={20} />
                Quick Payment: {quickPayStudent.name}
              </h3>
              <button onClick={() => setQuickPayStudent(null)} className="text-slate-400 hover:text-rose-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Subject selector */}
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Select Subjects</label>
                <div className="flex flex-wrap gap-2">
                  {quickPayStudent.subjects.map(sub => {
                    const subjectPaymentCount = (quickPayStudent.payments || []).filter(p => p.subjects.includes(sub)).length;
                    const nextMonth = getMonthForOffset(quickPayStudent.admissionDate, subjectPaymentCount);
                    const isSelected = paySubjects.includes(sub);
                    
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => {
                          const newSubjects = paySubjects.includes(sub) 
                            ? paySubjects.filter(s => s !== sub) 
                            : [...paySubjects, sub];
                          
                          setPaySubjects(newSubjects);
                          const perSubFee = quickPayStudent.monthlyFee / quickPayStudent.subjects.length;
                          setPayAmount(Math.round(perSubFee * newSubjects.length));
                        }}
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all border ${
                          isSelected
                            ? 'bg-blue-900 text-white border-blue-900 shadow-md'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-blue-900/50'
                        }`}
                      >
                        {sub} <span className="opacity-70">({nextMonth})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Amount (₹)</label>
                  <input 
                    type="number" 
                    value={payAmount} 
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    className="w-full rounded-lg border-slate-200 text-sm font-bold p-2 outline-none border focus:ring-2 focus:ring-blue-900/10"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Method</label>
                  <select 
                    value={payMethod} 
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full rounded-lg border-slate-200 text-sm font-bold p-2 outline-none border focus:ring-2 focus:ring-blue-900/10"
                  >
                    <option>Cash</option>
                    <option>UPI</option>
                    <option>Bank Transfer</option>
                  </select>
                </div>
              </div>

              {/* Reference ID input */}
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Reference / Notes <span className="font-medium normal-case text-slate-400">(optional)</span></label>
                <input
                  type="text"
                  value={payRefId}
                  onChange={(e) => setPayRefId(e.target.value)}
                  placeholder="UPI transaction ID, receipt #, etc."
                  className="w-full rounded-lg border-slate-200 text-sm p-2 outline-none border focus:ring-2 focus:ring-blue-900/10"
                />
              </div>

              {/* Summary line */}
              {paySubjects.length > 0 && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center justify-between">
                  <div className="text-xs text-blue-800 font-bold">
                    ₹{payAmount.toLocaleString()} for {paySubjects.length} subject{paySubjects.length > 1 ? 's' : ''}
                  </div>
                  <div className="text-[10px] text-blue-600 font-black uppercase tracking-wider">
                    via {payMethod}
                  </div>
                </div>
              )}

              <button 
                disabled={paySubjects.length === 0 || payAmount <= 0}
                onClick={() => {
                  const paymentsByMonth: Record<string, string[]> = {};
                  
                  paySubjects.forEach(sub => {
                    const subjectPaymentCount = (quickPayStudent.payments || []).filter(p => p.subjects.includes(sub)).length;
                    const targetMonth = getMonthForOffset(quickPayStudent.admissionDate, subjectPaymentCount);
                    
                    if (!paymentsByMonth[targetMonth]) {
                      paymentsByMonth[targetMonth] = [];
                    }
                    paymentsByMonth[targetMonth].push(sub);
                  });

                  Object.entries(paymentsByMonth).forEach(([month, subjects]) => {
                    const proportion = subjects.length / paySubjects.length;
                    const amountForMonth = Math.round(payAmount * proportion);

                    onAddPayment(quickPayStudent.id, {
                      studentId: quickPayStudent.id,
                      amount: amountForMonth,
                      date: new Date().toISOString(),
                      monthFor: month,
                      method: payMethod,
                      subjects: subjects,
                      referenceId: payRefId
                    });
                  });

                  setQuickPayStudent(null);
                }}
                className="w-full py-3 bg-blue-900 text-white rounded-xl font-black text-sm hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
