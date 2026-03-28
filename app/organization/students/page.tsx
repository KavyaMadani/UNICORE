'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard, Card, CardTitle, CardSubtitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MOCK_STUDENTS } from '@/lib/mock-data';
import { GraduationCap, Award, FileText, ArrowRight } from 'lucide-react';

export default function OrgStudentsPage() {
  return (
    <DashboardLayout title="Students" subtitle="All students who participated in your hackathons">
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Students', value: MOCK_STUDENTS.length, icon: <GraduationCap size={18} className="text-indigo-400" /> },
          { label: 'Certificates Issued', value: MOCK_STUDENTS.reduce((s,st) => s + st.certificates, 0), icon: <Award size={18} className="text-amber-400" /> },
          { label: 'Total Submissions', value: MOCK_STUDENTS.reduce((s,st) => s + st.submissions, 0), icon: <FileText size={18} className="text-blue-400" /> },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <StatCard label={s.label} value={s.value} icon={s.icon} />
          </motion.div>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between mb-5">
          <div>
            <CardTitle>Student Directory</CardTitle>
            <CardSubtitle>All registered students across your events</CardSubtitle>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>College</th>
                <th>Hackathons</th>
                <th>Submissions</th>
                <th>Certificates</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_STUDENTS.map((student, i) => (
                <motion.tr key={student.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {student.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-200">{student.name}</p>
                        <p className="text-xs text-slate-600">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className="text-sm">{student.college}</span></td>
                  <td><Badge variant="upcoming">{student.registeredHackathons}</Badge></td>
                  <td><span className="text-sm font-medium text-slate-300">{student.submissions}</span></td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <Award size={12} className="text-amber-400" />
                      <span className="text-sm font-medium text-amber-400">{student.certificates}</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
