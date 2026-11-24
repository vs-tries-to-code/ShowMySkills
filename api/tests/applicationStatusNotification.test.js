import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';

const LOCAL_URI = 'mongodb://127.0.0.1:27017/showmyskills_dev';
const TEST_JWT_SECRET = 'local-application-notification-test-only';
process.env.MONGODB_URI = LOCAL_URI;
process.env.JWT_SECRET = TEST_JWT_SECRET;

const [{ default: mongoose }, { default: User }, { default: Application }, { default: Notification }, { default: app }] = await Promise.all([
  import('mongoose'),
  import('../src/models/User.js'),
  import('../src/models/Application.js'),
  import('../src/models/Notification.js'),
  import('../src/app.js'),
]);

const makeUser = (role, suffix) => ({
  _id: new mongoose.Types.ObjectId(),
  name: `Local Application Test ${suffix}`,
  email: `local-application-${suffix}-${new mongoose.Types.ObjectId()}@example.invalid`,
  phone: `+300000${Math.floor(Math.random() * 1_000_000).toString().padStart(6, '0')}`,
  password: 'not-a-login-credential',
  role,
  emailVerified: true,
});

const headersFor = (user) => ({
  Authorization: `Bearer ${jwt.sign(
    { sub: user._id.toString(), role: user.role },
    TEST_JWT_SECRET,
    { expiresIn: '5m' }
  )}`,
  'Content-Type': 'application/json',
});

test('application status changes notify only the student and require the owning company or admin', async () => {
  await mongoose.connect(LOCAL_URI, {
    serverSelectionTimeoutMS: 3000,
    connectTimeoutMS: 3000,
  });
  assert.equal(mongoose.connection.host, '127.0.0.1');
  assert.equal(mongoose.connection.name, 'showmyskills_dev');

  const student = makeUser('student', 'student');
  const company = makeUser('company', 'company');
  const otherCompany = makeUser('company', 'other-company');
  const users = [student, company, otherCompany];
  const applicationId = new mongoose.Types.ObjectId();
  let server;

  try {
    await User.create(users);
    await Application.create({
      _id: applicationId,
      internship: new mongoose.Types.ObjectId(),
      student: student._id,
      company: company._id,
      roleTitle: 'Local QA Internship',
      companyName: 'Local QA Company',
      candidateSnapshot: {
        name: student.name,
        email: student.email,
      },
      status: 'applied',
    });

    server = app.listen(0, '127.0.0.1');
    await new Promise((resolve, reject) => {
      server.once('listening', resolve);
      server.once('error', reject);
    });
    const endpoint = `http://127.0.0.1:${server.address().port}/api/applications/${applicationId}/status`;
    const update = async (user, body) => {
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: headersFor(user),
        body: JSON.stringify(body),
      });
      return { response, json: await response.json() };
    };

    const deniedStudent = await update(student, { status: 'shortlisted' });
    assert.equal(deniedStudent.response.status, 403);
    const deniedCompany = await update(otherCompany, { status: 'shortlisted' });
    assert.equal(deniedCompany.response.status, 404);
    assert.equal(await Notification.countDocuments({ user: student._id }), 0);

    const changed = await update(company, { status: 'shortlisted' });
    assert.equal(changed.response.status, 200);
    const studentNotices = await Notification.find({ user: student._id }).lean();
    assert.equal(studentNotices.length, 1);
    assert.equal(studentNotices[0].type, 'application');
    assert.equal(studentNotices[0].link, '/student/applications');
    assert.match(studentNotices[0].desc, /Local QA Company updated your application for Local QA Internship to shortlisted/);

    await update(company, { status: 'shortlisted' });
    await update(company, { notes: 'Recruiter note only' });
    assert.equal(await Notification.countDocuments({ user: student._id }), 1);
    assert.equal(await Notification.countDocuments({ user: company._id }), 0);
  } finally {
    if (server) await new Promise((resolve) => server.close(resolve));
    await Notification.deleteMany({ user: { $in: users.map((user) => user._id) } });
    await Application.deleteMany({ _id: applicationId });
    await User.deleteMany({ _id: { $in: users.map((user) => user._id) } });
    await mongoose.disconnect();
  }
});
