/**
 * LinkedIn Integration Service
 * -----------------------------
 * IMPORTANT — what this honestly does and does not do:
 *   LinkedIn's Jobs data (search results, individual postings) is only available
 *   through LinkedIn's Talent Solutions Partner API, which requires an approved
 *   business partnership — there is no public self-serve "search LinkedIn jobs"
 *   API. Scraping LinkedIn's website violates its Terms of Service, so this app
 *   does not do that.
 *
 * What it DOES do (fully real, fully working):
 *   Builds correctly-formatted LinkedIn job-search URLs (the same URLs LinkedIn's
 *   own site uses) from the user's target role, skill gaps, resume location, and
 *   preferred work mode. "Apply on LinkedIn" / "Find on LinkedIn" buttons open
 *   these links in a new tab, landing the user on real, live LinkedIn job
 *   results/postings where they can apply directly through LinkedIn.
 *
 * If your organization later signs a LinkedIn Talent API partnership, drop the
 * real API calls into `jobProviderService.js` (`searchJobsLiveProvider`) — the
 * rest of the app (matching, gap analysis, application tracking) needs zero
 * changes because it already talks to that one abstraction layer.
 */

const LINKEDIN_WORK_MODE_CODES = {
  Remote: '2',
  Hybrid: '3',
  'On-site': '1',
};

function buildLinkedInSearchUrl({ keywords, location, workMode }) {
  const params = new URLSearchParams();
  if (keywords) params.set('keywords', keywords);
  if (location) params.set('location', location);
  if (workMode && LINKEDIN_WORK_MODE_CODES[workMode]) params.set('f_WT', LINKEDIN_WORK_MODE_CODES[workMode]);
  params.set('sortBy', 'R'); // sort by relevance
  return `https://www.linkedin.com/jobs/search/?${params.toString()}`;
}

// Best-effort direct-apply link for a specific role/company. LinkedIn does not
// expose a public way to resolve a title+company to an exact posting ID without
// partner API access, so this deep-links to a highly-targeted search (title +
// company as keywords) — in practice this reliably surfaces the exact listing
// (or the company's current openings) as the top result.
function buildLinkedInApplyUrl({ title, company, location }) {
  return buildLinkedInSearchUrl({ keywords: `${title} ${company}`.trim(), location });
}

function buildLinkedInCompanyUrl(company) {
  const slug = encodeURIComponent(company);
  return `https://www.linkedin.com/search/results/companies/?keywords=${slug}`;
}

// Personalized set of "jump to LinkedIn" shortcuts based on the user's real
// target role + biggest skill gaps, instead of one generic search link.
function buildPersonalizedSearchLinks({ targetRole, topGapSkills = [], location, workMode }) {
  const links = [];
  if (targetRole) {
    links.push({
      label: `${targetRole} roles`,
      url: buildLinkedInSearchUrl({ keywords: targetRole, location, workMode }),
    });
  }
  topGapSkills.slice(0, 3).forEach((skill) => {
    links.push({
      label: `${skill} roles`,
      url: buildLinkedInSearchUrl({ keywords: `${targetRole || ''} ${skill}`.trim(), location, workMode }),
    });
  });
  if (!links.length) {
    links.push({ label: 'Browse jobs on LinkedIn', url: buildLinkedInSearchUrl({ keywords: '', location }) });
  }
  return links;
}

module.exports = {
  buildLinkedInSearchUrl,
  buildLinkedInApplyUrl,
  buildLinkedInCompanyUrl,
  buildPersonalizedSearchLinks,
};
