import React from 'react';
import { Hero } from '../components/landing/Hero';
import { HowItWorks } from '../components/landing/HowItWorks';
import { SmartMatching } from '../components/landing/SmartMatching';
import { Community } from '../components/landing/Community';
import { Benefits } from '../components/landing/Benefits';
import { Trust } from '../components/landing/Trust';

export interface LandingPageProps {
  onNavigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col">
      <Hero
        onFindMatch={() => onNavigate('/explore')}
        onOfferSkill={() => onNavigate('/signup')}
      />
      <HowItWorks />
      <SmartMatching />
      <Community />
      <Benefits />
      <Trust />
    </div>
  );
};
