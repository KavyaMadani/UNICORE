/**
 * Mock data — all UI components run on this
 * No backend or database required
 */

export type HackathonStatus = 'upcoming' | 'active' | 'ended' | 'draft';
export type SubmissionStatus = 'pending' | 'submitted' | 'reviewed' | 'disqualified';

// ─── Hackathons ───────────────────────────────────────────────────────────────

export interface Hackathon {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  status: HackathonStatus;
  maxTeamSize: number;
  minTeamSize: number;
  prizePool: string;
  tags: string[];
  college: string;
  collegeSlug: string;
  organizer: string;
  participantCount: number;
  teamCount: number;
  image?: string;
  isFeatured: boolean;
  rules: string[];
  prizes: { rank: string; amount: string; description: string }[];
  timeline: { label: string; date: string; done: boolean }[];
}

export const MOCK_HACKATHONS: Hackathon[] = [
  {
    id: 'hack_001',
    title: 'HackForge 2025',
    subtitle: 'Build the Future with AI',
    description: 'Join the most exciting hackathon of 2025 where brilliant minds come together to solve real-world problems using AI and machine learning.',
    startDate: '2025-08-15T09:00:00Z',
    endDate: '2025-08-17T18:00:00Z',
    registrationDeadline: '2025-08-10T23:59:00Z',
    status: 'upcoming',
    maxTeamSize: 4,
    minTeamSize: 2,
    prizePool: '₹5,00,000',
    tags: ['AI', 'ML', 'Web3', 'Open Innovation'],
    college: 'IIT Bombay',
    collegeSlug: 'iitb',
    organizer: 'Tech Society, IIT Bombay',
    participantCount: 847,
    teamCount: 213,
    isFeatured: true,
    rules: [
      'All team members must be currently enrolled students',
      'Teams can have 2–4 members',
      'Projects must be built during the hackathon',
      'Open source libraries are allowed',
      'Plagiarism will result in immediate disqualification',
    ],
    prizes: [
      { rank: '1st Place', amount: '₹2,00,000', description: 'Cash prize + internship opportunities' },
      { rank: '2nd Place', amount: '₹1,00,000', description: 'Cash prize + mentorship' },
      { rank: '3rd Place', amount: '₹50,000', description: 'Cash prize + swag kit' },
    ],
    timeline: [
      { label: 'Registration Opens', date: 'July 1, 2025', done: true },
      { label: 'Registration Closes', date: 'August 10, 2025', done: false },
      { label: 'Hackathon Begins', date: 'August 15, 2025', done: false },
      { label: 'Submission Deadline', date: 'August 17, 2025', done: false },
      { label: 'Results Announced', date: 'August 20, 2025', done: false },
    ],
  },
  {
    id: 'hack_002',
    title: 'CodeStorm 2025',
    subtitle: 'Hack the Climate Crisis',
    description: 'A 48-hour sustainability hackathon where you build solutions for climate change, renewable energy, and environmental monitoring.',
    startDate: '2025-07-20T09:00:00Z',
    endDate: '2025-07-22T18:00:00Z',
    registrationDeadline: '2025-07-15T23:59:00Z',
    status: 'active',
    maxTeamSize: 5,
    minTeamSize: 1,
    prizePool: '₹3,00,000',
    tags: ['Climate', 'Sustainability', 'IoT', 'GreenTech'],
    college: 'IIT Delhi',
    collegeSlug: 'iitd',
    organizer: 'EcoTech Club, IIT Delhi',
    participantCount: 523,
    teamCount: 148,
    isFeatured: true,
    rules: [
      'Solo or team participation allowed',
      'Projects must address climate-related issues',
      'Must use at least one open API',
      'Prototype must be functional',
    ],
    prizes: [
      { rank: '1st Place', amount: '₹1,50,000', description: 'Cash + incubation support' },
      { rank: '2nd Place', amount: '₹75,000', description: 'Cash prize' },
      { rank: '3rd Place', amount: '₹25,000', description: 'Cash prize' },
    ],
    timeline: [
      { label: 'Registration Opens', date: 'June 20, 2025', done: true },
      { label: 'Registration Closes', date: 'July 15, 2025', done: true },
      { label: 'Hackathon Live', date: 'July 20, 2025', done: true },
      { label: 'Submission Deadline', date: 'July 22, 2025', done: false },
    ],
  },
  {
    id: 'hack_003',
    title: 'FinHack 2025',
    subtitle: 'Reimagine Financial Inclusion',
    description: 'Build fintech solutions that bridge the gap between traditional finance and the unbanked population using blockchain and open banking APIs.',
    startDate: '2025-06-01T09:00:00Z',
    endDate: '2025-06-03T18:00:00Z',
    registrationDeadline: '2025-05-28T23:59:00Z',
    status: 'ended',
    maxTeamSize: 3,
    minTeamSize: 2,
    prizePool: '₹2,50,000',
    tags: ['Fintech', 'Blockchain', 'OpenBanking'],
    college: 'BITS Pilani',
    collegeSlug: 'bits-pilani',
    organizer: 'Finance Club, BITS Pilani',
    participantCount: 412,
    teamCount: 137,
    isFeatured: false,
    rules: [
      'Teams of 2–3 members only',
      'Must use Open Banking API',
      'KYC solutions are encouraged',
    ],
    prizes: [
      { rank: '1st Place', amount: '₹1,20,000', description: 'Cash prize' },
      { rank: '2nd Place', amount: '₹80,000', description: 'Cash prize' },
      { rank: '3rd Place', amount: '₹50,000', description: 'Cash prize' },
    ],
    timeline: [
      { label: 'Registration Opens', date: 'May 1, 2025', done: true },
      { label: 'Hackathon', date: 'Jun 1–3, 2025', done: true },
      { label: 'Results', date: 'Jun 7, 2025', done: true },
    ],
  },
  {
    id: 'hack_004',
    title: 'HealthTech Hackathon',
    subtitle: 'Innovate Healthcare with AI',
    description: 'Design and build AI-powered healthcare solutions for diagnosis, patient management, and medical imaging.',
    startDate: '2025-09-05T09:00:00Z',
    endDate: '2025-09-07T18:00:00Z',
    registrationDeadline: '2025-09-01T23:59:00Z',
    status: 'draft',
    maxTeamSize: 4,
    minTeamSize: 2,
    prizePool: '₹4,00,000',
    tags: ['HealthTech', 'AI', 'MedTech', 'Diagnostics'],
    college: 'VIT Vellore',
    collegeSlug: 'vit',
    organizer: 'MedTech Society, VIT',
    participantCount: 0,
    teamCount: 0,
    isFeatured: false,
    rules: ['Teams of 2–4 members', 'Healthcare domain required'],
    prizes: [
      { rank: '1st Place', amount: '₹2,00,000', description: 'Cash + mentorship' },
      { rank: '2nd Place', amount: '₹1,00,000', description: 'Cash prize' },
      { rank: '3rd Place', amount: '₹50,000', description: 'Cash prize' },
    ],
    timeline: [
      { label: 'Registration Opens', date: 'Aug 1, 2025', done: false },
      { label: 'Hackathon', date: 'Sep 5–7, 2025', done: false },
    ],
  },
];

