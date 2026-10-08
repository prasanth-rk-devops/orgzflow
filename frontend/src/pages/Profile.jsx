import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, uploadFile } from '../api';
import { squareJpeg } from '../lib/image';
import { useToast } from '../toast';
import { useAuth } from '../auth';
import Avatar from '../components/Avatar';
import Icon from '../components/Icon';
import { Badge, ErrorNote } from '../components/ui';

function tenure(hireDate) {
  const start = new Date(`${hireDate}T00:00:00Z`); const now = new Date();
  let months = (now.getUTCFullYear() - start.getUTCFullYear()) * 12 + (now.getUTCMonth() - start.getUTCMonth());
  if (now.getUTCDate() < start.getUTCDate()) months -= 1;
  if (months < 1) return 'Joined this month';
  const y = Math.floor(months / 12); const m = months % 12;
  return [y ? `${y} ${y === 1 ? 'year' : 'years'}` : '', m ? `${m} ${m === 1 ? 'month' : 'months'}` : ''].filter(Boolean).join(' and ');
}

export default function Profile() {
  const { id } = useParams();
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [tick, setTick] = useState(0);
  const [everyone, setEveryone] = useState([]);
  const [p, setP] = useState(null);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    Promise.all([api(`/employees/${id}`), api('/employees/org-chart')])
      .then(([emp, chart]) => { setP(emp); setEveryone(chart); setReports(chart.filter((c) => c.managerId === emp.id)); })
      .catch((e) => setError(e.message));
  }, [id, tick]);

  if (error) return <><Link to="/employees" className="back">Back to people</Link><ErrorNote error={error} /></>;
  if (!p) return <p className="muted">Loading…</p>;
  const name = `${p.firstName} ${p.lastName}`;
  const canEdit = user.role === 'admin' || user.employeeId === p.id;
  const manager = everyone.find((x) => x.id === p.managerId);

  const choosePhoto = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) { toast.error('Choose a picture smaller than 15 MB'); return; }
    setBusy(true);
    try {
      const jpeg = await squareJpeg(file, 320);
      await uploadFile(`/employees/${p.id}/photo`, new File([jpeg], 'photo.jpg', { type: 'image/jpeg' }));
      toast.success('Photo updated');
      setTick((t) => t + 1);
      if (p.id === user.employeeId) refreshUser();
    } catch (err) { toast.error(err.message || 'Could not update the photo'); } finally { setBusy(false); }
  };
  const removePhoto = async () => {
    if (!window.confirm('Remove this photo?')) return;
    setBusy(true);
    try {
      await api(`/employees/${p.id}/photo`, { method: 'DELETE' });
      toast.success('Photo removed');
      setTick((t) => t + 1);
      if (p.id === user.employeeId) refreshUser();
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  return (
    <>
      <Link to="/employees" className="back">Back to people</Link>
      <header className="profile-head">
        <div className="photo-block">
          <Avatar name={name} size={104} employeeId={p.id} photo={p.hasPhoto} photoV={p.photoV} />
          {canEdit && (
            <div className="photo-actions">
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={choosePhoto} aria-label="Choose a photo" />
              <button className="link" onClick={() => fileRef.current.click()} disabled={busy}>{busy ? 'Working…' : p.hasPhoto ? 'Change photo' : 'Add photo'}</button>
              {p.hasPhoto && !busy && <button className="link danger" onClick={removePhoto}>Remove</button>}
            </div>
          )}
        </div>
        <div>
          <h1>{name}</h1>
          <p className="profile-title">{p.jobTitle}{p.departmentName ? `, ${p.departmentName}` : ''}</p>
          <Badge status={p.status} />
        </div>
      </header>

      <div className="grid2">
        <section className="panel">
          <div className="panel-head"><h2>Details</h2></div>
          <dl className="facts">
            <dt><Icon name="mail" size={16} /> Email</dt><dd><a href={`mailto:${p.email}`}>{p.email}</a></dd>
            <dt><Icon name="phone" size={16} /> Phone</dt><dd>{p.phone || 'Not provided'}</dd>
            <dt><Icon name="building" size={16} /> Department</dt><dd>{p.departmentName || 'Not assigned'}</dd>
            <dt><Icon name="calendar" size={16} /> Joined</dt>
            <dd>{new Date(`${p.hireDate}T00:00:00Z`).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}
              <small className="muted"> {tenure(p.hireDate)}</small></dd>
            {user.role === 'admin' && (<><dt><Icon name="user" size={16} /> Salary</dt><dd>{p.salary != null ? p.salary.toLocaleString() : 'Not set'}</dd></>)}
          </dl>
        </section>

        <section className="panel">
          <div className="panel-head"><h2>Reporting line</h2></div>
          <h3 className="sub first">Reports to</h3>
          {p.managerId
            ? <ul className="people-list"><li><Avatar name={p.managerName} size={34} employeeId={manager?.id} photo={manager?.hasPhoto} photoV={manager?.photoV} /><div><Link to={`/employees/${p.managerId}`}><b>{p.managerName}</b></Link></div></li></ul>
            : <p className="muted">No manager. This person is at the top of the org chart.</p>}
          <h3 className="sub">Direct reports</h3>
          {reports.length === 0 ? <p className="muted">No direct reports.</p> : (
            <ul className="people-list">{reports.map((r) => (
              <li key={r.id}><Avatar name={`${r.firstName} ${r.lastName}`} size={34} employeeId={r.id} photo={r.hasPhoto} photoV={r.photoV} />
                <div><Link to={`/employees/${r.id}`}><b>{r.firstName} {r.lastName}</b></Link><small>{r.jobTitle}</small></div></li>))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
