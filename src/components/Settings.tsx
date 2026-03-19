import React, { useState, useEffect } from 'react';
import { Book, Plus, Clock, Trash2, X, Save, User, Link as LinkIcon, ImageIcon, Check, BarChart2, Info, Mail, MessageSquare } from 'lucide-react';
import { AdminProfile, Batch, SubjectFee } from '../types';
import { EmailJsConfig } from '../hooks/useSettings';

interface SettingsProps {
  adminProfile?: AdminProfile;
  onUpdateAdminProfile?: (profile: Partial<AdminProfile>) => void;
  batches: Batch[];
  subjectFees: SubjectFee[];
  emailJsConfig: EmailJsConfig;
  onUpdateEmailJsConfig: (config: EmailJsConfig) => void;
  onAddBatch: (batch: Omit<Batch, 'id'>) => void;
  onDeleteBatch: (id: string) => void;
  onAddSubjectFee: (fee: Omit<SubjectFee, 'id'>) => void;
  onUpdateSubjectFee: (fee: SubjectFee) => void;
  onDeleteSubjectFee: (id: string) => void;
  onSetAllSettings: (batches: Batch[], subjectFees: SubjectFee[]) => void;
  disqusShortname?: string;
  onUpdateDisqusShortname?: (shortname: string) => void;
}

