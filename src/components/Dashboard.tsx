import React from 'react';
import { Users, UserPlus, CreditCard, Clock, TrendingUp, MoreHorizontal } from 'lucide-react';
import { Student, SubjectFee } from '../types';

interface DashboardProps {
  students: Student[];
  subjectFees: SubjectFee[];
  searchQuery?: string;
}

const StatCard = ({ title, value, subValue, icon: Icon, color, trend }: any) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className={color + " p-2 rounded-lg text-white"}>
        <Icon size={20} />
      </div>
      {trend && (
        <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">
          <TrendingUp size={12} />
          {trend}
        </span>
      )}
    </div>
    <p className="text-slate-500 text-xs font-medium mb-1">{title}</p>
    <h3 className="text-2xl font-bold mb-1">{value}</h3>
    {subValue && <p className="text-slate-400 text-[10px]">{subValue}</p>}
  </div>
);

export default function Dashboard({ students, subjectFees, searchQuery = '' }: DashboardProps) {
  const totalStudents = students.length;
  
  // Calculate paid students (students who have NO pending subjects)
  const paidCount = students.filter(s => {
    if (!s.subjects || s.subjects.length === 0) return false; // Not paid if no subjects
    return s.subjects.every(sub => s.subjectStatuses?.[sub] === 'Paid');
  }).length;
  
  // Pending students (students who have AT LEAST ONE pending or unassigned subject)
  const pendingCount = students.filter(s => {
    if (!s.subjects || s.subjects.length === 0) return false;
    return s.subjects.some(sub => s.subjectStatuses?.[sub] === 'Pending' || !s.subjectStatuses?.[sub] || s.subjectStatuses?.[sub] === 'Partial' || s.subjectStatuses?.[sub] === 'Unassigned');
  }).length;

  let totalFees = 0;
  let paidFees = 0;

  // Calculate actual revenue granularity per subject
  students.forEach(student => {
    (student.subjects || []).forEach(subName => {
      const match = subjectFees.find(sf => 
        sf.name.toLowerCase().trim() === subName.toLowerCase().trim()
      );
      if (match) {
        totalFees += match.baseFee;
        if (student.subjectStatuses?.[subName] === 'Paid') {
          paidFees += match.baseFee;
        }
      }
    });
  });


  const pendingFees = totalFees - paidFees;

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2">Coaching Overview</h2>
        <p className="text-slate-500 text-sm md:text-base">Welcome back, here's what's happening with your students today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Total Active Students"
          value={totalStudents}
          trend={`${totalStudents} enrolled`}
          icon={Users}
          color="bg-blue-600"
        />
        <StatCard
          title="Fees Paid"
          value={paidCount}
          trend={`${totalStudents > 0 ? Math.round((paidCount / totalStudents) * 100) : 0}% paid`}
          icon={UserPlus}
          color="bg-purple-600"
        />
        <StatCard
          title="Fees Collected vs Pending"
          value={`₹${paidFees.toLocaleString()}`}
          subValue={`/ ₹${pendingFees.toLocaleString()} pending`}
          trend={`${totalFees > 0 ? Math.round((paidFees / totalFees) * 100) : 0}% collected`}
          icon={CreditCard}
          color="bg-emerald-600"
        />
        <StatCard
          title="Pending Payments"
          value={pendingCount}
          trend="Due Soon"
          icon={Clock}
          color="bg-rose-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Recent Students</h3>
          </div>
          <div className="space-y-4">
            {students
              .filter(s => 
                s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.subjects.some(sub => sub.toLowerCase().includes(searchQuery.toLowerCase()))
              )
              .slice(0, 5)
              .map((student, i) => {
              // Calculate status format for Recent students preview
              let studentStatus = 'UNASSIGNED';
              let statusColor = 'text-slate-400';
              if (student.subjects && student.subjects.length > 0) {
                const allPaid = student.subjects.every(sub => student.subjectStatuses?.[sub] === 'Paid');
                const somePending = student.subjects.some(sub => student.subjectStatuses?.[sub] === 'Pending' || student.subjectStatuses?.[sub] === 'Partial');
                
                if (allPaid) {
                  studentStatus = 'PAID IN FULL';
                  statusColor = 'text-emerald-600';
                } else if (somePending) {
                  studentStatus = 'FEES PENDING';
                  statusColor = 'text-rose-600';
                } else {
                  studentStatus = 'UNASSIGNED/PARTIAL';
                  statusColor = 'text-amber-500';
                }
              }
              
              return (
                <div key={student.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">{student.name}</span>
                    <span className="text-[10px] text-slate-400">{student.class}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold">₹{student.monthlyFee.toLocaleString()}</span>
                    <span className={`text-[10px] font-black ${statusColor}`}>
                      {studentStatus}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
