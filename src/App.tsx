import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Users, CreditCard, Calendar, Settings as SettingsIcon } from 'lucide-react';

// Hooks
import { useStudents } from './hooks/useStudents';
import { useAdminProfile } from './hooks/useAdminProfile';
import { useSettings } from './hooks/useSettings';
import { useAuth } from './hooks/useAuth';
import { useContent } from './hooks/useContent';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import StudentDirectory from './components/StudentDirectory';
import AddEditStudent from './components/AddEditStudent';
import StudentProfile from './components/StudentProfile';
import Fees from './components/Fees';
import Attendance from './components/Attendance';
import Settings from './components/Settings';
import ContentManagement from './components/admin/ContentManagement';
import Login from './components/admin/Login';
import StudentPortal from './components/student/StudentPortal';

import { Student } from './types';
import { getMonthForOffset, getFeeAlertStatus } from './utils/dateUtils';

/* ─── Student Profile Route (reads studentId from URL) ───────────────────────── */
function StudentProfileRoute({ students, onEdit, onAddPayment, onUpdateAttendance, subjectFees }: any) {
  const { studentId } = useParams<{ studentId: string }>();
  const student = students.find((s: Student) => s.id === studentId);
  const navigate = useNavigate();
  if (!student) return <Navigate to="/admin/students" replace />;
  return (
    <StudentProfile
      student={student}
      onEdit={onEdit}
      onAddPayment={onAddPayment}
      onUpdateAttendance={onUpdateAttendance}
      subjectFees={subjectFees}
    />
  );
}

function StudentEditRoute({ students, batches, subjectFees, onSave }: any) {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const student = students.find((s: Student) => s.id === studentId) || null;
  return (
    <AddEditStudent
      key={studentId}
      student={student}
      onCancel={() => navigate('/admin/students')}
      onSave={onSave}
      batches={batches}
      subjectFees={subjectFees}
    />
  );
}

