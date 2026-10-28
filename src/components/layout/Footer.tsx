import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, ExternalLink, Globe, Mail, MapPin, MessageSquare, Phone, Trophy, Users } from 'lucide-react';
import { Container } from '../common/Container';
import { EVENT_CONFIG, SUPPORT_CONTACTS } from '../../config/event';
import compute50Logo from '../../assets/logos/compute 50 logo.png';

// Accessible Instagram SVG Icon
const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const socialClass =
  'w-9 h-9 rounded-full border border-[var(--border-color)] bg-[var(--bg-surface)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all hover:-translate-y-0.5';

const linkClass = 'text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors inline-block';

const QUICK_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: `About ${EVENT_CONFIG.collegeShort} & ${EVENT_CONFIG.organizerShort}` },
  { to: '/hackathon', label: 'Hackathon' },
  { to: '/profile', label: 'My Profile' },
];

export const Footer: React.FC = () => {
  return (
    <footer id="contact" className="bg-[var(--bg-main)] border-t border-[var(--border-color)] pt-14 pb-8 text-[var(--text-secondary)] text-sm transition-colors relative z-10">
      <Container size="lg">
        {/* Call-to-action band */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 sm:p-8 mb-12">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">Ready to build something that matters?</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {EVENT_CONFIG.dates} · {EVENT_CONFIG.prizePool} in prizes
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/register" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-text)] text-sm font-bold transition-all group">
              Register your team <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/hackathon" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--border-color)] hover:border-[var(--accent)] text-sm font-bold text-[var(--text-primary)] transition-all">
              Hackathon details
            </Link>
          </div>
        </div>

        {/* Main columns */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-x-6 gap-y-10 pb-10 border-b border-[var(--border-color)]">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 space-y-4">
            <Link to="/" className="flex items-center gap-3 group w-fit">
              <div className="w-10 h-10 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                <img src={compute50Logo} alt="Compute 50 logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-mono font-extrabold text-lg text-[var(--text-primary)] tracking-tight">
                COMPUTE <span className="text-[var(--accent)]">50</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed max-w-xs">
              A 2-day technical innovation challenge celebrating 50 years of the M.E. CSE programme at {EVENT_CONFIG.college}. Hosted by {EVENT_CONFIG.organizerFull}.
            </p>
            <div className="flex items-center gap-2.5">
              {EVENT_CONFIG.instagramUrl && (
                <a href={EVENT_CONFIG.instagramUrl} target="_blank" rel="noopener noreferrer" className={socialClass} aria-label="Instagram">
                  <InstagramIcon className="w-4 h-4" />
                </a>
              )}
              <a href={EVENT_CONFIG.whatsappLink} target="_blank" rel="noopener noreferrer" className={socialClass} aria-label="WhatsApp channel">
                <MessageSquare className="w-4 h-4" />
              </a>
              <a href={EVENT_CONFIG.organizerWebsite} target="_blank" rel="noopener noreferrer" className={socialClass} aria-label="CSEA website">
                <Globe className="w-4 h-4" />
              </a>
              <a href={`mailto:${EVENT_CONFIG.contactEmail}`} className={socialClass} aria-label="Email">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="md:col-span-2 space-y-3.5">
            <h4 className="text-[var(--text-primary)] font-mono font-bold text-xs uppercase tracking-wider">Quick links</h4>
            <ul className="space-y-2.5 text-xs">
              {QUICK_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className={linkClass}>{l.label}</Link>
                </li>
              ))}
              <li>
                <Link to="/register" className="text-[var(--accent)] hover:underline font-bold inline-block">Register Team</Link>
              </li>
            </ul>
          </div>

          {/* Event details */}
          <div className="md:col-span-3 space-y-3.5">
            <h4 className="text-[var(--text-primary)] font-mono font-bold text-xs uppercase tracking-wider">Event details</h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2"><Calendar className="w-3.5 h-3.5 text-[var(--accent)] shrink-0 mt-0.5" /><span>{EVENT_CONFIG.dates}</span></li>
              <li className="flex items-start gap-2"><Users className="w-3.5 h-3.5 text-[var(--accent)] shrink-0 mt-0.5" /><span>Teams of {EVENT_CONFIG.teamSize}</span></li>
              <li className="flex items-start gap-2"><Trophy className="w-3.5 h-3.5 text-[var(--accent)] shrink-0 mt-0.5" /><span>{EVENT_CONFIG.prizePool} prize pool</span></li>
              <li>
                <a href={EVENT_CONFIG.venueMapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 hover:text-[var(--accent)] transition-colors" aria-label="View the venue on Google Maps">
                  <MapPin className="w-3.5 h-3.5 text-[var(--accent)] shrink-0 mt-0.5" />
                  <span className="leading-snug">{EVENT_CONFIG.venueFull}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-3 space-y-3.5">
            <h4 className="text-[var(--text-primary)] font-mono font-bold text-xs uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3.5 text-xs">
              {SUPPORT_CONTACTS.filter((c) => c.phone).slice(0, 3).map((c) => (
                <li key={c.id}>
                  <p className="font-semibold text-[var(--text-primary)]">{c.category}</p>
                  <p className="text-[11px] mt-0.5">{c.contactName}</p>
                  <a href={`tel:${(c.phone ?? '').replace(/\s+/g, '')}`} className="inline-flex items-center gap-1.5 mt-1 hover:text-[var(--accent)] transition-colors" aria-label={`Call ${c.contactName}`}>
                    <Phone className="w-3 h-3 text-[var(--accent)]" />
                    <span>{c.phone}</span>
                  </a>
                </li>
              ))}
              <li>
                <a href={`mailto:${EVENT_CONFIG.contactEmail}`} className="inline-flex items-center gap-1.5 hover:text-[var(--accent)] transition-colors break-all">
                  <Mail className="w-3 h-3 text-[var(--accent)] shrink-0" />
                  <span>{EVENT_CONFIG.contactEmail}</span>
                </a>
              </li>
              <li>
                <a href={EVENT_CONFIG.collegeWebsite} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-[var(--accent)] transition-colors">
                  <span>PSG Tech main portal</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs font-mono gap-3 text-center sm:text-left">
          <p>{EVENT_CONFIG.footerCopyright}</p>
          <p className="text-[11px]">
            ORGANIZED BY <span className="text-[var(--text-primary)] font-bold">CSEA</span>,{' '}
            <span className="text-[var(--text-primary)] font-bold">PSG TECH</span>
          </p>
        </div>
      </Container>
    </footer>
  );
};
