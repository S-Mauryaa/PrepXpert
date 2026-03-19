import React, { useState } from 'react';
import { User, CreditCard, Calendar, Edit2, Plus, MapPin, BookOpen, Clock, Download, AlertCircle, Users, Receipt, X, CheckCircle2 } from 'lucide-react';
import { Student, SubjectFee } from '../types';
import { format, addDays, parseISO } from 'date-fns';
import { formatToDDMMYYYY, calculateDueDate, getMonthForOffset, isOverdue, getFirstUnpaidMonthOffset } from '../utils/dateUtils';
import ReceiptModal from './ReceiptModal';
import StudentProfilePrintModal from './StudentProfilePrintModal';
import { motion, AnimatePresence } from 'motion/react';

interface StudentProfileProps {
  student: Student;
  onEdit: (student: Student) => void;
  onAddPayment: (studentId: string, payment: any) => void;
  onUpdateAttendance: (studentId: string, date: string, status: string) => void;
  subjectFees: SubjectFee[];
}

export default function StudentProfile({ student, onEdit, onAddPayment, onUpdateAttendance, subjectFees }: StudentProfileProps) {
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  
  // Payment Form State
  const [payAmount, setPayAmount] = useState(student.monthlyFee);
  const [payMethod, setPayMethod] = useState('Cash');
  const [payMonthOffset, setPayMonthOffset] = useState((student.payments?.length || 0));
  const [payRefId, setPayRefId] = useState('');
  const [paySubjects, setPaySubjects] = useState<string[]>(student.subjects);

  // Reset payment form when modal opens
  React.useEffect(() => {
    if (isPaymentModalOpen) {
      const offset = getFirstUnpaidMonthOffset(student.admissionDate, student.subjects, student.payments || []);
      const month = getMonthForOffset(student.admissionDate, offset);
      const unpaidInMonth = student.subjects.filter(sub => 
        !(student.payments || []).some(p => p.monthFor === month && p.subjects.includes(sub))
      );

      setPayMonthOffset(offset);
      setPaySubjects(unpaidInMonth);
      setPayAmount(unpaidInMonth.length * (student.monthlyFee / student.subjects.length));
      setPayMethod('Cash');
      setPayRefId('');
    }
  }, [isPaymentModalOpen, student]);
  // Grand total of all payments ever made
  const totalPaidAmount = (student.payments || []).reduce((sum, p) => sum + p.amount, 0);

  // Derive an overall "status" for the UI based on whether ANY subject is overdue
  const hasOverdue = student.subjects.some(sub => {
    const dueDate = student.subjectDueDates?.[sub] || calculateDueDate(student.admissionDate, (student.payments || []).filter(p => p.subjects.includes(sub)).length);
    return isOverdue(dueDate);
  });
  
  const cycleStatus = hasOverdue ? 'Pending' : 'Paid';


  const currentMonth = new Date().toLocaleString('default', { month: 'short', year: 'numeric' });
  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'fees', label: 'Fees', icon: CreditCard },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
  ];

  const [activeTab, setActiveTab] = React.useState('profile');

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      {/* Profile Header */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start text-center md:text-left">
          <div className="size-24 md:size-32 rounded-xl overflow-hidden border-4 border-slate-50 shrink-0 shadow-sm">
            <img 
              className="w-full h-full object-cover" 
              src={student.photoUrl || `https://picsum.photos/seed/${student.name}/200/200`} 
              alt={student.name}
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex-1 space-y-4 w-full">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">{student.name}</h2>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                student.enrollmentStatus === 'Left' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                student.enrollmentStatus === 'Completed' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                'bg-emerald-50 text-emerald-600 border-emerald-100'
              }`}>
                {student.enrollmentStatus || 'Active'}
              </span>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6 text-xs md:text-sm text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <User size={16} className="text-slate-400" />
                <span>{student.studentId}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-slate-400" />
                <span>{student.class}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button 
                onClick={() => setIsPrintModalOpen(true)}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
              >
                <Download size={18} />
                Download Profile
              </button>
              <button 
                onClick={() => onEdit(student)}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg font-bold text-sm hover:bg-slate-50 transition-all"
              >
                <Edit2 size={18} />
                Edit Profile
              </button>
            </div>

              <button 
                onClick={() => setIsPaymentModalOpen(true)}
                className="flex items-center gap-2 px-6 py-2 bg-blue-900 text-white rounded-lg text-sm font-bold hover:bg-blue-800 transition-colors justify-center"
              >
                <Plus size={16} />
                Add Payment
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-4 md:gap-8 mt-8 border-b border-slate-100 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-4 text-xs md:text-sm font-bold transition-colors relative shrink-0 ${
                activeTab === tab.id ? 'text-blue-900' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <tab.icon size={18} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-900"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                {/* Basic Information */}
                <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
                    <AlertCircle className="text-blue-900" size={20} />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Gender</p>
                      <p className="text-sm font-bold">{student.gender || 'Male'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Date of Birth</p>
                      <p className="text-sm font-bold">{formatToDDMMYYYY(student.dob)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Admission Date</p>
                      <p className="text-sm font-bold">{formatToDDMMYYYY(student.admissionDate)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Current Class</p>
                      <p className="text-sm font-bold">{student.class}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Academic Stream</p>
                      <p className="text-sm font-bold">{student.stream || 'PCM (Science)'}</p>
                    </div>
                  </div>
                </section>

                {/* Academic Enrollment */}
                <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
                    <BookOpen className="text-blue-900" size={20} />
                    Academic Enrollment
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Enrolled Subjects</p>
                      <div className="flex flex-wrap gap-2">
                        {student.subjects.map(sub => (
                          <span key={sub} className="px-3 py-1 bg-blue-50 text-blue-900 text-xs font-bold rounded-full">{sub}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Batch Timing</p>
                        <div className="flex flex-col gap-2 w-full">
                          {student.subjects.map(sub => (
                            <div key={sub} className="flex justify-between items-center text-xs bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                              <span className="font-black text-slate-700">{sub}</span>
                              <span className="text-slate-500 font-medium">{student.subjectBatches?.[sub] || 'No Batch'}</span>
                            </div>
                          ))}
                        </div>
                    </div>
                  </div>
                </section>
              </div>

              <div className="space-y-8">
                {/* Contact Details */}
                <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
                    <Users className="text-blue-900" size={20} />
                    Contact Details
                  </h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="flex gap-8">
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Student Mobile</p>
                        <p className="text-sm font-bold tracking-tight">{student.mobile || 'Not provided'}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Parent Mobile</p>
                        <p className="text-sm font-bold tracking-tight">{student.parentMobile || 'Not provided'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Parent Name</p>
                      <p className="text-sm font-bold">{student.parentName || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Address</p>
                      <div className="flex items-start gap-2">
                        <MapPin size={16} className="text-slate-400 mt-0.5" />
                        <p className="text-sm font-bold leading-relaxed">{student.address || 'No address provided'}</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          )}

          {activeTab === 'fees' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                {/* Fee Summary */}
                <div className="bg-blue-900 p-6 rounded-xl text-white shadow-lg shadow-blue-900/20 relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold mb-6">Fee Summary</h3>
                    <div className="grid grid-cols-1 gap-4 mb-6">
                      <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                        <p className="text-[10px] font-black uppercase tracking-wider opacity-70 mb-1">Monthly Fee</p>
                        <p className="text-xl font-black">₹ {student.monthlyFee.toLocaleString()}</p>
                      </div>
                      <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                        <p className="text-[10px] font-black uppercase tracking-wider opacity-70 mb-1">Grand Total Paid</p>
                        <p className="text-xl font-black">₹ {totalPaidAmount.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/20">
                      <h4 className="text-[10px] font-black uppercase tracking-wider opacity-70 mb-3 border-b border-white/10 pb-2">By Subject Due Dates</h4>
                      <div className="space-y-2">
                        {student.subjects.map(sub => {
                          const subjectPaymentCount = (student.payments || []).filter(p => p.subjects.includes(sub)).length;
                          const nextMonth = getMonthForOffset(student.admissionDate, subjectPaymentCount);
                          const dueDate = student.subjectDueDates?.[sub] || calculateDueDate(student.admissionDate, subjectPaymentCount);
                          
                          return (
                            <div key={sub} className="flex justify-between items-center">
                              <div className="flex flex-col">
                                <span className="text-xs font-bold">{sub}</span>
                                <span className="text-[9px] opacity-60 font-medium">For {nextMonth}</span>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className={`text-sm font-black ${isOverdue(dueDate) ? 'text-rose-400' : 'text-amber-400'}`}>
                                  {formatToDDMMYYYY(dueDate)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <CreditCard className="absolute -bottom-4 -right-4 size-32 opacity-10 rotate-12" />
                </div>
                
                <button 
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black text-sm hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  Record New Payment
                </button>
              </div>

              <div className="lg:col-span-2 space-y-8">
                {/* Fee History */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Clock className="text-blue-900" size={20} />
                      Full Payment History
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {student.payments && student.payments.length > 0 ? (
                      student.payments.slice().reverse().map((pay, i) => (
                        <div key={pay.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors group">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-black text-slate-900">{pay.monthFor}</span>
                                <span className="text-[10px] bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded font-bold">{pay.method}</span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{formatToDDMMYYYY(pay.date)}</p>
                              {pay.subjects && pay.subjects.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {pay.subjects.map(s => (
                                    <span key={s} className="px-1.5 py-0.5 bg-white text-slate-500 text-[8px] font-black rounded uppercase border border-slate-200">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-3">
                              <p className="text-lg font-black text-slate-900">₹ {pay.amount.toLocaleString()}</p>
                              <button 
                                onClick={() => {
                                  setSelectedPayment(pay);
                                  setIsReceiptOpen(true);
                                }}
                                className="flex items-center gap-1.5 text-[10px] bg-white text-blue-900 px-3 py-1.5 rounded-lg border border-slate-200 font-black uppercase hover:bg-blue-900 hover:text-white hover:border-blue-900 transition-all shadow-sm"
                              >
                                <Receipt size={14} />
                                View Receipt
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <CreditCard className="mx-auto text-slate-300 mb-3" size={32} />
                        <p className="text-sm text-slate-400 font-bold">No payment history recorded yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-slate-50/50">
                <div>
                  <h3 className="text-base md:text-lg font-bold flex items-center gap-2">
                    <Calendar className="text-blue-900" size={18} />
                    Attendance Management
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Editable for the past 30 days</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <span className="flex items-center gap-1.5"><span className="size-3 bg-emerald-500 rounded-sm inline-block" />Present</span>
                  <span className="flex items-center gap-1.5"><span className="size-3 bg-rose-500 rounded-sm inline-block" />Absent</span>
                </div>
              </div>

              {/* Scrollable table wrapper */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[480px]">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <th className="p-3 md:p-4 whitespace-nowrap sticky left-0 bg-slate-50 z-10">Date</th>
                      <th className="p-3 md:p-4">Status</th>
                      <th className="p-3 md:p-4 hidden sm:table-cell">Day</th>
                      <th className="p-3 md:p-4 text-right">✓</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {(() => {
                      const start = parseISO(student.admissionDate);
                      const totalDays = Math.max(0, Math.ceil((new Date().getTime() - start.getTime()) / (1000 * 60 * 60 * 24))) + 1;
                      const displayDays = Math.max(30, totalDays);

                      return Array.from({ length: displayDays }, (_, i) => {
                        const date = addDays(new Date(), -i);
                        const dateStr = format(date, 'yyyy-MM-dd');
                        const isEditableRow = i < 30;

                        const getStatus = (d: Date) => {
                          const dStr = format(d, 'yyyy-MM-dd');
                          if (student.attendance?.[dStr]) return student.attendance[dStr];
                          if (d.getDay() === 0) return 'holiday';
                          return 'none';
                        };
                        const status = getStatus(date);

                        return (
                          <tr key={dateStr} className="hover:bg-slate-50 transition-colors group">
                            {/* Sticky date column */}
                            <td className="p-3 md:p-4 text-xs md:text-sm font-bold border-r border-slate-50 sticky left-0 bg-white group-hover:bg-slate-50 z-10 whitespace-nowrap">
                              {format(date, 'dd MMM yy')}
                            </td>
                            {/* Status buttons */}
                            <td className="p-3 md:p-4">
                              {isEditableRow ? (
                                <div className="flex gap-1.5">
                                  {(['present', 'absent', 'holiday'] as const).map(s => (
                                    <button
                                      key={s}
                                      onClick={() => onUpdateAttendance(student.id, dateStr, s)}
                                      className={`px-2 md:px-3 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase transition-all border ${
                                        status === s
                                          ? s === 'present' ? 'bg-emerald-500 text-white border-emerald-500'
                                            : s === 'absent' ? 'bg-rose-500 text-white border-rose-500'
                                            : 'bg-slate-500 text-white border-slate-500'
                                          : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                                      }`}
                                    >
                                      {s.charAt(0).toUpperCase() + s.slice(1, s === 'holiday' ? 3 : undefined)}
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                  status === 'present' ? 'bg-emerald-50 text-emerald-600' :
                                  status === 'absent' ? 'bg-rose-50 text-rose-600' :
                                  status === 'holiday' ? 'bg-slate-100 text-slate-500' : 'bg-slate-50 text-slate-400'
                                }`}>
                                  {status !== 'none' ? status : 'No Record'}
                                  <Clock size={9} className="opacity-50" />
                                </span>
                              )}
                            </td>
                            <td className="p-3 md:p-4 text-[10px] font-black text-slate-400 uppercase hidden sm:table-cell">
                              {format(date, 'EEE')}
                            </td>
                            <td className="p-3 md:p-4 text-right">
                              {status !== 'none' && (
                                <CheckCircle2 size={14} className="text-emerald-500 ml-auto" />
                              )}
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Payment Entry Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <CreditCard className="text-blue-900" size={20} />
                Record Payment
              </h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-rose-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Month For</label>
                <div className="flex gap-2">
                  <select 
                    value={payMonthOffset} 
                    onChange={(e) => {
                      setPayMonthOffset(Number(e.target.value));
                      setPaySubjects([]); // Reset selection on month change
                    }}
                    className="flex-1 rounded-lg border-slate-200 text-sm font-bold p-2 outline-none border focus:ring-2 focus:ring-blue-900/10"
                  >
                    {Array.from({length: 12}, (_, i) => i).map(offset => (
                      <option key={offset} value={offset}>{getMonthForOffset(student.admissionDate, offset)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Select Subjects</label>
                <div className="flex flex-wrap gap-2">
                  {student.subjects.map(sub => {
                    const targetMonth = getMonthForOffset(student.admissionDate, payMonthOffset);
                    const isAlreadyPaid = (student.payments || []).some(p => p.monthFor === targetMonth && p.subjects.includes(sub));
                    
                    return (
                      <button
                        key={sub}
                        type="button"
                        disabled={isAlreadyPaid}
                        onClick={() => {
                          setPaySubjects(prev => 
                            prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
                          );
                        }}
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all border ${
                          isAlreadyPaid
                            ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                            : paySubjects.includes(sub)
                              ? 'bg-blue-900 text-white border-blue-900'
                              : 'bg-white text-slate-500 border-slate-200 hover:border-blue-900/50'
                        }`}
                        title={isAlreadyPaid ? 'Already Paid' : ''}
                      >
                        {sub} {isAlreadyPaid && '✓'}
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
                  <button 
                    onClick={() => {
                      let total = 0;
                      paySubjects.forEach(sub => {
                        const match = (subjectFees || []).find(sf => sf.name.toLowerCase().trim() === sub.toLowerCase().trim());
                        if (match) total += match.baseFee;
                      });
                      setPayAmount(total || student.monthlyFee);
                    }}
                    className="text-[9px] text-blue-900 font-bold hover:underline mt-1"
                  >
                    Auto-calculate for selection
                  </button>
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
                    <option>Cheque</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Ref ID / Notes</label>
                <input 
                  type="text" 
                  value={payRefId} 
                  onChange={(e) => setPayRefId(e.target.value)}
                  placeholder="Optional transaction ID"
                  className="w-full rounded-lg border-slate-200 text-sm font-bold p-2 outline-none border focus:ring-2 focus:ring-blue-900/10"
                />
              </div>
              <div className="pt-4">
                <button 
                  disabled={paySubjects.length === 0}
                  onClick={() => {
                    const targetMonth = getMonthForOffset(student.admissionDate, payMonthOffset);
                    const payment = {
                      studentId: student.id,
                      amount: payAmount,
                      date: new Date().toISOString(),
                      monthFor: targetMonth,
                      method: payMethod,
                      subjects: [...paySubjects],
                      referenceId: payRefId
                    };
                    onAddPayment(student.id, payment);
                    setIsPaymentModalOpen(false);
                    // Open receipt automatically for the new payment
                    setSelectedPayment({...payment, id: 'temp-' + Date.now()});
                    setIsReceiptOpen(true);
                  }}
                  className="w-full py-3 bg-blue-900 text-white rounded-xl font-black text-sm hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Payment & Generate Receipt
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {selectedPayment && (
        <ReceiptModal 
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          student={student}
          payment={selectedPayment}
        />
      )}

      <StudentProfilePrintModal 
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        student={student}
      />
    </div>
  );
}
