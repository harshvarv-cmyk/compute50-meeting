import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { ArrowRight, Check, Copy, Link2, MessageSquare, Share2 } from 'lucide-react';
import { HackathonTeam } from '../../types/user';
import { buildJoinLink, MIN_TEAM_SIZE } from '../../services/team.service';
import { copyText } from '../../lib/clipboard';
import { soundSuccess } from '../../lib/sound';

interface TeamSuccessProps {
  team: HackathonTeam;
  role: 'Leader' | 'Member';
}

const burst = () => {
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#DAA520';
  const base = { spread: 360, ticks: 90, gravity: 0.8, decay: 0.92, startVelocity: 28, colors: [accent, '#FFFFFF'] };
  confetti({ ...base, particleCount: 50, origin: { x: 0.3, y: 0.6 } });
  confetti({ ...base, particleCount: 50, origin: { x: 0.7, y: 0.6 } });
};

export const TeamSuccess: React.FC<TeamSuccessProps> = ({ team, role }) => {
  const [copied, setCopied] = useState<'id' | 'link' | null>(null);
  const leader = team.members.find((m) => m.role === 'Leader') ?? team.members[0];
  const joinLink = buildJoinLink(team.code);
  const shareText = `Join my team "${team.name}" for Compute 50! Team ID: ${team.code}. Join here: ${joinLink}`;

  useEffect(() => {
    burst();
    soundSuccess();
  }, []);

  const copy = async (kind: 'id' | 'link', text: string) => {
    if (await copyText(text)) {
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-8 space-y-6">
      <div className="text-center space-y-1">
        <div className="mx-auto w-12 h-12 rounded-full bg-[var(--accent-muted)] border border-[var(--accent)]/40 flex items-center justify-center text-[var(--accent)] mb-3">
          <Check className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          {role === 'Leader' ? 'Team created!' : `You joined ${team.name}!`}
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          {role === 'Leader' ? team.name : `Team leader: ${leader?.name}`} · {team.members.length}/{team.maxMembers} members
        </p>
      </div>

      {role === 'Leader' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3">
            <div className="min-w-0">
              <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-secondary)]">Team ID</p>
              <p className="text-2xl font-mono font-extrabold text-[var(--accent)] tracking-wider">{team.code}</p>
            </div>
            <button type="button" onClick={() => copy('id', team.code)} className="p-2 rounded-lg border border-[var(--border-color)] hover:border-[var(--accent)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors cursor-pointer" aria-label="Copy Team ID">
              {copied === 'id' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3">
            <Link2 className="w-4 h-4 text-[var(--accent)] shrink-0" />
            <p className="text-xs font-mono text-[var(--text-secondary)] truncate flex-1">{joinLink}</p>
            <button type="button" onClick={() => copy('link', joinLink)} className="text-xs font-semibold text-[var(--accent)] hover:underline cursor-pointer shrink-0">
              {copied === 'link' ? 'Copied' : 'Copy link'}
            </button>
          </div>

          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--border-color)] hover:border-[var(--accent)] text-sm font-semibold text-[var(--text-primary)] transition-colors"
          >
            <Share2 className="w-4 h-4 text-[var(--accent)]" /> Share the link on WhatsApp
          </a>
          <p className="text-xs text-[var(--text-secondary)] text-center">
            Teammates join with the Team ID or this link. Teams need {MIN_TEAM_SIZE} to {team.maxMembers} members.
          </p>
        </div>
      )}

      <div className="flex items-start gap-3 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent-muted)] px-4 py-3">
        <MessageSquare className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
        <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
          {role === 'Leader' ? (
            <>
              <span className="font-semibold text-[var(--text-primary)]">WhatsApp invite:</span> the organisers will send the hackathon group invite
              directly to you, the team leader{leader?.phone ? <> on <span className="font-semibold text-[var(--text-primary)]">{leader.phone}</span></> : null}. Keep that number reachable on WhatsApp.
            </>
          ) : (
            <>
              <span className="font-semibold text-[var(--text-primary)]">WhatsApp invite:</span> the organisers send the hackathon group invite directly to
              your team leader, {leader?.name}. They will share updates with you.
            </>
          )}
        </p>
      </div>

      <Link to="/profile" className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-text)] text-sm font-bold transition-all">
        Go to my profile <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
};
