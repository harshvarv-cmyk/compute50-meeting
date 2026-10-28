import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Copy, Link2, Lock, MessageSquare, UserPlus, Users } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { HackathonTeam } from '../../types/user';
import { User } from '../../types/auth';
import { buildJoinLink, formatDeadline, isRegistrationOpen, MIN_TEAM_SIZE, teamService } from '../../services/team.service';
import { useToast } from '../../hooks/useToast';
import { copyText } from '../../lib/clipboard';
import { soundSwoosh, soundTap, soundWarning } from '../../lib/sound';

interface TeamSectionProps {
  team?: HackathonTeam;
  user: User;
  /** Called after a leave / remove so the profile reloads. */
  onChanged: () => void | Promise<void>;
}

type Confirm = { type: 'leave' } | { type: 'remove'; email: string } | null;

const linkBase =
  'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer';

const quietBtn = 'text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50';

export const TeamSection: React.FC<TeamSectionProps> = ({ team, user, onChanged }) => {
  const { addToast } = useToast();
  const [copied, setCopied] = useState<'id' | 'link' | null>(null);
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [busy, setBusy] = useState(false);

  const ask = (next: Confirm) => {
    soundTap();
    setConfirm(next);
  };

  const run = async (action: () => Promise<unknown>, success: string) => {
    setBusy(true);
    try {
      await action();
      soundSwoosh();
      addToast(success, 'success');
      await onChanged();
    } catch (err) {
      soundWarning();
      addToast(err instanceof Error ? err.message : 'Something went wrong. Please try again.', 'error');
    } finally {
      setConfirm(null);
      setBusy(false);
    }
  };

  const copy = async (kind: 'id' | 'link', text: string) => {
    if (await copyText(text)) {
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  if (!team) {
    return (
      <Card className="text-center space-y-4 py-10">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-[var(--accent-muted)] border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)]">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">You are not in a team yet</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-md mx-auto">
            Create a team to get a Team ID, or join your teammates with the ID or joining link they shared.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/register?mode=create" className={`${linkBase} bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-text)]`}>
            <UserPlus className="w-4 h-4" /> Create Team
          </Link>
          <Link to="/register?mode=join" className={`${linkBase} border border-[var(--border-color)] hover:border-[var(--accent)] text-[var(--text-primary)]`}>
            <Link2 className="w-4 h-4" /> Join Team
          </Link>
        </div>
      </Card>
    );
  }

  const leader = team.members.find((m) => m.role === 'Leader') ?? team.members[0];
  const needsMore = team.members.length < MIN_TEAM_SIZE;
  const isOpen = isRegistrationOpen();
  const isLeader = team.members.some((m) => m.role === 'Leader' && m.email.toLowerCase() === user.email.toLowerCase());
  const canLeave = isOpen && !isLeader;

  return (
    <Card className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <span className="text-[13px] text-[var(--text-secondary)] uppercase font-semibold">Your Team</span>
          <h3 className="text-xl font-bold text-[var(--text-primary)]">{team.name}</h3>
          <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">
            {team.members.length} of {team.maxMembers} members
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-[var(--bg-secondary)] px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-[13px] font-mono">
            <span className="text-[var(--text-secondary)]">Team ID:</span>
            <span className="text-[var(--accent)] font-bold">{team.code}</span>
            <button
              type="button"
              onClick={() => copy('id', team.code)}
              className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              aria-label="Copy Team ID"
            >
              {copied === 'id' ? <Check className="w-3.5 h-3.5 text-[var(--accent)]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <button
            type="button"
            onClick={() => copy('link', buildJoinLink(team.code))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] hover:border-[var(--accent)] text-[13px] font-semibold text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            {copied === 'link' ? <Check className="w-3.5 h-3.5 text-[var(--accent)]" /> : <Link2 className="w-3.5 h-3.5" />}
            {copied === 'link' ? 'Link copied' : 'Copy joining link'}
          </button>
        </div>
      </div>

      <ul className="space-y-2">
        <AnimatePresence initial={false}>
          {team.members.map((m) => {
            const removing = confirm?.type === 'remove' && confirm.email === m.email;
            const canRemove = isOpen && isLeader && m.role !== 'Leader';
            return (
              <motion.li
                key={m.email}
                layout
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{m.name}</p>
                  <p className="text-xs text-[var(--text-secondary)] truncate">{m.email}</p>
                </div>
                {removing ? (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[var(--text-secondary)]">Remove {m.name.split(' ')[0]}?</span>
                    <button type="button" disabled={busy} onClick={() => setConfirm(null)} className={`${quietBtn} text-[var(--text-secondary)] hover:text-[var(--text-primary)]`}>
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => run(() => teamService.removeMember(user, m.email), `${m.name} was removed from the team.`)}
                      className={`${quietBtn} text-red-600 dark:text-red-400 hover:underline`}
                    >
                      {busy ? 'Removing...' : 'Remove'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    {canRemove && (
                      <button type="button" onClick={() => ask({ type: 'remove', email: m.email })} className={`${quietBtn} text-[var(--text-secondary)] hover:text-red-600 dark:hover:text-red-400`}>
                        Remove
                      </button>
                    )}
                    <Badge variant={m.role === 'Leader' ? 'primary' : 'secondary'} size="sm">{m.role}</Badge>
                  </div>
                )}
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>

      {needsMore && (
        <p className="text-[13px] text-[var(--text-secondary)]">
          Teams need at least {MIN_TEAM_SIZE} members. Share your Team ID or joining link so your teammates can join.
        </p>
      )}

      {!isOpen && (
        <p className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)]">
          <Lock className="w-3.5 h-3.5 shrink-0" /> Registration closed on {formatDeadline()}. Your team is locked.
        </p>
      )}

      {canLeave && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-[13px] text-[var(--text-secondary)]">
          {confirm?.type === 'leave' ? (
            <>
              <span>Leave {team.name}? You can join another team afterwards.</span>
              <div className="flex items-center gap-3">
                <button type="button" disabled={busy} onClick={() => setConfirm(null)} className={`${quietBtn} hover:text-[var(--text-primary)]`}>
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => run(() => teamService.leaveTeam(user), `You left ${team.name}.`)}
                  className={`${quietBtn} text-red-600 dark:text-red-400 hover:underline`}
                >
                  {busy ? 'Leaving...' : 'Leave team'}
                </button>
              </div>
            </>
          ) : (
            <>
              <span>Changes are open until {formatDeadline()}.</span>
              <button type="button" onClick={() => ask({ type: 'leave' })} className={`${quietBtn} hover:text-red-600 dark:hover:text-red-400`}>
                Leave team
              </button>
            </>
          )}
        </div>
      )}

      <div className="flex items-start gap-3 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent-muted)] px-4 py-3">
        <MessageSquare className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
        <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
          The hackathon WhatsApp group invite goes straight to the team leader
          {leader?.phone ? <> on <span className="font-semibold text-[var(--text-primary)]">{leader.phone}</span></> : null}, sent by the organisers directly.
        </p>
      </div>
    </Card>
  );
};
