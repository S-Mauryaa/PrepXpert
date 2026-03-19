import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft, Play, Layers, Video, ChevronRight, BookOpen, PlayCircle
} from 'lucide-react';
import { Course, Lesson, OneShotVideo } from '../../types';
import { useTheme } from '../../hooks/useTheme';

interface LessonBrowserProps {
  course: Course;
  lessons: Lesson[];
  onBack: () => void;
  onSelectLesson: (lessonId: string, mode: 'topics' | 'one-shot', itemId?: string) => void;
}

function getOneShotVideos(lesson: Lesson): OneShotVideo[] {
  if (lesson.videos && lesson.videos.length > 0) return lesson.videos;
  if (lesson.youtubeId) return [{ id: 'legacy', title: lesson.title, youtubeId: lesson.youtubeId, driveUrl: lesson.driveUrl }];
  return [];
}

export default function LessonBrowser({ course, lessons, onBack, onSelectLesson }: LessonBrowserProps) {
  const courseLessons = lessons.filter(l => l.courseId === course.id);
  const [lessonModes, setLessonModes] = useState<Record<string, 'topics' | 'one-shot'>>({});
  const [expandedLessons, setExpandedLessons] = useState<Record<string, boolean>>({});
  const { theme } = useTheme();
  const dk = theme === 'dark';

  const getMode = (lesson: Lesson) => lessonModes[lesson.id] || lesson.type;
  const isExpanded = (lessonId: string) => expandedLessons[lessonId] ?? false;

  const toggleExpand = (lessonId: string) => {
    setExpandedLessons(prev => ({ ...prev, [lessonId]: !prev[lessonId] }));
  };

  const setMode = (lessonId: string, mode: 'topics' | 'one-shot') => {
    const currentMode = lessonModes[lessonId];
    const currentExpanded = expandedLessons[lessonId];
    if (currentMode === mode && currentExpanded) {
      // clicking active mode — collapse
      setExpandedLessons(prev => ({ ...prev, [lessonId]: false }));
    } else {
      // switch mode and expand
      setLessonModes(prev => ({ ...prev, [lessonId]: mode }));
      setExpandedLessons(prev => ({ ...prev, [lessonId]: true }));
    }
  };

  return (
    <div className={`min-h-screen pb-16 ${dk ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {/* Header */}
      <div className={`border-b ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-10">
          <button
            type="button"
            onClick={onBack}
            className={`flex items-center gap-2 font-bold text-xs uppercase tracking-[0.15em] transition-colors mb-5 ${
              dk ? 'text-slate-400 hover:text-blue-400' : 'text-slate-400 hover:text-blue-600'
            }`}
          >
            <ArrowLeft size={14} /> Back to Subjects
          </button>
          <div className="flex items-start gap-5">
            {course.thumbnailUrl && (
              <div className={`hidden sm:block size-20 rounded-2xl overflow-hidden shrink-0 border ${dk ? 'bg-slate-700 border-slate-600' : 'bg-slate-100 border-slate-200'}`}>
                <img src={course.thumbnailUrl} alt={course.subjectName} className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <h1 className={`text-2xl sm:text-3xl font-black tracking-tight mb-1 ${dk ? 'text-white' : 'text-slate-900'}`}>{course.subjectName}</h1>
              <p className={`font-bold text-xs uppercase tracking-[0.15em] ${dk ? 'text-slate-500' : 'text-slate-400'}`}>
                {course.class} — {courseLessons.length} Chapter{courseLessons.length !== 1 ? 's' : ''}
              </p>
              {course.description && (
                <p className={`text-sm mt-3 max-w-xl leading-relaxed ${dk ? 'text-slate-400' : 'text-slate-500'}`}>{course.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lessons */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-5">
        {courseLessons.length === 0 ? (
          <div className={`py-20 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center ${
            dk ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-white border-slate-200 text-slate-400'
          }`}>
            <BookOpen size={48} className="mb-4 opacity-10" />
            <p className={`font-black text-lg ${dk ? 'text-slate-300' : 'text-slate-600'}`}>No Lessons Yet</p>
            <p className="text-sm font-medium mt-1">Content is being prepared. Check back soon!</p>
          </div>
        ) : (
          courseLessons.map((lesson, idx) => {
            const hasTopics = (lesson.topics?.length || 0) > 0;
            const oneShotVideos = getOneShotVideos(lesson);
            const hasOneShot = oneShotVideos.length > 0;
            const hasBoth = hasTopics && hasOneShot;
            const mode = getMode(lesson);
            const effectiveMode = !hasTopics && hasOneShot ? 'one-shot' : !hasOneShot && hasTopics ? 'topics' : mode;

            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: idx * 0.1, duration: 0.5, type: "spring", stiffness: 200, damping: 20 }}
                className={`border-2 rounded-2xl sm:rounded-[2rem] overflow-hidden transition-all duration-500 shadow-sm backdrop-blur-xl ${
                  isExpanded(lesson.id)
                    ? (dk ? 'border-blue-500/50 shadow-blue-500/10 bg-slate-800/80 shadow-2xl' : 'border-blue-400 shadow-blue-900/10 bg-white/90 shadow-2xl')
                    : (dk ? 'bg-slate-800/40 border-slate-700 hover:border-blue-500/30 hover:bg-slate-800' : 'bg-white/60 border-slate-200 hover:shadow-lg hover:border-slate-300 hover:bg-white')
                }`}
              >
                <div className="p-5 sm:p-6 relative">
                  {/* Subtle dynamic glow if expanded */}
                  {isExpanded(lesson.id) && <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-transparent pointer-events-none" />}
                  <div className="flex items-start gap-4 relative z-10">
                    <div className={`size-10 sm:size-12 rounded-xl flex items-center justify-center font-black text-lg shrink-0 shadow-lg transition-transform duration-500 ${
                      isExpanded(lesson.id) ? 'scale-110 bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-blue-500/30' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <h3 className={`text-base sm:text-lg font-black mb-1 transition-colors ${dk ? (isExpanded(lesson.id) ? 'text-white' : 'text-slate-300') : (isExpanded(lesson.id) ? 'text-blue-950' : 'text-slate-800')}`}>{lesson.title}</h3>
                      {lesson.description && (
                        <p className={`text-sm font-medium line-clamp-2 ${dk ? 'text-slate-400' : 'text-slate-500'}`}>{lesson.description}</p>
                      )}
                    </div>

                    {hasBoth ? (
                      <div className={`flex p-1 rounded-xl gap-1 shrink-0 ${dk ? 'bg-slate-700' : 'bg-slate-100'}`}>
                        <button
                          type="button"
                          onClick={() => setMode(lesson.id, 'topics')}
                          className={`py-2 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                            effectiveMode === 'topics' && isExpanded(lesson.id)
                              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                              : (dk ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-600' : 'text-slate-400 hover:text-slate-600 hover:bg-white/60')
                          }`}
                        >
                          <Layers size={12} /> Topics
                        </button>
                        <button
                          type="button"
                          onClick={() => setMode(lesson.id, 'one-shot')}
                          className={`py-2 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                            effectiveMode === 'one-shot' && isExpanded(lesson.id)
                              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
                              : (dk ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-600' : 'text-slate-400 hover:text-slate-600 hover:bg-white/60')
                          }`}
                        >
                          <Video size={12} /> One Shot
                        </button>
                      </div>
                    ) : (
                      <div className="shrink-0">
                        {hasTopics && (
                          <button
                            type="button"
                            onClick={() => toggleExpand(lesson.id)}
                            className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-xl border transition-all ${
                              isExpanded(lesson.id)
                                ? (dk ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-emerald-100 text-emerald-600 border-emerald-200')
                                : (dk ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100')
                            }`}
                          >
                            <Layers size={11} />
                            {lesson.topics?.length} Topic{(lesson.topics?.length || 0) !== 1 ? 's' : ''}
                            <ChevronRight size={11} className={`transition-transform duration-200 ${isExpanded(lesson.id) ? 'rotate-90' : ''}`} />
                          </button>
                        )}
                        {hasOneShot && (
                          <button
                            type="button"
                            onClick={() => toggleExpand(lesson.id)}
                            className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-xl border transition-all ${
                              isExpanded(lesson.id)
                                ? (dk ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-amber-100 text-amber-600 border-amber-200')
                                : (dk ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20' : 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100')
                            }`}
                          >
                            <Video size={11} />
                            {oneShotVideos.length} Video{oneShotVideos.length !== 1 ? 's' : ''}
                            <ChevronRight size={11} className={`transition-transform duration-200 ${isExpanded(lesson.id) ? 'rotate-90' : ''}`} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {(hasTopics || hasOneShot) && isExpanded(lesson.id) && (
                  <div className={`border-t ${dk ? 'border-slate-700' : 'border-slate-100'}`}>
                    <div className="p-4 sm:p-5">
                      {effectiveMode === 'topics' && hasTopics && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {lesson.topics?.map((topic) => (
                            <motion.button
                              whileHover={{ scale: 1.02, x: 5 }}
                              whileTap={{ scale: 0.98 }}
                              key={topic.id}
                              type="button"
                              onClick={() => onSelectLesson(lesson.id, 'topics', topic.id)}
                              className={`group flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border transition-all duration-300 text-left ${
                                dk
                                  ? 'border-slate-700/50 hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                  : 'border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/80 hover:shadow-[0_4px_10px_rgba(16,185,129,0.1)]'
                              }`}
                            >
                              <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-300 ${
                                dk ? 'bg-slate-800 text-slate-500 group-hover:bg-emerald-500 group-hover:text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-emerald-500 group-hover:text-white'
                              }`}>
                                <PlayCircle size={16} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-[13px] font-bold truncate transition-colors duration-300 ${dk ? 'text-slate-300 group-hover:text-emerald-400' : 'text-slate-700 group-hover:text-emerald-700'}`}>{topic.title}</p>
                                {topic.description && (
                                  <p className="text-[10px] text-slate-400 truncate font-medium mt-0.5">{topic.description}</p>
                                )}
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      )}

                      {effectiveMode === 'one-shot' && hasOneShot && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {oneShotVideos.map((video) => (
                            <motion.button
                              whileHover={{ scale: 1.02, x: 5 }}
                              whileTap={{ scale: 0.98 }}
                              key={video.id}
                              type="button"
                              onClick={() => onSelectLesson(lesson.id, 'one-shot', video.id)}
                              className={`group flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border transition-all duration-300 text-left ${
                                dk
                                  ? 'border-slate-700/50 hover:border-amber-500/50 hover:bg-amber-500/10 hover:shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                                  : 'border-slate-100 hover:border-amber-300 hover:bg-amber-50/80 hover:shadow-[0_4px_10px_rgba(245,158,11,0.1)]'
                              }`}
                            >
                              <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-300 ${
                                dk ? 'bg-slate-800 text-slate-500 group-hover:bg-amber-500 group-hover:text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-amber-500 group-hover:text-white'
                              }`}>
                                <Video size={16} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-[13px] font-bold truncate transition-colors duration-300 ${dk ? 'text-slate-300 group-hover:text-amber-400' : 'text-slate-700 group-hover:text-amber-700'}`}>{video.title}</p>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      )}

                      {!hasTopics && !hasOneShot && (
                        <p className="text-xs text-slate-400 font-medium text-center py-4">No content available yet.</p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
