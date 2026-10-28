import React, { useEffect, useState } from 'react';
import { ArrowLeft, KeyRound, Users } from 'lucide-react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { User } from '../../types/auth';
import { HackathonTeam } from '../../types/user';
import { teamService } from '../../services/team.service';
import { soundWarning } from '../../lib/sound';

interface JoinTeamFormProps {
  user: User;
  initialId: string;
  onBack: () => void;
  onJoined: (team: HackathonTeam) => void;
  onCreateOwn?: () => void;
}

export const JoinTeamForm: React.FC<JoinTeamFormProps> = ({ user, initialId, onBack, onJoined, onCreateOwn }) => {
  const [value, setValue] = useState(initialId);
  const [found, setFound] = useState<HackathonTeam | null>(null);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  const lookup = async (raw: string) => {
    if (!raw.trim()) {
      setError('Enter the Team ID or paste the joining link.');
      return;
    }
    setLoading(true);
    setError('');
    setFound(null);
    try {
      const team = await teamService.findTeam(raw);
      if (team) setFound(team);
      else {
        soundWarning();
        setError('No team found with that ID. Please check it with your team leader.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Opened from a joining link (?join=ID): look the team up straight away.
  useEffect(() => {
    if (initialId) void lookup(initialId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const join = async () => {
    if (!found) return;
    setJoining(true);
    setError('');
    try {
      onJoined(await teamService.joinTeam(found.code, user));
    } catch (err) {
      soundWarning();
      // The team may have filled up while this page was open: refresh it so the full-team prompt shows.
      const fresh = await teamService.findTeam(found.code);
      if (fresh) setFound(fresh);
      if (!fresh || fresh.members.length < fresh.maxMembers) {
        setError(err instanceof Error ? err.message : 'Could not join the team. Please try again.');
      }
    } finally {
      setJoining(false);
    }
  };

  const leader = found?.members.find((m) => m.role === 'Leader') ?? found?.members[0];
  const isFull = !!found && found.members.length >= found.maxMembers;

  return (
    <div className="max-w-lg mx-auto bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-8 space-y-5">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors cursor-pointer">
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Join a team</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Enter the Team ID your leader shared, or paste the joining link.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void lookup(value);
        }}
        className="space-y-4"
        noValidate
      >
        <Input
          label="Team ID or joining link"
          placeholder="C50-ABC123"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setFound(null);
            setError('');
          }}
          leftIcon={<KeyRound className="w-4 h-4" />}
          autoFocus={!initialId}
        />
        <Button type="submit" variant="outline" fullWidth isLoading={loading}>
          Find team
        </Button>
      </form>

      {error && (
        <div role="alert" className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {found && (
        <div className="rounded-xl border border-[var(--accent)]/40 bg-[var(--accent-muted)] p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-secondary)]">Team found</p>
              <h3 className="text-lg font-bold text-[var(--text-primary)] truncate">{found.name}</h3>
              <p className="text-xs text-[var(--text-secondary)]">Led by {leader?.name}</p>
            </div>
            <Badge variant={isFull ? 'warning' : 'primary'} size="sm">
              <Users className="w-3 h-3 inline mr-1" />
              {found.members.length}/{found.maxMembers}
            </Badge>
          </div>
          {isFull ? (
            <div className="space-y-3">
              <p className="text-sm text-[var(--text-secondary)]">
                {found.name} already has {found.maxMembers} members. You can start your own team instead.
              </p>
              {onCreateOwn && (
                <Button fullWidth onClick={onCreateOwn}>
                  Create your own team
                </Button>
              )}
            </div>
          ) : (
            <Button fullWidth onClick={join} isLoading={joining}>
              {`Join ${found.name}`}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
