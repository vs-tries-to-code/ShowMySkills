import test from 'node:test';
import assert from 'node:assert/strict';
import { navigationConfig } from '../web/src/config/navigation.js';
import Internship from '../api/src/models/Internship.js';
import { updateExistingInternship, removeInternship } from '../api/src/controllers/internshipController.js';
import * as internshipService from '../api/src/services/internshipService.js';
import { internshipService as webInternshipService } from '../web/src/services/apiClient.js';

test('Company Navigation: contains Manage Internships link', () => {
  const companyTopNav = navigationConfig.company.top;
  const manageItem = companyTopNav.find(item => item.href === '/company/internships');
  assert.ok(manageItem, 'Manage Internships item should exist in company top navigation');
  assert.strictEqual(manageItem.label, 'Manage Internships');
});

test('Backend Model Status Verification: supported statuses vs completed/filled', () => {
  const statusEnumValues = Internship.schema.path('status').enumValues;
  
  // Verify supported enum values
  assert.ok(statusEnumValues.includes('active'), 'Should support active status');
  assert.ok(statusEnumValues.includes('closed'), 'Should support closed status');
  assert.ok(statusEnumValues.includes('draft'), 'Should support draft status');
  assert.ok(statusEnumValues.includes('pending_review'), 'Should support pending_review status');
  assert.ok(statusEnumValues.includes('suspended'), 'Should support suspended status');

  // Verify that 'completed' and 'filled' are NOT supported by the backend model
  assert.strictEqual(statusEnumValues.includes('completed'), false, 'Backend does not support completed status');
  assert.strictEqual(statusEnumValues.includes('filled'), false, 'Backend does not support filled status');
});

test('Internship Service: getInternships respects postedBy filter', async () => {
  const originalFind = Internship.find;
  const originalCount = Internship.countDocuments;
  let capturedFilter = null;

  Internship.find = function(filter) {
    capturedFilter = filter;
    return {
      sort: () => ({
        skip: () => ({
          limit: () => ({
            lean: () => Promise.resolve([])
          })
        })
      })
    };
  };

  Internship.countDocuments = function() {
    return Promise.resolve(0);
  };

  try {
    const testCompanyId = '64f1a2b3c4d5e6f7a8b9c0d1';

    // 1. Query with postedBy and status=all
    await internshipService.getInternships({ postedBy: testCompanyId, status: 'all' });
    assert.strictEqual(capturedFilter.postedBy, testCompanyId);
    assert.strictEqual(capturedFilter.status, undefined, 'status=all should not restrict status');

    // 2. Query with postedBy and status=closed
    await internshipService.getInternships({ postedBy: testCompanyId, status: 'closed' });
    assert.strictEqual(capturedFilter.postedBy, testCompanyId);
    assert.strictEqual(capturedFilter.status, 'closed');

    // 3. Query with postedBy default (active)
    await internshipService.getInternships({ postedBy: testCompanyId });
    assert.strictEqual(capturedFilter.postedBy, testCompanyId);
    assert.strictEqual(capturedFilter.status, 'active');
  } finally {
    Internship.find = originalFind;
    Internship.countDocuments = originalCount;
  }
});

test('Company Authorization: updateExistingInternship prevents modifying other company postings', async () => {
  const originalFindById = Internship.findById;
  const validPostingId = '64f1a2b3c4d5e6f7a8b9c001';
  const ownerId = '64f1a2b3c4d5e6f7a8b9c111';
  const attackerId = '64f1a2b3c4d5e6f7a8b9c222';

  Internship.findById = function() {
    return {
      lean: () => Promise.resolve({
        _id: validPostingId,
        role: 'Backend Intern',
        postedBy: ownerId
      })
    };
  };

  try {
    let statusCode = null;
    let jsonResponse = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return res;
      },
      json: (data) => {
        jsonResponse = data;
        return res;
      }
    };

    const req = {
      params: { id: validPostingId },
      body: { status: 'closed' },
      user: { id: attackerId, role: 'company' }
    };

    await updateExistingInternship(req, res, () => {});

    assert.strictEqual(statusCode, 403, 'Should reject unauthorized update with 403');
    assert.strictEqual(jsonResponse.success, false);
    assert.match(jsonResponse.message, /Forbidden.*manage your own internship postings/);
  } finally {
    Internship.findById = originalFindById;
  }
});

