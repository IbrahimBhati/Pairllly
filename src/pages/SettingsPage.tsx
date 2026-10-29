import React, { useState, useEffect } from 'react';
import {
  Bell,
  Sun,
  Moon,
  Laptop,
  Ban,
  ShieldCheck,
  AlertTriangle,
  Trash2,
  Save,
  CheckCircle,
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SettingsService } from '../lib/services/settingsService';
import { SafetyService } from '../lib/services/safetyService';
import type { UserSettings, UserBlock, VerificationRequest } from '../types/database';

interface SettingsPageProps {
  onNavigate: (path: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const { user, profile, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [blockedUsers, setBlockedUsers] = useState<UserBlock[]>([]);
  const [verificationReq, setVerificationReq] = useState<VerificationRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verification request form state
  const [verifMethod, setVerifMethod] = useState<'institutional_email' | 'manual_review'>('institutional_email');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [verifNotes, setVerifNotes] = useState('');
  const [isSubmittingVerif, setIsSubmittingVerif] = useState(false);

  // Delete account modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      if (!user) return;
      setIsLoading(true);
      try {
        const [userSet, blocks, verif] = await Promise.all([
          SettingsService.getUserSettings(user.id),
          SafetyService.getBlockedUsers(user.id),
          SafetyService.getLatestVerificationRequest(user.id),
        ]);
        setSettings(userSet);
        setBlockedUsers(blocks);
        setVerificationReq(verif);
      } catch (err) {
        setError((err as Error).message || 'Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [user]);

  const handleToggle = (key: keyof UserSettings) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  const handleSaveSettings = async () => {
    if (!user || !settings) return;
    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);
    try {
      await SettingsService.updateUserSettings(user.id, settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError((err as Error).message || 'Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnblock = async (blockedId: string) => {
    if (!user) return;
    try {
      await SafetyService.unblockUser(user.id, blockedId);
      setBlockedUsers((prev) => prev.filter((b) => b.blocked_id !== blockedId));
    } catch (err) {
      setError((err as Error).message || 'Failed to unblock user');
    }
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmittingVerif(true);
    setError(null);
    try {
      const v = await SafetyService.submitVerificationRequest({
        userId: user.id,
        method: verifMethod,
        evidenceUrl: evidenceUrl.trim() || undefined,
        notes: verifNotes.trim() || undefined,
      });
      setVerificationReq(v);
      setEvidenceUrl('');
      setVerifNotes('');
    } catch (err) {
      setError((err as Error).message || 'Failed to submit verification request');
    } finally {
      setIsSubmittingVerif(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || deleteConfirmText !== 'DELETE') return;
    setIsDeleting(true);
    try {
      await SettingsService.deleteAccount(user.id);
      await logout();
      onNavigate('/');
    } catch (err) {
      setError((err as Error).message || 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <PageHeader
        title="Account Settings"
        description="Manage your notification preferences, theme appearance, blocked members, and university verification status."
      />

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
          {error}
        </div>
      )}

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Settings saved successfully.</span>
        </div>
      )}

      {/* Theme & Appearance */}
      <Card className="border-[#E2E8F0]">
        <CardHeader className="border-b border-[#F1F5F9] pb-4">
          <CardTitle className="text-base text-[#1F2937]">Theme & Appearance</CardTitle>
          <CardDescription>
            Choose your preferred color scheme across Pairly.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-3 max-w-md">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center gap-2 ${
                theme === 'light'
                  ? 'border-[#4B3F72] bg-purple-50/50 text-[#4B3F72] font-bold shadow-sm'
                  : 'border-[#CBD5E1] bg-white text-[#64748B] hover:bg-slate-50'
              }`}
            >
              <Sun className="w-5 h-5" />
              <span className="text-xs">Light</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center gap-2 ${
                theme === 'dark'
                  ? 'border-[#4B3F72] bg-purple-50/50 text-[#4B3F72] font-bold shadow-sm'
                  : 'border-[#CBD5E1] bg-white text-[#64748B] hover:bg-slate-50'
              }`}
            >
              <Moon className="w-5 h-5" />
              <span className="text-xs">Dark</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('system')}
              className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center gap-2 ${
                theme === 'system'
                  ? 'border-[#4B3F72] bg-purple-50/50 text-[#4B3F72] font-bold shadow-sm'
                  : 'border-[#CBD5E1] bg-white text-[#64748B] hover:bg-slate-50'
              }`}
            >
              <Laptop className="w-5 h-5" />
              <span className="text-xs">System</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Preferences */}
      <Card className="border-[#E2E8F0]">
        <CardHeader className="border-b border-[#F1F5F9] pb-4">
          <CardTitle className="text-base text-[#1F2937]">Notification Preferences</CardTitle>
          <CardDescription>
            Control alerts for collaboration requests, direct messages, and exchange updates.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {settings && (
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 transition-colors cursor-pointer">
                <div>
                  <span className="font-semibold text-xs text-[#1F2937] block">
                    Connection Request Alerts
                  </span>
                  <span className="text-[11px] text-[#64748B]">
                    Receive notifications when a peer proposes a skill exchange
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.request_notifications}
                  onChange={() => handleToggle('request_notifications')}
                  className="rounded text-[#4B3F72] focus:ring-[#A78BFA] w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 transition-colors cursor-pointer">
                <div>
                  <span className="font-semibold text-xs text-[#1F2937] block">
                    Direct Message Notifications
                  </span>
                  <span className="text-[11px] text-[#64748B]">
                    Get alerts when a peer sends you a chat message
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.message_notifications}
                  onChange={() => handleToggle('message_notifications')}
                  className="rounded text-[#4B3F72] focus:ring-[#A78BFA] w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 transition-colors cursor-pointer">
                <div>
                  <span className="font-semibold text-xs text-[#1F2937] block">
                    Exchange Completion Reminders
                  </span>
                  <span className="text-[11px] text-[#64748B]">
                    Remind me to confirm completed sessions and leave reviews
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.exchange_reminders}
                  onChange={() => handleToggle('exchange_reminders')}
                  className="rounded text-[#4B3F72] focus:ring-[#A78BFA] w-4 h-4 cursor-pointer"
                />
              </label>
            </div>
          )}

          <div className="pt-2">
            <Button
              size="sm"
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="bg-[#4B3F72] hover:bg-[#3d335d] text-white text-xs flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Notification Settings'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* University Verification */}
      <Card className="border-[#E2E8F0]">
        <CardHeader className="border-b border-[#F1F5F9] pb-4">
          <CardTitle className="text-base text-[#1F2937] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#4B3F72]" />
            <span>Academic Community Verification</span>
          </CardTitle>
          <CardDescription>
            Verified members receive an authentic verification badge on their public profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <span className="font-semibold text-[#1F2937]">Current Verification Status:</span>
            <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
              profile?.verification_status === 'verified'
                ? 'bg-[#A7F3D0] text-[#065F46]'
                : verificationReq?.status === 'pending'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-slate-200 text-slate-700'
            }`}>
              {profile?.verification_status === 'verified'
                ? 'Verified Member'
                : verificationReq?.status === 'pending'
                ? 'Pending Review'
                : 'Unverified'}
            </span>
          </div>

          {profile?.verification_status !== 'verified' && verificationReq?.status !== 'pending' && (
            <form onSubmit={handleSubmitVerification} className="space-y-4 pt-2 border-t border-[#F1F5F9]">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1F2937]">Verification Method</label>
                <select
                  value={verifMethod}
                  onChange={(e) => setVerifMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs bg-white text-[#1F2937]"
                >
                  <option value="institutional_email">Institutional University Email</option>
                  <option value="manual_review">Manual Student / Faculty ID Review</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1F2937]">
                  Evidence Link or Institutional Portal URL (Optional)
                </label>
                <input
                  type="url"
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  placeholder="https://university.edu/directory/profile"
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs bg-white text-[#1F2937]"
                />
              </div>

              <Button
                type="submit"
                size="sm"
                disabled={isSubmittingVerif}
                className="bg-[#4B3F72] hover:bg-[#3d335d] text-white text-xs"
              >
                {isSubmittingVerif ? 'Submitting...' : 'Submit Verification Request'}
              </Button>
            </form>
          )}

          {verificationReq?.status === 'pending' && (
            <p className="text-xs text-[#64748B] italic">
              Your academic verification request is currently under review by our campus moderation team.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Blocked Members */}
      <Card className="border-[#E2E8F0]">
        <CardHeader className="border-b border-[#F1F5F9] pb-4">
          <CardTitle className="text-base text-[#1F2937]">Blocked Members</CardTitle>
          <CardDescription>
            Blocked users cannot see your active listings, send you requests, or message you.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {blockedUsers.length > 0 ? (
            <div className="space-y-3">
              {blockedUsers.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div>
                    <span className="font-bold text-[#1F2937]">
                      {b.blocked_user?.display_name || 'Blocked Member'}
                    </span>
                    <span className="text-[#64748B] ml-1">
                      {b.blocked_user?.username ? `@${b.blocked_user.username}` : ''}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnblock(b.blocked_id)}
                    className="text-xs border-[#CBD5E1]"
                  >
                    Unblock
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#94A3B8] italic">You have not blocked any members.</p>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone: Account Deletion */}
      <Card className="border-red-200 bg-red-50/20">
        <CardHeader className="border-b border-red-100 pb-4">
          <CardTitle className="text-base text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span>Danger Zone</span>
          </CardTitle>
          <CardDescription className="text-red-600/80">
            Permanently delete your Pairly profile, active listings, and account data.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            className="text-xs text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete My Account</span>
          </Button>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Permanent Account Deletion"
        description="This action is irreversible. All your profile information, skills, listings, and connection history will be permanently deleted."
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-[#64748B]">
            Type <span className="font-mono font-bold text-red-700">DELETE</span> below to confirm:
          </p>
          <input
            type="text"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="DELETE"
            className="w-full px-3 py-2 rounded-xl border border-red-300 text-xs bg-white text-red-700 font-mono focus:outline-none focus:ring-2 focus:ring-red-400"
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F1F5F9]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== 'DELETE' || isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white text-xs"
            >
              {isDeleting ? 'Deleting Account...' : 'Permanently Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
