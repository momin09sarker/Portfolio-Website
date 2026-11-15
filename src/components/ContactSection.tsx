import { useRef, useState, type FormEvent } from 'react';
import { ArrowUpRight, CheckCircle2, AlertCircle, Mail, MapPin, Phone, Send } from 'lucide-react';
import { submitContactMessage } from '../lib/api';
import type { ContactContent } from '../types/portfolio';

interface ContactSectionProps {
  contact: ContactContent;
}

export function ContactSection({ contact }: ContactSectionProps) {
  const formRenderedAtRef = useRef<number>(Date.now());
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // Honeypot field

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (name.trim().length < 2) {
      setErrorMsg('Please enter your name (at least 2 characters).');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (subject.trim().length < 3) {
      setErrorMsg('Please enter a subject (at least 3 characters).');
      return;
    }
    if (message.trim().length < 10) {
      setErrorMsg('Please write a message of at least 10 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await submitContactMessage({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
        website,
        formRenderedAt: formRenderedAtRef.current,
      });
      setSuccessMsg('Thank you for reaching out. Your message has been received and I will reply shortly.');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      formRenderedAtRef.current = Date.now();
    } catch (err) {
      const raw = err instanceof Error ? err.message : '';
      if (raw.includes('404') || raw.includes('Failed to initialize')) {
        setErrorMsg(
          `Direct form delivery requires the backend server. Please email ${contact.email} directly or connect via Fiverr.`
        );
      } else {
        setErrorMsg(
          raw || 'Unable to send message right now. Please try again.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="border-t border-[#F4F2ED]/10 bg-[#161618] py-24 text-[#F4F2ED]"
    >
      <div className="mx-auto max-w-[1200px] px-6">
        <div data-reveal className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="space-y-8 lg:col-span-5">
            <div className="space-y-4">
              <p className="text-sm font-medium text-[#E85D26]">Get in Touch</p>
              <h2 className="font-display text-3xl font-bold tracking-tight text-[#F4F2ED] sm:text-4xl text-balance">
                Let us automate workflows or launch your next campaign.
              </h2>
              <p className="text-base leading-relaxed text-[#F4F2ED]/75">
                {contact.availability}
              </p>
            </div>

            <div className="space-y-4 border-t border-[#F4F2ED]/10 pt-6 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 stroke-[1.5] text-[#E85D26]" />
                <div>
                  <div className="text-xs text-[#F4F2ED]/50">Email</div>
                  <a
                    href={`mailto:${contact.email}`}
                    className="font-medium text-[#F4F2ED] transition-colors hover:text-[#E85D26]"
                  >
                    {contact.email}
                  </a>
                </div>
              </div>

              {contact.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 stroke-[1.5] text-[#E85D26]" />
                  <div>
                    <div className="text-xs text-[#F4F2ED]/50">Phone</div>
                    <span className="font-medium text-[#F4F2ED]">{contact.phone}</span>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 stroke-[1.5] text-[#E85D26]" />
                <div>
                  <div className="text-xs text-[#F4F2ED]/50">Location</div>
                  <span className="font-medium text-[#F4F2ED]">{contact.location}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 border-t border-[#F4F2ED]/10 pt-6">
              <div className="text-xs font-medium text-[#F4F2ED]/50">Profiles &amp; Channels</div>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {contact.fiverrUrl && (
                  <a
                    href={contact.fiverrUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#E85D26] transition-colors hover:text-[#F26E38]"
                  >
                    <span>{contact.fiverrLabel || 'Fiverr'}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 stroke-[1.75]" />
                  </a>
                )}

                {contact.socialLinks
                  .filter((s) => s.url && s.url !== contact.fiverrUrl)
                  .map((social) => (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-[#F4F2ED]/80 transition-colors hover:text-[#F4F2ED]"
                    >
                      <span>{social.label}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 stroke-[1.5]" />
                    </a>
                  ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-5 border border-[#F4F2ED]/10 bg-[#121212] p-6 sm:p-8"
            >
              {/* Offscreen Honeypot Field */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0"
              >
                <label htmlFor="contact-website">Website</label>
                <input
                  id="contact-website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-medium text-[#F4F2ED]/75"
                  >
                    Your Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    maxLength={120}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Rahman"
                    className="mt-2 w-full border border-[#F4F2ED]/15 bg-[#18181B] px-3.5 py-2.5 text-sm text-[#F4F2ED] placeholder:text-[#F4F2ED]/35 focus:border-[#E85D26] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-medium text-[#F4F2ED]/75"
                  >
                    Email Address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    maxLength={160}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="mt-2 w-full border border-[#F4F2ED]/15 bg-[#18181B] px-3.5 py-2.5 text-sm text-[#F4F2ED] placeholder:text-[#F4F2ED]/35 focus:border-[#E85D26] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  className="block text-xs font-medium text-[#F4F2ED]/75"
                >
                  Subject
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  required
                  maxLength={180}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="n8n workflow automation or Meta Ads inquiry"
                  className="mt-2 w-full border border-[#F4F2ED]/15 bg-[#18181B] px-3.5 py-2.5 text-sm text-[#F4F2ED] placeholder:text-[#F4F2ED]/35 focus:border-[#E85D26] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-xs font-medium text-[#F4F2ED]/75"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  maxLength={4000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share your goals, timeline, and current tools..."
                  className="mt-2 w-full resize-y border border-[#F4F2ED]/15 bg-[#18181B] px-3.5 py-2.5 text-sm text-[#F4F2ED] placeholder:text-[#F4F2ED]/35 focus:border-[#E85D26] focus:outline-none"
                />
              </div>

              {errorMsg && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-200"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 stroke-[1.5] text-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div
                  role="status"
                  className="flex items-start gap-2.5 border border-emerald-500/40 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-200"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 stroke-[1.5] text-emerald-400" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-between gap-4 pt-1">
                <span className="text-xs text-[#F4F2ED]/50">
                  Direct delivery · Replies within 24 hours
                </span>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 bg-[#E85D26] px-6 py-3 text-sm font-semibold text-[#121212] transition-colors duration-150 hover:bg-[#F26E38] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Send className="h-4 w-4 stroke-[1.75]" />
                  <span>{submitting ? 'Sending...' : 'Send Message'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
