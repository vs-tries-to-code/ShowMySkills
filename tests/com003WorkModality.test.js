import test from 'node:test';
import assert from 'node:assert/strict';
import { validateInternshipPayload } from '../api/src/validators/internshipValidator.js';

const validate = (body, method = 'POST') => {
  const req = { body: { ...body }, method };
  let statusCode;
  let response;
  let nextCalled = false;
  const res = {
    status(code) { statusCode = code; return this; },
    json(value) { response = value; return this; },
  };
  validateInternshipPayload(req, res, () => { nextCalled = true; });
  return { req, statusCode, response, nextCalled };
};

test('COM-003 accepts Onsite and Hybrid with trimmed locations', () => {
  for (const mode of ['onsite', 'hybrid']) {
    const result = validate({ mode, location: '  Bengaluru, Karnataka  ' });
    assert.equal(result.nextCalled, true);
    assert.equal(result.req.body.location, 'Bengaluru, Karnataka');
  }
});

test('COM-003 rejects Onsite and Hybrid without a location', () => {
  for (const mode of ['onsite', 'hybrid']) {
    const result = validate({ mode, location: '  ' });
    assert.equal(result.statusCode, 400);
    assert.match(result.response.message, /Location is required/);
  }
});

test('COM-003 accepts Remote without location and removes stale location', () => {
  const result = validate({ mode: 'remote', location: 'Old office' });
  assert.equal(result.nextCalled, true);
  assert.equal(result.req.body.location, '');
});

test('COM-003 rejects unsupported modalities and overly long locations', () => {
  assert.equal(validate({ mode: 'flexible', location: 'Somewhere' }).statusCode, 400);
  assert.equal(validate({ mode: 'onsite', location: 'x'.repeat(151) }).statusCode, 400);
});

test('COM-003 allows partial updates that omit modality', () => {
  const result = validate({ description: 'Updated description' }, 'PUT');
  assert.equal(result.nextCalled, true);
});
