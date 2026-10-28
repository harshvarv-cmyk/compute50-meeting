import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, KeyRound, Lock, UserPlus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { teamService, isRegistrationOpen, formatDeadline } from '../../services/team.service';
import EVENT_CONFIG from '../../config/event';
import { HackathonTeam } from '../../types/user';
import { SectionHeading } from '../common/SectionHeading';
import { CreateTeamForm } from '../registration/CreateTeamForm';
import { JoinTeamForm } from '../registration/JoinTeamForm';
import { TeamSuccess } from '../registration/TeamSuccess';
import { soundTap } from '../../lib/sound';

type Mode = 'choose' | 'create' | 'join' | 'done';

const choiceClass =
  'text-left w-full bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-[var(--accent)] rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer group';

export const RegisterForm: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const [params] = useSearchParams();

  const joinParam = params.get('join') ?? '';
  const modeParam = params.get('mode');
  const [mode, setMode] = useState<Mode>(joinParam || modeParam === 'join' ? 'join' : modeParam === 'create' ? 'create' : 'choose');
  const [existing, setExisting] = useState<HackathonTeam | null | undefined>(undefined);
  const [result, setResult] = useState<{ team: HackathonTeam; role: 'Leader' | 'Member' } | null>(null);

  useEffect(() => {
    if (!user) return;
    teamService.getTeamForUser(user.email).then((team) => setExisting(team ?? null));
  }, [user]);

  if (!user || existing === undefined) {
    return <p className="text-center text-sm text-[var(--text-secondary)]">Loading your registration...</p>;
  }

  const go = (next: Mode) => {
    soundTap();
    setMode(next);
  };

  const handleCreated = (team: HackathonTeam, whatsappNumber: string) => {
    if (user.phone !== whatsappNumber) {
      const updated = { ...user, phone: whatsappNumber };
      updateUser(updated);
      try {
        localStorage.setItem('compute50_user', JSON.stringify(updated));
      } catch {
        /* storage unavailable: ignore */
      }
    }
    addToast(`Team "${team.name}" created.`, 'success');
    setResult({ team, role: 'Leader' });
    setMode('done');
  };

  const handleJoined = (team: HackathonTeam) => {
    addToast(`You joined "${team.name}".`, 'success');
    setResult({ team, role: 'Member' });
    setMode('done');
  };

  if (mode === 'done' && result) {
    return <TeamSuccess team={result.team} role={result.role} />;
  }

  if (existing) {
    return (
      <div className="max-w-lg mx-auto bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">You are already registered</h2>
        <p className="text-sm text-[var(--text-secondary)]">
          You are part of <span className="font-semibold text-[var(--text-primary)]">{existing.name}</span> (Team ID{' '}
          <span className="font-mono text-[var(--accent)] font-bold">{existing.code}</span>).
        </p>
        <Link to="/profile" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-text)] text-sm font-bold transition-all">
          View my team <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (!isRegistrationOpen()) {
    return (
      <div className="max-w-lg mx-auto bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-8 text-center space-y-3">
        <div className="mx-auto w-12 h-12 rounded-full bg-[var(--accent-muted)] border border-[var(--accent)]/40 flex items-center justify-center text-[var(--accent)]">
          <Lock className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Registration is closed</h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Team sign-ups closed on {formatDeadline()}. Questions? Write to{' '}
          <a href={`mailto:${EVENT_CONFIG.contactEmail}`} className="text-[var(--accent)] hover:underline">{EVENT_CONFIG.contactEmail}</a>.
        </p>
      </div>
    );
  }

  if (mode === 'create') {
    return <CreateTeamForm user={user} onBack={() => go('choose')} onCreated={handleCreated} />;
  }

  if (mode === 'join') {
    return <JoinTeamForm user={user} initialId={joinParam} onBack={() => go('choose')} onJoined={handleJoined} onCreateOwn={() => go('create')} />;
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      <SectionHeading
        badge="REGISTRATION"
        title="Register for Compute 50"
        subtitle="Start a team as its leader, or join a team that already exists."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button type="button" onClick={() => go('create')} className={choiceClass}>
          <div className="w-11 h-11 rounded-xl bg-[var(--accent-muted)] border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] mb-4">
            <UserPlus className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">Create Team</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            You become the team leader. We generate a unique Team ID and a joining link to share with your teammates.
          </p>
        </button>
        <button type="button" onClick={() => go('join')} className={choiceClass}>
          <div className="w-11 h-11 rounded-xl bg-[var(--accent-muted)] border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] mb-4">
            <KeyRound className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">Join Team</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Already have a Team ID or a joining link from your team leader? Enter it to join their team.
          </p>
        </button>
      </div>
      <p className="text-xs text-[var(--text-secondary)] text-center">
        The hackathon WhatsApp group invite is sent by the organisers directly to each team leader.
      </p>
    </div>
  );
};