// ─── Organizations ────────────────────────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  email: string;
  college: string;
  collegeSlug: string;
  managersCount: number;
  hackathonsCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export const MOCK_ORGANIZATIONS: Organization[] = [
  { id: 'org_001', name: 'IIT Bombay Tech Society', email: 'tech@iitb.ac.in', college: 'IIT Bombay', collegeSlug: 'iitb', managersCount: 3, hackathonsCount: 5, status: 'active', createdAt: '2025-01-10' },
  { id: 'org_002', name: 'IIT Delhi Innovation Club', email: 'innovation@iitd.ac.in', college: 'IIT Delhi', collegeSlug: 'iitd', managersCount: 2, hackathonsCount: 3, status: 'active', createdAt: '2025-02-15' },
  { id: 'org_003', name: 'BITS Pilani Hackathon Cell', email: 'hackathon@bits-pilani.ac.in', college: 'BITS Pilani', collegeSlug: 'bits-pilani', managersCount: 4, hackathonsCount: 7, status: 'active', createdAt: '2025-01-05' },
  { id: 'org_004', name: 'VIT Tech Events', email: 'techevents@vit.ac.in', college: 'VIT Vellore', collegeSlug: 'vit', managersCount: 1, hackathonsCount: 2, status: 'inactive', createdAt: '2025-03-01' },
];

