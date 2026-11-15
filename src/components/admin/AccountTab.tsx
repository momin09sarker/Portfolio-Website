import { useState, type FormEvent } from 'react';
import { AlertCircle, CheckCircle2, KeyRound, LogOut } from 'lucide-react';
import { adminChangePassword } from '../../lib/api';

interface AccountTabProps {
  username: string;
  onLogout: () => void;
}

export function AccountTab({ username, onLogout }: AccountTabProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (newPassword.length < 8) {
      setStatus({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setSaving(true);
    try {
      await adminChangePassword({ currentPassword, newPassword });
      setStatus({ type: 'success', text: 'Password updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setStatus({
        type: 'error',
        text: err instanceof Error ? err.message : 'Unable to update password.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F4F2ED]/10 pb-5">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#F4F2ED]">Security &amp; Account</h2>
          <p className="mt-1 text-sm text-[#F4F2ED]/60">
            Signed in as <span className="font-medium text-[#F4F2ED]">{username}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-2 border border-[#F4F2ED]/20 px-4 py-2 text-xs font-semibold text-[#F4F2ED] hover:border-[#E85D26] cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 border border-[#F4F2ED]/10 bg-[#161618] p-6"
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-[#F4F2ED]">
          <KeyRound className="h-4 w-4 text-[#E85D26]" />
          <span>Change Admin Password</span>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#F4F2ED]/70">
            Current Password
          </label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1.5 w-full border border-[#F4F2ED]/15 bg-[#121212] px-3.5 py-2 text-sm text-[#F4F2ED]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#F4F2ED]/70">
            New Password (minimum 8 characters)
          </label>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1.5 w-full border border-[#F4F2ED]/15 bg-[#121212] px-3.5 py-2 text-sm text-[#F4F2ED]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#F4F2ED]/70">
            Confirm New Password
          </label>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1.5 w-full border border-[#F4F2ED]/15 bg-[#121212] px-3.5 py-2 text-sm text-[#F4F2ED]"
          />
        </div>

        {status && (
          <div
            role={status.type === 'error' ? 'alert' : 'status'}
            className={`flex items-start gap-2.5 border px-4 py-3 text-sm ${
              status.type === 'success'
                ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200'
                : 'border-red-500/40 bg-red-950/30 text-red-200'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
            )}
            <span>{status.text}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="bg-[#E85D26] px-5 py-2.5 text-sm font-semibold text-[#121212] hover:bg-[#F26E38] disabled:opacity-60 cursor-pointer"
        >
          {saving ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
