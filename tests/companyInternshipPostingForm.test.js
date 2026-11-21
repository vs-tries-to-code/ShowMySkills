import test from 'node:test';
import assert from 'node:assert/strict';
import { validateInternshipPayload } from '../api/src/validators/internshipValidator.js';
import { uploadInternshipPoster } from '../api/src/services/uploadService.js';
import { uploadController } from '../api/src/controllers/uploadController.js';
import { uploadService as webUploadService } from '../web/src/services/apiClient.js';
import Internship from '../api/src/models/Internship.js';

// Helper to run validateInternshipPayload
const runValidation = (body, method = 'PUT') => {
  let statusCode = null;
  let jsonResponse = null;
  let nextCalled = false;

  const req = { body, method };
  const res = {
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (data) => {
      jsonResponse = data;
      return res;
    },
  };

  validateInternshipPayload(req, res, () => {
    nextCalled = true;
  });

  return { nextCalled, statusCode, jsonResponse, body: req.body };
};

// ──── Location Validation Tests ────

test('Location: Onsite mode requires a non-empty location', () => {
  const result1 = runValidation({ mode: 'onsite', location: '' });
  assert.strictEqual(result1.nextCalled, false);
  assert.strictEqual(result1.statusCode, 400);
  assert.match(result1.jsonResponse.message, /Location is required for Onsite and Hybrid/);

  const result2 = runValidation({ mode: 'onsite', location: '   ' });
  assert.strictEqual(result2.nextCalled, false);
  assert.strictEqual(result2.statusCode, 400);

  const result3 = runValidation({ mode: 'onsite' });
  assert.strictEqual(result3.nextCalled, false);
  assert.strictEqual(result3.statusCode, 400);

  const validResult = runValidation({ mode: 'onsite', location: '  Bengaluru, India  ' });
  assert.strictEqual(validResult.nextCalled, true);
  assert.strictEqual(validResult.body.location, 'Bengaluru, India');
});

test('Location: Hybrid mode requires a non-empty location', () => {
  const invalid = runValidation({ mode: 'hybrid', location: '' });
  assert.strictEqual(invalid.nextCalled, false);
  assert.strictEqual(invalid.statusCode, 400);
  assert.match(invalid.jsonResponse.message, /Location is required for Onsite and Hybrid/);

  const valid = runValidation({ mode: 'hybrid', location: 'Hyderabad, Tech City' });
  assert.strictEqual(valid.nextCalled, true);
  assert.strictEqual(valid.body.location, 'Hyderabad, Tech City');
});

test('Location: Remote mode clears empty or stale physical locations', () => {
  // Empty location passes and is cleared
  const validRemote = runValidation({ mode: 'remote', location: '' });
  assert.strictEqual(validRemote.nextCalled, true);
  assert.strictEqual(validRemote.body.location, '');

  // A stale physical location is cleared before saving
  const staleRemote = runValidation({ mode: 'remote', location: 'Mumbai Office Floor 3' });
  assert.strictEqual(staleRemote.nextCalled, true);
  assert.strictEqual(staleRemote.body.location, '');
});

// ──── Duration Validation Tests ────

test('Duration: Rejects empty duration', () => {
  const result = runValidation({ duration: '' });
  assert.strictEqual(result.nextCalled, false);
  assert.strictEqual(result.statusCode, 400);
  assert.match(result.jsonResponse.message, /Duration cannot be empty/);
});

test('Duration: Accepts valid preset and custom durations', () => {
  const preset = runValidation({ duration: '3 Months' });
  assert.strictEqual(preset.nextCalled, true);
  assert.strictEqual(preset.body.duration, '3 Months');

  const custom = runValidation({ duration: '10 Weeks' });
  assert.strictEqual(custom.nextCalled, true);
  assert.strictEqual(custom.body.duration, '10 Weeks');

  const fractional = runValidation({ duration: '1.5 Months' });
  assert.strictEqual(fractional.nextCalled, true);
  assert.strictEqual(fractional.body.duration, '1.5 Months');
});

test('Duration: Rejects unsupported units and malformed custom values', () => {
  for (const duration of ['10 Days', '1.5.2 Months', '1Months']) {
    const result = runValidation({ duration });
    assert.strictEqual(result.nextCalled, false, `${duration} should be rejected`);
    assert.strictEqual(result.statusCode, 400);
  }
});

