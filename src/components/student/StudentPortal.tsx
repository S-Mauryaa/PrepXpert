import React from 'react';
import { Routes, Route, Navigate, useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { GraduationCap, ChevronRight, Sun, Moon } from 'lucide-react';
import { Course, Lesson } from '../../types';
import { ThemeProvider, useTheme } from '../../hooks/useTheme';
import SubjectLibrary from './SubjectLibrary';
import LessonBrowser from './LessonBrowser';
import LessonList from './LessonList';
import Home from './Home';

interface StudentPortalProps {
  classes: string[];
  courses: Course[];
  lessons: Lesson[];
}

/* ─── Shared Navbar ──────────────────────────────────────────────────────────── */
function Navbar({ courses }: { courses: Course[] }) {
  const { theme, toggle } = useTheme();
  return (
    <header className={`sticky top-0 z-50 backdrop-blur-2xl border-b shrink-0 transition-all duration-300 ${
      theme === 'dark'
        ? 'bg-slate-900/60 border-slate-800 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]'
        : 'bg-white/70 border-slate-200 shadow-[0_10px_30px_-10px_rgba(59,130,246,0.1)]'
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-14 sm:h-16 flex items-center gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="size-8 sm:size-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:bg-blue-500 transition-colors">
            <GraduationCap size={18} className="text-white" />
          </div>
          <div>
            <p className={`font-black text-sm sm:text-base leading-none tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>PrepXpert</p>
            <p className={`text-[9px] font-bold uppercase tracking-widest hidden sm:block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Student Portal</p>
          </div>
        </Link>

        {/* Breadcrumb */}
        <NavBreadcrumb courses={courses} />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggle}
          className={`size-9 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${
            theme === 'dark'
              ? 'bg-white/10 text-yellow-400 hover:bg-white/15'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}

/* ─── Breadcrumb reads URL params ────────────────────────────────────────────── */
function NavBreadcrumb({ courses }: { courses: Course[] }) {
  const { theme } = useTheme();
  const { className, courseId } = useParams<{ className?: string; courseId?: string }>();
  const cls = className ? decodeURIComponent(className) : null;
  const course = courseId ? courses.find(c => c.id === courseId) : null;

  if (!cls) return null;

  return (
    <nav className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black uppercase tracking-widest overflow-hidden">
      <Link to="/" className={`transition-colors shrink-0 ${theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}>Classes</Link>
      <ChevronRight size={10} className={theme === 'dark' ? 'text-slate-600' : 'text-slate-300'} />
      <Link
        to={`/${encodeURIComponent(cls)}`}
        className={`transition-colors truncate ${course
          ? (theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-900')
          : (theme === 'dark' ? 'text-white' : 'text-slate-900')}`}
      >
        {cls}
      </Link>
      {course && (
        <>
          <ChevronRight size={10} className={theme === 'dark' ? 'text-slate-600' : 'text-slate-300'} />
          <span className={`truncate max-w-[120px] sm:max-w-none ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{course.subjectName}</span>
        </>
      )}
    </nav>
  );
}

/* ─── Route Wrappers ─────────────────────────────────────────────────────────── */
function HomeRoute({ classes, courses }: { classes: string[]; courses: Course[] }) {
  const navigate = useNavigate();
  return (
    <Home
      classes={classes}
      courses={courses}
      onClassSelect={(cls) => navigate(`/${encodeURIComponent(cls)}`)}
    />
  );
}

function SubjectsRoute({ courses }: { courses: Course[] }) {
  const { className } = useParams<{ className: string }>();
  const navigate = useNavigate();
  const cls = decodeURIComponent(className || '');

  return (
    <SubjectLibrary
      selectedClass={cls}
      courses={courses}
      onCourseSelect={(course) => navigate(`/${encodeURIComponent(cls)}/${course.id}`)}
      onBack={() => navigate('/')}
    />
  );
}

function BrowserRoute({ courses, lessons }: { courses: Course[]; lessons: Lesson[] }) {
  const { className, courseId } = useParams<{ className: string; courseId: string }>();
  const navigate = useNavigate();
  const cls = decodeURIComponent(className || '');
  const course = courses.find(c => c.id === courseId);

  if (!course) return <Navigate to={`/${encodeURIComponent(cls)}`} replace />;

  return (
    <LessonBrowser
      course={course}
      lessons={lessons}
      onBack={() => navigate(`/${encodeURIComponent(cls)}`)}
      onSelectLesson={(lessonId, mode, itemId) => {
        const params = new URLSearchParams();
        params.set('mode', mode);
        if (mode === 'topics' && itemId) params.set('topicId', itemId);
        if (mode === 'one-shot' && itemId) params.set('videoId', itemId);
        navigate(`/${encodeURIComponent(cls)}/${courseId}/${lessonId}?${params.toString()}`);
      }}
    />
  );
}

function ViewerRoute({ courses, lessons }: { courses: Course[]; lessons: Lesson[] }) {
  const { className, courseId, lessonId } = useParams<{ className: string; courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cls = decodeURIComponent(className || '');
  const course = courses.find(c => c.id === courseId);

  if (!course) return <Navigate to={`/${encodeURIComponent(cls)}`} replace />;

  return (
    <LessonList
      course={course}
      lessons={lessons}
      onBack={() => navigate(`/${encodeURIComponent(cls)}/${courseId}`)}
      initialLessonId={lessonId}
      initialMode={(searchParams.get('mode') as 'topics' | 'one-shot') || null}
      initialTopicId={searchParams.get('topicId')}
      initialVideoId={searchParams.get('videoId')}
    />
  );
}

/* ─── Animated page wrapper ──────────────────────────────────────────────────── */
function AnimatedPage({ children, k }: { children: React.ReactNode; k: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={k}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.15 }}
        className="flex-1 flex flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── Inner Portal (uses theme) ──────────────────────────────────────────────── */
function PortalContent({ classes, courses, lessons }: StudentPortalProps) {
  const { theme } = useTheme();
  return (
    <div className={`flex flex-col min-h-screen font-sans ${theme === 'dark' ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      <Routes>
        <Route path="/" element={
          <div className="flex flex-col min-h-screen">
            <Navbar courses={courses} />
            <AnimatedPage k="home">
              <HomeRoute classes={classes} courses={courses} />
            </AnimatedPage>
          </div>
        } />

        <Route path="/:className" element={
          <div className="flex flex-col min-h-screen">
            <Navbar courses={courses} />
            <AnimatedPage k="subjects">
              <SubjectsRoute courses={courses} />
            </AnimatedPage>
          </div>
        } />

        <Route path="/:className/:courseId" element={
          <div className="flex flex-col min-h-screen">
            <Navbar courses={courses} />
            <AnimatedPage k="browser">
              <BrowserRoute courses={courses} lessons={lessons} />
            </AnimatedPage>
          </div>
        } />

        <Route path="/:className/:courseId/:lessonId" element={
          <div className="flex flex-col flex-1">
            <Navbar courses={courses} />
            <AnimatedPage k="viewer">
              <ViewerRoute courses={courses} lessons={lessons} />
            </AnimatedPage>
          </div>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

/* ─── Main Portal with URL Routing ──────────────────────────────────────────── */
export default function StudentPortal({ classes, courses, lessons }: StudentPortalProps) {
  return (
    <ThemeProvider>
      <PortalContent classes={classes} courses={courses} lessons={lessons} />
    </ThemeProvider>
  );
}
