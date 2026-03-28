'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardTitle, CardSubtitle, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MOCK_STUDENTS, MOCK_HACKATHONS } from '@/lib/mock-data';
import { Users, GraduationCap, Building2, Calendar } from 'lucide-react';

export default function ManagerParticipantsPage() {
  return (
    <DashboardLayout title="Participants" subtitle="All registered participants across your hackathons">
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Participants', value: MOCK_HACKATHONS.reduce((s,h)=>s+h.participantCount,0), icon: <Users size={18} className="text-indigo-400" /> },
          { label: 'Total Teams', value: MOCK_HACKATHONS.reduce((s,h)=>s+h.teamCount,0), icon: <Users size={18} className="text-blue-400" /> },
          { label: 'Institutions', value: new Set(MOCK_STUDENTS.map(s=>s.college)).size, icon: <Building2 size={18} className="text-emerald-400" /> },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <StatCard label={s.label} value={s.value} icon={s.icon} />
          </motion.div>
        ))}
      </div>

      <Card>
        <div className="mb-5">
          <CardTitle>Participant Directory</CardTitle>
          <CardSubtitle>All students registered in your hackathons</CardSubtitle>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Participant</th>
                <th>College</th>
                <th>Hackathons Joined</th>
                <th>Submissions</th>
                <th>Certificates</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_STUDENTS.map((student, i) => (
                <motion.tr key={student.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
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
                  <td><span className="text-sm font-medium">{student.submissions}</span></td>
                  <td><span className="text-sm font-medium text-amber-400">{student.certificates}</span></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