/* ─── Admin Layout ────────────────────────────────────────────────────────────── */
function AdminApp() {
  const { students, addStudent, updateStudent, deleteStudent, addPayment, updateAttendance } = useStudents();
  const { adminProfile, updateAdminProfile } = useAdminProfile();
  const { 
    batches, subjectFees, emailJsConfig, disqusShortname, 
    addBatch, deleteBatch, addSubjectFee, updateSubjectFee, deleteSubjectFee, 
    setAllSettings, updateEmailJsConfig, updateDisqusShortname 
  } = useSettings();
  const { isAuthenticated, login, logout } = useAuth();
  const {
    classes: contentClasses, courses, lessons,
    addClass, deleteClass, addCourse, updateCourse, deleteCourse,
    addLesson, deleteLesson, updateLesson
  } = useContent();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  const handleViewStudent = (student: Student) => {
    navigate('/admin/students/' + student.id);
    setIsSidebarOpen(false);
  };

  const handleEditStudent = (student: Student) => {
    navigate('/admin/students/' + student.id + '/edit');
    setIsSidebarOpen(false);
  };

  const handleAddStudent = () => {
    navigate('/admin/students/new');
    setIsSidebarOpen(false);
  };

  const handleSaveStudent = (studentData: Omit<Student, 'id' | 'studentId'> & { id?: string; studentId?: string }) => {
    if (studentData.id) {
      updateStudent(studentData.id, studentData);
    } else {
      addStudent(studentData);
    }
    navigate('/admin/students');
  };

  const handleDeleteStudent = (id: string) => {
    deleteStudent(id);
    navigate('/admin/students');
  };

  const notifications = React.useMemo(() => {
    const list: Array<{ id: string; message: string; type: 'pending' | 'overdue' | 'fee' }> = [];
    students.forEach(student => {
      if (student.enrollmentStatus && student.enrollmentStatus !== 'Active') return;
      student.subjects.forEach(sub => {
        const subjectPaymentCount = (student.payments || []).filter(p => p.subjects.includes(sub)).length;
        const status = getFeeAlertStatus(student.admissionDate, subjectPaymentCount, false);
        if (status !== 'none') {
          list.push({
            id: `${student.id}-${sub}`,
            message: `${student.name} ${sub} fee for ${getMonthForOffset(student.admissionDate, subjectPaymentCount)} is ${status}!`,
            type: status as 'pending' | 'overdue'
          });
        }
      });
    });
    return list;
  }, [students]);

  if (!isAuthenticated) return <Login onLogin={login} />;

  // Derive sidebar highlight from current URL path
  const pathname = location.pathname;
  const currentSection =
    pathname.includes('/content') ? 'content-management' :
    pathname.includes('/fees') ? 'fees' :
    pathname.includes('/attendance') ? 'attendance' :
    pathname.includes('/settings') ? 'settings' :
    pathname.includes('/students') ? 'students' :
    'dashboard';

  const handleViewChange = (view: string) => {
    const routeMap: Record<string, string> = {
      'dashboard': '/admin',
      'students': '/admin/students',
      'content-management': '/admin/content',
      'fees': '/admin/fees',
      'attendance': '/admin/attendance',
      'settings': '/admin/settings',
    };
    navigate(routeMap[view] || '/admin');
    setIsSidebarOpen(false);
  };

  // ── Mobile bottom nav items
  const mobileNavItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard, route: '/admin' },
    { id: 'students', label: 'Students', icon: Users, route: '/admin/students' },
    { id: 'fees', label: 'Fees', icon: CreditCard, route: '/admin/fees' },
    { id: 'attendance', label: 'Attendance', icon: Calendar, route: '/admin/attendance' },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, route: '/admin/settings' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 relative">
      <Sidebar
        currentView={currentSection as any}
        onViewChange={handleViewChange}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        adminProfile={adminProfile}
        onLogout={logout}
      />

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onAddStudent={handleAddStudent}
          onToggleSidebar={toggleSidebar}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          currentView={currentSection as any}
          notifications={notifications}
        />

        <div className="flex-1 overflow-auto pb-16 lg:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="min-h-full"
            >
              <Routes>
                {/* Dashboard */}
                <Route path="/" element={
                  <Dashboard students={students} subjectFees={subjectFees} searchQuery={searchQuery} />
                } />

                {/* Students list */}
                <Route path="/students" element={
                  <StudentDirectory
                    students={students}
                    searchQuery={searchQuery}
                    onViewStudent={handleViewStudent}
                    onEditStudent={handleEditStudent}
                    onDeleteStudent={handleDeleteStudent}
                  />
                } />

                {/* New student */}
                <Route path="/students/new" element={
                  <AddEditStudent
                    key="new"
                    student={null}
                    onCancel={() => navigate('/admin/students')}
                    onSave={handleSaveStudent}
                    batches={batches}
                    subjectFees={subjectFees}
                  />
                } />

                {/* Edit existing student */}
                <Route path="/students/:studentId/edit" element={
                  <StudentEditRoute
                    students={students}
                    batches={batches}
                    subjectFees={subjectFees}
                    onSave={handleSaveStudent}
                  />
                } />

                {/* Student profile */}
                <Route path="/students/:studentId" element={
                  <StudentProfileRoute
                    students={students}
                    onEdit={handleEditStudent}
                    onAddPayment={addPayment}
                    onUpdateAttendance={updateAttendance}
                    subjectFees={subjectFees}
                  />
                } />

                {/* Fees */}
                <Route path="/fees" element={
                  <Fees
                    students={students}
                    subjectFees={subjectFees}
                    onAddPayment={addPayment}
                    onViewStudent={(student) => navigate('/admin/students/' + student.id)}
                    searchQuery={searchQuery}
                  />
                } />

                {/* Attendance */}
                <Route path="/attendance" element={
                  <Attendance
                    students={students}
                    onUpdateAttendance={updateAttendance}
                    searchQuery={searchQuery}
                  />
                } />

                {/* Settings */}
                <Route path="/settings" element={
                  <Settings
                    adminProfile={adminProfile}
                    onUpdateAdminProfile={updateAdminProfile}
                    subjectFees={subjectFees}
                    batches={batches}
                    emailJsConfig={emailJsConfig}
                    onUpdateEmailJsConfig={updateEmailJsConfig}
                    onAddBatch={addBatch}
                    onDeleteBatch={deleteBatch}
                    onAddSubjectFee={addSubjectFee}
                    onUpdateSubjectFee={updateSubjectFee}
                    onDeleteSubjectFee={deleteSubjectFee}
                    onSetAllSettings={setAllSettings}
                    disqusShortname={disqusShortname}
                    onUpdateDisqusShortname={updateDisqusShortname}
                  />
                } />

                {/* Content Management — all 4 levels handled via nested routes inside the component */}
                <Route path="/content/*" element={
                  <ContentManagement
                    classes={contentClasses}
                    courses={courses}
                    lessons={lessons}
                    onAddClass={addClass}
                    onDeleteClass={deleteClass}
                    onAddCourse={addCourse}
                    onUpdateCourse={updateCourse}
                    onDeleteCourse={deleteCourse}
                    onAddLesson={addLesson}
                    onDeleteLesson={deleteLesson}
                    updateLesson={updateLesson}
                  />
                } />

                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ── Mobile Bottom Navigation Bar ────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-slate-200 flex items-stretch" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {mobileNavItems.map(item => {
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleViewChange(item.id)}
              className={`flex-1 flex flex-col items-center justify-center pt-2 pb-1 gap-0.5 text-[9px] font-black uppercase tracking-wide transition-colors ${
                isActive ? 'text-blue-900' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span>{item.label}</span>
              {isActive && <span className="absolute bottom-0 w-8 h-0.5 bg-blue-900 rounded-full" />}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/* ─── Root App ────────────────────────────────────────────────────────────────── */
export default function App() {
  // Load content once at root for StudentPortal
  const { classes: contentClasses, courses, lessons } = useContent();

  return (
    <Router>
      <Routes>
        {/* Public student portal — path="/*" passes sub-paths to internal Routes */}
        <Route path="/*" element={
          <StudentPortal classes={contentClasses} courses={courses} lessons={lessons} />
        } />

        {/* Admin panel — has its own useContent() instance (synced via localStorage) */}
        <Route path="/admin/*" element={<AdminApp />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
