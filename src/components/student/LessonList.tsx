import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Play, FileText, List, Clock,
  ChevronRight, ChevronDown, Video, File, Layers,
  Download, Eye, X
} from 'lucide-react';
import { Course, Lesson, OneShotVideo } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { useSettings } from '../../hooks/useSettings';
import { DiscussionEmbed } from 'disqus-react';

interface LessonListProps {
  course: Course;
  lessons: Lesson[];
  onBack: () => void;
  initialLessonId?: string;
  initialMode?: 'topics' | 'one-shot' | null;
  initialTopicId?: string | null;
  initialVideoId?: string | null;
}

function getOneShotVideos(lesson: Lesson): OneShotVideo[] {
  if (lesson.videos && lesson.videos.length > 0) return lesson.videos;
  if (lesson.youtubeId) return [{ id: 'legacy', title: lesson.title, youtubeId: lesson.youtubeId, driveUrl: lesson.driveUrl }];
  return [];
}

export default function LessonList({ course, lessons, onBack, initialLessonId, initialMode, initialTopicId, initialVideoId }: LessonListProps) {
  const courseLessons = lessons.filter(l => l.courseId === course.id);
  const { theme } = useTheme();
  const dk = theme === 'dark';
  const { disqusShortname } = useSettings();

  const initLesson = initialLessonId ? lessons.find(l => l.id === initialLessonId) : courseLessons[0];
  const initVideos = initLesson ? getOneShotVideos(initLesson) : [];

  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(initialLessonId || courseLessons[0]?.id || null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(() => {
    if (initialTopicId) return initialTopicId;
    if (initLesson?.topics?.length) return initLesson.topics[0].id;
    return null;
  });
  const [viewMode, setViewMode] = useState<'topics' | 'one-shot'>(() => {
    if (initialMode) return initialMode;
    if (initLesson) return initLesson.type;
    return 'topics';
  });
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(() => {
    if (initialVideoId) return initialVideoId;
    if (initVideos.length > 0) return initVideos[0].id;
    return null;
  });

  // Mobile curriculum toggle
  const [showCurriculum, setShowCurriculum] = useState(false);
  // Notes preview
  const [showNotePreview, setShowNotePreview] = useState(false);
  // Accordion: which lesson is expanded in sidebar
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(initialLessonId || courseLessons[0]?.id || null);

  const isFirstRender = useRef(!!initialLessonId);

  const selectedLesson = lessons.find(l => l.id === selectedLessonId);

  const hasTopics = selectedLesson ? (selectedLesson.topics?.length || 0) > 0 : false;
  const oneShotVideos = selectedLesson ? getOneShotVideos(selectedLesson) : [];
  const hasOneShot = oneShotVideos.length > 0;
  const hasBothModes = hasTopics && hasOneShot;

  const effectiveMode = !hasTopics && hasOneShot ? 'one-shot' : !hasOneShot && hasTopics ? 'topics' : viewMode;

  const currentTopic = effectiveMode === 'topics'
    ? (selectedLesson?.topics?.find(t => t.id === selectedTopicId) || selectedLesson?.topics?.[0])
    : null;

  const currentVideo = effectiveMode === 'one-shot'
    ? (oneShotVideos.find(v => v.id === selectedVideoId) || oneShotVideos[0])
    : null;

  const currentVideoId = effectiveMode === 'one-shot'
    ? currentVideo?.youtubeId
    : (currentTopic?.youtubeId || selectedLesson?.topics?.[0]?.youtubeId);

  const currentNotes = effectiveMode === 'one-shot'
    ? currentVideo?.driveUrl
    : currentTopic?.driveUrl;

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (selectedLesson) {
      const lessonHasTopics = (selectedLesson.topics?.length || 0) > 0;
      const lessonVideos = getOneShotVideos(selectedLesson);
      const lessonHasOneShot = lessonVideos.length > 0;

      if (lessonHasTopics && lessonHasOneShot) {
        setViewMode(selectedLesson.type);
      } else if (lessonHasTopics) {
        setViewMode('topics');
      } else {
        setViewMode('one-shot');
      }

      if (lessonHasTopics && selectedLesson.topics?.length) {
        setSelectedTopicId(selectedLesson.topics[0].id);
      } else {
        setSelectedTopicId(null);
      }

      if (lessonVideos.length > 0) {
        setSelectedVideoId(lessonVideos[0].id);
      } else {
        setSelectedVideoId(null);
      }
    }
  }, [selectedLessonId]);

  // Get a direct download URL from drive URL
  const getDownloadUrl = (url: string) => {
    // Convert Google Drive view links to direct download
    const match = url.match(/(?:srcid=|\/d\/|id=)([a-zA-Z0-9_-]+)/);
    if (match) return `https://drive.google.com/uc?export=download&id=${match[1]}`;
    return url;
  };

  const getPreviewUrl = (url: string) => {
    const match = url.match(/(?:srcid=|\/d\/|id=)([a-zA-Z0-9_-]+)/);
    if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;
    return url;
  };

  /* ── Curriculum sidebar content (shared between desktop sidebar & mobile dropdown) ── */
  const CurriculumContent = () => (
    <div className="p-3 space-y-1">
      {courseLessons.map((lesson, idx) => {
        const isSelected = selectedLessonId === lesson.id;
        const isExpanded = expandedLessonId === lesson.id;
        const lessonOneShotVideos = getOneShotVideos(lesson);
        const lessonHasTopics = (lesson.topics?.length || 0) > 0;
        const lessonHasOneShot = lessonOneShotVideos.length > 0;
        const lessonHasBoth = lessonHasTopics && lessonHasOneShot;
        const lessonMode = !lessonHasTopics && lessonHasOneShot ? 'one-shot' : !lessonHasOneShot && lessonHasTopics ? 'topics' : viewMode;

        return (
          <div key={lesson.id} className="rounded-xl overflow-hidden">
            {/* Lesson header */}
            <button
              type="button"
              onClick={() => {
                if (isSelected) {
                  setExpandedLessonId(expandedLessonId === lesson.id ? null : lesson.id);
                } else {
                  setSelectedLessonId(lesson.id);
                  setExpandedLessonId(lesson.id);
                }
              }}
              className={`w-full group flex items-center gap-3 p-3.5 transition-all text-left ${
                isSelected
                  ? 'bg-slate-900 text-white'
                  : (dk ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-600')
              } rounded-xl`}
            >
              <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 font-black text-xs transition-colors ${
                isSelected ? 'bg-blue-600 text-white' : (dk ? 'bg-slate-700 text-slate-400 group-hover:bg-blue-500/20 group-hover:text-blue-400' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600')
              }`}>{idx + 1}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold truncate ${isSelected ? 'text-white' : (dk ? 'text-slate-200 group-hover:text-white' : 'text-slate-800 group-hover:text-slate-900')}`}>
                  {lesson.title}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  {lessonHasTopics && (
                    <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-600'
                    }`}>Topics</span>
                  )}
                  {lessonHasOneShot && (
                    <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-50 text-amber-600'
                    }`}>One Shot</span>
                  )}
                </div>
              </div>
              <ChevronRight size={14} className={`shrink-0 transition-all ${
                isExpanded ? 'text-blue-400 rotate-90' : isSelected ? 'text-blue-400' : 'text-slate-300 group-hover:text-blue-400'
              }`} />
            </button>

            {/* Expanded content when selected */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 pt-1 space-y-2">
                    {/* Mode toggle inside curriculum */}
                    {lessonHasBoth && (
                      <div className={`flex p-0.5 rounded-lg gap-0.5 ${dk ? 'bg-slate-700' : 'bg-slate-100'}`}>
                        <button
                          type="button"
                          onClick={() => setViewMode('topics')}
                          className={`flex-1 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1 ${
                            effectiveMode === 'topics' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          <Layers size={10} /> Topics
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewMode('one-shot')}
                          className={`flex-1 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1 ${
                            effectiveMode === 'one-shot' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          <Video size={10} /> One Shot
                        </button>
                      </div>
                    )}

                    {/* Content items */}
                    {effectiveMode === 'topics' && lessonHasTopics && (
                      <div className="space-y-1">
                        {lesson.topics?.map((topic, tIdx) => {
                          const isActive = selectedTopicId === topic.id || (!selectedTopicId && tIdx === 0);
                          return (
                            <button
                              key={topic.id}
                              type="button"
                              onClick={() => { setSelectedTopicId(topic.id); setExpandedLessonId(null); setShowCurriculum(false); }}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all ${
                                isActive ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'hover:bg-slate-50 text-slate-500 border border-transparent'
                              }`}
                            >
                              <Play size={10} className={isActive ? 'text-blue-600' : 'text-slate-300'} />
                              <span className="text-[11px] font-semibold truncate">{topic.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {effectiveMode === 'one-shot' && lessonHasOneShot && (
                      <div className="space-y-1">
                        {lessonOneShotVideos.map((video, vIdx) => {
                          const isActive = selectedVideoId === video.id || (!selectedVideoId && vIdx === 0);
                          return (
                            <button
                              key={video.id}
                              type="button"
                              onClick={() => { setSelectedVideoId(video.id); setExpandedLessonId(null); setShowCurriculum(false); }}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all ${
                                isActive ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'hover:bg-slate-50 text-slate-500 border border-transparent'
                              }`}
                            >
                              <Play size={10} className={isActive ? 'text-amber-600' : 'text-slate-300'} />
                              <span className="text-[11px] font-semibold truncate">{video.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {courseLessons.length === 0 && (
        <div className="p-12 text-center text-slate-400">
          <File size={40} className="mx-auto mb-3 opacity-5" />
          <p className="text-xs font-black uppercase tracking-widest">No Content Yet</p>
        </div>
      )}
    </div>
  );

  return (
    <div className={`flex flex-col flex-1 overflow-hidden ${dk ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {/* Course sub-header */}
      <div className={`border-b shrink-0 ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="mx-auto max-w-full px-4 sm:px-6 h-14 flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className={`flex items-center gap-2 font-bold text-xs uppercase tracking-widest transition-colors shrink-0 ${
              dk ? 'text-slate-400 hover:text-blue-400' : 'text-slate-500 hover:text-blue-600'
            }`}
          >
            <ArrowLeft size={14} /> Back
          </button>
          <div className={`w-px h-5 shrink-0 ${dk ? 'bg-slate-700' : 'bg-slate-200'}`} />
          <div className={`text-xs font-black truncate uppercase tracking-widest ${dk ? 'text-slate-200' : 'text-slate-700'}`}>
            {course.subjectName}
            <span className={`font-bold ${dk ? 'text-slate-500' : 'text-slate-400'}`}> — {course.class}</span>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Player + Info */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-5xl">
            {/* Mobile: Curriculum dropdown toggle */}
            <div className="lg:hidden mb-4">
              <button
                type="button"
                onClick={() => setShowCurriculum(!showCurriculum)}
                className={`w-full flex items-center justify-between p-3.5 border rounded-xl shadow-sm transition-colors ${
                  dk ? 'bg-slate-800 border-slate-700 hover:border-blue-500/30' : 'bg-white border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`size-8 rounded-lg flex items-center justify-center ${dk ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                    <List size={16} className="text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className={`text-xs font-bold ${dk ? 'text-white' : 'text-slate-800'}`}>Course Curriculum</p>
                    <p className="text-[10px] text-slate-400 font-medium">{courseLessons.length} Chapters</p>
                  </div>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${showCurriculum ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showCurriculum && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className={`mt-2 border rounded-xl shadow-lg max-h-[50vh] overflow-auto ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                      <CurriculumContent />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              {selectedLesson ? (
                <motion.div
                  key={selectedLesson.id + (effectiveMode === 'topics' ? selectedTopicId || '' : selectedVideoId || '')}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-5"
                >
                  {/* Video player container with glow */}
                  <div className="relative">
                    <div className={`absolute inset-0 -z-10 rounded-2xl blur-2xl transition-opacity duration-1000 ${dk ? 'bg-blue-600/20 opacity-100' : 'opacity-0'}`} />
                    <div className={`aspect-video bg-slate-900 rounded-2xl overflow-hidden border relative z-10 shadow-2xl ${
                      dk ? 'border-slate-700/50 shadow-[0_0_40px_rgba(59,130,246,0.15)]' : 'border-slate-200 shadow-blue-900/5'
                    }`}>
                    {currentVideoId ? (
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${currentVideoId}?rel=0&modestbranding=1`}
                        title={selectedLesson.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                        <Play size={56} className="mb-4 opacity-10" />
                        <p className="text-sm font-black uppercase tracking-widest opacity-30">Video Not Linked</p>
                      </div>
                    )}
                  </div>
                  </div>

                  {/* Title + Info */}
                  <div className={`p-5 sm:p-6 rounded-2xl border shadow-sm ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                        effectiveMode === 'one-shot' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {effectiveMode === 'one-shot' ? 'One Shot' : 'Topic-Based'}
                      </span>
                      {effectiveMode === 'topics' && currentTopic && (
                        <span className="text-slate-400 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1">
                          <ChevronRight size={10} /> {currentTopic.title}
                        </span>
                      )}
                      {effectiveMode === 'one-shot' && currentVideo && oneShotVideos.length > 1 && (
                        <span className="text-slate-400 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1">
                          <ChevronRight size={10} /> {currentVideo.title}
                        </span>
                      )}
                    </div>
                    <h1 className={`text-xl sm:text-2xl font-black mb-1.5 ${dk ? 'text-white' : 'text-slate-900'}`}>
                      {effectiveMode === 'one-shot'
                        ? (currentVideo && oneShotVideos.length > 1 ? currentVideo.title : selectedLesson.title)
                        : (currentTopic?.title || selectedLesson.title)}
                    </h1>
                    {(effectiveMode === 'one-shot' ? selectedLesson.description : (currentTopic?.description || selectedLesson.description)) && (
                      <p className="text-slate-500 font-medium text-sm leading-relaxed">
                        {effectiveMode === 'one-shot'
                          ? selectedLesson.description
                          : (currentTopic?.description || selectedLesson.description)}
                      </p>
                    )}
                  </div>

                  {/* Notes / Resources — below video */}
                  {currentNotes && (
                    <div className={`rounded-2xl border shadow-sm overflow-hidden ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                      <div className="p-5 flex items-center justify-between">
                        <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                          <FileText size={16} className="text-blue-600" /> Notes & Resources
                        </h4>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowNotePreview(!showNotePreview)}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                              showNotePreview
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100'
                            }`}
                          >
                            <Eye size={12} /> {showNotePreview ? 'Hide Preview' : 'Preview'}
                          </button>
                          <a
                            href={getDownloadUrl(currentNotes)}
                            download
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-sm"
                          >
                            <Download size={12} /> Download
                          </a>
                        </div>
                      </div>

                      <AnimatePresence>
                        {showNotePreview && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 500 }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden border-t border-slate-100"
                          >
                            <iframe
                              src={getPreviewUrl(currentNotes)}
                              className="w-full h-[500px] bg-slate-50"
                              title="Notes Preview"
                              allow="autoplay"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Disqus Comments */}
                  {disqusShortname && (currentTopic || currentVideo || effectiveMode === 'topics') && (
                    <div className={`mt-8 p-5 sm:p-6 rounded-2xl border shadow-sm ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                      <h3 className={`text-lg font-black mb-4 flex items-center gap-2 ${dk ? 'text-white' : 'text-slate-900'}`}>
                        Discussion & Doubts
                      </h3>
                      <div className={dk ? 'disqus-dark-mode-container' : ''}>
                        <DiscussionEmbed
                          shortname={disqusShortname}
                          config={{
                            url: window.location.origin + window.location.pathname + '?discussion=' + (currentTopic?.id || currentVideo?.id || selectedLesson.id),
                            identifier: currentTopic?.id || currentVideo?.id || selectedLesson.id,
                            title: currentTopic?.title || currentVideo?.title || selectedLesson.title,
                            language: 'en'
                          }}
                        />
                      </div>
                    </div>
                  )}

                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
                  <Play size={56} className="mb-5 opacity-5" />
                  <p className="text-lg font-black text-slate-600">Ready to Learn</p>
                  <p className="text-sm font-medium mt-1">Select a chapter to begin.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Desktop: Chapter Sidebar */}
        <div className={`hidden lg:block w-80 xl:w-96 border-l h-full overflow-auto shrink-0 backdrop-blur-xl ${dk ? 'bg-slate-900/40 border-slate-800 shadow-[-20px_0_40px_rgba(0,0,0,0.2)]' : 'bg-white/80 border-slate-100 shadow-[-10px_0_30px_rgba(0,0,0,0.02)]'}`}>
          <div className={`p-5 border-b sticky top-0 z-10 backdrop-blur-md ${dk ? 'bg-slate-900/80 border-slate-800' : 'bg-white/90 border-slate-100'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`font-black flex items-center gap-2 text-sm ${dk ? 'text-white' : 'text-slate-900'}`}>
                  <List size={16} className="text-blue-600" /> Curriculum
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{course.subjectName}</p>
              </div>
              <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                {courseLessons.length} Ch
              </span>
            </div>
          </div>

          <CurriculumContent />
        </div>
      </div>
    </div>
  );
}
