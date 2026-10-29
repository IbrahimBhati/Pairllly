import React, { useState } from 'react';
import { OnboardingStepper } from '../components/onboarding/OnboardingStepper';
import { SkillMultiSelect } from '../components/onboarding/SkillMultiSelect';
import { AccountTypeSelector } from '../components/auth/AccountTypeSelector';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { FormError } from '../components/auth/FormError';
import { Avatar } from '../components/ui/Avatar';
import {
  User,
  AtSign,
  Building,
  GraduationCap,
  MapPin,
  Clock,
  Calendar,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Edit2,
  BookOpen,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Skill, OnboardingFormData, AccountType } from '../types/database';

// 15 Seeded skills from Phase 1
const SEED_SKILLS: Skill[] = [
  { id: '1', name: 'Programming', slug: 'programming', category: 'Technology', description: 'Web development, mobile apps, algorithms, software engineering, and clean code.', is_active: true, created_at: '2026-10-29' },
  { id: '2', name: 'Graphic Design', slug: 'graphic-design', category: 'Creative & Design', description: 'Visual identity, logo design, illustration, layout, and brand assets.', is_active: true, created_at: '2026-10-29' },
  { id: '3', name: 'Photography', slug: 'photography', category: 'Creative & Design', description: 'Camera composition, lighting, photo editing, and portrait or landscape capture.', is_active: true, created_at: '2026-10-29' },
  { id: '4', name: 'Video Editing', slug: 'video-editing', category: 'Creative & Design', description: 'Post-production, pacing, color grading, sound design, and motion cuts.', is_active: true, created_at: '2026-10-29' },
  { id: '5', name: 'Writing', slug: 'writing', category: 'Communication', description: 'Essay composition, storytelling, copywriting, academic papers, and technical docs.', is_active: true, created_at: '2026-10-29' },
  { id: '6', name: 'English', slug: 'english', category: 'Languages', description: 'Grammar, conversational fluency, pronunciation, and academic literature.', is_active: true, created_at: '2026-10-29' },
  { id: '7', name: 'Mathematics', slug: 'mathematics', category: 'Academics', description: 'Calculus, linear algebra, discrete math, statistics, and applied problem solving.', is_active: true, created_at: '2026-10-29' },
  { id: '8', name: 'Public Speaking', slug: 'public-speaking', category: 'Communication', description: 'Stage presence, speech crafting, presentation delivery, and debate technique.', is_active: true, created_at: '2026-10-29' },
  { id: '9', name: 'UI/UX Design', slug: 'ui-ux-design', category: 'Creative & Design', description: 'User research, wireframing, Figma prototyping, and design system building.', is_active: true, created_at: '2026-10-29' },
  { id: '10', name: 'Digital Marketing', slug: 'digital-marketing', category: 'Business', description: 'SEO, social media growth, email campaigns, and analytics tracking.', is_active: true, created_at: '2026-10-29' },
  { id: '11', name: 'Excel', slug: 'excel', category: 'Business', description: 'Data cleaning, advanced formulas, pivot tables, lookup models, and dashboards.', is_active: true, created_at: '2026-10-29' },
  { id: '12', name: 'Research', slug: 'research', category: 'Academics', description: 'Literature review, empirical methodology, qualitative analysis, and citations.', is_active: true, created_at: '2026-10-29' },
  { id: '13', name: 'Tutoring', slug: 'tutoring', category: 'Academics', description: 'Study planning, peer mentoring, concept mastery, and exam preparation.', is_active: true, created_at: '2026-10-29' },
  { id: '14', name: 'Career Guidance', slug: 'career-guidance', category: 'Professional', description: 'Resume review, interview practice, portfolio curation, and networking strategies.', is_active: true, created_at: '2026-10-29' },
  { id: '15', name: 'Content Creation', slug: 'content-creation', category: 'Media', description: 'Short-form video, scriptwriting, community building, and creative storytelling.', is_active: true, created_at: '2026-10-29' },
];