test('Company Authorization: updateExistingInternship permits owner to modify posting', async () => {
  const originalFindById = Internship.findById;
  const originalFindByIdAndUpdate = Internship.findByIdAndUpdate;
  const validPostingId = '64f1a2b3c4d5e6f7a8b9c001';
  const ownerId = '64f1a2b3c4d5e6f7a8b9c111';

  Internship.findById = function() {
    return {
      lean: () => Promise.resolve({
        _id: validPostingId,
        role: 'Backend Intern',
        postedBy: ownerId
      })
    };
  };

  Internship.findByIdAndUpdate = function(id, update) {
    return Promise.resolve({
      _id: id,
      ...update.$set,
      postedBy: ownerId
    });
  };

  try {
    let statusCode = null;
    let jsonResponse = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return res;
      },
      json: (data) => {
        jsonResponse = data;
        return res;
      }
    };

    const req = {
      params: { id: validPostingId },
      body: { status: 'closed' },
      user: { id: ownerId, role: 'company' }
    };

    await updateExistingInternship(req, res, () => {});

    assert.strictEqual(statusCode, 200);
    assert.strictEqual(jsonResponse.success, true);
    assert.strictEqual(jsonResponse.data.status, 'closed');
  } finally {
    Internship.findById = originalFindById;
    Internship.findByIdAndUpdate = originalFindByIdAndUpdate;
  }
});

test('Company Authorization: removeInternship prevents deleting other company postings', async () => {
  const originalFindById = Internship.findById;
  const validPostingId = '64f1a2b3c4d5e6f7a8b9c001';
  const ownerId = '64f1a2b3c4d5e6f7a8b9c111';
  const attackerId = '64f1a2b3c4d5e6f7a8b9c222';

  Internship.findById = function() {
    return {
      lean: () => Promise.resolve({
        _id: validPostingId,
        postedBy: ownerId
      })
    };
  };

  try {
    let statusCode = null;
    let jsonResponse = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return res;
      },
      json: (data) => {
        jsonResponse = data;
        return res;
      }
    };

    const req = {
      params: { id: validPostingId },
      user: { id: attackerId, role: 'company' }
    };

    await removeInternship(req, res, () => {});

    assert.strictEqual(statusCode, 403, 'Should reject unauthorized delete with 403');
    assert.strictEqual(jsonResponse.success, false);
    assert.match(jsonResponse.message, /Forbidden.*delete your own internship postings/);
  } finally {
    Internship.findById = originalFindById;
  }
});

test('Company Authorization: removeInternship permits owner to delete posting', async () => {
  const originalFindById = Internship.findById;
  const originalFindByIdAndDelete = Internship.findByIdAndDelete;
  const validPostingId = '64f1a2b3c4d5e6f7a8b9c001';
  const ownerId = '64f1a2b3c4d5e6f7a8b9c111';

  Internship.findById = function() {
    return {
      lean: () => Promise.resolve({
        _id: validPostingId,
        postedBy: ownerId
      })
    };
  };

  let deleteCalled = false;
  Internship.findByIdAndDelete = function(id) {
    deleteCalled = true;
    return Promise.resolve({ _id: id });
  };

  try {
    let statusCode = null;
    let jsonResponse = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return res;
      },
      json: (data) => {
        jsonResponse = data;
        return res;
      }
    };

    const req = {
      params: { id: validPostingId },
      user: { id: ownerId, role: 'company' }
    };

    await removeInternship(req, res, () => {});

    assert.strictEqual(statusCode, 200);
    assert.strictEqual(deleteCalled, true);
    assert.strictEqual(jsonResponse.success, true);
    assert.match(jsonResponse.message, /removed successfully/);
  } finally {
    Internship.findById = originalFindById;
    Internship.findByIdAndDelete = originalFindByIdAndDelete;
  }
});

test('Web Client: internshipService has delete method', () => {
  assert.strictEqual(typeof webInternshipService.delete, 'function');
});