// ─── Students ─────────────────────────────────────────────────────────────────

export interface Student {
  id: string;
  name: string;
  email: string;
  college: string;
  collegeSlug: string;
  registeredHackathons: number;
  submissions: number;
  certificates: number;
  joinedAt: string;
}

export const MOCK_STUDENTS: Student[] = [
  { id: 'stu_001', name: 'Arjun Sharma', email: 'arjun@iitb.ac.in', college: 'IIT Bombay', collegeSlug: 'iitb', registeredHackathons: 3, submissions: 2, certificates: 1, joinedAt: '2025-01-20' },
  { id: 'stu_002', name: 'Priya Patel', email: 'priya@iitd.ac.in', college: 'IIT Delhi', collegeSlug: 'iitd', registeredHackathons: 5, submissions: 4, certificates: 3, joinedAt: '2025-02-10' },
  { id: 'stu_003', name: 'Rahul Verma', email: 'rahul@bits-pilani.ac.in', college: 'BITS Pilani', collegeSlug: 'bits-pilani', registeredHackathons: 2, submissions: 1, certificates: 1, joinedAt: '2025-01-15' },
  { id: 'stu_004', name: 'Sneha Reddy', email: 'sneha@vit.ac.in', college: 'VIT Vellore', collegeSlug: 'vit', registeredHackathons: 4, submissions: 3, certificates: 2, joinedAt: '2025-03-05' },
  { id: 'stu_005', name: 'Karan Mehta', email: 'karan@gmail.com', college: 'Independent', collegeSlug: 'general', registeredHackathons: 1, submissions: 1, certificates: 0, joinedAt: '2025-03-20' },
];

// ─── Submissions ──────────────────────────────────────────────────────────────

export interface Submission {
  id: string;
  hackathonId: string;
  hackathonTitle: string;
  teamName: string;
  projectTitle: string;
  description: string;
  githubUrl: string;
  demoUrl?: string;
  status: SubmissionStatus;
  score?: number;
  submittedAt: string;
  feedback?: string;
}

export const MOCK_SUBMISSIONS: Submission[] = [
  { id: 'sub_001', hackathonId: 'hack_003', hackathonTitle: 'FinHack 2025', teamName: 'FinNova', projectTitle: 'PayEasy — UPI for All', description: 'A simplified UPI interface for senior citizens with voice commands.', githubUrl: 'https://github.com/finnova/payeasy', demoUrl: 'https://payeasy.demo', status: 'reviewed', score: 88, submittedAt: '2025-06-03T15:30:00Z', feedback: 'Excellent UX, needs better backend scaling.' },
  { id: 'sub_002', hackathonId: 'hack_002', hackathonTitle: 'CodeStorm 2025', teamName: 'GreenPulse', projectTitle: 'ClimateWatch Dashboard', description: 'Real-time climate monitoring using satellite data.', githubUrl: 'https://github.com/greenpulse/climatewatch', status: 'submitted', submittedAt: '2025-07-22T14:00:00Z' },
];

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  rank: number;
  teamName: string;
  members: string[];
  projectTitle: string;
  score: number;
  college: string;
}

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, teamName: 'NeuralNinjas', members: ['Arjun S.', 'Priya P.'], projectTitle: 'MedAI Diagnostic Tool', score: 97, college: 'IIT Bombay' },
  { rank: 2, teamName: 'CodeCrafters', members: ['Rahul V.', 'Sneha R.', 'Karan M.'], projectTitle: 'SmartCity Dashboard', score: 94, college: 'BITS Pilani' },
  { rank: 3, teamName: 'ByteBusters', members: ['Aditya K.', 'Nisha L.'], projectTitle: 'EcoRoute Optimizer', score: 91, college: 'IIT Delhi' },
  { rank: 4, teamName: 'PixelPirates', members: ['Rohan G.', 'Pooja S.', 'Dev M.', 'Tanya R.'], projectTitle: 'AR Campus Navigator', score: 89, college: 'VIT Vellore' },
  { rank: 5, teamName: 'DataDrifters', members: ['Sahil B.', 'Megha T.'], projectTitle: 'Stock Prediction AI', score: 86, college: 'IISc Bangalore' },
];

