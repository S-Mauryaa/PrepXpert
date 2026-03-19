import React from 'react';
import { LayoutDashboard, Users, CreditCard, Settings, School, X, User, Video, LogOut, Calendar } from 'lucide-react';
import { View, AdminProfile } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  isOpen: boolean;
  onClose: () => void;
  adminProfile: AdminProfile;
  onLogout: () => void;
}

export default function Sidebar({ currentView, onViewChange, isOpen, onClose, adminProfile, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'content-management', label: 'Lessons', icon: Video },
    { id: 'fees', label: 'Fees', icon: CreditCard },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 h-screen transition-transform duration-300 lg:translate-x-0 lg:static lg:block",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-900 size-10 rounded-lg flex items-center justify-center text-white">
            <School size={24} />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight">PREPXPERT</h1>
            <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest">Coaching Classes</p>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as View)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
              currentView === item.id || (currentView === 'add-student' && item.id === 'students') || (currentView === 'student-profile' && item.id === 'students')
                ? "bg-blue-50 text-blue-900"
                : "text-slate-600 hover:bg-slate-50"
            )}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 mt-auto">
        <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-8 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-white shadow-sm flex items-center justify-center text-slate-500">
              {adminProfile.photoUrl ? (
                <img
                  className="w-full h-full object-cover"
                  src={adminProfile.photoUrl}
                  alt={adminProfile.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <User size={18} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black truncate text-slate-900">{adminProfile.name}</p>
              <p className="text-[10px] text-slate-500 truncate font-bold uppercase tracking-wider">{adminProfile.role}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-all"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
