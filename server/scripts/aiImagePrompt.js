/**
 * Standard AI thumbnail prompt — always use this for new game art.
 * Matches the premium mobile game icons generated for True Mobsters v2.3+.
 */
export function aiImagePrompt(name, categoryContext) {
  const subject = String(name).replace(/\([^)]*\)/g, '').trim();
  const ctx = categoryContext || 'game item';
  return `${subject}, ${ctx}, premium mobile game icon, isolated centered object, dark studio background #0a0a0f, cinematic rim light, ultra detailed 3D product render, no text, no logo, no watermark, Storm8 iMobsters style`;
}

export const AI_IMAGE_CONTEXT = {
  weapon: 'detailed mafia weapon prop',
  armor: 'tactical armor equipment protection',
  vehicle: 'crime syndicate vehicle transport',
  property: 'criminal business real estate property building',
  consumable: 'game power-up consumable item',
  boss: 'crime boss character portrait',
  job: 'mafia crime mission job icon',
  territory: 'territory control map marker',
  location: 'city district location pin',
  ui: 'mobile game UI button icon',
  godfather: 'the godfather specialty shop character portrait',
};

export function aiImageFilename(category, id) {
  return `${category}_${id}.webp`;
}
