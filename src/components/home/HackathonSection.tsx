import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, MapPin, Trophy, Users } from 'lucide-react';
import { Container } from '../common/Container';
import { SectionHeading } from '../common/SectionHeading';
import { Reveal } from '../common/Reveal';
import { EVENT_CONFIG } from '../../config/event';

const FACTS = [
  { icon: Calendar, label: 'Dates', value: EVENT_CONFIG.dates },
  { icon: Users, label: 'Team size', value: EVENT_CONFIG.teamSize },
  { icon: MapPin, label: 'Format', value: EVENT_CONFIG.venue },
  { icon: Trophy, label: 'Prize pool', value: EVENT_CONFIG.prizePool },
];

export const HackathonSection: React.FC = () => {
  return (
    <section id="hackathon-home" className="py-14 md:py-20 bg-[var(--bg-main)] border-b border-[var(--border-color)] transition-colors">
      <Container size="lg">
        <Reveal>
          <div className="text-center">
            <SectionHeading
              badge="THE HACKATHON"
              title="Build. Compete. Win."
              subtitle="Pick a track, form a team of 2 to 4, and turn a real-world problem into a working solution with mentors and judges beside you."
              className="mb-8"
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 text-left">
              {FACTS.map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-4 hover:border-[var(--accent)]/50 transition-colors">
                  <Icon className="w-5 h-5 text-[var(--accent)] mb-2" />
                  <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-secondary)]">{label}</p>
                  <p className="text-sm font-bold text-[var(--text-primary)] mt-0.5 leading-snug">{value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/hackathon"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-text)] text-sm font-bold rounded-xl transition-all shadow-xs group"
              >
                <span>View hackathon details</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--bg-surface)] hover:bg-[var(--accent-muted)] border border-[var(--border-color)] hover:border-[var(--accent)] text-sm font-bold text-[var(--text-primary)] rounded-xl transition-all shadow-xs"
              >
                Register your team
              </Link>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
};