test('Duration: Rejects zero or negative duration values', () => {
  const zeroResult = runValidation({ duration: '0 Weeks' });
  assert.strictEqual(zeroResult.nextCalled, false);
  assert.strictEqual(zeroResult.statusCode, 400);
  assert.match(zeroResult.jsonResponse.message, /Duration must be greater than zero/);

  const negativeResult = runValidation({ duration: '-3 Months' });
  assert.strictEqual(negativeResult.nextCalled, false);
  assert.strictEqual(negativeResult.statusCode, 400);
  assert.match(negativeResult.jsonResponse.message, /Duration must be greater than zero/);
});

// ──── Required Skills Validation Tests ────

test('Skills: Rejects empty skills or empty skills array', () => {
  const emptyStr = runValidation({ skills: '' });
  assert.strictEqual(emptyStr.nextCalled, false);
  assert.strictEqual(emptyStr.statusCode, 400);
  assert.match(emptyStr.jsonResponse.message, /At least one required skill must be provided/);

  const emptyArr = runValidation({ skills: [] });
  assert.strictEqual(emptyArr.nextCalled, false);
  assert.strictEqual(emptyArr.statusCode, 400);
});

test('Skills: Accepts comma-separated string or array and trims', () => {
  const strSkills = runValidation({ skills: ' React , TypeScript , Node.js ' });
  assert.strictEqual(strSkills.nextCalled, true);
  assert.deepStrictEqual(strSkills.body.skills, ['React', 'TypeScript', 'Node.js']);

  const arrSkills = runValidation({ skills: ['Python', ' Django '] });
  assert.strictEqual(arrSkills.nextCalled, true);
  assert.deepStrictEqual(arrSkills.body.skills, ['Python', 'Django']);
});

// ──── Compensation Choices and Range Validation Tests ────

test('Compensation: Paid requires valid min and max amounts', () => {
  const missingAmounts = runValidation({ compensationType: 'paid', stipendMin: '', stipendMax: '' });
  assert.strictEqual(missingAmounts.nextCalled, false);
  assert.strictEqual(missingAmounts.statusCode, 400);
  assert.match(missingAmounts.jsonResponse.message, /Minimum and maximum monthly stipend amounts are required/);

  const negativeAmount = runValidation({ compensationType: 'paid', stipendMin: -5000, stipendMax: 20000 });
  assert.strictEqual(negativeAmount.nextCalled, false);
  assert.strictEqual(negativeAmount.statusCode, 400);
  assert.match(negativeAmount.jsonResponse.message, /cannot be negative/);

  const invalidRange = runValidation({ compensationType: 'paid', stipendMin: 25000, stipendMax: 20000 });
  assert.strictEqual(invalidRange.nextCalled, false);
  assert.strictEqual(invalidRange.statusCode, 400);
  assert.match(invalidRange.jsonResponse.message, /Minimum stipend cannot exceed maximum stipend/);

  const equalRange = runValidation({ compensationType: 'paid', stipendMin: 20000, stipendMax: 20000 });
  assert.strictEqual(equalRange.nextCalled, true);
  assert.strictEqual(equalRange.body.stipendMax, 20000);

  const validPaid = runValidation({ compensationType: 'paid', stipendMin: 15000, stipendMax: 25000 });
  assert.strictEqual(validPaid.nextCalled, true);
  assert.strictEqual(validPaid.body.compensationType, 'paid');
  assert.strictEqual(validPaid.body.stipendMin, 15000);
  assert.strictEqual(validPaid.body.stipendMax, 25000);
  assert.match(validPaid.body.stipendText, /15,000.*25,000/);
});

test('Compensation: Paid supports a fixed amount and rejects incompatible or invalid values', () => {
  const fixed = runValidation({ compensationType: 'paid', stipendMode: 'fixed', stipendMin: '25000' });
  assert.equal(fixed.nextCalled, true);
  assert.equal(fixed.body.stipendMin, 25000);
  assert.equal(fixed.body.stipendMax, 25000);
  assert.equal(fixed.body.stipendText, '₹25,000 / month');

  for (const stipendMin of ['-1', 'nope', 'Infinity']) {
    const invalid = runValidation({ compensationType: 'paid', stipendMode: 'fixed', stipendMin });
    assert.equal(invalid.nextCalled, false);
  }
  const incompatible = runValidation({ compensationType: 'paid', stipendMode: 'fixed', stipendMin: 1000, stipendMax: 2000 });
  assert.equal(incompatible.nextCalled, false);
});

test('Compensation: Unpaid saves zero amounts and sets Unpaid label', () => {
  const unpaidResult = runValidation({ compensationType: 'unpaid', stipendMin: 5000, stipendMax: 10000 });
  assert.strictEqual(unpaidResult.nextCalled, true);
  assert.strictEqual(unpaidResult.body.compensationType, 'unpaid');
  assert.strictEqual(unpaidResult.body.stipendMin, 0);
  assert.strictEqual(unpaidResult.body.stipendMax, 0);
  assert.strictEqual(unpaidResult.body.stipendText, 'Unpaid');
  assert.strictEqual(unpaidResult.body.stipend, 'Unpaid');
});

