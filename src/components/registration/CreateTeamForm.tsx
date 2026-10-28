import React, { useState } from 'react';
import { ArrowLeft, Phone, Users } from 'lucide-react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { User } from '../../types/auth';
import { HackathonTeam } from '../../types/user';
import { teamService, MAX_TEAM_SIZE, MIN_TEAM_SIZE } from '../../services/team.service';
import { soundWarning } from '../../lib/sound';

interface CreateTeamFormProps {
  user: User;
  onBack: () => void;
  onCreated: (team: HackathonTeam, whatsappNumber: string) => void;
}

const normalisePhone = (v: string) => v.replace(/[\s-]/g, '');
const isValidMobile = (v: string) => /^(?:\+?91)?[6-9]\d{9}$/.test(normalisePhone(v));

export const CreateTeamForm: React.FC<CreateTeamFormProps> = ({ user, onBack, onCreated }) => {
  const [teamName, setTeamName] = useState('');
  const [phone, setPhone] = useState(user.phone ?? '');
  const [errors, setErrors] = useState<{ teamName?: string; phone?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    const name = teamName.trim();
    if (name.length < 3 || name.length > 30) next.teamName = 'Team name must be 3 to 30 characters.';
    if (!isValidMobile(phone)) next.phone = 'Enter a valid 10-digit mobile number.';
    setErrors(next);
    if (Object.keys(next).length) {
      soundWarning();
      return;
    }
    setLoading(true);
    try {
      const team = await teamService.createTeam(user, name, phone.trim());
      onCreated(team, phone.trim());
    } catch (err) {
      soundWarning();
      setErrors({ form: err instanceof Error ? err.message : 'Could not create the team. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-lg mx-auto bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-8 space-y-5" noValidate>
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors cursor-pointer">
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Create your team</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          You will be the team leader. We generate a unique Team ID that your teammates use to join ({MIN_TEAM_SIZE} to {MAX_TEAM_SIZE} members).
        </p>
      </div>

      {errors.form && (
        <div role="alert" className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs font-medium text-red-600 dark:text-red-400">
          {errors.form}
        </div>
      )}

      <Input
        label="Team name"
        placeholder="e.g. Byte Builders"
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
        error={errors.teamName}
        leftIcon={<Users className="w-4 h-4" />}
        maxLength={30}
        autoFocus
      />
      <Input
        label="Your WhatsApp number"
        type="tel"
        placeholder="98765 43210"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        error={errors.phone}
        helperText="The organisers send the hackathon WhatsApp group invite to the team leader on this number."
        leftIcon={<Phone className="w-4 h-4" />}
      />

      <Button type="submit" fullWidth isLoading={loading}>
        Create team and get Team ID
      </Button>
    </form>
  );
};
