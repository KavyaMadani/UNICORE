/**
 * College detection from email domain.
 * 
 * How it works:
 * - Extracts the domain from the email (e.g. "charusat.edu.in" from "user@charusat.edu.in")
 * - Checks the `colleges` table in Supabase for a matching `domain` column
 * - Falls back to a prettified version of the domain if no match found
 * 
 * Admin can add colleges with their domains in the admin panel.
 * Example: college "Charusat University" with domain "charusat.edu.in"
 */

import { supabase } from './supabase';

/**
 * Extract domain from email.
 * "student@charusat.edu.in" → "charusat.edu.in"
 */
export function getDomainFromEmail(email: string): string {
  return email.trim().toLowerCase().split('@')[1] ?? '';
}

/**
 * Prettify a domain into a readable college name (fallback only).
 * "charusat.edu.in" → "Charusat"
 * "iitb.ac.in"      → "Iitb"
 */
export function prettifyDomain(domain: string): string {
  const parts = domain.split('.');
  // Remove common suffixes like edu, ac, com, in, org
  const stop = new Set(['edu', 'ac', 'com', 'in', 'org', 'net', 'co']);
  const meaningful = parts.filter(p => !stop.has(p));
  if (meaningful.length === 0) return domain;
  // Capitalize first part
  return meaningful[0].charAt(0).toUpperCase() + meaningful[0].slice(1);
}

/**
 * Look up a college name from the DB colleges table using email domain.
 * Returns: { college: string | null, collegeId: string | null }
 *
 * If the domain matches a college in DB → returns full college name.
 * If no match → returns prettified domain as fallback.
 */
export async function detectCollegeFromEmail(email: string): Promise<{
  college: string;
  collegeId: string | null;
}> {
  const domain = getDomainFromEmail(email);
  if (!domain) return { college: '', collegeId: null };

  try {
    // Try exact domain match in colleges table
    const { data } = await supabase
      .from('colleges')
      .select('id, name, domain')
      .eq('domain', domain)
      .maybeSingle();

    if (data?.name) {
      return { college: data.name, collegeId: data.id };
    }

    // Try partial domain match (e.g., "iitb.ac.in" matches "iitb")
    const subdomain = domain.split('.')[0];
    const { data: fuzzy } = await supabase
      .from('colleges')
      .select('id, name, domain')
      .ilike('name', `%${subdomain}%`)
      .maybeSingle();

    if (fuzzy?.name) {
      return { college: fuzzy.name, collegeId: fuzzy.id };
    }
  } catch {
    // DB unavailable — use fallback
  }

  // Fallback: prettify domain
  return { college: prettifyDomain(domain), collegeId: null };
}
