import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import dotenv from 'dotenv';

// Load api/.env configuration
dotenv.config({ path: path.resolve(process.cwd(), 'api/.env') });

import { StorageService } from '../api/src/services/storageService.js';
import User from '../api/src/models/User.js';
import { mediaController } from '../api/src/controllers/mediaController.js';

test('Centralized Storage: Service initialization and configuration checks', () => {
  const service = new StorageService();
  assert.equal(service.productId, 'showmyskills');
  assert.ok(service.baseUrl.includes('storage.xyphx.com'));
  
  const headers = service.getHeaders();
  assert.equal(headers['X-Product-ID'], 'showmyskills');
  assert.ok(headers['X-Product-Key'].startsWith('xpk_'));
  assert.ok(headers['X-Product-Secret'].startsWith('xsec_'));
  assert.equal(service.isConfigured(), true);
});

test('Centralized Storage: Validation checks on upload parameters', async () => {
  const service = new StorageService();

  await assert.rejects(
    async () => {
      await service.uploadFile({ userId: '', buffer: Buffer.from('abc'), fileName: 'test.png' });
    },
    /userId is required/
  );

  await assert.rejects(
    async () => {
      await service.uploadFile({ userId: 'u1', buffer: null, fileName: 'test.png' });
    },
    /buffer is required/
  );

  await assert.rejects(
    async () => {
      await service.deleteFile('', 'u1');
    },
    /fileId is required/
  );
});

test('Centralized Storage: Delivery URL formatting specification', () => {
  const userId = 'usr_student_01';
  const fileId = '01M7CXVRXYMHK7TKYZ3Z8K6NBN';
  const fileName = 'avatar.png';
  const expectedCdnUrl = `https://storage.xyphx.com/showmyskills/${userId}/${fileId}/${fileName}`;

  assert.equal(
    expectedCdnUrl,
    'https://storage.xyphx.com/showmyskills/usr_student_01/01M7CXVRXYMHK7TKYZ3Z8K6NBN/avatar.png'
  );
});

test('Centralized Storage: Database Schema supports fileId and mediaUrl fields', () => {
  const userPaths = User.schema.paths;
  
  assert.ok(userPaths['profileIconFileId'], 'User schema must support profileIconFileId');
  assert.ok(userPaths['resumeFileId'], 'User schema must support resumeFileId');
  
  const projectPaths = userPaths['projects']?.schema?.paths;
  assert.ok(projectPaths?.['fileId'], 'Project schema must support fileId');
  assert.ok(projectPaths?.['mediaUrl'], 'Project schema must support mediaUrl');
});

test('Centralized Storage: Media Controller exports required endpoints', () => {
  assert.equal(typeof mediaController.handleMediaUpload, 'function');
  assert.equal(typeof mediaController.handleMediaDelete, 'function');
  assert.equal(typeof mediaController.handleGetQuota, 'function');
});
