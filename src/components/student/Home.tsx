import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap, ChevronRight, BookOpen, Mail, Send, Loader2, CheckCircle2, AlertCircle
} from 'lucide-react';
import { Course } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { useSettings } from '../../hooks/useSettings';

interface HomeProps {
  onClassSelect: (cls: string) => void;
  classes: string[];
  courses: Course[];
}

export default function Home({ onClassSelect, classes, courses }: HomeProps) {
  const { theme } = useTheme();
  const dk = theme === 'dark';
  const { emailJsConfig } = useSettings();

  const [formData, setFormData] = useState({ name: '', class: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailJsConfig?.serviceId || !emailJsConfig?.templateId || !emailJsConfig?.publicKey || !emailJsConfig?.contactEmail) {
      setSubmitStatus('error');
      setErrorMessage('Contact form is not fully configured by the administrator yet.');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      const data = {
        service_id: emailJsConfig.serviceId,
        template_id: emailJsConfig.templateId,
        user_id: emailJsConfig.publicKey,
        template_params: {
          to_email: emailJsConfig.contactEmail,
          from_name: formData.name,
          from_class: formData.class,
          reply_to: formData.email,
          phone_number: formData.phone || 'Not provided',
          message: formData.message
        }
      };
      
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', class: '', email: '', phone: '', message: '' });
        setTimeout(() => setSubmitStatus('idle'), 5000);
      } else {
        const text = await response.text();
        setSubmitStatus('error');
        setErrorMessage(text || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen overflow-hidden relative ${dk ? 'bg-slate-950' : 'bg-white'}`}
    >
      {/* ── Futuristic Background Flares ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.1, 1], opacity: dk ? [0.15, 0.25, 0.15] : [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-blue-600 blur-[120px]" 
        />
        <motion.div 
          animate={{ x: [0, -40, 0], y: [0, 50, 0], scale: [1, 1.2, 1], opacity: dk ? [0.1, 0.2, 0.1] : [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600 blur-[150px]" 
        />
        <motion.div 
          animate={{ opacity: dk ? [0.05, 0.15, 0.05] : [0.1, 0.3, 0.1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[40%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-cyan-500 blur-[100px]" 
        />
      </div>

      {/* ── Classes Grid ── */}
      <section className="relative z-10 pt-8 pb-12 sm:pt-16 sm:pb-24">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex items-end justify-between mb-8 sm:mb-12"
          >
            <div>
              <p className="text-[10px] sm:text-xs font-black text-blue-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="w-6 h-px bg-blue-500"></span> Welcome to PrepXpert
              </p>
              <h2 className={`text-3xl sm:text-5xl font-black tracking-tight ${dk ? 'text-white' : 'text-slate-900'} drop-shadow-sm`}>Select Your Class</h2>
            </div>
          </motion.div>

          {classes.length === 0 ? (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              delay={0.2}
              className={`py-16 sm:py-24 border rounded-3xl flex flex-col items-center justify-center backdrop-blur-md ${
              dk ? 'border-white/10 bg-white/[0.03] shadow-2xl shadow-black/50' : 'border-white bg-white/60 shadow-xl shadow-blue-900/5'
            }`}>
              <BookOpen size={40} className="mb-3 text-slate-400" />
              <p className={`text-base font-black ${dk ? 'text-slate-400' : 'text-slate-600'}`}>No classes yet</p>
              <p className="text-xs font-medium mt-1 text-slate-400">Content is being prepared. Check back soon!</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {classes.map((cls, idx) => {
                const subjectCount = courses.filter(c => c.class === cls).length;
                return (
                  <motion.button
                    key={cls}
                    type="button"
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    whileHover={{ scale: 1.03, y: -5 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ delay: idx * 0.1, type: "spring", stiffness: 300, damping: 20 }}
                    onClick={() => onClassSelect(cls)}
                    className={`group relative rounded-3xl p-5 sm:p-7 text-left transition-all duration-300 overflow-hidden border backdrop-blur-xl ${
                      dk
                        ? 'bg-slate-900/40 border-slate-700/50 hover:bg-slate-800/80 hover:border-blue-500 hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)]'
                        : 'bg-white/80 border-white hover:border-blue-400 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.2)]'
                    }`}
                  >
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none ${
                      dk ? 'bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent' : 'bg-gradient-to-br from-blue-100/50 via-indigo-50/30 to-transparent'
                    }`} />
                    
                    {/* Glowing highlight edge */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
                      <div className="relative size-12 sm:size-16 rounded-2xl flex items-center justify-center shrink-0 group-hover:shadow-[0_0_30px_-5px_var(--tw-shadow-color)] shadow-blue-500/50 transition-all duration-500 z-10">
                        {/* Shimmer effect inside icon box */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl opacity-20 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <GraduationCap size={26} className="text-blue-600 group-hover:text-white relative z-10 transition-colors duration-500 group-hover:scale-110 group-hover:rotate-[-5deg]" />
                      </div>
                      <div className="flex-1 min-w-0 z-10">
                        <h3 className={`text-lg sm:text-2xl font-black mb-1 truncate tracking-tight transition-colors duration-300 ${dk ? 'text-white group-hover:text-blue-300' : 'text-slate-900 group-hover:text-blue-900'}`}>{cls}</h3>
                        <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest ${dk ? 'text-slate-500 group-hover:text-blue-400' : 'text-slate-500 group-hover:text-blue-600'}`}>
                          {subjectCount} Subject{subjectCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <motion.div 
                        initial={{ x: -10, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        className={`hidden sm:flex size-10 rounded-full items-center justify-center shrink-0 z-10 ${
                        dk ? 'bg-white/5 text-slate-400 group-hover:bg-blue-500 group-hover:text-white group-hover:shadow-[0_0_20px_var(--tw-shadow-color)] shadow-blue-500' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-600/30'
                      }`}>
                        <ChevronRight size={18} className="translate-x-[-1px] group-hover:translate-x-0.5 transition-transform duration-300" />
                      </motion.div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Contact Us ── */}
      <section className="relative z-10 py-16 sm:py-32">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-800" />
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 10 }}
              className={`inline-flex items-center justify-center size-14 sm:size-16 rounded-3xl mb-6 shadow-lg relative ${
              dk ? 'bg-slate-900 text-blue-400 border border-slate-700/50 shadow-blue-500/10' : 'bg-white text-blue-600 border border-blue-50 shadow-blue-600/5'
            }`}>
              <div className="absolute inset-0 rounded-3xl bg-blue-500/20 blur-xl"></div>
              <Mail size={28} className="relative z-10" />
            </motion.div>
            <h2 className={`text-3xl sm:text-5xl font-black tracking-tight mb-4 ${dk ? 'text-white' : 'text-slate-900'}`}>Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">Touch</span></h2>
            <p className={`text-sm sm:text-lg font-medium max-w-xl mx-auto ${dk ? 'text-slate-400' : 'text-slate-500'}`}>
              Have a question about admissions, fees, or anything else? Send us a message and we'll get back to you soon.
            </p>
          </motion.div>

          <motion.form 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}
            onSubmit={handleContactSubmit} 
            className={`p-6 sm:p-10 rounded-[2rem] border shadow-2xl backdrop-blur-xl relative overflow-hidden ${
            dk ? 'bg-slate-900/60 border-slate-700/50 shadow-black/40' : 'bg-white/80 border-white shadow-blue-900/10'
          }`}>
             {/* Form subtle background glow */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
             <div className="relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 mb-6">
              <div>
                <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${dk ? 'text-slate-400' : 'text-slate-500'}`}>Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                    dk 
                      ? 'bg-slate-900/50 border-slate-700 text-white focus:border-blue-500 focus:bg-slate-900' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600 focus:bg-white'
                  }`}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${dk ? 'text-slate-400' : 'text-slate-500'}`}>Your Class <span className="text-red-500">*</span></label>
                <input
                  list="contact-classes"
                  required
                  value={formData.class}
                  onChange={(e) => setFormData(prev => ({ ...prev, class: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                    dk 
                      ? 'bg-slate-900/50 border-slate-700 text-white focus:border-blue-500 focus:bg-slate-900' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600 focus:bg-white'
                  }`}
                  placeholder="E.g. Class 10"
                />
                <datalist id="contact-classes">
                  {classes.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div>
                <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${dk ? 'text-slate-400' : 'text-slate-500'}`}>Email Address <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                    dk 
                      ? 'bg-slate-900/50 border-slate-700 text-white focus:border-blue-500 focus:bg-slate-900' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600 focus:bg-white'
                  }`}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${dk ? 'text-slate-400' : 'text-slate-500'}`}>Phone Number <span className="text-slate-400 font-medium normal-case">(Optional)</span></label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                    dk 
                      ? 'bg-slate-900/50 border-slate-700 text-white focus:border-blue-500 focus:bg-slate-900' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600 focus:bg-white'
                  }`}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="sm:col-span-2">
                <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${dk ? 'text-slate-400' : 'text-slate-500'}`}>Your Query <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border outline-none transition-all resize-none ${
                    dk 
                      ? 'bg-slate-900/50 border-slate-700 text-white focus:border-blue-500 focus:bg-slate-900' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600 focus:bg-white'
                  }`}
                  placeholder="How can we help you?"
                />
              </div>
            </div>

            {submitStatus === 'success' && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`flex items-start gap-3 p-4 mb-6 rounded-xl border ${
                dk ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}>
                <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
                <p className="text-sm font-bold">Message sent successfully! We will get back to you soon.</p>
              </motion.div>
            )}

            {submitStatus === 'error' && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`flex items-start gap-3 p-4 mb-6 rounded-xl border ${
                dk ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p className="text-sm font-bold">{errorMessage}</p>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className={`w-full sm:w-auto px-8 py-4 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all shadow-xl relative overflow-hidden group ${
                isSubmitting 
                  ? 'bg-slate-400 cursor-not-allowed shadow-none' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/40'
              }`}
            >
              {/* Button shimmer effect */}
              {!isSubmitting && <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />}
              
              {isSubmitting ? <Loader2 size={18} className="animate-spin relative z-10" /> : <Send size={18} className="relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
              <span className="relative z-10">{isSubmitting ? 'Sending Request...' : 'Send Message'}</span>
            </motion.button>
            </div>
          </motion.form>
        </div>
      </section>

    </motion.div>
  );
}
