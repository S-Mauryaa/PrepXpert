import React from 'react';
import { X, Printer, Download, CheckCircle2, School } from 'lucide-react';
import { Student, Payment } from '../types';
import { formatToDDMMYYYY } from '../utils/dateUtils';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  payment: Payment;
}

export default function ReceiptModal({ isOpen, onClose, student, payment }: ReceiptModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header - Actions */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
            <h3 className="font-black text-slate-900 tracking-tight">Payment Receipt</h3>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint}
              className="p-2 text-slate-500 hover:text-blue-900 hover:bg-white rounded-lg transition-all print:hidden"
              title="Print Receipt"
            >
              <Printer size={20} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-white rounded-lg transition-all print:hidden"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="flex-1 overflow-auto p-8 md:p-12 print:p-4" id="receipt-content">
          <div className="max-w-xl mx-auto space-y-8 border border-slate-100 p-8 rounded-xl shadow-sm bg-white">
            {/* Coaching Header */}
            <div className="text-center space-y-2 border-b border-slate-100 pb-6">
              <div className="flex justify-center mb-2">
                <div className="bg-blue-900 size-12 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <School size={28} />
                </div>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tighter">PREPXPERT COACHING CLASSES</h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Academic Excellence Centre</p>
              <p className="text-[10px] text-slate-400 font-medium">123 Education Lane, Learning Hub, City - 110021</p>
            </div>

            {/* Receipt Info Grid */}
            <div className="grid grid-cols-2 gap-y-6 text-sm">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Receipt No.</p>
                <p className="font-bold text-slate-900">RCP-{payment.id.split('-')[0].toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Date</p>
                <p className="font-bold text-slate-900">{formatToDDMMYYYY(payment.date)}</p>
              </div>

              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Student Details</p>
                <p className="font-black text-slate-900 text-lg">{student.name}</p>
                <p className="text-xs text-slate-500 font-bold">{student.class} | {student.studentId}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Admission Date</p>
                <p className="font-bold text-slate-900">{formatToDDMMYYYY(student.admissionDate)}</p>
              </div>
            </div>

            {/* Payment Table */}
            <div className="border border-slate-100 rounded-xl overflow-hidden mt-8">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-wider">Description</th>
                    <th className="px-4 py-3 text-right text-[10px] font-black text-slate-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-900">Monthly Tuition Fee</p>
                      <p className="text-[10px] text-slate-500 font-medium">For {payment.monthFor}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {payment.subjects.map(s => (
                          <span key={s} className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold uppercase">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right font-black text-slate-900">
                      ₹ {payment.amount.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
                <tfoot className="bg-slate-50/50">
                  <tr>
                    <td className="px-4 py-3 text-right text-[10px] font-black text-slate-500 uppercase tracking-wider">Grand Total</td>
                    <td className="px-4 py-3 text-right text-lg font-black text-blue-900">
                      ₹ {payment.amount.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Footer Notes */}
            <div className="grid grid-cols-2 gap-4 items-end pt-8">
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Payment Method</p>
                  <p className="text-xs font-bold text-slate-700">{payment.method}</p>
                </div>
                {payment.referenceId && (
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Ref/Trans ID</p>
                    <p className="text-xs font-bold text-slate-700 font-mono italic">{payment.referenceId}</p>
                  </div>
                )}
              </div>
              <div className="text-right space-y-12">
                <div className="h-px w-32 bg-slate-200 ml-auto"></div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">ABHISHEK MAURYA</p>
                <p className="text-[8px] text-slate-400 uppercase font-bold">Authorized Signatory</p>
              </div>
            </div>

            <div className="text-center pt-8 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 font-medium italic">This is a computer-generated receipt and does not require a physical signature.</p>
              <p className="text-[10px] text-blue-900 font-black mt-1 uppercase tracking-widest">Thank you for being part of our journey.</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 print:hidden">
          <button 
            onClick={onClose}
            className="px-6 py-2 text-sm font-bold text-slate-600 hover:text-slate-900"
          >
            Close
          </button>
          <button 
            onClick={handlePrint}
            className="px-8 py-2 bg-blue-900 text-white rounded-lg text-sm font-bold hover:bg-blue-800 transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20"
          >
            <Printer size={16} />
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
