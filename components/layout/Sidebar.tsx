'use client';
import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthProvider';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, Building2, FileText, BarChart3,
  LogOut, GraduationCap, Zap, UserCog, Menu, X, BookOpen,
  Award, Bookmark, Send, PlusCircle, Eye, Megaphone, ClipboardList,
  ChevronLeft, Settings, Home
} from 'lucide-react';
import type { UserRole } from '@/lib/auth';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

function getNavSections(role: UserRole): NavSection[] {
  switch (role) {
    case 'admin':
      return [
        {
          items: [{ label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={18} /> }]
        },
        {
          title: 'Management',
          items: [
            { label: 'Colleges', href: '/admin/colleges', icon: <Building2 size={18} /> },
            { label: 'Organizations', href: '/admin/organizations', icon: <Users size={18} /> },
          ],
        },
        {
          title: 'Insights',
          items: [
            { label: 'Analytics', href: '/admin/analytics', icon: <BarChart3 size={18} /> },
          ],
        },
      ];
    case 'organization':
      return [
        {
          items: [{ label: 'Dashboard', href: '/organization/dashboard', icon: <LayoutDashboard size={18} /> }]
        },
        {
          title: 'Team',
          items: [
            { label: 'Managers', href: '/organization/managers', icon: <UserCog size={18} /> },
            { label: 'Students', href: '/organization/students', icon: <GraduationCap size={18} /> },
          ],
        },
        {
          title: 'Events',
          items: [
            { label: 'Hackathons', href: '/organization/hackathons', icon: <Zap size={18} /> },
            { label: 'Profile', href: '/organization/profile', icon: <Settings size={18} /> },
          ],
        },
      ];
    case 'manager':
      return [
        {
          items: [{ label: 'Dashboard', href: '/manager/dashboard', icon: <LayoutDashboard size={18} /> }]
        },
        {
          title: 'Events',
          items: [
            { label: 'My Hackathons', href: '/manager/hackathons', icon: <Zap size={18} /> },
            { label: 'Create Hackathon', href: '/manager/hackathons/create', icon: <PlusCircle size={18} /> },
          ],
        },
        {
          title: 'Manage',
          items: [
            { label: 'Participants', href: '/manager/participants', icon: <Users size={18} /> },
            { label: 'Submissions', href: '/manager/submissions', icon: <FileText size={18} /> },
            { label: 'Announcements', href: '/manager/announcements', icon: <Megaphone size={18} /> },
          ],
        },
      ];
    case 'student':
    default:
      return [
        {
          items: [{ label: 'Dashboard', href: '/student/dashboard', icon: <LayoutDashboard size={18} /> }]
        },
        {
          title: 'Explore',
          items: [
            { label: 'Browse Hackathons', href: '/student/hackathons', icon: <Eye size={18} /> },
            { label: 'Saved', href: '/student/saved', icon: <Bookmark size={18} /> },
          ],
        },
        {
          title: 'My Activity',
          items: [
            { label: 'My Registrations', href: '/student/registrations', icon: <ClipboardList size={18} /> },
            { label: 'Submissions', href: '/student/submissions', icon: <Send size={18} /> },
            { label: 'Certificates', href: '/student/certificates', icon: <Award size={18} /> },
          ],
        },
      ];
  }
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Platform Admin',
  organization: 'Organization',
  manager: 'Event Manager',
  student: 'Student',
};

const ROLE_GRADIENTS: Record<UserRole, string> = {
  admin: 'from-purple-500 to-indigo-500',
  organization: 'from-blue-500 to-cyan-500',
  manager: 'from-cyan-500 to-teal-500',
  student: 'from-emerald-500 to-green-500',
};

const ROLE_BADGE_STYLE: Record<UserRole, { color: string; bg: string }> = {
  admin: { color: '#c4b5fd', bg: 'rgba(139,92,246,0.15)' },
  organization: { color: '#93c5fd', bg: 'rgba(59,130,246,0.15)' },
  manager: { color: '#67e8f9', bg: 'rgba(6,182,212,0.15)' },
  student: { color: '#6ee7b7', bg: 'rgba(16,185,129,0.15)' },
};

function UserAvatar({ name, gradient, size = 36 }: { name: string; gradient: string; size?: number }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div
      className={cn('rounded-xl bg-gradient-to-br flex items-center justify-center font-bold text-white flex-shrink-0', gradient)}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
    >
      {initials || '?'}
    </div>
  );
}

const SIDEBAR_WIDTH = 256;
const SIDEBAR_COLLAPSED = 64;

