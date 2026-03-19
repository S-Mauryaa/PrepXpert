import React, { useState, useEffect } from 'react';
import {
  Routes, Route, useNavigate, useParams, Navigate, Link
} from 'react-router-dom';
import {
  Plus, Book, Trash2, Play, ChevronRight, ArrowLeft,
  Video, Layers, Globe, GraduationCap, X, Save, CheckCircle, ExternalLink
} from 'lucide-react';
import { Course, Lesson, Topic, OneShotVideo } from '../../types';

interface ContentManagementProps {
  classes: string[];
  courses: Course[];
  lessons: Lesson[];
  onAddClass: (name: string) => boolean;
  onDeleteClass: (name: string) => void;
  onAddCourse: (course: Omit<Course, 'id'>) => void;
  onUpdateCourse: (id: string, updates: Partial<Course>) => void;
  onDeleteCourse: (id: string) => void;
  onAddLesson: (courseId: string) => Lesson;
  onDeleteLesson: (id: string) => void;
  updateLesson: (id: string, updates: Partial<Lesson>) => void;
}

/* ─── LEVEL 1: Classes Grid ────────────────────────────────────────────────── */
function ClassesPage({ classes, courses, onAddClass, onDeleteClass }: {
  classes: string[];
  courses: Course[];
  onAddClass: (name: string) => boolean;
  onDeleteClass: (name: string) => void;
}) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    setError('');
    if (!name.trim()) { setError('Enter a class name.'); return; }
    const ok = onAddClass(name.trim());
    if (!ok) { setError('This class already exists.'); return; }
    setName('');
    setShowModal(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">Educational Content</h2>
          <p className="text-slate-500 text-sm mt-1">Select a class to manage its subjects and lessons.</p>
        </div>
        <button type="button"
          onClick={() => { setName(''); setError(''); setShowModal(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-colors"
        >
          <Plus size={16} />
          Add Class
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {classes.map(cls => (
          <div key={cls} className="relative group">
            <button type="button"
              onClick={() => navigate(encodeURIComponent(cls))}
              className="w-full p-6 bg-white border-2 border-slate-200 rounded-3xl hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-600/10 transition-all text-center space-y-3"
            >
              <div className="size-14 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto group-hover:from-blue-500 group-hover:to-indigo-600 transition-all">
                <GraduationCap size={26} className="text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="text-lg font-black">{cls}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  {courses.filter(c => c.class === cls).length} Subject{courses.filter(c => c.class === cls).length !== 1 ? 's' : ''}
                </p>
              </div>
            </button>
            <button type="button"
              onClick={() => { if (window.confirm(`Delete "${cls}" and all its content?`)) onDeleteClass(cls); }}
              className="absolute top-3 right-3 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
            ><Trash2 size={14} /></button>
          </div>
        ))}

        <button type="button"
          onClick={() => { setName(''); setError(''); setShowModal(true); }}
          className="p-6 bg-white border-2 border-dashed border-slate-200 rounded-3xl hover:border-blue-400 hover:text-blue-600 transition-all text-center space-y-3 text-slate-400 group flex flex-col items-center justify-center"
        >
          <div className="size-14 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200 group-hover:border-blue-400">
            <Plus size={24} />
          </div>
          <p className="text-sm font-black">Add Class</p>
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black">Add New Class</h3>
              <button type="button" onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={18} /></button>
            </div>
            <div className="space-y-2">
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="e.g. Class 11, JEE Batch 2025..."
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-bold text-base transition-colors"
              />
              {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={handleAdd} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-black hover:bg-blue-500 transition-colors">Create Class</button>
              <button type="button" onClick={() => setShowModal(false)} className="px-6 bg-slate-100 text-slate-700 py-3 rounded-xl font-black hover:bg-slate-200 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── LEVEL 2: Subjects Grid ────────────────────────────────────────────────── */
function SubjectsPage({ courses, lessons, onAddCourse, onUpdateCourse, onDeleteCourse }: {
  courses: Course[];
  lessons: Lesson[];
  onAddCourse: (c: Omit<Course, 'id'>) => void;
  onUpdateCourse: (id: string, updates: Partial<Course>) => void;
  onDeleteCourse: (id: string) => void;
}) {
  const { className } = useParams<{ className: string }>();
  const navigate = useNavigate();
  const cls = decodeURIComponent(className || '');

  const [showModal, setShowModal] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [subjectDesc, setSubjectDesc] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  // Edit thumbnail modal
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [editThumb, setEditThumb] = useState('');

  const classCourses = courses.filter(c => c.class === cls);

  const handleAdd = () => {
    if (!subjectName.trim()) return;
    onAddCourse({ subjectName: subjectName.trim(), class: cls, description: subjectDesc.trim(), thumbnailUrl: thumbnailUrl.trim() || undefined });
    setSubjectName('');
    setSubjectDesc('');
    setThumbnailUrl('');
    setShowModal(false);
  };

  const handleSaveThumb = () => {
    if (!editCourse) return;
    onUpdateCourse(editCourse.id, { thumbnailUrl: editThumb.trim() || undefined });
    setEditCourse(null);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
        <Link to="/admin/content" className="hover:text-blue-600 transition-colors">All Classes</Link>
        <ChevronRight size={10} />
        <span className="text-slate-800">{cls}</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">{cls}</h2>
          <p className="text-slate-500 text-sm mt-1">Manage subjects for this class.</p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate('/admin/content')} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black hover:bg-slate-50 transition-colors shadow-sm">
            <ArrowLeft size={14} /> Back
          </button>
          <button type="button" onClick={() => { setSubjectName(''); setSubjectDesc(''); setThumbnailUrl(''); setShowModal(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-colors">
            <Plus size={16} /> Add Subject
          </button>
        </div>
      </div>

      {classCourses.length === 0 ? (
        <div className="py-24 bg-white border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400">
          <Book size={48} className="mb-4 opacity-10" />
          <p className="font-black text-slate-600 text-lg">No Subjects Yet</p>
          <p className="text-xs font-medium mt-1">Click "Add Subject" to create the first subject.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classCourses.map(course => {
            const lessonCount = lessons.filter(l => l.courseId === course.id).length;
            return (
              <div key={course.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all group flex flex-col">
                {/* Thumbnail */}
                <div className="relative aspect-[16/9] bg-slate-100 overflow-hidden">
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.subjectName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                      <Book size={36} className="text-slate-300" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => { setEditCourse(course); setEditThumb(course.thumbnailUrl || ''); }}
                    className="absolute bottom-2 right-2 px-2.5 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-[9px] font-black text-slate-600 hover:bg-white shadow-sm transition-colors uppercase tracking-widest"
                  >
                    {course.thumbnailUrl ? 'Change' : '+ Thumbnail'}
                  </button>
                </div>
                <div className="p-5 space-y-3 flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-lg font-black">{course.subjectName}</h4>
                    <button type="button"
                      onClick={() => { if (window.confirm(`Delete "${course.subjectName}" and all its lessons?`)) onDeleteCourse(course.id); }}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    ><Trash2 size={16} /></button>
                  </div>
                  <p className="text-xs text-slate-400 font-medium line-clamp-2">{course.description || 'No description.'}</p>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {lessonCount} Lesson{lessonCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <button type="button"
                  onClick={() => navigate(course.id)}
                  className="w-full py-3.5 bg-slate-50 text-blue-600 text-xs font-black flex items-center justify-center gap-2 group-hover:bg-blue-600 group-hover:text-white transition-all"
                >
                  Manage Lessons <ChevronRight size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Subject Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black">Add Subject</h3>
                <p className="text-xs text-blue-600 font-bold uppercase tracking-widest">{cls}</p>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <input
                autoFocus
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="Subject Name (e.g. Physics, Maths)"
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-bold transition-colors"
              />
              <textarea
                value={subjectDesc}
                onChange={(e) => setSubjectDesc(e.target.value)}
                placeholder="Short description (optional)"
                rows={2}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-medium text-sm transition-colors resize-none"
              />
              <input
                type="text"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="Thumbnail Image URL (optional)"
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-medium text-sm transition-colors"
              />
              {thumbnailUrl.trim() && (
                <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img src={thumbnailUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={handleAdd} disabled={!subjectName.trim()}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-black hover:bg-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >Create Subject</button>
              <button type="button" onClick={() => setShowModal(false)} className="px-6 bg-slate-100 text-slate-700 py-3 rounded-xl font-black hover:bg-slate-200 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Thumbnail Modal */}
      {editCourse && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black">Edit Thumbnail</h3>
                <p className="text-xs text-blue-600 font-bold uppercase tracking-widest">{editCourse.subjectName}</p>
              </div>
              <button type="button" onClick={() => setEditCourse(null)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <input
                autoFocus
                type="text"
                value={editThumb}
                onChange={(e) => setEditThumb(e.target.value)}
                placeholder="Image URL"
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-medium text-sm transition-colors"
              />
              {editThumb.trim() && (
                <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img src={editThumb} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={handleSaveThumb} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-black hover:bg-blue-500 transition-colors">Save</button>
              <button type="button" onClick={() => setEditCourse(null)} className="px-6 bg-slate-100 text-slate-700 py-3 rounded-xl font-black hover:bg-slate-200 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── LEVEL 3: Lessons List ─────────────────────────────────────────────────── */
function LessonsPage({ courses, lessons, onAddLesson, onDeleteLesson }: {
  courses: Course[];
  lessons: Lesson[];
  onAddLesson: (courseId: string) => Lesson;
  onDeleteLesson: (id: string) => void;
}) {
  const { className, courseId } = useParams<{ className: string; courseId: string }>();
  const navigate = useNavigate();

  const cls = decodeURIComponent(className || '');
  const course = courses.find(c => c.id === courseId);
  const courseLessons = lessons.filter(l => l.courseId === courseId);

  if (!course) return <Navigate to={`/admin/content/${className}`} replace />;

  const handleAddLesson = () => {
    const newLesson = onAddLesson(course.id);
    navigate(`/admin/content/${encodeURIComponent(className || '')}/${courseId}/${newLesson.id}`);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 flex-wrap">
        <Link to="/admin/content" className="hover:text-blue-600 transition-colors">All Classes</Link>
        <ChevronRight size={10} />
        <Link to={`/admin/content/${encodeURIComponent(className || '')}`} className="hover:text-blue-600 transition-colors">{cls}</Link>
        <ChevronRight size={10} />
        <span className="text-slate-800">{course.subjectName}</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">{course.subjectName}</h2>
          <p className="text-slate-500 text-sm mt-1">{cls} — {courseLessons.length} Lesson{courseLessons.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate(`/admin/content/${encodeURIComponent(className || '')}`)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black hover:bg-slate-50 transition-colors shadow-sm">
            <ArrowLeft size={14} /> Back
          </button>
          <button type="button" onClick={handleAddLesson} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-colors">
            <Plus size={16} /> Add Lesson
          </button>
        </div>
      </div>

      {courseLessons.length === 0 ? (
        <div className="py-24 bg-white border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400">
          <Play size={48} className="mb-4 opacity-10" />
          <p className="font-black text-slate-600 text-lg">No Lessons Yet</p>
          <p className="text-xs font-medium mt-1">Click "Add Lesson" to create the first lesson and start filling your curriculum.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {courseLessons.map((lesson, idx) => (
            <div key={lesson.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-200 hover:shadow-lg transition-all group">
              <div className="flex items-center gap-4">
                <div className="size-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-lg shrink-0">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="font-black text-base group-hover:text-blue-600 transition-colors">{lesson.title}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${lesson.type === 'one-shot' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {lesson.type === 'one-shot' ? '🎬 One Shot' : '📚 Topic-Based'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {lesson.type === 'one-shot' ? '1 Full Video' : `${lesson.topics?.length || 0} Topics`}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button type="button"
                  onClick={() => navigate(`/admin/content/${encodeURIComponent(className || '')}/${courseId}/${lesson.id}`)}
                  className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-blue-600 transition-colors"
                >Edit</button>
                <button type="button"
                  onClick={() => { if (window.confirm(`Delete "${lesson.title}"?`)) onDeleteLesson(lesson.id); }}
                  className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                ><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── LEVEL 4: Lesson Editor ─────────────────────────────────────────────────── */
function LessonEditorPage({ courses, lessons, updateLesson }: {
  courses: Course[];
  lessons: Lesson[];
  updateLesson: (id: string, updates: Partial<Lesson>) => void;
}) {
  const { className, courseId, lessonId } = useParams<{ className: string; courseId: string; lessonId: string }>();
  const navigate = useNavigate();

  const cls = decodeURIComponent(className || '');
  const course = courses.find(c => c.id === courseId);
  const lesson = lessons.find(l => l.id === lessonId);

  // ── Normalize lesson draft: ensure videos array for one-shot
  const normalizeDraft = (l: Lesson): Lesson => {
    const d = { ...l, topics: l.topics ? l.topics.map(t => ({ ...t })) : [] };
    if (!d.videos || d.videos.length === 0) {
      if (d.youtubeId) {
        d.videos = [{ id: `VID-${Date.now()}`, title: d.title || 'Video 1', youtubeId: d.youtubeId, driveUrl: d.driveUrl }];
      } else {
        d.videos = [];
      }
    } else {
      d.videos = d.videos.map(v => ({ ...v }));
    }
    return d;
  };

  // ── Local draft state: lazy-initialized so it's populated on the FIRST render.
  // Using null fallback only when lesson isn't found (handled below).
  const [draft, setDraft] = useState<Lesson | null>(() =>
    lesson ? normalizeDraft(lesson) : null
  );
  const [saved, setSaved] = useState(false);

  // Re-sync draft only when the lessonId URL param changes (user opens a different lesson)
  useEffect(() => {
    if (lesson) setDraft(normalizeDraft(lesson));
    setSaved(false);
  }, [lessonId]);

  // Guard: only redirect if lesson/course not found. Never redirect just because draft is null.
  if (!lesson || !course) return <Navigate to={`/admin/content/${encodeURIComponent(className || '')}/${courseId}`} replace />;
  // While draft is initialising (should not happen with lazy init, but just in case)
  if (!draft) return null;

  // ── Helpers ──
  const setDraftField = (field: keyof Lesson, value: any) => {
    setDraft(prev => prev ? { ...prev, [field]: value } : prev);
    setSaved(false);
  };

  const setType = (type: 'topic-based' | 'one-shot') => {
    // NOTE: We NEVER clear topics when switching type — they are only hidden in UI.
    // This prevents accidental data loss when toggling type.
    setDraft(prev => prev ? { ...prev, type } : prev);
    setSaved(false);
  };

  const updateTopicDraft = (topicId: string, changes: Partial<Topic>) => {
    setDraft(prev => {
      if (!prev) return prev;
      return { ...prev, topics: (prev.topics || []).map(t => t.id === topicId ? { ...t, ...changes } : t) };
    });
    setSaved(false);
  };

  const removeTopicDraft = (topicId: string) => {
    setDraft(prev => prev ? { ...prev, topics: (prev.topics || []).filter(t => t.id !== topicId) } : prev);
    setSaved(false);
  };

  const addTopicDraft = () => {
    const newTopic: Topic = { id: `TP-${Date.now()}`, title: 'New Topic', youtubeId: '' };
    setDraft(prev => prev ? { ...prev, topics: [...(prev.topics || []), newTopic] } : prev);
    setSaved(false);
  };

  const addVideoDraft = () => {
    const newVideo: OneShotVideo = { id: `VID-${Date.now()}`, title: 'New Video', youtubeId: '' };
    setDraft(prev => prev ? { ...prev, videos: [...(prev.videos || []), newVideo] } : prev);
    setSaved(false);
  };

  const updateVideoDraft = (videoId: string, changes: Partial<OneShotVideo>) => {
    setDraft(prev => {
      if (!prev) return prev;
      return { ...prev, videos: (prev.videos || []).map(v => v.id === videoId ? { ...v, ...changes } : v) };
    });
    setSaved(false);
  };

  const removeVideoDraft = (videoId: string) => {
    setDraft(prev => prev ? { ...prev, videos: (prev.videos || []).filter(v => v.id !== videoId) } : prev);
    setSaved(false);
  };

  const handleSave = () => {
    if (!draft) return;
    updateLesson(draft.id, {
      title: draft.title,
      description: draft.description,
      type: draft.type,
      topics: draft.topics,
      videos: draft.videos,
      // Backward compat: keep top-level youtubeId/driveUrl in sync with first video
      youtubeId: draft.videos?.[0]?.youtubeId || draft.youtubeId,
      driveUrl: draft.videos?.[0]?.driveUrl || draft.driveUrl,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const extractYtId = (val: string) => {
    if (val.includes('v=')) return val.split('v=')[1].split('&')[0];
    if (val.includes('youtu.be/')) return val.split('youtu.be/')[1].split('?')[0];
    return val;
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 flex-wrap">
        <Link to="/admin/content" className="hover:text-blue-600 transition-colors">All Classes</Link>
        <ChevronRight size={10} />
        <Link to={`/admin/content/${encodeURIComponent(className || '')}`} className="hover:text-blue-600 transition-colors">{cls}</Link>
        <ChevronRight size={10} />
        <Link to={`/admin/content/${encodeURIComponent(className || '')}/${courseId}`} className="hover:text-blue-600 transition-colors">{course.subjectName}</Link>
        <ChevronRight size={10} />
        <span className="text-slate-700 truncate max-w-[200px]">{draft.title || 'New Lesson'}</span>
      </nav>

      {/* Header row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight">Edit Lesson</h2>
          <p className="text-slate-500 text-sm mt-1">{course.subjectName} — {cls}</p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate(`/admin/content/${encodeURIComponent(className || '')}/${courseId}`)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black hover:bg-slate-50 transition-colors shadow-sm">
            <ArrowLeft size={14} /> Back
          </button>
          {draft.type === 'topic-based' && (
            <button type="button" onClick={addTopicDraft} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-black hover:bg-slate-200 transition-colors">
              <Plus size={14} /> Add Topic
            </button>
          )}
          {draft.type === 'one-shot' && (
            <button type="button" onClick={addVideoDraft} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-black hover:bg-slate-200 transition-colors">
              <Plus size={14} /> Add Video
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black shadow-lg transition-all ${saved ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-500'}`}
          >
            {saved ? (
              <><CheckCircle size={16} /> Saved!</>
            ) : (
              <><Save size={16} /> Save Changes</>
            )}
          </button>
        </div>
      </div>

      {/* Unsaved changes banner */}
      {!saved && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs font-bold">
          <span className="size-2 rounded-full bg-amber-400 shrink-0 animate-pulse" />
          You have unsaved changes. Click <strong>Save Changes</strong> to commit them.
        </div>
      )}

      {/* Lesson Header Card */}
      <div className="bg-slate-900 rounded-3xl p-7 md:p-10 text-white">
        <div className="flex flex-col lg:flex-row justify-between gap-8">
          {/* Left: title & description */}
          <div className="flex-1 space-y-4">
            <div className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Lesson Details</div>
            <input
              type="text"
              value={draft.title}
              onChange={(e) => setDraftField('title', e.target.value)}
              placeholder="Lesson Title..."
              className="text-2xl md:text-3xl font-black bg-transparent border-b border-white/10 w-full outline-none pb-2 focus:border-blue-400 transition-colors text-white placeholder-white/30"
            />
            <textarea
              value={draft.description || ''}
              onChange={(e) => setDraftField('description', e.target.value)}
              placeholder="Brief description of this lesson..."
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 outline-none focus:border-blue-400 transition-colors resize-none"
            />
          </div>

          {/* Right: type + fields */}
          <div className="lg:w-80 bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 shrink-0">
            <div>
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-3">Lesson Type</label>
              <div className="flex bg-black/40 p-1 rounded-xl gap-1">
                <button type="button"
                  onClick={() => setType('topic-based')}
                  className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${draft.type === 'topic-based' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >📚 Topics</button>
                <button type="button"
                  onClick={() => setType('one-shot')}
                  className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${draft.type === 'one-shot' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >🎬 One Shot</button>
              </div>
            </div>

            {draft.type === 'one-shot' && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Content Status</p>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <Video size={13} className="text-amber-400" />
                  <span>{draft.videos?.length || 0} Video{(draft.videos?.length || 0) !== 1 ? 's' : ''}</span>
                </div>
                {(draft.topics?.length || 0) > 0 && (
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <Layers size={13} className="text-emerald-400" />
                    <span>{draft.topics?.length} Topic{(draft.topics?.length || 0) !== 1 ? 's' : ''} (hidden)</span>
                  </div>
                )}
              </div>
            )}
            {draft.type === 'topic-based' && (draft.videos?.length || 0) > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Content Status</p>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <Video size={13} className="text-amber-400" />
                  <span>{draft.videos?.length} One-Shot Video{(draft.videos?.length || 0) !== 1 ? 's' : ''} (hidden)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Topics Section */}
      {draft.type === 'topic-based' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black flex items-center gap-2">
              <Layers className="text-blue-600" size={22} />
              Topics &amp; Lectures
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{draft.topics?.length || 0}</span>
            </h3>
            <button type="button" onClick={addTopicDraft} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-blue-600 transition-colors">
              <Plus size={14} /> Add Topic
            </button>
          </div>

          {(!draft.topics || draft.topics.length === 0) && (
            <div className="py-20 bg-white border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400">
              <Layers size={48} className="mb-4 opacity-10" />
              <p className="font-black text-slate-600">No topics yet</p>
              <p className="text-xs font-medium mt-1">Click "Add Topic" to add the first lecture.</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5">
            {(draft.topics || []).map((topic, tIdx) => (
              <div key={topic.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-500" />
                <div className="px-6 py-6 flex flex-col lg:flex-row gap-6">
                  {/* Left: title + desc */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="size-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-black text-sm shrink-0">{tIdx + 1}</span>
                      <input
                        type="text"
                        value={topic.title}
                        onChange={(e) => updateTopicDraft(topic.id, { title: e.target.value })}
                        placeholder="Topic Title"
                        className="flex-1 text-base font-black bg-transparent outline-none focus:text-blue-600 transition-colors border-b border-transparent focus:border-blue-200 pb-1"
                      />
                    </div>
                    <textarea
                      value={topic.description || ''}
                      onChange={(e) => updateTopicDraft(topic.id, { description: e.target.value })}
                      placeholder="What students will learn in this topic..."
                      rows={2}
                      className="w-full text-sm font-medium text-slate-500 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-blue-200 transition-all resize-none"
                    />
                  </div>

                  {/* Right: links + delete */}
                  <div className="lg:w-72 space-y-3 shrink-0">
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">YouTube Video ID / URL</label>
                      <div className="relative">
                        <Video className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                        <input
                          type="text"
                          value={topic.youtubeId}
                          onChange={(e) => updateTopicDraft(topic.id, { youtubeId: extractYtId(e.target.value) })}
                          placeholder="Paste YouTube link or ID"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 outline-none text-xs font-bold focus:border-blue-400 transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Google Drive Notes URL</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                        <input
                          type="text"
                          value={topic.driveUrl || ''}
                          onChange={(e) => updateTopicDraft(topic.id, { driveUrl: e.target.value })}
                          placeholder="https://drive.google.com/..."
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 outline-none text-xs font-bold focus:border-blue-400 transition-colors"
                        />
                      </div>
                    </div>
                    <button type="button"
                      onClick={() => removeTopicDraft(topic.id)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    ><Trash2 size={12} /> Remove Topic</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom save button for long topic lists */}
          {(draft.topics?.length || 0) > 0 && (
            <div className="flex justify-end pt-4">
              <button type="button" onClick={handleSave}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black shadow-lg transition-all ${saved ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-500'}`}
              >
                {saved ? <><CheckCircle size={18} /> All Changes Saved!</> : <><Save size={18} /> Save All Changes</>}
              </button>
            </div>
          )}
        </div>
      )}

      {/* One-Shot Videos Section */}
      {draft.type === 'one-shot' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black flex items-center gap-2">
              <Video className="text-amber-600" size={22} />
              One-Shot Videos
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{draft.videos?.length || 0}</span>
            </h3>
            <button type="button" onClick={addVideoDraft} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-amber-600 transition-colors">
              <Plus size={14} /> Add Video
            </button>
          </div>

          {(!draft.videos || draft.videos.length === 0) && (
            <div className="py-20 bg-white border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400">
              <Video size={48} className="mb-4 opacity-10" />
              <p className="font-black text-slate-600">No videos yet</p>
              <p className="text-xs font-medium mt-1">Click "Add Video" to add the first one-shot video.</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5">
            {(draft.videos || []).map((video, vIdx) => (
              <div key={video.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="w-full h-1 bg-gradient-to-r from-amber-500 to-orange-400" />
                <div className="px-6 py-6 flex flex-col lg:flex-row gap-6">
                  {/* Left: title + preview */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="size-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center font-black text-sm shrink-0">{vIdx + 1}</span>
                      <input
                        type="text"
                        value={video.title}
                        onChange={(e) => updateVideoDraft(video.id, { title: e.target.value })}
                        placeholder="Video Title"
                        className="flex-1 text-base font-black bg-transparent outline-none focus:text-amber-600 transition-colors border-b border-transparent focus:border-amber-200 pb-1"
                      />
                    </div>
                    {video.youtubeId && (
                      <div className="rounded-xl overflow-hidden aspect-video bg-black">
                        <iframe
                          src={`https://www.youtube.com/embed/${video.youtubeId}`}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title="Preview"
                        />
                      </div>
                    )}
                  </div>

                  {/* Right: links + delete */}
                  <div className="lg:w-72 space-y-3 shrink-0">
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">YouTube Video ID / URL</label>
                      <div className="relative">
                        <Video className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                        <input
                          type="text"
                          value={video.youtubeId}
                          onChange={(e) => updateVideoDraft(video.id, { youtubeId: extractYtId(e.target.value) })}
                          placeholder="Paste YouTube link or ID"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 outline-none text-xs font-bold focus:border-amber-400 transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Google Drive Notes URL</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                        <input
                          type="text"
                          value={video.driveUrl || ''}
                          onChange={(e) => updateVideoDraft(video.id, { driveUrl: e.target.value })}
                          placeholder="https://drive.google.com/..."
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 outline-none text-xs font-bold focus:border-amber-400 transition-colors"
                        />
                      </div>
                    </div>
                    <button type="button"
                      onClick={() => removeVideoDraft(video.id)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    ><Trash2 size={12} /> Remove Video</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom save button for long video lists */}
          {(draft.videos?.length || 0) > 0 && (
            <div className="flex justify-end pt-4">
              <button type="button" onClick={handleSave}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black shadow-lg transition-all ${saved ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-500'}`}
              >
                {saved ? <><CheckCircle size={18} /> All Changes Saved!</> : <><Save size={18} /> Save All Changes</>}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── ROOT ContentManagement: router for each level ─────────────────────────── */
export default function ContentManagement(props: ContentManagementProps) {
  const { classes, courses, lessons, onAddClass, onDeleteClass, onAddCourse, onUpdateCourse, onDeleteCourse, onAddLesson, onDeleteLesson, updateLesson } = props;

  return (
    <Routes>
      <Route index element={
        <ClassesPage classes={classes} courses={courses} onAddClass={onAddClass} onDeleteClass={onDeleteClass} />
      } />
      <Route path=":className" element={
        <SubjectsPage courses={courses} lessons={lessons} onAddCourse={onAddCourse} onUpdateCourse={onUpdateCourse} onDeleteCourse={onDeleteCourse} />
      } />
      <Route path=":className/:courseId" element={
        <LessonsPage courses={courses} lessons={lessons} onAddLesson={onAddLesson} onDeleteLesson={onDeleteLesson} />
      } />
      <Route path=":className/:courseId/:lessonId" element={
        <LessonEditorPage courses={courses} lessons={lessons} updateLesson={updateLesson} />
      } />
    </Routes>
  );
}

