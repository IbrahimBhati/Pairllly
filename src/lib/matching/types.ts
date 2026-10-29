import type { Skill, Profile, Listing } from '../../types/database';

export interface UserSkillPair {
  userId: string;
  offers: Skill[];
  wants: Skill[];
}

export interface MatchScoreDetails {
  matchPercentage: number;
  myWantsCoverage: number;
  theirWantsCoverage: number;
  skillsIOfferTheyWant: Skill[];
  skillsTheyOfferIWant: Skill[];
  isReciprocal: boolean;
  explanation: string;
}

export interface SmartMatchCandidate {
  userId: string;
  profile: Profile;
  scoreDetails: MatchScoreDetails;
  relevantListings: Listing[];
}
