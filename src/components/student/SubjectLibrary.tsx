import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Book, PlayCircle, ChevronRight, BookOpen } from 'lucide-react';
import { Course } from '../../types';
import { useTheme } from '../../hooks/useTheme';

interface SubjectLibraryProps {
  selectedClass: string;
  courses: Course[];
  onCourseSelect: (course: Course) => void;
  onBack: () => void;
}

export default function SubjectLibrary({ selectedClass, courses, onCourseSelect, onBack }: SubjectLibraryProps) {
  const filteredCourses = courses.filter(c => c.class === selectedClass);
  const { theme } = useTheme();
  const dk = theme === 'dark';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen pb-24 relative overflow-hidden ${dk ? 'bg-slate-950' : 'bg-slate-50'}`}
    >
      {/* ── Background Flares ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ x: [0, -30, 0], y: [0, 40, 0], scale: [1, 1.1, 1], opacity: dk ? [0.1, 0.2, 0.1] : [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-600 blur-[120px]" 
        />
        <motion.div 
          animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.2, 1], opacity: dk ? [0.05, 0.15, 0.05] : [0.1, 0.3, 0.1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[40%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-indigo-500 blur-[100px]" 
        />
      </div>

      <div className={`border-b relative z-10 ${dk ? 'bg-slate-900/50 backdrop-blur-xl border-slate-800' : 'bg-white/80 backdrop-blur-xl border-slate-200'}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 md:py-14">
          <button
            type="button"
            onClick={onBack}
            className={`flex items-center gap-2 font-bold text-xs uppercase tracking-widest transition-colors mb-6 ${
              dk ? 'text-slate-400 hover:text-blue-400' : 'text-slate-500 hover:text-blue-600'
            }`}
          >
            <ArrowLeft size={14} /> All Classes
          </button>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            className={`text-4xl md:text-5xl font-black tracking-tight mb-2 drop-shadow-md ${dk ? 'text-white' : 'text-slate-900'}`}
          >
            {selectedClass}
          </motion.h1>
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`font-medium ${dk ? 'text-slate-400' : 'text-slate-500'}`}
          >
            {filteredCourses.length} Subject{filteredCourses.length !== 1 ? 's' : ''} available — select one to view lectures.
          </motion.p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {filteredCourses.map((course, idx) => (
              <motion.button
                key={course.id}
                type="button"
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ delay: idx * 0.1, type: "spring", stiffness: 300, damping: 20 }}
                onClick={() => onCourseSelect(course)}
                className={`group relative rounded-3xl overflow-hidden transition-all duration-500 text-left border-2 backdrop-blur-xl ${
                  dk
                    ? 'bg-slate-900/50 border-slate-700/50 hover:bg-slate-800/80 hover:border-blue-500 hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)] shadow-black/40'
                    : 'bg-white/80 border-white hover:border-blue-400 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.2)] shadow-blue-900/5'
                }`}
              >
                {/* Glowing edge highlight */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20"></div>
                
                <div className={`h-28 sm:aspect-video relative overflow-hidden ${dk ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  {/* Image Shimmer overlay */}
                  <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-10 pointer-events-none" />
                  
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.subjectName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center transition-transform duration-700 group-hover:scale-110 ${dk ? 'bg-gradient-to-br from-slate-800 to-slate-900' : 'bg-gradient-to-br from-slate-100 to-slate-200'}`}>
                      <Book size={32} className={`sm:size-12 transition-colors duration-500 ${dk ? 'text-slate-600 group-hover:text-slate-500' : 'text-slate-300 group-hover:text-blue-200'}`} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 via-blue-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center overflow-hidden">
                    <motion.div 
                      initial={{ scale: 0.5, opacity: 0 }}
                      whileHover={{ scale: 1.1 }}
                      className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform"
                    >
                      <PlayCircle className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" size={48} />
                    </motion.div>
                  </div>
                </div>

                <div className="p-4 sm:p-6 relative z-10">
                  <h3 className={`text-base sm:text-2xl font-black mb-1 truncate transition-colors duration-300 ${dk ? 'text-white group-hover:text-blue-300' : 'text-slate-900 group-hover:text-blue-700'}`}>{course.subjectName}</h3>
                  <p className={`text-xs font-medium line-clamp-2 ${dk ? 'text-slate-400' : 'text-slate-500'} hidden sm:block sm:mb-4 sm:min-h-[40px]`}>
                    {course.description || 'Access all lectures, notes and assignments for this subject.'}
                  </p>
                  <div className={`flex items-center justify-end pt-2 sm:pt-4 sm:border-t ${dk ? 'border-slate-700' : 'border-slate-100'}`}>
                    <ChevronRight size={16} className={`transition-colors ${dk ? 'text-slate-600 group-hover:text-blue-400' : 'text-slate-300 group-hover:text-blue-600'}`} />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`py-24 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center backdrop-blur-md shadow-2xl ${
            dk ? 'border-slate-700 bg-slate-800/50 text-slate-400 shadow-black/50' : 'border-slate-200 bg-white/70 text-slate-400 shadow-blue-900/5'
          }`}>
            <BookOpen size={48} className="mb-4 opacity-10" />
            <p className={`font-black text-2xl mb-1 ${dk ? 'text-slate-300' : 'text-slate-600'}`}>No Subjects Yet</p>
            <p className="text-sm font-medium mt-1 mb-8">Content for {selectedClass} is being prepared.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onBack}
              className={`px-8 py-3.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all shadow-xl ${
                dk ? 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-blue-500/20' : 'bg-slate-900 text-white hover:bg-blue-600 hover:shadow-blue-600/30'
              }`}
            >
              Back to Classes
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