// ─── Announcements ────────────────────────────────────────────────────────────

export interface Announcement {
  id: string;
  hackathonId: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success';
  createdAt: string;
}

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: 'ann_001', hackathonId: 'hack_002', title: 'Extended Submission Deadline!', content: 'The submission deadline has been extended by 2 hours. New deadline: July 22, 8:00 PM IST.', type: 'info', createdAt: '2025-07-22T12:00:00Z' },
  { id: 'ann_002', hackathonId: 'hack_002', title: 'API Rate Limiting Issue', content: 'Some teams have reported issues with the climate API. Please use the backup endpoint provided in the resources section.', type: 'warning', createdAt: '2025-07-21T10:00:00Z' },
  { id: 'ann_003', hackathonId: 'hack_001', title: 'Registration Now Open!', content: 'Registration for HackForge 2025 is now officially open. Sign up early to secure your spot!', type: 'success', createdAt: '2025-07-01T09:00:00Z' },
];

// ─── Analytics summary ────────────────────────────────────────────────────────

export const MOCK_ANALYTICS = {
  totalHackathons: 12,
  activeHackathons: 2,
  totalStudents: 3847,
  totalOrganizations: 8,
  totalSubmissions: 1243,
  totalPrizePool: '₹32,00,000',
  monthlyGrowth: 24,
  certificatesIssued: 876,
};

// ─── Certificates ─────────────────────────────────────────────────────────────

export interface Certificate {
  id: string;
  hackathonTitle: string;
  studentName: string;
  achievement: string;
  issuedAt: string;
  verificationCode: string;
}

export const MOCK_CERTIFICATES: Certificate[] = [
  { id: 'cert_001', hackathonTitle: 'FinHack 2025', studentName: 'Arjun Sharma', achievement: '2nd Runner Up', issuedAt: '2025-06-07', verificationCode: 'FH25-ARJ-002' },
  { id: 'cert_002', hackathonTitle: 'CodeStorm 2024', studentName: 'Arjun Sharma', achievement: 'Participant', issuedAt: '2024-11-20', verificationCode: 'CS24-ARJ-PAR' },
];

// ─── Teams ────────────────────────────────────────────────────────────────────

export interface Team {
  id: string;
  name: string;
  hackathonId: string;
  leaderId: string;
  members: { id: string; name: string; email: string; role: 'leader' | 'member' }[];
  inviteCode: string;
  maxSize: number;
}

export const MOCK_TEAMS: Team[] = [
  {
    id: 'team_001',
    name: 'NeuralNinjas',
    hackathonId: 'hack_001',
    leaderId: 'stu_001',
    members: [
      { id: 'stu_001', name: 'Arjun Sharma', email: 'arjun@iitb.ac.in', role: 'leader' },
      { id: 'stu_002', name: 'Priya Patel', email: 'priya@iitd.ac.in', role: 'member' },
    ],
    inviteCode: 'NN-2025-XK9P',
    maxSize: 4,
  },
];

// ─── Saved hackathons (user favorites) ───────────────────────────────────────
export const MOCK_SAVED_HACKATHONS: string[] = ['hack_001', 'hack_002'];

// ─── Event Managers ───────────────────────────────────────────────────────────
export interface EventManager {
  id: string;
  name: string;
  email: string;
  orgId: string;
  orgName: string;
  hackathonsManaged: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export const MOCK_MANAGERS: EventManager[] = [
  { id: 'mgr_001', name: 'Rahul Kumar', email: 'rahul.mgr@iitb.ac.in', orgId: 'org_001', orgName: 'IIT Bombay Tech Society', hackathonsManaged: 2, status: 'active', createdAt: '2025-01-15' },
  { id: 'mgr_002', name: 'Ananya Singh', email: 'ananya.mgr@iitd.ac.in', orgId: 'org_002', orgName: 'IIT Delhi Innovation Club', hackathonsManaged: 1, status: 'active', createdAt: '2025-02-20' },
];
