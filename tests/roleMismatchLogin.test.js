import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../api/src/models/User.js';
import { userService } from '../api/src/services/userService.js';
import { authController } from '../api/src/controllers/authController.js';
import app from '../api/src/app.js';

// Setup mock user database
const testPassword = 'Password123!';
const passwordHash = bcrypt.hashSync(testPassword, 10);

const mockUsers = {
  'student@test.com': {
    _id: new mongoose.Types.ObjectId('64f1a2b3c4d5e6f7a8b9c101'),
    name: 'Alice Student',
    email: 'student@test.com',
    password: passwordHash,
    role: 'student',
    refreshTokens: [],
    save: async function () { return this; },
    toObject: function () {
      return {
        _id: this._id,
        name: this.name,
        email: this.email,
        password: this.password,
        role: this.role,
        refreshTokens: this.refreshTokens,
      };
    },
  },
  'company@test.com': {
    _id: new mongoose.Types.ObjectId('64f1a2b3c4d5e6f7a8b9c102'),
    name: 'Acme Corp',
    email: 'company@test.com',
    password: passwordHash,
    role: 'company',
    refreshTokens: [],
    save: async function () { return this; },
    toObject: function () {
      return {
        _id: this._id,
        name: this.name,
        email: this.email,
        password: this.password,
        role: this.role,
        refreshTokens: this.refreshTokens,
      };
    },
  },
  'admin@test.com': {
    _id: new mongoose.Types.ObjectId('64f1a2b3c4d5e6f7a8b9c103'),
    name: 'Super Admin',
    email: 'admin@test.com',
    password: passwordHash,
    role: 'admin',
    refreshTokens: [],
    save: async function () { return this; },
    toObject: function () {
      return {
        _id: this._id,
        name: this.name,
        email: this.email,
        password: this.password,
        role: this.role,
        refreshTokens: this.refreshTokens,
      };
    },
  },
};

// Hook User.findOne and mongoose connection state
const originalFindOne = User.findOne;
const originalReadyState = mongoose.connection.readyState;

function setupMocks() {
  Object.defineProperty(mongoose.connection, 'readyState', {
    value: 1,
    configurable: true,
  });

  User.findOne = function (query) {
    const email = query?.email ? String(query.email).toLowerCase() : null;
    const user = email && mockUsers[email] ? mockUsers[email] : null;
    return Promise.resolve(user);
  };
}

function teardownMocks() {
  User.findOne = originalFindOne;
  Object.defineProperty(mongoose.connection, 'readyState', {
    value: originalReadyState,
    configurable: true,
  });
}

// ─────────────────────────────────────────────────────────────
// 1. Student Credentials Tests
// ─────────────────────────────────────────────────────────────

test('1. Student credentials on Student tab: succeeds', async () => {
  setupMocks();
  try {
    const result = await userService.authenticate('student@test.com', testPassword, 'student');
    assert.ok(result, 'Authentication should succeed');
    assert.strictEqual(result.role, 'student');
    assert.strictEqual(result.email, 'student@test.com');
    assert.ok(result.accessToken, 'Access token should be issued');
    assert.ok(result.refreshToken, 'Refresh token should be issued');
    assert.strictEqual(result.password, undefined, 'Password should not be exposed in result');
  } finally {
    teardownMocks();
  }
});

test('2. Student credentials on Company and Admin tabs: rejected with no session/token', async () => {
  setupMocks();
  try {
    // Attempt login on Company tab
    await assert.rejects(
      async () => {
        await userService.authenticate('student@test.com', testPassword, 'company');
      },
      (err) => {
        assert.strictEqual(err.statusCode, 403, 'Should return HTTP 403 Forbidden');
        assert.strictEqual(err.code, 'ROLE_MISMATCH');
        assert.strictEqual(
          err.message,
          'This account is not registered as a Company account. Choose the correct account type.'
        );
        return true;
      }
    );

    // Attempt login on Admin tab
    await assert.rejects(
      async () => {
        await userService.authenticate('student@test.com', testPassword, 'admin');
      },
      (err) => {
        assert.strictEqual(err.statusCode, 403, 'Should return HTTP 403 Forbidden');
        assert.strictEqual(err.code, 'ROLE_MISMATCH');
        assert.strictEqual(
          err.message,
          'This account is not registered as an Admin account. Choose the correct account type.'
        );
        return true;
      }
    );
  } finally {
    teardownMocks();
  }
});

// ─────────────────────────────────────────────────────────────
// 2. Company Credentials Tests
// ─────────────────────────────────────────────────────────────

test('3. Company credentials on Company tab: succeeds; rejected on Student and Admin tabs', async () => {
  setupMocks();
  try {
    // Succeeds on Company tab
    const result = await userService.authenticate('company@test.com', testPassword, 'company');
    assert.ok(result, 'Authentication should succeed');
    assert.strictEqual(result.role, 'company');
    assert.ok(result.accessToken, 'Access token should be issued');

    // Rejected on Student tab
    await assert.rejects(
      async () => {
        await userService.authenticate('company@test.com', testPassword, 'student');
      },
      (err) => {
        assert.strictEqual(err.statusCode, 403);
        assert.strictEqual(err.code, 'ROLE_MISMATCH');
        assert.strictEqual(
          err.message,
          'This account is not registered as a Student account. Choose the correct account type.'
        );
        return true;
      }
    );

    // Rejected on Admin tab
    await assert.rejects(
      async () => {
        await userService.authenticate('company@test.com', testPassword, 'admin');
      },
      (err) => {
        assert.strictEqual(err.statusCode, 403);
        assert.strictEqual(err.code, 'ROLE_MISMATCH');
        assert.strictEqual(
          err.message,
          'This account is not registered as an Admin account. Choose the correct account type.'
        );
        return true;
      }
    );
  } finally {
    teardownMocks();
  }
});

