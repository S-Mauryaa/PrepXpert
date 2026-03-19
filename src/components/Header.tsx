import React, { useRef, useEffect } from 'react';
import { Search, Plus, Bell, Menu, AlertCircle, X } from 'lucide-react';

interface HeaderProps {
  onAddStudent: () => void;
  onToggleSidebar: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentView: string;
  notifications: Array<{ id: string; message: string; type: string }>;
}

export default function Header({ onAddStudent, onToggleSidebar, searchQuery, onSearchChange, currentView, notifications }: HeaderProps) {
  const isSearchVisible = ['dashboard', 'students', 'fees', 'attendance'].includes(currentView);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Click-outside to dismiss
  useEffect(() => {
    if (!showNotifications) return;
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNotifications]);

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-4 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button 
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
        >
          <Menu size={20} />
        </button>
        {isSearchVisible ? (
          <>
            <div className="relative w-full hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
              <input
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-blue-900/20 text-sm outline-none"
                placeholder="Search by student name, ID or subject..."
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
            <button className="sm:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <Search size={20} />
            </button>
          </>
        ) : (
          <div className="flex-1"></div>
        )}
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={onAddStudent}
          className="flex items-center gap-2 bg-blue-900 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-800 transition-colors"
        >
          <Plus size={18} />
          <span className="hidden md:inline">New Student</span>
        </button>
        <div className="w-px h-6 bg-slate-200 mx-1 md:mx-2"></div>
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative"
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-5 duration-200">
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Fee Notifications</h4>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <span className="bg-blue-900 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">{notifications.length} Pending</span>
                  )}
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-0.5 text-slate-400 hover:text-slate-700 rounded transition-colors"
                    title="Close"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
              <div className="max-h-[300px] overflow-auto">
                {notifications.length > 0 ? (
                  notifications.map(notif => (
                    <div key={notif.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3">
                      <div className="size-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                        <AlertCircle size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{notif.message}</p>
                        <p className="text-[10px] text-slate-400 font-medium">Fee overdue based on admission date</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center flex flex-col items-center gap-3">
                    <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center">
                      <Bell size={22} className="text-slate-300" />
                    </div>
                    <p className="text-xs font-black text-slate-500 uppercase tracking-wider">All Caught Up</p>
                    <p className="text-[10px] text-slate-400">No pending fee notifications.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