export default function Settings({ 
  adminProfile, 
  onUpdateAdminProfile,
  batches,
  subjectFees,
  emailJsConfig,
  onUpdateEmailJsConfig,
  onAddBatch,
  onDeleteBatch,
  onAddSubjectFee,
  onUpdateSubjectFee,
  onDeleteSubjectFee,
  onSetAllSettings,
  disqusShortname,
  onUpdateDisqusShortname
}: SettingsProps) {
  const [adminName, setAdminName] = useState(adminProfile?.name || '');
  const [adminRole, setAdminRole] = useState(adminProfile?.role || '');
  const [adminPhotoUrl, setAdminPhotoUrl] = useState(adminProfile?.photoUrl || '');
  
  const [localBatches, setLocalBatches] = useState<Batch[]>(batches);
  const [localSubjectFees, setLocalSubjectFees] = useState<SubjectFee[]>(subjectFees);
  const [localEmailConfig, setLocalEmailConfig] = useState<EmailJsConfig>(emailJsConfig);
  const [localDisqusShortname, setLocalDisqusShortname] = useState(disqusShortname || '');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setLocalBatches(batches);
    setLocalSubjectFees(subjectFees);
    setLocalEmailConfig(emailJsConfig);
    setLocalDisqusShortname(disqusShortname || '');
  }, [batches, subjectFees, emailJsConfig, disqusShortname]);

  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectClasses, setNewSubjectClasses] = useState('');
  const [newSubjectFee, setNewSubjectFee] = useState('');

  const [isAddingBatch, setIsAddingBatch] = useState(false);
  const [newBatchTime, setNewBatchTime] = useState('');
  const [newBatchDays, setNewBatchDays] = useState('');
  const [newBatchClass, setNewBatchClass] = useState('');

  const existingClasses = React.useMemo(() => {
    const classes = new Set<string>();
    localSubjectFees.forEach(sf => {
      sf.classes.split(',').map(c => c.trim()).forEach(c => {
        if (c) classes.add(c);
      });
    });
    ['Class 9', 'Class 10', 'Class 11', 'Class 12'].forEach(c => classes.add(c));
    return Array.from(classes).sort();
  }, [localSubjectFees]);

  // Quick stats for the sidebar card
  const totalSubjects = localSubjectFees.length;
  const totalBatches = localBatches.length;
  const avgFee = totalSubjects > 0
    ? Math.round(localSubjectFees.reduce((s, f) => s + f.baseFee, 0) / totalSubjects)
    : 0;

  const handleSaveAllSettings = () => {
    if (onUpdateAdminProfile) {
      onUpdateAdminProfile({
        name: adminName,
        role: adminRole,
        photoUrl: adminPhotoUrl,
      });
    }
    onUpdateEmailJsConfig(localEmailConfig);
    if (onUpdateDisqusShortname) {
      onUpdateDisqusShortname(localDisqusShortname.trim());
    }
    onSetAllSettings(localBatches, localSubjectFees);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleConfirmNewSubject = () => {
    if (!newSubjectName.trim() || !newSubjectClasses.trim() || !newSubjectFee.trim()) return;
    const newSubject: SubjectFee = {
      id: `SUB-${Date.now()}`,
      name: newSubjectName,
      classes: newSubjectClasses,
      baseFee: Number(newSubjectFee)
    };
    setLocalSubjectFees([...localSubjectFees, newSubject]);
    setIsAddingSubject(false);
    setNewSubjectName('');
    setNewSubjectClasses('');
    setNewSubjectFee('');
    setIsSaved(false);
  };

  const handleConfirmNewBatch = () => {
    if (!newBatchTime.trim() || !newBatchDays.trim()) return;
    const newBatch: Batch = {
      id: `BAT-${Date.now()}`,
      time: newBatchTime,
      days: newBatchDays,
      class: newBatchClass
    };
    setLocalBatches([...localBatches, newBatch]);
    setIsAddingBatch(false);
    setNewBatchTime('');
    setNewBatchDays('');
    setNewBatchClass('');
    setIsSaved(false);
  };

  const updateLocalSubjectFeeBase = (id: string, newFee: number) => {
    setLocalSubjectFees(prev => prev.map(sf => sf.id === id ? { ...sf, baseFee: newFee } : sf));
    setIsSaved(false);
  };

  const deleteLocalSubjectFee = (id: string) => {
    setLocalSubjectFees(prev => prev.filter(sf => sf.id !== id));
    setIsSaved(false);
  };

  const deleteLocalBatch = (id: string) => {
    setLocalBatches(prev => prev.filter(b => b.id !== id));
    setIsSaved(false);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2">Settings &amp; Management</h2>
          <p className="text-slate-500 text-sm">Manage admin profile, fee structures, and class timings.</p>
        </div>
        <button 
          onClick={handleSaveAllSettings}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black shadow-lg transition-all ${
            isSaved 
              ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/30' 
              : 'bg-blue-900 hover:bg-blue-800 text-white shadow-blue-900/30'
          }`}
        >
          {isSaved ? <Check size={18} /> : <Save size={18} />}
          {isSaved ? 'Settings Saved!' : 'Save All Settings'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content — 2/3 width */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Admin Profile */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <User className="text-blue-900" size={20} />
                Admin Profile
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="sm:col-span-2 lg:col-span-1 lg:row-span-2 flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 transition-colors">
                <div className="size-24 rounded-full bg-slate-200 flex items-center justify-center mb-3 overflow-hidden relative shadow-sm border border-slate-300">
                  {adminPhotoUrl ? (
                    <img 
                      src={adminPhotoUrl} 
                      alt="Admin Preview" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <ImageIcon className="text-slate-400" size={32} />
                  )}
                </div>
                <div className="w-full mt-2">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">
                    <LinkIcon size={12} className="inline mr-1" />
                    Photo URL
                  </label>
                  <input
                    value={adminPhotoUrl}
                    onChange={(e) => { setAdminPhotoUrl(e.target.value); setIsSaved(false); }}
                    className="w-full rounded-lg border-slate-200 bg-white focus:border-blue-900 focus:ring-blue-900/20 text-xs py-2 px-3 outline-none border"
                    placeholder="E.g. https://.../photo.jpg"
                    type="url"
                  />
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => { setAdminName(e.target.value); setIsSaved(false); }}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-blue-900/20"
                    placeholder="Enter Admin Name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Role / Designation</label>
                  <input
                    type="text"
                    value={adminRole}
                    onChange={(e) => { setAdminRole(e.target.value); setIsSaved(false); }}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-blue-900/20"
                    placeholder="E.g. Administrator"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Contact Form Settings */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Mail className="text-blue-900" size={20} />
                Contact Form Settings
              </h3>
              <p className="text-xs text-slate-500 mt-1 pl-7">Configure where the Student Portal messages should be sent.</p>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Receiving Email Address</label>
                <input
                  type="email"
                  value={localEmailConfig.contactEmail}
                  onChange={(e) => { setLocalEmailConfig(prev => ({ ...prev, contactEmail: e.target.value })); setIsSaved(false); }}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-900/20"
                  placeholder="E.g. admin@prepxpert.com"
                />
              </div>
              <div className="sm:col-span-2 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-800 mb-2">EmailJS Connection Keys</h4>
                <p className="text-xs text-slate-500 mb-4">Required to send automated emails directly from the frontend.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Service ID</label>
                    <input
                      type="text"
                      value={localEmailConfig.serviceId}
                      onChange={(e) => { setLocalEmailConfig(prev => ({ ...prev, serviceId: e.target.value })); setIsSaved(false); }}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono outline-none focus:ring-2 focus:ring-blue-900/20"
                      placeholder="service_xxxxx"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Template ID</label>
                    <input
                      type="text"
                      value={localEmailConfig.templateId}
                      onChange={(e) => { setLocalEmailConfig(prev => ({ ...prev, templateId: e.target.value })); setIsSaved(false); }}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono outline-none focus:ring-2 focus:ring-blue-900/20"
                      placeholder="template_xxxxx"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Public Key</label>
                    <input
                      type="text"
                      value={localEmailConfig.publicKey}
                      onChange={(e) => { setLocalEmailConfig(prev => ({ ...prev, publicKey: e.target.value })); setIsSaved(false); }}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono outline-none focus:ring-2 focus:ring-blue-900/20"
                      placeholder="your_public_key"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Subject Fees */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Book className="text-blue-900" size={20} />
                Subject Fees
              </h3>
              <button 
                onClick={() => setIsAddingSubject(!isAddingSubject)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-200 text-blue-900 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors shadow-sm"
              >
                <Plus size={14} />
                Add New Subject
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Subject Name &amp; Class</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Base Fee (₹)</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isAddingSubject && (
                    <tr className="bg-blue-50/50">
                      <td className="px-6 py-4 space-y-2">
                        <input
                          type="text"
                          placeholder="Subject Name"
                          value={newSubjectName}
                          onChange={(e) => setNewSubjectName(e.target.value)}
                          className="w-full px-2 py-1 border border-blue-200 bg-white rounded text-sm font-bold focus:ring-2 focus:ring-blue-900/20 outline-none"
                        />
                        <input
                          list="add-subject-classes"
                          placeholder="e.g. Class 10"
                          value={newSubjectClasses}
                          onChange={(e) => setNewSubjectClasses(e.target.value)}
                          className="w-full px-2 py-1 border border-blue-200 bg-white rounded text-xs font-medium focus:ring-2 focus:ring-blue-900/20 outline-none"
                        />
                        <datalist id="add-subject-classes">
                          {existingClasses.map(cls => <option key={cls} value={cls} />)}
                        </datalist>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          placeholder="Fee Amount"
                          value={newSubjectFee}
                          onChange={(e) => setNewSubjectFee(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-blue-200 bg-white rounded text-lg font-black focus:ring-4 focus:ring-blue-900/10 outline-none transition-all"
                        />
                      </td>
                      <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        <button onClick={handleConfirmNewSubject} className="p-1.5 bg-blue-900 text-white rounded hover:bg-blue-800 transition-colors">
                          <Check size={14} />
                        </button>
                        {/* Fixed: X icon instead of Trash2 for cancel */}
                        <button onClick={() => setIsAddingSubject(false)} className="p-1.5 bg-slate-200 text-slate-600 rounded hover:bg-slate-300 transition-colors">
                          <X size={14} />
                        </button>
                      </td>
                    </tr>
                  )}
                  {localSubjectFees.map((fee) => (
                    <tr key={fee.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold">{fee.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{fee.classes}</p>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={fee.baseFee}
                          onChange={(e) => updateLocalSubjectFeeBase(fee.id, Number(e.target.value))}
                          className="w-2/3 px-4 py-2 border-2 border-slate-100 bg-white focus:bg-blue-50 rounded text-lg font-black focus:ring-4 focus:ring-blue-900/10 outline-none transition-all"
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => deleteLocalSubjectFee(fee.id)}
                          className="text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50 transition-colors inline-block"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {localSubjectFees.length === 0 && !isAddingSubject && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500 font-medium">
                        No subject fees defined. Click "Add New Subject" to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Active Batches */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Clock className="text-blue-900" size={20} />
                Active Batches
              </h3>
              <button 
                onClick={() => setIsAddingBatch(!isAddingBatch)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-200 text-blue-900 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors shadow-sm"
              >
                <Plus size={14} />
                Add New Batch
              </button>
            </div>
            <div className="p-6 space-y-4">
              {isAddingBatch && (
                <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 mr-4">
                    <input
                      type="text"
                      placeholder="e.g. 04:00 PM - 05:00 PM"
                      value={newBatchTime}
                      onChange={(e) => setNewBatchTime(e.target.value)}
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-900/20 outline-none"
                    />
                    <input
                      list="add-subject-classes"
                      placeholder="e.g. Class 10"
                      value={newBatchClass}
                      onChange={(e) => setNewBatchClass(e.target.value)}
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-900/20 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="e.g. Weekdays (Mon - Fri)"
                      value={newBatchDays}
                      onChange={(e) => setNewBatchDays(e.target.value)}
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-900/20 outline-none sm:col-span-2"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleConfirmNewBatch} className="p-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors">
                      <Check size={18} />
                    </button>
                    {/* Fixed: X icon instead of Trash2 for cancel */}
                    <button onClick={() => setIsAddingBatch(false)} className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                </div>
              )}
              {localBatches.map((batch) => (
                <div key={batch.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 group hover:border-blue-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="size-10 bg-white rounded-lg flex items-center justify-center text-blue-900 shadow-sm shrink-0 border border-slate-100">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{batch.time}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{batch.days} • {batch.class || 'All Classes'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => deleteLocalBatch(batch.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              {localBatches.length === 0 && !isAddingBatch && (
                <div className="text-center py-6 text-sm text-slate-500 font-medium">
                  No active batches defined. Click "Add New Batch" to create one.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar — 1/3 width */}
        <div className="space-y-6">
          {/* Quick Stats Card */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <BarChart2 className="text-blue-900" size={18} />
                Quick Stats
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Subjects Configured</span>
                <span className="text-2xl font-black text-slate-900">{totalSubjects}</span>
              </div>
              <div className="w-full h-px bg-slate-100" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Active Batches</span>
                <span className="text-2xl font-black text-slate-900">{totalBatches}</span>
              </div>
              <div className="w-full h-px bg-slate-100" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Avg. Subject Fee</span>
                <span className="text-2xl font-black text-blue-900">₹{avgFee.toLocaleString()}</span>
              </div>
            </div>
          </section>

          {/* Tip card */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex gap-3">
            <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black text-blue-900 mb-1">Remember to Save</p>
              <p className="text-[11px] text-blue-700 leading-relaxed">
                Changes to fees and batches are staged locally. Click <strong>Save All Settings</strong> to persist them.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
