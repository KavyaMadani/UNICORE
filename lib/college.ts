/**
 * College slug detection from email domain
 * No database queries — purely frontend mock
 */

interface College {
  name: string;
  slug: string;
  domain: string;
  city: string;
  state: string;
}

// ─── Mock College Map ─────────────────────────────────────────────────────────

const COLLEGE_MAP: Record<string, College> = {
  'iitb.ac.in': { name: 'IIT Bombay', slug: 'iitb', domain: 'iitb.ac.in', city: 'Mumbai', state: 'Maharashtra' },
  'iitd.ac.in': { name: 'IIT Delhi', slug: 'iitd', domain: 'iitd.ac.in', city: 'New Delhi', state: 'Delhi' },
  'iitm.ac.in': { name: 'IIT Madras', slug: 'iitm', domain: 'iitm.ac.in', city: 'Chennai', state: 'Tamil Nadu' },
  'iisc.ac.in': { name: 'IISc Bangalore', slug: 'iisc', domain: 'iisc.ac.in', city: 'Bangalore', state: 'Karnataka' },
  'bits-pilani.ac.in': { name: 'BITS Pilani', slug: 'bits-pilani', domain: 'bits-pilani.ac.in', city: 'Pilani', state: 'Rajasthan' },
  'nit.ac.in': { name: 'NIT', slug: 'nit', domain: 'nit.ac.in', city: 'Various', state: 'India' },
  'vit.ac.in': { name: 'VIT Vellore', slug: 'vit', domain: 'vit.ac.in', city: 'Vellore', state: 'Tamil Nadu' },
  'manipal.edu': { name: 'Manipal University', slug: 'manipal', domain: 'manipal.edu', city: 'Manipal', state: 'Karnataka' },
  'lpu.in': { name: 'Lovely Professional University', slug: 'lpu', domain: 'lpu.in', city: 'Phagwara', state: 'Punjab' },
  'srm.edu.in': { name: 'SRM University', slug: 'srm', domain: 'srm.edu.in', city: 'Chennai', state: 'Tamil Nadu' },
  'amity.edu': { name: 'Amity University', slug: 'amity', domain: 'amity.edu', city: 'Noida', state: 'Uttar Pradesh' },
  'christuniversity.in': { name: 'Christ University', slug: 'christ', domain: 'christuniversity.in', city: 'Bangalore', state: 'Karnataka' },
  'mu.ac.in': { name: 'Mumbai University', slug: 'mu', domain: 'mu.ac.in', city: 'Mumbai', state: 'Maharashtra' },
  'du.ac.in': { name: 'Delhi University', slug: 'du', domain: 'du.ac.in', city: 'New Delhi', state: 'Delhi' },
};

export function getCollegeFromDomain(domain: string): College | null {
  try {
    if (!domain) return null;
    return COLLEGE_MAP[domain.toLowerCase()] ?? null;
  } catch {
    return null;
  }
}

export function getCollegeSlugFromEmail(email: string): string {
  try {
    if (!email || !email.includes('@')) return 'general';
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return 'general';
    const college = COLLEGE_MAP[domain];
    return college?.slug ?? 'general';
  } catch {
    return 'general';
  }
}

export function getCollegeNameFromEmail(email: string): string {
  try {
    if (!email || !email.includes('@')) return 'General';
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return 'General';
    const college = COLLEGE_MAP[domain];
    return college?.name ?? 'Independent';
  } catch {
    return 'General';
  }
}

export function getAllColleges(): College[] {
  return Object.values(COLLEGE_MAP);
}

export const MOCK_COLLEGES: College[] = Object.values(COLLEGE_MAP);
