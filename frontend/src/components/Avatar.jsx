import { useEffect, useState } from 'react';
import { fetchPhotoUrl } from '../api';

/** Initials in a softly tinted circle, or the person's photo when they have one. */
export const initials = (name = '') =>
  name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '?';

const hue = (name = '') => {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) h = (h * 31 + name.charCodeAt(i)) % 360;
  return h;
};

// One download per photo version, shared by every avatar on screen.
const urlCache = new Map();
const inflight = new Map();
function loadPhoto(id, version) {
  const key = `${id}:${version}`;
  if (urlCache.has(key)) return Promise.resolve(urlCache.get(key));
  if (!inflight.has(key)) {
    inflight.set(key, fetchPhotoUrl(id, version)
      .then((u) => { urlCache.set(key, u); inflight.delete(key); return u; })
      .catch(() => { inflight.delete(key); return null; }));
  }
  return inflight.get(key);
}

export default function Avatar({ name, size = 36, employeeId, photo, photoV }) {
  const wants = Boolean(photo && employeeId);
  const [src, setSrc] = useState(() => (wants ? urlCache.get(`${employeeId}:${photoV}`) || null : null));

  useEffect(() => {
    if (!wants) { setSrc(null); return undefined; }
    let alive = true;
    loadPhoto(employeeId, photoV).then((u) => { if (alive) setSrc(u); });
    return () => { alive = false; };
  }, [wants, employeeId, photoV]);

  return (
    <span className="avatar" style={{ '--h': hue(name), width: size, height: size, fontSize: size * 0.38 }} aria-hidden="true">
      {src ? <img src={src} alt="" /> : initials(name)}
    </span>
  );
}
