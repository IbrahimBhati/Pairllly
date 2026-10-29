import type { Skill } from '../../types/database';
import type { MatchScoreDetails } from './types';
import { generateMatchExplanation } from './explanations';

/**
 * Calculates deterministic smart match compatibility between user A (active user)
 * and user B (candidate peer) using stable skill IDs.
 */
export function calculateMatchScore(
  userName: string,
  userAOffers: Skill[],
  userAWants: Skill[],
  userBOffers: Skill[],
  userBWants: Skill[]
): MatchScoreDetails {
  // Compare stable skill IDs, not display names
  const userAOfferIds = new Set(userAOffers.map((s) => s.id));
  const userAWantIds = new Set(userAWants.map((s) => s.id));
  const userBOfferIds = new Set(userBOffers.map((s) => s.id));
  const userBWantIds = new Set(userBWants.map((s) => s.id));

  // Skills User A offers that User B wants: A_offers ∩ B_wants
  const skillsIOfferTheyWant = userAOffers.filter((s) => userBWantIds.has(s.id));

  // Skills User B offers that User A wants: B_offers ∩ A_wants
  const skillsTheyOfferIWant = userBOffers.filter((s) => userAWantIds.has(s.id));

  // A's wants coverage = count(B_offers ∩ A_wants) / count(A_wants)
  const myWantsCount = userAWants.length;
  const myWantsCoveredCount = skillsTheyOfferIWant.length;
  const myWantsCoverage = myWantsCount > 0 ? Math.min(1, myWantsCoveredCount / myWantsCount) : 0;

  // B's wants coverage = count(A_offers ∩ B_wants) / count(B_wants)
  const theirWantsCount = userBWants.length;
  const theirWantsCoveredCount = skillsIOfferTheyWant.length;
  const theirWantsCoverage = theirWantsCount > 0 ? Math.min(1, theirWantsCoveredCount / theirWantsCount) : 0;

  // Overall score = round(100 * (A's wants coverage + B's wants coverage) / 2)
  const matchPercentage = Math.round(100 * ((myWantsCoverage + theirWantsCoverage) / 2));

  // A reciprocal match requires at least one matching skill in each direction
  const isReciprocal = myWantsCoveredCount >= 1 && theirWantsCoveredCount >= 1;

  const explanation = generateMatchExplanation(
    userName,
    skillsIOfferTheyWant,
    skillsTheyOfferIWant,
    isReciprocal
  );

  return {
    matchPercentage,
    myWantsCoverage: Math.round(myWantsCoverage * 100),
    theirWantsCoverage: Math.round(theirWantsCoverage * 100),
    skillsIOfferTheyWant,
    skillsTheyOfferIWant,
    isReciprocal,
    explanation,
  };
}