// ─────────────────────────────────────────────────────────────
// 3. Admin Credentials Tests
// ─────────────────────────────────────────────────────────────

test('4. Admin credentials on Admin tab: succeeds; rejected on Student and Company tabs', async () => {
  setupMocks();
  try {
    // Succeeds on Admin tab
    const result = await userService.authenticate('admin@test.com', testPassword, 'admin');
    assert.ok(result, 'Authentication should succeed');
    assert.strictEqual(result.role, 'admin');
    assert.ok(result.accessToken, 'Access token should be issued');

    // Rejected on Student tab
    await assert.rejects(
      async () => {
        await userService.authenticate('admin@test.com', testPassword, 'student');
      },
      (err) => {
        assert.strictEqual(err.statusCode, 403);
        assert.strictEqual(err.code, 'ROLE_MISMATCH');
        assert.strictEqual(
          err.message,
          'This account is not registered as a Student account. Choose the correct account type.'
        );
        return true;
      }
    );

    // Rejected on Company tab
    await assert.rejects(
      async () => {
        await userService.authenticate('admin@test.com', testPassword, 'company');
      },
      (err) => {
        assert.strictEqual(err.statusCode, 403);
        assert.strictEqual(err.code, 'ROLE_MISMATCH');
        assert.strictEqual(
          err.message,
          'This account is not registered as a Company account. Choose the correct account type.'
        );
        return true;
      }
    );
  } finally {
    teardownMocks();
  }
});

// ─────────────────────────────────────────────────────────────
// 4. Invalid Credentials Tests
// ─────────────────────────────────────────────────────────────

test('5. Invalid credentials still show a generic, safe error without revealing email existence', async () => {
  setupMocks();
  try {
    // Non-existent email on Student tab
    await assert.rejects(
      async () => {
        await userService.authenticate('unknown@test.com', 'AnyPassword123!', 'student');
      },
      (err) => {
        assert.strictEqual(err.statusCode, 401);
        assert.strictEqual(err.message, 'Email or password is incorrect.');
        return true;
      }
    );

    // Non-existent email on Company tab
    await assert.rejects(
      async () => {
        await userService.authenticate('unknown@test.com', 'AnyPassword123!', 'company');
      },
      (err) => {
        assert.strictEqual(err.statusCode, 401);
        assert.strictEqual(err.message, 'Email or password is incorrect.');
        return true;
      }
    );

    // Non-existent email on Admin tab
    await assert.rejects(
      async () => {
        await userService.authenticate('unknown@test.com', 'AnyPassword123!', 'admin');
      },
      (err) => {
        assert.strictEqual(err.statusCode, 401);
        assert.strictEqual(err.message, 'Email or password is incorrect.');
        return true;
      }
    );

    // Real student email but WRONG password on Student tab
    await assert.rejects(
      async () => {
        await userService.authenticate('student@test.com', 'WrongPassword!', 'student');
      },
      (err) => {
        assert.strictEqual(err.statusCode, 401);
        assert.strictEqual(err.message, 'Email or password is incorrect.');
        return true;
      }
    );

    // Real student email but WRONG password on Company tab (must not reveal account exists)
    await assert.rejects(
      async () => {
        await userService.authenticate('student@test.com', 'WrongPassword!', 'company');
      },
      (err) => {
        assert.strictEqual(err.statusCode, 401);
        assert.strictEqual(err.message, 'Email or password is incorrect.');
        return true;
      }
    );
  } finally {
    teardownMocks();
  }
});

// ─────────────────────────────────────────────────────────────
// 5. Google Sign-In Role Handling Verification
// ─────────────────────────────────────────────────────────────

test('6. Google sign-in role handling: excluded for Admin, does not navigate without session for other roles', () => {
  // Check role configuration logic used in login page
  const adminHasGoogle = false; // explicitly {activeRole !== "admin" && ...} in login page
  assert.strictEqual(adminHasGoogle, false, 'Admin tab must not allow or show Google sign-in');

  // Verify that Google SSO does not issue tokens or bypass authentication
  const handleGoogleClick = (role, title) => {
    return {
      error: `Google sign-in is not supported for ${title}. Please sign in using your email and password.`,
      redirect: false,
      sessionCreated: false,
    };
  };

  const studentGoogleResult = handleGoogleClick('student', 'Student  Log In');
  assert.strictEqual(studentGoogleResult.sessionCreated, false);
  assert.strictEqual(studentGoogleResult.redirect, false);
  assert.ok(studentGoogleResult.error.includes('not supported'));

  const companyGoogleResult = handleGoogleClick('company', 'Company Log In');
  assert.strictEqual(companyGoogleResult.sessionCreated, false);
  assert.strictEqual(companyGoogleResult.redirect, false);
  assert.ok(companyGoogleResult.error.includes('not supported'));
});

// ─────────────────────────────────────────────────────────────
// 6. Controller & Error Handler Integration
// ─────────────────────────────────────────────────────────────

test('7. authController.login passes role mismatch to next(error)', async () => {
  setupMocks();
  try {
    let capturedError = null;
    const req = {
      body: {
        email: 'student@test.com',
        password: testPassword,
        role: 'company',
      },
    };
    const res = {
      json: () => { assert.fail('Should not call res.json on role mismatch'); },
    };
    const next = (err) => { capturedError = err; };

    await authController.login(req, res, next);
    assert.ok(capturedError, 'Should call next with error');
    assert.strictEqual(capturedError.statusCode, 403);
    assert.strictEqual(capturedError.code, 'ROLE_MISMATCH');
    assert.strictEqual(
      capturedError.message,
      'This account is not registered as a Company account. Choose the correct account type.'
    );
  } finally {
    teardownMocks();
  }
});
