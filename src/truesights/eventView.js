import { eventRegistrationUrl } from '../utils/eventLinks';

const FALLBACK_IMAGES = ['/assets/event-1.jpg', '/assets/event-2.jpg', '/assets/event-3.jpg'];

const hash = (s) => [...String(s || '')].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

export const modeLabel = (e) => (e.eventType === 'online' ? 'Online / Live' : e.eventType === 'hybrid' ? 'Hybrid' : 'In-person');

export const speakerNames = (speakers = []) =>
  speakers
    .map((s) => (typeof s === 'string' ? s : s && (s.name || s.fullName)))
    .filter(Boolean);

const dateLabel = (iso) => {
  if (!iso) return 'Date TBA';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Date TBA';
  const day = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return `${day} · ${time}`;
};

/**
 * A /api/v2/events event in the shape the TrueSights event cards render.
 * Registration happens on the organiser's site (registerUrl), not in-app.
 */
export const toEventView = (e) => ({
  id: e.id,
  title: e.title,
  category: e.category || e.subtitle || 'Event',
  date: dateLabel(e.dateTimeStart),
  location: modeLabel(e),
  venue: e.location || (e.eventType === 'online' ? 'Online' : 'Venue TBA'),
  image: e.imageUrl || FALLBACK_IMAGES[hash(e.id) % FALLBACK_IMAGES.length],
  speakers: speakerNames(e.speakers).join(', '),
  desc: e.description || '',
  registerUrl: eventRegistrationUrl(e),
  start: e.dateTimeStart,
  end: e.dateTimeEnd,
  raw: e
});

/** An .ics file for one event, downloaded in the browser. */
export const downloadCalendar = (ev) => {
  const stamp = (iso) => (iso ? new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '') : '');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TrueSights//Events//EN',
    'BEGIN:VEVENT',
    `UID:${ev.id}@truesight.community`,
    ev.start ? `DTSTART:${stamp(ev.start)}` : null,
    ev.end ? `DTEND:${stamp(ev.end)}` : null,
    `SUMMARY:${ev.title}`,
    `DESCRIPTION:${(ev.desc || '').replace(/\n/g, '\\n').slice(0, 1000)}`,
    `LOCATION:${ev.venue}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean);
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${ev.title.replace(/[^\w]+/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