test('Compensation: Flexible allows optional range and enforces validation if entered', () => {
  // Without amounts
  const flexibleEmpty = runValidation({ compensationType: 'flexible' });
  assert.strictEqual(flexibleEmpty.nextCalled, true);
  assert.strictEqual(flexibleEmpty.body.compensationType, 'flexible');
  assert.strictEqual(flexibleEmpty.body.stipendMin, 0);
  assert.strictEqual(flexibleEmpty.body.stipendMax, 0);
  assert.strictEqual(flexibleEmpty.body.stipendText, 'Flexible');

  // With invalid amounts (max <= min)
  const flexibleInvalid = runValidation({ compensationType: 'flexible', stipendMin: 30000, stipendMax: 20000 });
  assert.strictEqual(flexibleInvalid.nextCalled, false);
  assert.strictEqual(flexibleInvalid.statusCode, 400);
  assert.match(flexibleInvalid.jsonResponse.message, /Maximum stipend must be greater than minimum stipend/);

  // With valid amounts
  const flexibleValid = runValidation({ compensationType: 'flexible', stipendMin: 10000, stipendMax: 20000 });
  assert.strictEqual(flexibleValid.nextCalled, true);
  assert.strictEqual(flexibleValid.body.stipendMin, 10000);
  assert.strictEqual(flexibleValid.body.stipendMax, 20000);
  assert.match(flexibleValid.body.stipendText, /Flexible/);
});

test('Compensation: Skill-based stores no monetary stipend', () => {
  const result = runValidation({ compensationType: 'skill-based', stipendMin: 12000, stipendMax: 25000 });
  assert.equal(result.nextCalled, true);
  assert.equal(result.body.compensationType, 'skill-based');
  assert.equal(result.body.stipendMin, 0);
  assert.equal(result.body.stipendMax, 0);
  assert.equal(result.body.stipendText, 'Skill-based');
});

test('Compensation: Missing type preserves the existing paid default; unknown types are rejected', () => {
  const missing = runValidation({ role: 'Intern', duration: '3 Months', skills: ['JavaScript'], stipendMin: 10000, stipendMax: 15000 }, 'POST');
  assert.equal(missing.nextCalled, true);
  assert.equal(missing.body.compensationType, 'paid');
  const invalid = runValidation({ role: 'Intern', duration: '3 Months', skills: ['JavaScript'], compensationType: 'equity' }, 'POST');
  assert.equal(invalid.nextCalled, false);
});

// ──── Poster Image & Storage Tests ────

test('Poster Image: Schema defines posterImage and compensationType', () => {
  const schema = Internship.schema.paths;
  assert.ok(schema.posterImage, 'posterImage path must exist in Internship schema');
  assert.ok(schema.compensationType, 'compensationType path must exist in Internship schema');
  assert.deepStrictEqual(schema.compensationType.enumValues, ['paid', 'unpaid', 'skill-based', 'flexible']);
  assert.deepStrictEqual(schema.stipendMode.enumValues, ['fixed', 'range']);
});

test('Poster Image Upload Controller: rejects request without file', async () => {
  let statusCode = null;
  let jsonResponse = null;

  const req = { file: null };
  const res = {
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (data) => {
      jsonResponse = data;
      return res;
    },
  };

  await uploadController.handleInternshipPosterUpload(req, res, () => {});

  assert.strictEqual(statusCode, 400);
  assert.strictEqual(jsonResponse.success, false);
  assert.match(jsonResponse.message, /No poster image uploaded/);
});

test('Poster Image Upload Controller: formats and returns URL for uploaded file', async () => {
  let statusCode = null;
  let jsonResponse = null;

  const req = {
    file: {
      filename: 'poster-12345.png',
      size: 1024,
      mimetype: 'image/png',
    },
  };
  const res = {
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (data) => {
      jsonResponse = data;
      return res;
    },
  };

  await uploadController.handleInternshipPosterUpload(req, res, () => {});

  assert.strictEqual(statusCode, 201);
  assert.strictEqual(jsonResponse.success, true);
  assert.match(jsonResponse.data.url, /\/uploads\/internship-posters\/poster-12345\.png/);
});

test('Web Client: uploadService exports uploadInternshipPoster', () => {
  assert.strictEqual(typeof webUploadService.uploadInternshipPoster, 'function');
});
