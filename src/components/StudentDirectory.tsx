import React, { useState, useMemo } from 'react';
import { Eye, Edit2, Trash2, FilterX, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { Student } from '../types';
import { formatToDDMMYYYY } from '../utils/dateUtils';

interface StudentDirectoryProps {
  students: Student[];
  searchQuery: string;
  onViewStudent: (student: Student) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
}

export default function StudentDirectory({ students, searchQuery, onViewStudent, onEditStudent, onDeleteStudent }: StudentDirectoryProps) {
  const [classFilter, setClassFilter] = useState('All Classes');
  const [subjectFilter, setSubjectFilter] = useState('All Subjects');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [enrollmentFilter, setEnrollmentFilter] = useState('All');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  // Derive subject list dynamically from real student data
  const dynamicSubjects = useMemo(() => {
    const s = new Set<string>();
    students.forEach(st => (st.subjects || []).forEach(sub => s.add(sub)));
    return ['All Subjects', ...Array.from(s).sort()];
  }, [students]);

  // Count active (non-default) filters
  const activeFilterCount = [
    classFilter !== 'All Classes',
    subjectFilter !== 'All Subjects',
    statusFilter !== 'All Status',
    enrollmentFilter !== 'All',
  ].filter(Boolean).length;

  const resetFilters = () => {
    setClassFilter('All Classes');
    setSubjectFilter('All Subjects');
    setStatusFilter('All Status');
    setEnrollmentFilter('All');
    setCurrentPage(1);
  };

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.subjects.some(sub => sub.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesClass = classFilter === 'All Classes' || student.class === classFilter;
      const matchesSubject = subjectFilter === 'All Subjects' || student.subjects.includes(subjectFilter);

      const matchesFeeStatus = statusFilter === 'All Status' || (
        statusFilter === 'Paid' ? student.subjects.every(sub => student.subjectStatuses?.[sub] === 'Paid') :
        statusFilter === 'Pending' ? student.subjects.some(sub => student.subjectStatuses?.[sub] === 'Pending' || student.subjectStatuses?.[sub] === 'Partial') :
        statusFilter === 'Partial' ? student.subjects.some(sub => student.subjectStatuses?.[sub] === 'Partial') : true
      );

      const matchesEnrollment = enrollmentFilter === 'All' || student.enrollmentStatus === enrollmentFilter;

      return matchesSearch && matchesClass && matchesSubject && matchesFeeStatus && matchesEnrollment;
    });
  }, [students, searchQuery, classFilter, subjectFilter, statusFilter, enrollmentFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / perPage));
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handleDelete = (id: string) => {
    onDeleteStudent(id);
    setDeleteConfirm(null);
  };

  // Per-student overall fee status helper
  const getOverallStatus = (student: Student) => {
    if (!student.subjects || student.subjects.length === 0) return { label: 'No Subjects', color: 'bg-slate-100 text-slate-400 border-slate-100' };
    const allPaid = student.subjects.every(sub => student.subjectStatuses?.[sub] === 'Paid');
    const somePartial = student.subjects.some(sub => student.subjectStatuses?.[sub] === 'Partial');
    const somePending = student.subjects.some(sub => student.subjectStatuses?.[sub] === 'Pending');
    if (allPaid) return { label: 'Paid', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
    if (somePartial) return { label: 'Partial', color: 'bg-amber-50 text-amber-700 border-amber-100' };
    if (somePending) return { label: 'Pending', color: 'bg-rose-50 text-rose-700 border-rose-100' };
    return { label: 'Unassigned', color: 'bg-slate-100 text-slate-500 border-slate-200' };
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2">Student Directory</h2>
        <p className="text-slate-500 text-sm md:text-base">Manage and monitor student enrollments, fees, and performance.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm flex-1 min-w-[140px] sm:flex-none">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Class:</span>
          <select 
            value={classFilter} 
            onChange={(e) => { setClassFilter(e.target.value); setCurrentPage(1); }}
            className="bg-transparent border-none p-0 text-sm font-bold focus:ring-0 cursor-pointer outline-none flex-1"
          >
            {['All Classes', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map(opt => <option key={opt}>{opt}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm flex-1 min-w-[140px] sm:flex-none">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Subject:</span>
          <select 
            value={subjectFilter} 
            onChange={(e) => { setSubjectFilter(e.target.value); setCurrentPage(1); }}
            className="bg-transparent border-none p-0 text-sm font-bold focus:ring-0 cursor-pointer outline-none flex-1"
          >
            {dynamicSubjects.map(opt => <option key={opt}>{opt}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm flex-1 min-w-[140px] sm:flex-none">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Fee Status:</span>
          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-transparent border-none p-0 text-sm font-bold focus:ring-0 cursor-pointer outline-none flex-1"
          >
            {['All Status', 'Paid', 'Pending', 'Partial'].map(opt => <option key={opt}>{opt}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm flex-1 min-w-[140px] sm:flex-none">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Enrollment:</span>
          <select 
            value={enrollmentFilter} 
            onChange={(e) => { setEnrollmentFilter(e.target.value); setCurrentPage(1); }}
            className="bg-transparent border-none p-0 text-sm font-bold focus:ring-0 cursor-pointer outline-none flex-1"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Left">Left</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <button onClick={resetFilters} className="text-sm text-blue-900 font-bold hover:underline flex items-center gap-1.5 ml-auto sm:ml-0">
          <FilterX size={14} />
          Reset
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center size-4 bg-blue-900 text-white text-[9px] font-black rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Delete Student</h3>
                <p className="text-slate-500 text-sm">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-6">Are you sure you want to permanently remove this student from the directory?</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteConfirm(null)} 
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDelete(deleteConfirm)} 
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[860px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Student ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Class</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Enrollment</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Subjects</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Monthly Fee</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                    <p className="text-lg font-bold mb-1">No students found</p>
                    <p className="text-sm">Try adjusting your search or filters.</p>
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student) => {
                  const { label: statusLabel, color: statusColor } = getOverallStatus(student);
                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full overflow-hidden shrink-0 border border-slate-100 shadow-sm bg-slate-200 flex items-center justify-center">
                            {student.photoUrl ? (
                              <img 
                                className="w-full h-full object-cover" 
                                src={student.photoUrl} 
                                alt={student.name}
                                referrerPolicy="no-referrer"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            ) : (
                              <span className="text-xs font-bold text-slate-500">{student.name.charAt(0)}</span>
                            )}
                          </div>
                          <span className="text-sm font-bold">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-mono">{student.studentId}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-600">{student.class}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          student.enrollmentStatus === 'Left' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                          student.enrollmentStatus === 'Completed' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {student.enrollmentStatus || 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2 min-w-[120px]">
                          {student.subjects.map(sub => (
                            <div key={sub} className="flex flex-col bg-slate-50 border border-slate-100 p-1.5 rounded-lg">
                              <span className="text-[10px] font-black text-slate-700 leading-tight">{sub}</span>
                              <div className="flex justify-between items-center mt-0.5 gap-2">
                                <span className="text-[9px] font-medium text-slate-500 leading-tight">
                                  {student.subjectBatches?.[sub] || 'No Batch'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                      {/* Overall fee status pill */}
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusColor}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold">₹{student.monthlyFee.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-bold">{formatToDDMMYYYY(student.dueDate)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => onViewStudent(student)}
                            className="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-blue-900 rounded-lg transition-colors"
                            title="View Profile"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            onClick={() => onEditStudent(student)}
                            className="p-1.5 hover:bg-amber-50 text-slate-400 hover:text-amber-600 rounded-lg transition-colors"
                            title="Edit Student"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => setDeleteConfirm(student.id)}
                            className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors" 
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 bg-slate-50 flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 gap-4">
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredStudents.length === 0 ? 0 : (currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filteredStudents.length)} of {filteredStudents.length} students
            <span className="text-slate-400 ml-2">· Page {currentPage} of {totalPages}</span>
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold hover:bg-white transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
              <span className="hidden sm:inline">Previous</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map(page => (
              <button 
                key={page} 
                onClick={() => setCurrentPage(page)}
                className={`size-8 rounded-lg text-xs font-bold transition-colors ${
                  currentPage === page 
                    ? 'bg-blue-900 text-white' 
                    : 'border border-slate-300 hover:bg-white'
                }`}
              >
                {page}
              </button>
            ))}
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold hover:bg-white transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
