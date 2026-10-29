import type { Skill } from '../../types/database';

/**
 * Deterministically constructs clear human-readable explanations of match compatibility.
 */
export function generateMatchExplanation(
  userName: string,
  skillsIOfferTheyWant: Skill[],
  skillsTheyOfferIWant: Skill[],
  isReciprocal: boolean
): string {
  const iTeach = skillsIOfferTheyWant.map((s) => s.name).join(', ');
  const theyTeach = skillsTheyOfferIWant.map((s) => s.name).join(', ');

  if (isReciprocal && iTeach && theyTeach) {
    return `You can share ${iTeach} with ${userName}, while they can help you master ${theyTeach}.`;
  }

  if (theyTeach) {
    return `${userName} offers ${theyTeach}, which matches your learning goals.`;
  }

  if (iTeach) {
    return `You offer ${iTeach}, which ${userName} wants to learn.`;
  }

  return `Explore potential collaboration with ${userName}.`;
}
