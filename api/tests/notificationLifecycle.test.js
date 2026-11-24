import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';

const LOCAL_URI = 'mongodb://127.0.0.1:27017/showmyskills_dev';
const TEST_JWT_SECRET = 'local-notification-test-only';
process.env.MONGODB_URI = LOCAL_URI;
process.env.JWT_SECRET = TEST_JWT_SECRET;

const [{ default: mongoose }, { default: User }, { default: Notification }, { default: app }] = await Promise.all([
  import('mongoose'),
  import('../src/models/User.js'),
  import('../src/models/Notification.js'),
  import('../src/app.js'),
]);

const makeUser = (suffix) => ({
  _id: new mongoose.Types.ObjectId(),
  name: `Local Notification Test ${suffix}`,
  email: `local-notification-${suffix}-${new mongoose.Types.ObjectId()}@example.invalid`,
  phone: `+200000${Math.floor(Math.random() * 1_000_000).toString().padStart(6, '0')}`,
  password: 'not-a-login-credential',
  role: suffix === 'company' ? 'company' : 'student',
  emailVerified: true,
});

const authHeaders = (user) => ({
  Authorization: `Bearer ${jwt.sign(
    { sub: user._id.toString(), role: user.role },
    TEST_JWT_SECRET,
    { expiresIn: '5m' }
  )}`,
  'Content-Type': 'application/json',
});

test('notification list, recipient scoping, counts, and read states persist for the authenticated user', async () => {
  await mongoose.connect(LOCAL_URI, {
    serverSelectionTimeoutMS: 3000,
    connectTimeoutMS: 3000,
  });
  assert.equal(mongoose.connection.host, '127.0.0.1');
  assert.equal(mongoose.connection.name, 'showmyskills_dev');

  const student = makeUser('student');
  const company = makeUser('company');
  const users = [student, company];
  const notificationIds = [];
  let server;

  try {
    await User.create(users);
    const studentNotifications = await Notification.create(
      Array.from({ length: 32 }, (_, index) => ({
        user: student._id,
        title: `Local notification ${index + 1}`,
        desc: 'Local lifecycle integration test record',
        unread: index !== 0,
        type: 'system',
        createdAt: new Date(Date.now() - index * 1000),
      }))
    );
    const companyNotification = await Notification.create({
      user: company._id,
      title: 'Company scoped item',
      desc: 'Recipient isolation check',
      unread: true,
      type: 'application',
    });
    notificationIds.push(...studentNotifications.map((item) => item._id), companyNotification._id);
    const oneUnreadId = studentNotifications[1]._id;

    server = app.listen(0, '127.0.0.1');
    await new Promise((resolve, reject) => {
      server.once('listening', resolve);
      server.once('error', reject);
    });
    const baseUrl = `http://127.0.0.1:${server.address().port}/api/notifications`;
    const request = async (user, path = '', method = 'GET', body) => {
      const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: authHeaders(user),
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      return { response, json: await response.json() };
    };

    const listed = await request(student);
    assert.equal(listed.response.status, 200);
    assert.equal(listed.json.data.length, 30);
    assert.equal(listed.json.unreadCount, 31);
    assert.ok(listed.json.data.every((item) => item.user.toString() === student._id.toString()));

    const companyListed = await request(company);
    assert.equal(companyListed.json.data.length, 1);
    assert.equal(companyListed.json.data[0].user.toString(), company._id.toString());

    const markOne = await request(student, '/mark-read', 'PUT', {
      notificationId: oneUnreadId.toString(),
    });
    assert.equal(markOne.response.status, 200);
    const afterOne = await request(student);
    assert.equal(afterOne.json.unreadCount, 30);
    assert.equal(afterOne.json.data.find((item) => item._id.toString() === oneUnreadId.toString()).unread, false);

    const markAll = await request(student, '/mark-read', 'PUT', {});
    assert.equal(markAll.response.status, 200);
    const reopenedList = await request(student);
    assert.equal(reopenedList.json.unreadCount, 0);
    assert.ok(reopenedList.json.data.every((item) => item.unread === false));

    await request(student, '/mark-read', 'PUT', {
      notificationId: companyNotification._id.toString(),
    });
    assert.equal((await Notification.findById(companyNotification._id)).unread, true);
  } finally {
    if (server) await new Promise((resolve) => server.close(resolve));
    await Notification.deleteMany({ _id: { $in: notificationIds } });
    await User.deleteMany({ _id: { $in: users.map((user) => user._id) } });
    await mongoose.disconnect();
  }
});
