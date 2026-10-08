/** Integration tests: employee profile photos. Needs TEST_DATABASE_URL (wipes the DB). */
const request = require('supertest');

const suite = process.env.TEST_DATABASE_URL ? describe : describe.skip;

suite('Employee photos (integration)', () => {
  let app; let pool; const tokens = {}; const ids = {};
  const auth = (who) => ({ Authorization: `Bearer ${tokens[who]}` });
  const login = async (email, password) => (await request(app).post('/api/auth/login').send({ email, password })).body.token;
  // Smallest thing our validator accepts: JPEG magic bytes plus padding
  const jpeg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.from('JFIF fake body for tests'), Buffer.alloc(32, 7)]);
  const upload = (who, id, buf, name = 'p.jpg', type = 'image/jpeg') =>
    request(app).post(`/api/employees/${id}/photo`).set(auth(who)).attach('file', buf, { filename: name, contentType: type });

  beforeAll(async () => {
    app = require('../../src/app');
    ({ pool } = require('../../src/db/pool'));
    await require('../../src/db/migrate').migrate();
    await pool.query(`TRUNCATE notifications, announcements, password_resets, holidays, leave_attachments, leave_requests, audit_logs, users, employees, departments, leave_types RESTART IDENTITY CASCADE`);
    await require('../../src/db/seed').seed();
    tokens.admin = await login('admin@orgflow.local', 'Admin@12345');
    tokens.liam = await login('liam.chen@orgflow.local', 'Employee@12345');
    tokens.sara = await login('sara.khan@orgflow.local', 'Employee@12345');
    const people = (await request(app).get('/api/employees?limit=100').set(auth('admin'))).body.data;
    ids.liam = people.find((p) => p.firstName === 'Liam').id;
    ids.sara = people.find((p) => p.firstName === 'Sara').id;
  });
  afterAll(async () => { await pool.end(); });

  test('nobody has a photo at first', async () => {
    const res = await request(app).get(`/api/employees/${ids.liam}`).set(auth('liam'));
    expect(res.body.hasPhoto).toBe(false);
    expect((await request(app).get(`/api/employees/${ids.liam}/photo`).set(auth('liam'))).status).toBe(404);
  });
  test('you can upload your own photo', async () => {
    const res = await upload('liam', ids.liam, jpeg);
    expect(res.status).toBe(201);
    expect(res.body.hasPhoto).toBe(true);
    expect(res.body.photoV).toBeGreaterThan(0);
  });
  test('everyone signed in can view it, with the right content type', async () => {
    const res = await request(app).get(`/api/employees/${ids.liam}/photo`).set(auth('sara')).buffer(true).parse((r, cb) => {
      const chunks = []; r.on('data', (c) => chunks.push(c)); r.on('end', () => cb(null, Buffer.concat(chunks)));
    });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('image/jpeg');
    expect(res.body.equals(jpeg)).toBe(true);
  });
  test('viewing needs sign-in', async () => {
    expect((await request(app).get(`/api/employees/${ids.liam}/photo`)).status).toBe(401);
  });
  test('the people list, org chart and profile expose the photo flags', async () => {
    const list = (await request(app).get('/api/employees?search=liam').set(auth('sara'))).body.data[0];
    expect(list.hasPhoto).toBe(true);
    const chart = (await request(app).get('/api/employees/org-chart').set(auth('sara'))).body.find((p) => p.id === ids.liam);
    expect(chart.hasPhoto).toBe(true);
    expect((await request(app).get('/api/auth/me').set(auth('liam'))).body.hasPhoto).toBe(true);
  });
  test('you cannot change a colleague\'s photo, but an admin can', async () => {
    expect((await upload('sara', ids.liam, jpeg)).status).toBe(403);
    expect((await upload('admin', ids.sara, jpeg)).status).toBe(201);
  });
  test('non-images are rejected even when labelled as images', async () => {
    const res = await upload('liam', ids.liam, Buffer.from('<?php system($_GET["c"]); ?> definitely not a picture'), 'evil.jpg', 'image/jpeg');
    expect(res.status).toBe(400);
  });
  test('SVG uploads are rejected', async () => {
    expect((await upload('liam', ids.liam, Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"></svg>'), 'a.svg', 'image/svg+xml')).status).toBe(400);
  });
  test('oversized uploads are rejected', async () => {
    const big = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff]), Buffer.alloc(1024 * 1024 + 10, 1)]);
    expect((await upload('liam', ids.liam, big)).status).toBe(413);
  });
  test('missing file is a 400', async () => {
    expect((await request(app).post(`/api/employees/${ids.liam}/photo`).set(auth('liam'))).status).toBe(400);
  });
  test('replacing a photo changes its version', async () => {
    const before = (await request(app).get(`/api/employees/${ids.liam}`).set(auth('liam'))).body.photoV;
    await new Promise((r) => setTimeout(r, 1100)); // version is in whole seconds
    await upload('liam', ids.liam, jpeg);
    const after = (await request(app).get(`/api/employees/${ids.liam}`).set(auth('liam'))).body.photoV;
    expect(after).toBeGreaterThan(before);
  });
  test('removing a photo, and removing someone else\'s is forbidden', async () => {
    expect((await request(app).delete(`/api/employees/${ids.liam}/photo`).set(auth('sara'))).status).toBe(403);
    expect((await request(app).delete(`/api/employees/${ids.liam}/photo`).set(auth('liam'))).status).toBe(204);
    expect((await request(app).get(`/api/employees/${ids.liam}/photo`).set(auth('liam'))).status).toBe(404);
    expect((await request(app).get(`/api/employees/${ids.liam}`).set(auth('liam'))).body.hasPhoto).toBe(false);
  });
});