export function Sidebar() {
  const { user, role, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sections = getNavSections(role);
  const userName = user?.name ?? 'User';
  const userEmail = user?.email ?? '';
  const gradient = ROLE_GRADIENTS[role];
  const roleBadge = ROLE_BADGE_STYLE[role];

  const handleNavClick = (href: string) => {
    router.push(href);
    setMobileOpen(false);
  };

  const isActive = (href: string) =>
    pathname === href || (href.split('/').length > 2 && pathname.startsWith(href));

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Logo area */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: collapsed ? '0 16px' : '0 20px',
        height: 68,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 12,
          background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          boxShadow: '0 0 20px rgba(99,102,241,0.3)'
        }}>
          <Zap size={17} color="white" />
        </div>
        {!collapsed && (
          <span style={{ fontSize: 17, fontWeight: 800, color: 'white', letterSpacing: '-0.02em', userSelect: 'none' }}>
            HackForge
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '16px 10px' }}>
        {sections.map((section, si) => (
          <div key={si} style={{ marginBottom: 24 }}>
            {section.title && !collapsed && (
              <div style={{
                fontSize: 10, fontWeight: 700, color: '#334155',
                textTransform: 'uppercase', letterSpacing: '0.1em',
                padding: '0 10px', marginBottom: 8
              }}>
                {section.title}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <button
                    key={item.href}
                    onClick={() => handleNavClick(item.href)}
                    title={collapsed ? item.label : undefined}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: collapsed ? 0 : 12,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      padding: collapsed ? '11px 12px' : '11px 14px',
                      borderRadius: 12,
                      fontSize: 14,
                      fontWeight: active ? 600 : 500,
                      fontFamily: 'inherit',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
                      color: active ? '#a5b4fc' : '#64748b',
                      border: active ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                      position: 'relative',
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
                        (e.currentTarget as HTMLButtonElement).style.color = '#e2e8f0';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                        (e.currentTarget as HTMLButtonElement).style.color = '#64748b';
                      }
                    }}
                  >
                    <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                    {!collapsed && (
                      <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.label}
                      </span>
                    )}
                    {active && !collapsed && (
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#818cf8', flexShrink: 0 }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div style={{
        flexShrink: 0,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: collapsed ? '14px 10px' : '16px 14px',
      }}>
        {!collapsed ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <UserAvatar name={userName} gradient={gradient} size={38} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>{userName}</p>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
                color: roleBadge.color, background: roleBadge.bg,
              }}>
                {ROLE_LABELS[role]}
              </span>
            </div>
            <button
              onClick={signOut}
              title="Sign out"
              style={{
                flexShrink: 0, padding: 8, borderRadius: 10,
                color: '#475569', background: 'transparent', border: 'none',
                cursor: 'pointer', transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#475569'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <UserAvatar name={userName} gradient={gradient} size={34} />
            <button
              onClick={signOut}
              title="Sign out"
              style={{ padding: 6, borderRadius: 8, color: '#475569', background: 'transparent', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#475569'; }}
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }}
            className="lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -SIDEBAR_WIDTH }}
            animate={{ x: 0 }}
            exit={{ x: -SIDEBAR_WIDTH }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{
              position: 'fixed', left: 0, top: 0, height: '100%',
              width: SIDEBAR_WIDTH, zIndex: 50, background: '#090d19',
              borderRight: '1px solid rgba(99,102,241,0.1)',
            }}
            className="lg:hidden"
          >
            <button
              onClick={() => setMobileOpen(false)}
              style={{ position: 'absolute', top: 16, right: 14, padding: 6, borderRadius: 8, color: '#64748b', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        style={{
          height: '100%', flexShrink: 0, background: '#090d19',
          borderRight: '1px solid rgba(99,102,241,0.08)',
          position: 'relative', overflow: 'hidden',
        }}
        className="hidden lg:block"
      >
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            position: 'absolute', right: -12, top: 76,
            width: 24, height: 24, borderRadius: '50%',
            background: '#090d19', border: '1px solid rgba(99,102,241,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#64748b', cursor: 'pointer', zIndex: 10,
            transition: 'all 0.15s ease',
          }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#818cf8'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(99,102,241,0.5)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#64748b'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(99,102,241,0.25)'; }}
        >
          <ChevronLeft size={13} style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }} />
        </button>
      </motion.aside>

      {/* Mobile menu trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        style={{
          position: 'fixed', top: 14, left: 14, zIndex: 30, padding: 8, borderRadius: 12,
          background: 'rgba(9,13,25,0.9)', border: '1px solid rgba(255,255,255,0.08)',
          color: '#94a3b8', cursor: 'pointer',
        }}
        className="lg:hidden"
      >
        <Menu size={18} />
      </button>
    </>
  );
}
