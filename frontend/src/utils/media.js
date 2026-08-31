/**
 * Curated editorial imagery for HADES.
 *
 * Deliberately REAL photography — students, developers, and workspaces — to keep the
 * product grounded in a human technical career. No robots, glowing brains, holographic
 * "AI" art, or generic ed-tech illustration. All images are Unsplash (stable photo IDs)
 * served through their on-the-fly resize/format CDN.
 */

const UNSPLASH = 'https://images.unsplash.com/';

export function photoUrl(id, { w = 1200, h, q = 80 } = {}) {
  const params = new URLSearchParams({
    auto: 'format',
    fit: 'crop',
    w: String(w),
    q: String(q),
  });
  if (h) params.set('h', String(h));
  return `${UNSPLASH}${id}?${params.toString()}`;
}

// Raw photo IDs grouped by intent.
export const PHOTOS = {
  // Focused individuals building / studying
  focusedDeveloper: 'photo-1531482615713-2afd69097998',
  studentLaptop: 'photo-1516321318423-f06f85e504b3',
  womanCoding: 'photo-1607799279861-4dd421887fb3',
  developerPortrait: 'photo-1517245386807-bb43f82c33c4',
  // Collaboration & mentorship
  teamCollab: 'photo-1522071820081-009f0129c71c',
  pairLearning: 'photo-1522202176988-66273c2fd55f',
  mentorship: 'photo-1600880292203-757bb62b4baf',
  studyGroup: 'photo-1543269865-cbf427effbad',
  // Workspaces & code
  codeScreen: 'photo-1498050108023-c5249f4df085',
  editorScreen: 'photo-1461749280684-dccba630e2f6',
  deskWorkspace: 'photo-1504384308090-c894fdcc538d',
};

// Ready-made URLs for the key surfaces.
export const IMAGERY = {
  authPrimary: photoUrl(PHOTOS.teamCollab, { w: 1200, h: 1600, q: 82 }),
  authSecondary: photoUrl(PHOTOS.focusedDeveloper, { w: 1200, h: 1600, q: 82 }),
  heroWorkspace: photoUrl(PHOTOS.codeScreen, { w: 1600, h: 1000, q: 78 }),
  dashboardBackdrop: photoUrl(PHOTOS.deskWorkspace, { w: 1800, h: 900, q: 76 }),
  projectCard: photoUrl(PHOTOS.editorScreen, { w: 480, h: 320, q: 78 }),
  onboarding: photoUrl(PHOTOS.pairLearning, { w: 1200, h: 1500, q: 80 }),
};
