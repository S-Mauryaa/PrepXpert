import React, { useState } from 'react';
import { Calendar as CalendarIcon, CheckCircle2, Clock, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { Student } from '../types';
import { format, addDays, subDays, isSameDay } from 'date-fns';

interface AttendanceProps {
  students: Student[];
  onUpdateAttendance: (studentId: string, date: string, status: string) => void;
  searchQuery: string;
}

const STATUS_STYLES: Record<string, string> = {
  present: 'bg-emerald-600 text-white border-emerald-600 shadow-md',
  absent: 'bg-rose-600 text-white border-rose-600 shadow-md',
  holiday: 'bg-slate-500 text-white border-slate-500 shadow-md',
};
const STATUS_INACTIVE = 'bg-white text-slate-400 border-slate-200 hover:border-slate-300';
const STATUS_LOCKED = 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed';

export default function Attendance({ students, onUpdateAttendance, searchQuery }: AttendanceProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(subDays(selectedDate, 3), i));

  const getStatus = (student: Student, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    if (student.attendance?.[dateStr]) return student.attendance[dateStr];
    if (date.getDay() === 0) return 'holiday';
    return 'none';
  };

  const isEditable = Math.ceil((new Date().getTime() - selectedDate.getTime()) / (1000 * 60 * 60 * 24)) <= 30;

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-3 text-slate-900">
            <CalendarIcon className="text-blue-900 shrink-0" size={28} />
            Daily Attendance
          </h2>
          <p className="text-slate-500 font-medium text-sm">Mark and manage student attendance records</p>
        </div>
      </div>

      {/* Edit-lock warning */}
      {!isEditable && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-amber-800">
          <Clock className="shrink-0 mt-0.5" size={18} />
          <div className="text-xs font-bold leading-relaxed">
            <p className="uppercase tracking-widest text-[10px] mb-0.5">Historical Record</p>
            <p className="opacity-80">This date is outside the 30-day editing window. Records are preserved for viewing only.</p>
          </div>
        </div>
      )}

      {/* Date Picker Strip */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Month navigator */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSelectedDate(subDays(selectedDate, 1))}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="text-center min-w-[110px]">
              <p className="text-sm font-black text-blue-900">{format(selectedDate, 'MMMM yyyy')}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{format(selectedDate, 'EEEE')}</p>
            </div>
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Week day buttons — scrollable on narrow screens */}
          <div className="flex-1 overflow-x-auto w-full">
            <div className="flex gap-2 min-w-max pb-1">
              {weekDates.map(date => (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={`flex flex-col items-center min-w-[52px] p-2.5 rounded-xl transition-all border ${
                    isSameDay(date, selectedDate)
                      ? 'bg-blue-900 border-blue-900 text-white shadow-lg shadow-blue-900/20'
                      : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span className="text-[9px] font-black uppercase tracking-tighter mb-0.5">{format(date, 'eee')}</span>
                  <span className="text-base font-black leading-none">{format(date, 'dd')}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="hidden sm:flex items-center gap-3 text-xs font-black shrink-0">
            <span className="flex items-center gap-1.5 text-slate-400"><span className="size-3 border border-slate-200 rounded-sm inline-block" />None</span>
            <span className="flex items-center gap-1.5 text-emerald-600"><span className="size-3 bg-emerald-500 rounded-sm inline-block" />Present</span>
            <span className="flex items-center gap-1.5 text-rose-600"><span className="size-3 bg-rose-500 rounded-sm inline-block" />Absent</span>
          </div>
        </div>
      </div>

      {/* Register */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/10">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-base md:text-lg font-black text-slate-900 tracking-tight">Attendance Register</h3>
            <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-full border border-slate-200 uppercase tracking-wider">
              {format(selectedDate, 'dd MMM, yyyy')}
            </span>
          </div>
          <button
            disabled={!isEditable}
            onClick={() => {
              filteredStudents.forEach(s => {
                if (getStatus(s, selectedDate) === 'none') {
                  onUpdateAttendance(s.id, format(selectedDate, 'yyyy-MM-dd'), 'present');
                }
              });
            }}
            className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black rounded-lg transition-all uppercase tracking-widest self-start sm:self-auto ${
              isEditable
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
          >
            <Save size={14} />
            Mark All Present
          </button>
        </div>

        {/* --- Desktop table (md and up) --- */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[680px]">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="p-4">Student</th>
                <th className="p-4">ID / Class</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Last 7 Days</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.length > 0 ? filteredStudents.map(student => {
                const status = getStatus(student, selectedDate);
                const last7 = Array.from({ length: 7 }, (_, i) => addDays(subDays(selectedDate, 6), i));
                return (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                          <img src={student.photoUrl || `https://picsum.photos/seed/${student.name}/100/100`} className="w-full h-full object-cover" alt="" />
                        </div>
                        <p className="text-sm font-black text-slate-900 group-hover:text-blue-900 transition-colors">{student.name}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{student.studentId}</p>
                      <p className="text-[11px] font-black text-slate-600">{student.class}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {(['present', 'absent', 'holiday'] as const).map(s => (
                          <button
                            key={s}
                            disabled={!isEditable}
                            onClick={() => onUpdateAttendance(student.id, format(selectedDate, 'yyyy-MM-dd'), s)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1.5 border ${
                              status === s ? STATUS_STYLES[s] : isEditable ? STATUS_INACTIVE : STATUS_LOCKED
                            }`}
                          >
                            {status === s && <CheckCircle2 size={11} />}
                            {s}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-1">
                        {last7.map(d => {
                          const s = getStatus(student, d);
                          return (
                            <div
                              key={d.toISOString()}
                              title={`${format(d, 'dd MMM')}: ${s}`}
                              className={`size-2.5 rounded-sm ${
                                s === 'present' ? 'bg-emerald-500' :
                                s === 'absent' ? 'bg-rose-500' :
                                s === 'holiday' ? 'bg-slate-400' : 'bg-slate-200'
                              }`}
                            />
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={4} className="p-12 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <CalendarIcon size={40} className="mb-3" />
                      <p className="text-sm font-black uppercase tracking-widest">No students found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- Mobile card list (below md) --- */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredStudents.length > 0 ? filteredStudents.map(student => {
            const status = getStatus(student, selectedDate);
            const last7 = Array.from({ length: 7 }, (_, i) => addDays(subDays(selectedDate, 6), i));
            return (
              <div key={student.id} className="p-4 space-y-3">
                {/* Student row */}
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                    <img src={student.photoUrl || `https://picsum.photos/seed/${student.name}/100/100`} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-900 truncate">{student.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{student.studentId} · {student.class}</p>
                  </div>
                  {/* mini dots */}
                  <div className="flex gap-1 shrink-0">
                    {last7.map(d => {
                      const s = getStatus(student, d);
                      return (
                        <div key={d.toISOString()} title={`${format(d, 'dd MMM')}: ${s}`} className={`size-2 rounded-sm ${
                          s === 'present' ? 'bg-emerald-500' : s === 'absent' ? 'bg-rose-500' : s === 'holiday' ? 'bg-slate-400' : 'bg-slate-200'
                        }`} />
                      );
                    })}
                  </div>
                </div>
                {/* Status buttons */}
                <div className="flex gap-2">
                  {(['present', 'absent', 'holiday'] as const).map(s => (
                    <button
                      key={s}
                      disabled={!isEditable}
                      onClick={() => onUpdateAttendance(student.id, format(selectedDate, 'yyyy-MM-dd'), s)}
                      className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1.5 border ${
                        status === s ? STATUS_STYLES[s] : isEditable ? STATUS_INACTIVE : STATUS_LOCKED
                      }`}
                    >
                      {status === s && <CheckCircle2 size={11} />}
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            );
          }) : (
            <div className="p-12 text-center flex flex-col items-center opacity-40">
              <CalendarIcon size={40} className="mb-3" />
              <p className="text-sm font-black uppercase tracking-widest">No students found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
