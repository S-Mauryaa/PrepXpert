import React, { useState, useEffect, useMemo } from 'react';
import { User, Phone, Book, ArrowLeft, Save, X, Link as LinkIcon, ImageIcon, CreditCard, Plus, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { Student, Batch, SubjectFee, Payment } from '../types';
import { calculateDueDate, getMonthForOffset, formatToDDMMYYYY } from '../utils/dateUtils';
import { MOCK_SUBJECT_FEES } from '../constants';

interface AddEditStudentProps {
  key?: React.Key;
  student?: Student | null;
  onCancel: () => void;
  onSave: (student: any) => void;
  batches: Batch[];
  subjectFees: SubjectFee[];
}

export default function AddEditStudent({ student, onCancel, onSave, batches, subjectFees }: AddEditStudentProps) {
  const isEdit = !!student;

  const [name, setName] = useState(student?.name || '');
  const [gender, setGender] = useState(student?.gender || '');
  const [dob, setDob] = useState(student?.dob || '');
  const [admissionDate, setAdmissionDate] = useState(student?.admissionDate || new Date().toISOString().split('T')[0]);
  const [studentClass, setStudentClass] = useState(student?.class || '');
  const [stream, setStream] = useState(student?.stream || '');
  const [mobile, setMobile] = useState(student?.mobile || '');
  const [parentName, setParentName] = useState(student?.parentName || '');
  const [parentMobile, setParentMobile] = useState(student?.parentMobile || '');
  const [address, setAddress] = useState(student?.address || '');
  const [enrollmentStatus, setEnrollmentStatus] = useState<any>(student?.enrollmentStatus || 'Active');
  const [photoUrl, setPhotoUrl] = useState(student?.photoUrl || '');
  const [subjects, setSubjects] = useState<string[]>(student?.subjects || []);
  const [subjectBatches, setSubjectBatches] = useState<Record<string, string>>(student?.subjectBatches || {});
  const [subjectStatuses, setSubjectStatuses] = useState<Record<string, string>>(student?.subjectStatuses || {});
  const [subjectDueDates, setSubjectDueDates] = useState<Record<string, string>>(student?.subjectDueDates || {});
  const [monthlyFee, setMonthlyFee] = useState<number>(student?.monthlyFee || 0);

  // Quick Payment UI State
  const [quickPayAmount, setQuickPayAmount] = useState(0);
  const [quickPayMonthOffset, setQuickPayMonthOffset] = useState(0);
  const [quickPayMethod, setQuickPayMethod] = useState('Cash');
  const [quickPaySubjects, setQuickPaySubjects] = useState<string[]>([]);

  const [payments, setPayments] = useState<Payment[]>(student?.payments || []);

  // Compute dynamic classes from settings
  const availableClasses = useMemo(() => {
    const classes = new Set<string>();
    subjectFees.forEach(sf => {
      // Split by comma in case a subject covers multiple classes, e.g. "Class 11, Class 12"
      const clsList = sf.classes.split(',').map(c => c.trim());
      clsList.forEach(c => {
        if (c) classes.add(c);
      });
    });
    return Array.from(classes).sort(); // Basic alphabetical sort
  }, [subjectFees]);

  // Compute dynamic subjects based on selected class
  const availableSubjects = useMemo(() => {
    if (!studentClass) return [];
    return subjectFees.filter(sf => {
      const clsList = sf.classes.split(',').map(c => c.trim().toLowerCase());
      return clsList.includes(studentClass.toLowerCase());
    });
  }, [studentClass, subjectFees]);

  // Auto-calculate fee when subjects change, IF it's not an edit mode that already has a custom fee set.
  // Actually, we'll auto-calculate the total sum every time.
  useEffect(() => {
    let total = 0;
    subjects.forEach(subName => {
      const match = (subjectFees || []).find(sf => 
        sf.name.toLowerCase().trim() === subName.toLowerCase().trim()
      );
      if (match) {
        total += match.baseFee;
      }
    });

    setMonthlyFee(total);
  }, [subjects, subjectFees]);

  // If a class changes, remove subjects that are no longer applicable
  useEffect(() => {
    const validSubjectNames = availableSubjects.map(s => s.name);
    setSubjects(prev => prev.filter(s => validSubjectNames.includes(s)));
  }, [studentClass, availableSubjects]);

  const toggleSubject = (subName: string) => {
    setSubjects(prev =>
      prev.includes(subName) ? prev.filter(s => s !== subName) : [...prev, subName]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const studentData = {
      name,
      gender,
      dob,
      admissionDate,
      class: studentClass,
      stream,
      mobile,
      parentName,
      parentMobile,
      address,
      enrollmentStatus,
      photoUrl,
      subjects,
      subjectBatches,
      subjectStatuses,
      subjectDueDates: (() => {
        const newDueDates = { ...subjectDueDates };
        subjects.forEach(sub => {
          const subjectPaymentCount = payments.filter((p: Payment) => p.subjects.includes(sub)).length;
          newDueDates[sub] = calculateDueDate(admissionDate, subjectPaymentCount);
        });
        return newDueDates;
      })(),
      status: 'Unassigned', // Deprecated global status
      monthlyFee,
      payments,
      dueDate: (() => {
        const dDates = subjects.map(sub => {
          const count = payments.filter((p: Payment) => p.subjects.includes(sub)).length;
          return calculateDueDate(admissionDate, count);
        });
        return dDates.length > 0 
          ? dDates.reduce((earliest, current) => (current < earliest ? current : earliest))
          : calculateDueDate(admissionDate, payments.length);
      })(),
    };
    onSave(studentData);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 md:py-8 px-4">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 md:mb-8">
        <div className="flex items-center gap-2 text-slate-500 text-[10px] md:text-sm font-bold uppercase tracking-wider">
          <button type="button" onClick={onCancel} className="hover:text-blue-900">Dashboard</button>
          <span className="text-xs">/</span>
          <button type="button" onClick={onCancel} className="hover:text-blue-900">Students</button>
          <span className="text-xs">/</span>
          <span className="text-slate-900">{isEdit ? 'Edit Student' : 'Add New Student'}</span>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black leading-tight tracking-tight text-slate-900">
              {isEdit ? 'Edit Student' : 'Add New Student'}
            </h1>
            <p className="text-slate-500 text-sm">
              {isEdit ? `Update profile for ${student.name}` : 'Create a new student profile and assign them to a batch'}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isEdit && (
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status:</span>
                <select
                  className="bg-transparent text-sm font-black text-slate-900 border-none focus:ring-0 cursor-pointer outline-none p-0"
                  value={enrollmentStatus}
                  onChange={(e) => setEnrollmentStatus(e.target.value as any)}
                >
                  <option value="Active">Active</option>
                  <option value="Left">Left</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            )}
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-200 transition-colors flex-1 sm:flex-none justify-center"
            >
              <ArrowLeft size={18} />
              Back
            </button>
          </div>
        </div>

      </div>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        {/* Basic Info */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <User className="text-blue-900" size={20} />
              Basic Information
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* Photo URL Input */}
            <div className="sm:col-span-2 md:col-span-1 md:row-span-2 flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 transition-colors">
              <div className="size-32 rounded-full bg-slate-200 flex items-center justify-center mb-3 overflow-hidden relative">
                {photoUrl ? (
                  <img 
                    src={photoUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <ImageIcon className="text-slate-400" size={40} />
                )}
              </div>
              <div className="w-full mt-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">
                  <LinkIcon size={12} className="inline mr-1" />
                  Photo URL
                </label>
                <input
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full rounded-lg border-slate-200 bg-white focus:border-blue-900 focus:ring-blue-900/20 text-xs py-2 px-3 outline-none border"
                  placeholder="https://example.com/photo.jpg"
                  type="url"
                />
              </div>
              <p className="text-[10px] text-slate-400 text-center mt-2 leading-relaxed px-2">
                Upload to <a href="https://imgbb.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-bold">imgbb.com</a> or <a href="https://postimages.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-bold">postimages.org</a> and paste the link
              </p>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Full Name <span className="text-red-500">*</span></label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border-slate-200 bg-white focus:border-blue-900 focus:ring-blue-900/20 text-sm py-2 px-3 outline-none border"
                placeholder="Enter student's full name"
                required
                type="text"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full rounded-lg border-slate-200 bg-white focus:border-blue-900 focus:ring-blue-900/20 text-sm py-2 px-3 outline-none border">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Date of Birth</label>
              <input value={dob} onChange={(e) => setDob(e.target.value)} className="w-full rounded-lg border-slate-200 bg-white focus:border-blue-900 focus:ring-blue-900/20 text-sm py-2 px-3 outline-none border" type="date" />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Admission Date <span className="text-red-500">*</span></label>
              <input value={admissionDate} onChange={(e) => setAdmissionDate(e.target.value)} className="w-full rounded-lg border-slate-200 bg-white focus:border-blue-900 focus:ring-blue-900/20 text-sm py-2 px-3 outline-none border" required type="date" />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Class</label>
              <input 
                list="class-list"
                value={studentClass} 
                onChange={(e) => setStudentClass(e.target.value)} 
                className="w-full rounded-lg border-slate-200 bg-white focus:border-blue-900 focus:ring-blue-900/20 text-sm py-2 px-3 outline-none border"
                placeholder="Select or type class (e.g., Class 10)"
              />
              <datalist id="class-list">
                {Array.from(new Set([...Array.from({length: 12}, (_, i) => `Class ${i + 1}`), ...availableClasses])).map(cls => (
                  <option key={cls} value={cls} />
                ))}
              </datalist>
            </div>

            {studentClass.includes('11') || studentClass.includes('12') ? (
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Stream</label>
                <select value={stream} onChange={(e) => setStream(e.target.value)} className="w-full rounded-lg border-slate-200 bg-white focus:border-blue-900 focus:ring-blue-900/20 text-sm py-2 px-3 outline-none border">
                  <option value="">Select Stream</option>
                  <option value="Math">Math</option>
                  <option value="Biology">Biology</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Arts">Arts</option>
                </select>
              </div>
            ) : (
              <div className="hidden md:block"></div>
            )}
          </div>
        </section>

        {/* Contact Details */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Phone className="text-blue-900" size={20} />
              Contact Details
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Student Mobile Number <span className="text-red-500">*</span></label>
              <input
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full rounded-lg border-slate-200 bg-white focus:border-blue-900 focus:ring-blue-900/20 text-sm py-2 px-3 outline-none border"
                placeholder="e.g., 9876543210"
                required
                type="tel"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Parent/Guardian Name</label>
              <input value={parentName} onChange={(e) => setParentName(e.target.value)} className="w-full rounded-lg border-slate-200 bg-white focus:border-blue-900 focus:ring-blue-900/20 text-sm py-2 px-3 outline-none border" placeholder="Full name of guardian" type="text" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Parent/Guardian Mobile</label>
              <input value={parentMobile} onChange={(e) => setParentMobile(e.target.value)} className="w-full rounded-lg border-slate-200 bg-white focus:border-blue-900 focus:ring-blue-900/20 text-sm py-2 px-3 outline-none border" placeholder="e.g., 9876543210" type="tel" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Full Address</label>
              <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="w-full rounded-lg border-slate-200 bg-white focus:border-blue-900 focus:ring-blue-900/20 text-sm py-2 px-3 outline-none border" placeholder="Enter complete residential address" rows={3}></textarea>
            </div>
          </div>
        </section>
        {/* Academic & Batch Assignment */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Book className="text-blue-900" size={20} />
            Academic & Batch Assignment
          </h3>

          <div className="space-y-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Subjects & Batch Timings</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableSubjects.length > 0 ? (
                availableSubjects.map((fee) => (
                  <div 
                    key={fee.id}
                    className={`flex flex-col p-4 border-2 rounded-2xl transition-all ${
                      subjects.includes(fee.name) 
                        ? 'border-blue-900 bg-blue-50/50 shadow-sm ring-2 ring-blue-900/5' 
                        : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="size-4 rounded border-slate-300 text-blue-900 focus:ring-blue-900/20"
                          checked={subjects.includes(fee.name)}
                          onChange={() => toggleSubject(fee.name)}
                        />
                        <span className="text-sm font-black text-slate-900">{fee.name}</span>
                      </label>
                      <span className="text-xs font-black text-blue-900">₹{fee.baseFee}</span>
                    </div>
                    
                    {subjects.includes(fee.name) && (
                      <div className="space-y-2 pt-2 border-t border-blue-900/10">
                        <label className="text-[9px] font-black text-slate-400 uppercase">Selected Batch</label>
                        <select
                          value={subjectBatches[fee.name] || ''}
                          onChange={(e) => setSubjectBatches({ ...subjectBatches, [fee.name]: e.target.value })}
                          className="w-full rounded-lg border-slate-200 text-xs font-bold p-2 outline-none border focus:ring-2 focus:ring-blue-900/10 bg-white"
                        >
                          <option value="">Select timing</option>
                          {batches.map(b => (
                            <option key={b.id} value={`${b.time} (${b.days})`}>{b.time} ({b.days})</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="md:col-span-2 p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center">
                  <p className="text-xs text-slate-400 italic">
                    {studentClass ? 'No subjects found for this class in settings.' : 'Please select a class first to see available subjects.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Billing & Fee Information */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <CreditCard className="text-blue-900" size={20} />
              Billing & Fee Information
            </h3>
            <p className="text-[10px] text-slate-500 font-medium">Manage monthly fees and historical records</p>
          </div>
          <div className="p-6 space-y-8">
            {admissionDate && new Date(admissionDate) < new Date(new Date().setHours(0,0,0,0)) && subjects.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Consolidated Historical Record</p>
                  <span className="text-[9px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full uppercase">Past Admission Mode</span>
                </div>
                
                <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl flex flex-col lg:flex-row gap-4 items-end">
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                    <div>
                      <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Month For</label>
                      <select 
                        value={quickPayMonthOffset}
                        onChange={(e) => {
                          setQuickPayMonthOffset(Number(e.target.value));
                          setQuickPaySubjects([]);
                        }}
                        className="w-full bg-white border border-blue-200 p-2 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-blue-900/10"
                      >
                        {Array.from({length: 12}, (_, i) => i).map(offset => (
                          <option key={offset} value={offset}>{getMonthForOffset(admissionDate, offset)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Amount (₹)</label>
                      <input 
                        type="number"
                        placeholder="Amt"
                        value={quickPayAmount || monthlyFee}
                        onChange={(e) => setQuickPayAmount(Number(e.target.value))}
                        className="w-full bg-white border border-blue-200 p-2 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-blue-900/10"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Method</label>
                      <select 
                        value={quickPayMethod}
                        onChange={(e) => setQuickPayMethod(e.target.value)}
                        className="w-full bg-white border border-blue-200 p-2 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-blue-900/10"
                      >
                        <option>Cash</option>
                        <option>UPI</option>
                        <option>Transfer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-500 uppercase mb-1 flex justify-between">
                        <span>Subjects</span>
                        <button 
                          type="button"
                          onClick={() => {
                            const targetMonth = getMonthForOffset(admissionDate, quickPayMonthOffset);
                            const available = subjects.filter(s => !payments.some(p => p.monthFor === targetMonth && p.subjects.includes(s)));
                            setQuickPaySubjects(available);
                          }}
                          className="text-[8px] text-blue-900 font-bold hover:underline"
                        >Available All</button>
                      </label>
                      <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto bg-white p-1 rounded-lg border border-blue-200">
                        {subjects.map(s => {
                          const targetMonth = getMonthForOffset(admissionDate, quickPayMonthOffset);
                          const isAlreadyPaid = payments.some(p => p.monthFor === targetMonth && p.subjects.includes(s));
                          
                          return (
                            <button
                              key={s}
                              type="button"
                              disabled={isAlreadyPaid}
                              onClick={() => {
                                setQuickPaySubjects(prev => 
                                  prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
                                );
                              }}
                              className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase transition-all ${
                                isAlreadyPaid
                                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed border border-dashed border-slate-200'
                                  : quickPaySubjects.includes(s) 
                                    ? 'bg-blue-900 text-white' 
                                    : 'bg-slate-100 text-slate-400'
                              }`}
                              title={isAlreadyPaid ? 'Already Paid for this month' : ''}
                            >
                              {s} {isAlreadyPaid && '✓'}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (quickPaySubjects.length === 0) return alert('Select at least one subject');
                      const targetMonth = getMonthForOffset(admissionDate, quickPayMonthOffset);
                      
                      // Final validation check
                      const duplicates = quickPaySubjects.filter(s => payments.some(p => p.monthFor === targetMonth && p.subjects.includes(s)));
                      if (duplicates.length > 0) {
                        return alert(`Error: ${duplicates.join(', ')} already paid for ${targetMonth}`);
                      }

                      const newPay = {
                        id: 'quick-' + Date.now(),
                        studentId: student?.id || 'new',
                        amount: quickPayAmount || monthlyFee,
                        date: new Date().toISOString(),
                        monthFor: targetMonth,
                        method: quickPayMethod,
                        subjects: [...quickPaySubjects]
                      };
                      setPayments([...payments, newPay]);
                      setQuickPaySubjects([]);
                      setQuickPayAmount(0);
                    }}
                    className="w-full lg:w-auto h-10 px-6 bg-blue-900 text-white text-xs font-black rounded-lg hover:bg-blue-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95"
                  >
                    <Plus size={16} />
                    Record Selected
                  </button>
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-slate-50">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Total Monthly Fee (₹) *</label>
              <div className="relative group max-w-[200px]">
                <input
                  type="number"
                  value={monthlyFee}
                  onChange={(e) => setMonthlyFee(Number(e.target.value))}
                  className="w-full bg-slate-50/50 border border-slate-200 text-lg font-black text-blue-900 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-blue-900/10 focus:bg-white transition-all shadow-inner"
                  required
                />
              </div>
              <p className="mt-3 text-[10px] text-slate-400 flex items-center gap-1.5 font-medium">
                <AlertCircle size={12} className="text-amber-500" />
                Due date is the monthly anniversary of admission. A 10-day grace period is allowed for submissions.
              </p>
            </div>
          </div>
        </section>

        {/* Payment History Records */}
        {(isEdit || (admissionDate && new Date(admissionDate) < new Date(new Date().setHours(0,0,0,0)))) && (
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <CreditCard className="text-blue-900" size={20} />
                  Payment History Records
                </h3>
                <p className="text-[10px] text-slate-500 font-medium">Manage past payments and subject history</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const offset = payments.length;
                  const newPayment: Payment = {
                    id: 'temp-' + Date.now(),
                    studentId: student?.id || 'new',
                    amount: monthlyFee,
                    date: new Date().toISOString(),
                    monthFor: getMonthForOffset(admissionDate, offset),
                    method: 'Cash',
                    subjects: [...subjects],
                    referenceId: ''
                  };
                  setPayments([...payments, newPayment]);
                }}
                className="text-xs font-black bg-blue-900 text-white px-3 py-1.5 rounded-lg hover:bg-blue-800 transition-colors flex items-center gap-1 shadow-sm"
              >
                <Plus size={14} />
                Add Record
              </button>
            </div>
            <div className="p-6">
              {payments.length > 0 ? (
                <div className="space-y-4">
                  {payments.map((pay, idx) => (
                    <div key={pay.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 relative group">
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="flex gap-2 items-center shrink-0">
                          <span className="text-[10px] font-black text-slate-400 bg-white size-6 rounded-full flex items-center justify-center border border-slate-200 shadow-sm">{idx + 1}</span>
                          <select
                            value={pay.monthFor}
                            onChange={(e) => {
                              const newPayments = [...payments];
                              newPayments[idx] = { ...pay, monthFor: e.target.value };
                              setPayments(newPayments);
                            }}
                            className="bg-white border border-slate-200 text-xs font-bold rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-900/10"
                          >
                            {Array.from({length: 24}, (_, i) => i - 12).map(offset => (
                              <option key={offset} value={getMonthForOffset(admissionDate, offset + (student?.payments?.length || 0))}>
                                {getMonthForOffset(admissionDate, offset + (student?.payments?.length || 0))}
                              </option>
                            ))}
                            {!Array.from({length: 24}, (_, i) => i - 12).map(o => getMonthForOffset(admissionDate, o + (student?.payments?.length || 0))).includes(pay.monthFor) && (
                              <option value={pay.monthFor}>{pay.monthFor}</option>
                            )}
                          </select>
                        </div>
                        
                        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
                          <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Amount (₹)</label>
                            <input
                              type="number"
                              value={pay.amount}
                              onChange={(e) => {
                                const newPayments = [...payments];
                                newPayments[idx] = { ...pay, amount: Number(e.target.value) };
                                setPayments(newPayments);
                              }}
                              className="w-full bg-white border border-slate-200 text-xs font-bold rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-900/10"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Method</label>
                            <select
                              value={pay.method}
                              onChange={(e) => {
                                const newPayments = [...payments];
                                newPayments[idx] = { ...pay, method: e.target.value };
                                setPayments(newPayments);
                              }}
                              className="w-full bg-white border border-slate-200 text-xs font-bold rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-900/10"
                            >
                              <option>Cash</option>
                              <option>UPI</option>
                              <option>Transfer</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Ref ID</label>
                            <input
                              type="text"
                              value={pay.referenceId || ''}
                              onChange={(e) => {
                                const newPayments = [...payments];
                                newPayments[idx] = { ...pay, referenceId: e.target.value };
                                setPayments(newPayments);
                              }}
                              placeholder="Optional"
                              className="w-full bg-white border border-slate-200 text-xs font-bold rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-900/10"
                            />
                          </div>
                          <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 pt-2 sm:pt-0">
                            <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Subjects Covered</label>
                            <div className="flex flex-wrap gap-1">
                              {subjects.map(s => (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => {
                                    const newPayments = [...payments];
                                    const newSubs = pay.subjects.includes(s) 
                                      ? pay.subjects.filter(sub => sub !== s)
                                      : [...pay.subjects, s];
                                    newPayments[idx] = { ...pay, subjects: newSubs };
                                    setPayments(newPayments);
                                  }}
                                  className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase transition-all ${
                                    pay.subjects.includes(s) 
                                      ? 'bg-blue-900 text-white' 
                                      : 'bg-white text-slate-400 border border-slate-200'
                                  }`}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setPayments(payments.filter(p => p.id !== pay.id))}
                          className="absolute -top-2 -right-2 sm:static p-1.5 bg-white sm:bg-transparent shadow-sm sm:shadow-none border border-slate-100 sm:border-0 rounded-full text-slate-300 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2">
                    <p className="text-[10px] text-slate-400 italic">
                      Records are saved with the student. Due dates are automatically derived from the total payments per subject.
                    </p>
                  </div>
                </div>

              ) : (
                <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                  <CreditCard className="mx-auto text-slate-200 mb-2" size={32} />
                  <p className="text-sm text-slate-400 font-medium">No historical records yet.</p>
                  <p className="text-[10px] text-slate-300 mt-1">Add past payments to align the billing cycle.</p>
                </div>
              )}
            </div>
          </section>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pb-12 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-2.5 rounded-lg text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
          >
            <Save size={18} />
            {isEdit ? 'Update Student' : 'Save Student'}
          </button>
        </div>
      </form>
    </div>
  );
}
