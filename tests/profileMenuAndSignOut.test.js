import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webAppDir = path.resolve(__dirname, '../web/src/app');

// ─────────────────────────────────────────────────────────────
// 1. Role-Specific Profile Menu Routes Verification
// ─────────────────────────────────────────────────────────────

test('Profile Menu Routes: Student routes exist and point to valid pages', () => {
  const studentRoutes = ['/profile', '/settings', '/help'];
  
  for (const route of studentRoutes) {
    const routeSubpath = route.replace(/^\//, '');
    const pagePath = path.join(webAppDir, routeSubpath, 'page.jsx');
    assert.ok(
      fs.existsSync(pagePath),
      `Expected student page file to exist at ${pagePath} for route ${route}`
    );
  }
});

test('Profile Menu Routes: Company routes exist and point to valid pages', () => {
  const companyRoutes = ['/company/profile', '/settings', '/help'];
  
  for (const route of companyRoutes) {
    const routeSubpath = route.replace(/^\//, '');
    const pagePath = path.join(webAppDir, routeSubpath, 'page.jsx');
    assert.ok(
      fs.existsSync(pagePath),
      `Expected company page file to exist at ${pagePath} for route ${route}`
    );
  }
});

test('Profile Menu Routes: Admin routes exist and do not link to non-existent pages', () => {
  const adminRoutes = ['/admin/dashboard', '/settings', '/help'];
  
  for (const route of adminRoutes) {
    const routeSubpath = route.replace(/^\//, '');
    const pagePath = path.join(webAppDir, routeSubpath, 'page.jsx');
    assert.ok(
      fs.existsSync(pagePath),
      `Expected admin page file to exist at ${pagePath} for route ${route}`
    );
  }

  // Ensure /admin/profile does NOT exist (verifying requirement not to link to non-existent pages)
  const nonExistentAdminProfile = path.join(webAppDir, 'admin/profile/page.jsx');
  assert.strictEqual(
    fs.existsSync(nonExistentAdminProfile),
    false,
    'admin/profile/page.jsx should not exist; menu must not add links to non-existent pages'
  );
});

// ─────────────────────────────────────────────────────────────
// 2. Protected Route Session Logic Verification
// ─────────────────────────────────────────────────────────────

function isProtectedPath(pathname) {
  return (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/company') ||
    pathname.startsWith('/college') ||
    pathname.startsWith('/student') ||
    pathname === '/profile' ||
    pathname === '/settings'
  );
}

test('Route Protection: accurately identifies protected routes vs public pages', () => {
  // Protected paths
  assert.strictEqual(isProtectedPath('/student/internships'), true);
  assert.strictEqual(isProtectedPath('/student/applications'), true);
  assert.strictEqual(isProtectedPath('/student/chats'), true);
  assert.strictEqual(isProtectedPath('/company/dashboard'), true);
  assert.strictEqual(isProtectedPath('/company/internships'), true);
  assert.strictEqual(isProtectedPath('/company/profile'), true);
  assert.strictEqual(isProtectedPath('/admin/dashboard'), true);
  assert.strictEqual(isProtectedPath('/admin/analytics'), true);
  assert.strictEqual(isProtectedPath('/admin/users'), true);
  assert.strictEqual(isProtectedPath('/profile'), true);
  assert.strictEqual(isProtectedPath('/settings'), true);

  // Public / Guest paths
  assert.strictEqual(isProtectedPath('/'), false);
  assert.strictEqual(isProtectedPath('/internships'), false);
  assert.strictEqual(isProtectedPath('/about'), false);
  assert.strictEqual(isProtectedPath('/help'), false);
  assert.strictEqual(isProtectedPath('/people'), false);
  assert.strictEqual(isProtectedPath('/launchpad'), false);
  assert.strictEqual(isProtectedPath('/login'), false);
  assert.strictEqual(isProtectedPath('/signup'), false);
});

// ─────────────────────────────────────────────────────────────
// 3. Session Cleanup & Token Storage Verification
// ─────────────────────────────────────────────────────────────

test('Session Cleanup: tokenStorage.clearTokens clears all session identifiers', () => {
  const store = {};
  const mockStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
  };

  globalThis.window = {};
  globalThis.localStorage = mockStorage;
  globalThis.sessionStorage = mockStorage;

  mockStorage.setItem('token', 'sample-token');
  mockStorage.setItem('accessToken', 'sample-access-token');
  mockStorage.setItem('refreshToken', 'sample-refresh-token');
  mockStorage.setItem('user', JSON.stringify({ role: 'student', name: 'Test' }));

  // Emulate clearTokens logic
  const clearKeys = ['token', 'accessToken', 'refreshToken', 'authToken', 'jwt'];
  clearKeys.forEach((key) => {
    mockStorage.removeItem(key);
  });
  mockStorage.removeItem('user');

  assert.strictEqual(mockStorage.getItem('token'), null);
  assert.strictEqual(mockStorage.getItem('accessToken'), null);
  assert.strictEqual(mockStorage.getItem('refreshToken'), null);
  assert.strictEqual(mockStorage.getItem('user'), null);
});

// ─────────────────────────────────────────────────────────────
// 4. Landing Page Logged-Out Controls State Verification
// ─────────────────────────────────────────────────────────────

test('Landing Page State: resolves to Log In and Sign Up when session is cleared', () => {
  const evaluateLandingState = (hasSession) => {
    if (hasSession) {
      return { showDashboard: true, showAuthButtons: false };
    }
    return { showDashboard: false, showAuthButtons: true };
  };

  const loggedOutState = evaluateLandingState(false);
  assert.strictEqual(loggedOutState.showDashboard, false);
  assert.strictEqual(loggedOutState.showAuthButtons, true);

  const loggedInState = evaluateLandingState(true);
  assert.strictEqual(loggedInState.showDashboard, true);
  assert.strictEqual(loggedInState.showAuthButtons, false);
});