export interface OnboardingPageProps {
  onComplete: () => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onComplete }) => {
  const { user, profile, completeOnboarding } = useAuth();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State initialized from current profile/user
  const [formData, setFormData] = useState<OnboardingFormData>({
    display_name: profile?.display_name || user?.user_metadata?.display_name || '',
    username: profile?.username || user?.user_metadata?.username || '',
    account_type: profile?.account_type || (user?.user_metadata?.account_type as AccountType) || 'student',
    avatar_url: profile?.avatar_url || '',
    bio: profile?.bio || '',
    institution: profile?.institution || '',
    department: profile?.department || '',
    location: profile?.location || '',
    timezone: profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    availability: profile?.availability || 'Weekdays after 4 PM, Flexible weekends',
    offered_skills: [],
    wanted_skills: [],
  });

  const stepsList = [
    { number: 1, title: 'Profile', description: 'Basic Information' },
    { number: 2, title: 'Background', description: 'Campus & Location' },
    { number: 3, title: 'Skills', description: 'Offer & Learn' },
    { number: 4, title: 'Review', description: 'Confirm & Launch' },
  ];

  // Validation per step
  const handleNextStep = () => {
    setErrorMessage(null);

    if (step === 1) {
      if (!formData.display_name.trim() || formData.display_name.length < 2) {
        setErrorMessage('Display name must be at least 2 characters');
        return;
      }
      if (!formData.username.trim() || formData.username.length < 3) {
        setErrorMessage('Username must be at least 3 characters');
        return;
      }
      if (!/^[a-z0-9_]+$/.test(formData.username)) {
        setErrorMessage('Username may only contain lowercase letters, numbers, and underscores');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      if (formData.offered_skills.length < 1) {
        setErrorMessage('Please select at least one skill you can offer or teach');
        return;
      }
      if (formData.wanted_skills.length < 1) {
        setErrorMessage('Please select at least one skill you want to learn');
        return;
      }
      setStep(4);
    }
  };

  const handleComplete = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const res = await completeOnboarding(formData);
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        onComplete();
      }
    } catch (err) {
      setErrorMessage((err as Error).message || 'Failed to complete profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSkillName = (id: string) => SEED_SKILLS.find((s) => s.id === id)?.name || 'Skill';

  return (
    <div className="min-h-[calc(100vh-16rem)] py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header and Stepper */}
      <div className="mb-10 text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#4B3F72] bg-[#E0E7FF] px-3 py-1 rounded-full">
          Pairly Onboarding
        </span>
        <h1 className="text-3xl font-extrabold text-[#1F2937] tracking-tight">
          Complete Your Skill Profile
        </h1>
        <p className="text-sm text-[#64748B] max-w-lg mx-auto">
          Share what you can teach and what you want to learn to activate reciprocal smart matching.
        </p>

        <div className="pt-8 max-w-2xl mx-auto">
          <OnboardingStepper
            currentStep={step}
            steps={stepsList}
            onStepClick={(s) => setStep(s)}
          />
        </div>
      </div>

      <Card className="shadow-lg border-[#E2E8F0]">
        <CardHeader className="border-b border-[#F1F5F9] pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-[#1F2937]">
                {step === 1 && 'Step 1: Basic Information'}
                {step === 2 && 'Step 2: Background & Availability'}
                {step === 3 && 'Step 3: Select Your Skills'}
                {step === 4 && 'Step 4: Review & Finalize'}
              </CardTitle>
              <CardDescription>
                {step === 1 && 'Tell the community who you are and how you identify.'}
                {step === 2 && 'Add your campus, department, or flexible time preferences.'}
                {step === 3 && 'Specify what you can teach with your proficiency, and what you want to learn.'}
                {step === 4 && 'Double check your profile details before launching into Pairly.'}
              </CardDescription>
            </div>
            <span className="text-xs font-bold font-mono text-[#4B3F72] bg-[#F1F5F9] px-2.5 py-1 rounded-lg">
              {step} / 4
            </span>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <FormError message={errorMessage} className="mb-6" />

          {/* STEP 1: BASIC INFORMATION */}
          {step === 1 && (
            <div className="space-y-6">
              <AccountTypeSelector
                value={formData.account_type}
                onChange={(t) => setFormData({ ...formData, account_type: t })}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#1F2937]" htmlFor="display_name">
                    Display Name *
                  </label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    placeholder="e.g. Alex Morgan"
                    leftIcon={<User className="w-4 h-4" />}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#1F2937]" htmlFor="username">
                    Unique Username *
                  </label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                    placeholder="e.g. alex_m"
                    leftIcon={<AtSign className="w-4 h-4" />}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1F2937]" htmlFor="avatar_url">
                  Avatar Image URL (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <Avatar name={formData.display_name} src={formData.avatar_url} size="md" />
                  <Input
                    id="avatar_url"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    placeholder="https://images.unsplash.com/... or image link"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1F2937]" htmlFor="bio">
                  Biography (Optional)
                </label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Share what excites you about peer learning, past projects, or academic interests..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* STEP 2: BACKGROUND */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#1F2937]" htmlFor="institution">
                    Institution / University / Workplace
                  </label>
                  <Input
                    id="institution"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="e.g. Stanford University or Self-employed"
                    leftIcon={<Building className="w-4 h-4" />}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#1F2937]" htmlFor="department">
                    Department / Field of Study
                  </label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g. Computer Science, English, Design"
                    leftIcon={<GraduationCap className="w-4 h-4" />}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#1F2937]" htmlFor="location">
                    City / Campus Location
                  </label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Seattle, WA or Main Campus Library"
                    leftIcon={<MapPin className="w-4 h-4" />}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#1F2937]" htmlFor="timezone">
                    Timezone
                  </label>
                  <Input
                    id="timezone"
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    placeholder="e.g. America/Los_Angeles"
                    leftIcon={<Clock className="w-4 h-4" />}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1F2937]" htmlFor="availability">
                  General Availability
                </label>
                <Input
                  id="availability"
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  placeholder="e.g. Tuesdays & Thursdays after 3 PM, weekends"
                  leftIcon={<Calendar className="w-4 h-4" />}
                />
              </div>
            </div>
          )}

          {/* STEP 3: SKILLS */}
          {step === 3 && (
            <SkillMultiSelect
              catalog={SEED_SKILLS}
              offeredSkills={formData.offered_skills}
              wantedSkills={formData.wanted_skills}
              onOfferedSkillsChange={(offered) =>
                setFormData({ ...formData, offered_skills: offered })
              }
              onWantedSkillsChange={(wanted) =>
                setFormData({ ...formData, wanted_skills: wanted })
              }
            />
          )}

          {/* STEP 4: REVIEW */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={formData.display_name} src={formData.avatar_url} size="lg" />
                  <div>
                    <h3 className="text-base font-bold text-[#1F2937]">{formData.display_name}</h3>
                    <p className="text-xs text-[#64748B]">
                      @{formData.username} · {formData.account_type.toUpperCase()}
                    </p>
                    {formData.institution && (
                      <p className="text-xs text-[#4B3F72] mt-0.5 font-medium">
                        {formData.institution} {formData.department && `(${formData.department})`}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep(1)}
                  leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                >
                  Edit Profile
                </Button>
              </div>

              {formData.bio && (
                <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] text-xs text-[#64748B]">
                  <strong className="text-[#1F2937] block mb-1">Biography:</strong>
                  {formData.bio}
                </div>
              )}

              {/* Skills Review */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Offered */}
                <div className="p-4 rounded-2xl border border-[#10B981]/30 bg-[#A7F3D0]/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#064E3B] flex items-center gap-1.5 uppercase tracking-wide">
                      <BookOpen className="w-4 h-4 text-[#10B981]" />
                      Skills You Teach ({formData.offered_skills.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="text-xs text-[#064E3B] hover:underline font-semibold"
                    >
                      Change
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.offered_skills.map((s) => (
                      <div
                        key={s.skill_id}
                        className="p-2.5 rounded-xl bg-white border border-[#CBD5E1] text-xs flex items-center justify-between shadow-2xs"
                      >
                        <span className="font-bold text-[#1F2937]">{getSkillName(s.skill_id)}</span>
                        <span className="text-[10px] uppercase font-bold text-[#4B3F72] bg-[#E0E7FF] px-2 py-0.5 rounded">
                          {s.proficiency}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Wanted */}
                <div className="p-4 rounded-2xl border border-[#A78BFA]/40 bg-[#A78BFA]/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#4B3F72] flex items-center gap-1.5 uppercase tracking-wide">
                      <Layers className="w-4 h-4 text-[#A78BFA]" />
                      Skills You Want ({formData.wanted_skills.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="text-xs text-[#4B3F72] hover:underline font-semibold"
                    >
                      Change
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.wanted_skills.map((s) => (
                      <div
                        key={s.skill_id}
                        className="p-2.5 rounded-xl bg-white border border-[#CBD5E1] text-xs flex items-center justify-between shadow-2xs"
                      >
                        <span className="font-bold text-[#1F2937]">{getSkillName(s.skill_id)}</span>
                        <span className="text-[10px] text-[#64748B] italic">Goal</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t border-[#F1F5F9] pt-4 flex items-center justify-between">
          {step > 1 ? (
            <Button
              variant="outline"
              size="md"
              onClick={() => setStep(step - 1)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Previous
            </Button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <Button
              variant="primary"
              size="md"
              onClick={handleNextStep}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Next Step
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={handleComplete}
              isLoading={isSubmitting}
              rightIcon={<CheckCircle2 className="w-4 h-4" />}
              className="bg-[#10B981] hover:bg-[#059669] text-white"
            >
              Complete Profile & Launch
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};
