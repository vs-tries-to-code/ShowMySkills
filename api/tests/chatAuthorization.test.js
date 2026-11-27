import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';

const LOCAL_URI = 'mongodb://127.0.0.1:27017/showmyskills_dev';
const TEST_JWT_SECRET = 'local-chat-authorization-test-only';
process.env.MONGODB_URI = LOCAL_URI;
process.env.JWT_SECRET = TEST_JWT_SECRET;

const [{ default: mongoose }, { default: User }, { default: Conversation }, { default: Message }, { default: app }] = await Promise.all([
  import('mongoose'),
  import('../src/models/User.js'),
  import('../src/models/Conversation.js'),
  import('../src/models/Message.js'),
  import('../src/app.js'),
]);

const makeUser = (role, suffix) => ({
  _id: new mongoose.Types.ObjectId(),
  name: `Local Chat Test ${suffix}`,
  email: `local-chat-${suffix}-${new mongoose.Types.ObjectId()}@example.invalid`,
  phone: `+100000${Math.floor(Math.random() * 1_000_000).toString().padStart(6, '0')}`,
  password: 'not-a-login-credential',
  role,
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

test('chat operations require conversation membership for student and company users', async (t) => {
  await mongoose.connect(LOCAL_URI, {
    serverSelectionTimeoutMS: 3000,
    connectTimeoutMS: 3000,
  });
  assert.equal(mongoose.connection.host, '127.0.0.1');
  assert.equal(mongoose.connection.name, 'showmyskills_dev');

  const student = makeUser('student', 'student');
  const company = makeUser('company', 'company');
  const outsideStudent = makeUser('student', 'outside-student');
  const outsideCompany = makeUser('company', 'outside-company');
  const users = [student, company, outsideStudent, outsideCompany];
  const conversationId = new mongoose.Types.ObjectId();
  const missingConversationId = new mongoose.Types.ObjectId();
  const conversationIds = [conversationId];
  let server;

  try {
    await User.create(users);
    await Conversation.create({
      _id: conversationId,
      participants: [student._id, company._id],
      lastMessage: 'Initial message',
      lastMessageAt: new Date(),
      unreadCounts: {
        [student._id.toString()]: 1,
        [company._id.toString()]: 1,
      },
    });
    const [receivedByStudent, receivedByCompany] = await Message.create([
      {
        conversationId,
        sender: company._id,
        receiver: student._id,
        text: 'Company to student',
        status: 'delivered',
      },
      {
        conversationId,
        sender: student._id,
        receiver: company._id,
        text: 'Student to company',
        status: 'delivered',
      },
    ]);

    server = app.listen(0, '127.0.0.1');
    await new Promise((resolve, reject) => {
      server.once('listening', resolve);
      server.once('error', reject);
    });
    const baseUrl = `http://127.0.0.1:${server.address().port}/api/chats`;
    const request = async (path, user, method = 'GET', body) => {
      const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: user ? authHeaders(user) : {},
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      return { response, json: await response.json() };
    };

    const unauthenticated = await request(`/conversations/${conversationId}/messages`);
    assert.equal(unauthenticated.response.status, 401);

    for (const participant of [student, company]) {
      const result = await request(`/conversations/${conversationId}/messages`, participant);
      assert.equal(result.response.status, 200);
      assert.equal(result.json.data.length, 2);
    }

    for (const outsider of [outsideStudent, outsideCompany]) {
      const result = await request(`/conversations/${conversationId}/messages`, outsider);
      assert.equal(result.response.status, 404);
      assert.equal(result.json.message, 'Conversation not found');
    }
    assert.equal((await request('/conversations/not-an-id/messages', student)).response.status, 400);
    assert.equal((await request(`/conversations/${missingConversationId}/messages`, student)).response.status, 404);

    const beforeSendCount = await Message.countDocuments({ conversationId });
    for (const outsider of [outsideStudent, outsideCompany]) {
      const result = await request('/messages', outsider, 'POST', {
        conversationId: conversationId.toString(),
        text: 'Unauthorized attempt',
      });
      assert.equal(result.response.status, 404);
    }
    assert.equal(await Message.countDocuments({ conversationId }), beforeSendCount);

    for (const [participant, expectedReceiver] of [[student, company], [company, student]]) {
      const result = await request('/messages', participant, 'POST', {
        conversationId: conversationId.toString(),
        text: `Legitimate message from ${participant.role}`,
      });
      assert.equal(result.response.status, 201);
      assert.equal(result.json.data.sender, participant._id.toString());
      assert.equal(result.json.data.receiver, expectedReceiver._id.toString());
    }

    assert.equal((await request('/messages', student, 'POST', {
      conversationId: 'bad-id', text: 'Invalid conversation ID',
    })).response.status, 400);
    assert.equal((await request('/messages', student, 'POST', {
      conversationId: missingConversationId.toString(), text: 'Missing conversation',
    })).response.status, 404);

    for (const outsider of [outsideStudent, outsideCompany]) {
      const result = await request(`/conversations/${conversationId}/read`, outsider, 'PUT');
      assert.equal(result.response.status, 404);
    }
    assert.equal((await Message.findById(receivedByStudent._id)).status, 'delivered');

    for (const [participant, receivedMessage] of [[student, receivedByStudent], [company, receivedByCompany]]) {
      const result = await request(`/conversations/${conversationId}/read`, participant, 'PUT');
      assert.equal(result.response.status, 200);
      assert.equal((await Message.findById(receivedMessage._id)).status, 'read');
    }
    assert.equal((await request('/conversations/bad-id/read', student, 'PUT')).response.status, 400);
    assert.equal((await request(`/conversations/${missingConversationId}/read`, student, 'PUT')).response.status, 404);

    const studentConversations = await request('/conversations', student);
    assert.equal(studentConversations.response.status, 200);
    assert.equal(studentConversations.json.data.length, 1);
  } finally {
    if (server) await new Promise((resolve) => server.close(resolve));
    await Message.deleteMany({ conversationId: { $in: conversationIds } });
    await Conversation.deleteMany({ _id: { $in: conversationIds } });
    await User.deleteMany({ _id: { $in: users.map((user) => user._id) } });
    await mongoose.disconnect();
  }
});
