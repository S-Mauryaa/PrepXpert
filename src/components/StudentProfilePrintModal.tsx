import React from 'react';
import { X, Printer, User, BookOpen, School, Phone, MapPin, Calendar, Clock } from 'lucide-react';
import { Student } from '../types';
import { formatToDDMMYYYY } from '../utils/dateUtils';

interface StudentProfilePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
}

export default function StudentProfilePrintModal({ isOpen, onClose, student }: StudentProfilePrintModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `${student.name}_Profile`;
    window.print();
    document.title = originalTitle;
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:rounded-none">
        {/* Header - Actions */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 print:hidden">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Printer size={20} />
            </div>
            <h3 className="font-black text-slate-900 tracking-tight">Print Student Profile</h3>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg font-bold text-sm hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20"
            >
              <Printer size={18} />
              Print / Save PDF
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-white rounded-lg transition-all"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="flex-1 overflow-auto p-4 md:p-12 print:p-0 print:overflow-visible" id="profile-print-content">
          <div className="max-w-2xl mx-auto bg-white print:w-full">
            
            {/* Institution Header */}
            <div className="flex justify-between items-center border-b-2 border-blue-900 pb-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="bg-blue-900 size-14 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <School size={32} />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tighter">PREPXPERT COACHING CLASSES</h1>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Academic Excellence Centre</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Student Profile Record</p>
                <p className="text-lg font-black text-blue-900">{student.studentId}</p>
              </div>
            </div>

            {/* Profile Core Info Row */}
            <div className="flex gap-8 mb-10 items-start">
              {/* Photo Area */}
              <div className="size-40 rounded-2xl border-4 border-slate-50 shadow-sm overflow-hidden bg-slate-100 shrink-0">
                {student.photoUrl ? (
                  <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <User size={64} />
                  </div>
                )}
              </div>

              {/* Identity Details */}
              <div className="flex-1 space-y-6">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">{student.name}</h2>
                  <div className="flex gap-3">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-900 text-[10px] font-black rounded uppercase border border-blue-100">
                      {student.class}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-50 text-slate-500 text-[10px] font-black rounded uppercase border border-slate-100">
                      {student.gender}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Stream</p>
                    <p className="text-xs font-bold text-slate-700">{student.stream || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Date of Birth</p>
                    <p className="text-xs font-bold text-slate-700">{formatToDDMMYYYY(student.dob)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Admission Date</p>
                    <p className="text-xs font-bold text-slate-700">{formatToDDMMYYYY(student.admissionDate)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Enrollment Status</p>
                    <p className={`text-xs font-bold ${
                      student.enrollmentStatus === 'Left' ? 'text-rose-600' :
                      student.enrollmentStatus === 'Completed' ? 'text-blue-600' :
                      'text-emerald-600'
                    }`}>
                      {student.enrollmentStatus || 'Active'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-10 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Phone size={16} className="text-blue-900" />
                Contact Information
              </h3>
              <div className="grid grid-cols-2 gap-y-6">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Student Mobile</p>
                  <p className="text-xs font-bold text-slate-800">{student.mobile || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Parent/Guardian Name</p>
                  <p className="text-xs font-bold text-slate-800">{student.parentName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Parent Mobile</p>
                  <p className="text-xs font-bold text-slate-800">{student.parentMobile || 'N/A'}</p>
                </div>
                <div className="col-span-1">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Residential Address</p>
                   <p className="text-[11px] font-medium text-slate-600 leading-relaxed italic">{student.address || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Academic Enrollment */}
            <div className="mb-10">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <BookOpen size={16} className="text-blue-900" />
                Enrolled Subjects & Batches
              </h3>
              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3 font-black text-slate-500 uppercase">Subject</th>
                      <th className="px-6 py-3 font-black text-slate-500 uppercase">Batch Timing & Days</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {student.subjects.map((sub, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-black text-blue-900">{sub}</td>
                        <td className="px-6 py-4 font-bold text-slate-600">
                          {student.subjectBatches?.[sub] ? (
                            <div className="flex items-center gap-2">
                              <Clock size={12} className="text-slate-400" />
                              {student.subjectBatches[sub]}
                            </div>
                          ) : 'Not Assigned'}
                        </td>
                      </tr>
                    ))}
                    {student.subjects.length === 0 && (
                      <tr>
                        <td colSpan={2} className="px-6 py-8 text-center text-slate-400 italic font-medium">
                          No subjects enrolled at this time.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer / Validity */}
            <div className="mt-12 pt-8 border-t border-dashed border-slate-200 grid grid-cols-2 gap-8 items-end">
              <div>
                <p className="text-[9px] text-slate-400 leading-relaxed">
                  * This document serves as a verified student profile record.<br />
                  * For internal records and identity verification purposes only.<br />
                  * Valid until the completion of current academic session.
                </p>
              </div>
              <div className="text-right space-y-12">
                <div className="inline-block border-b border-slate-300 w-32 pb-1"></div>
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">ABHISHEK MAURYA</p>
                <p className="text-[8px] text-slate-400 uppercase font-bold">Authorized Signatory</p>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-[8px] text-slate-300 uppercase tracking-widest font-black">PREPXPERT COACHING CLASSES &copy; 2026</p>
            </div>
          </div>
        </div>

        {/* Print Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 print:hidden">
          <button 
            onClick={onClose}
            className="px-6 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Close Preview
          </button>
          <button 
            onClick={handlePrint}
            className="px-8 py-3 bg-blue-900 text-white rounded-xl font-black text-sm hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
          >
            <Printer size={18} />
            Download PDF
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body * {
            visibility: hidden;
          }
          #profile-print-content, #profile-print-content * {
            visibility: visible;
          }
          #profile-print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
            background: white;
          }
          .animate-in {
            animation: none !important;
          }
          /* Hide empty pages or overflow */
          html, body {
            height: auto;
            overflow: visible !important;
          }
        }
      `}} />
    </div>
  );
}
