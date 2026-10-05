import assert from 'node:assert/strict';
import { CmsService } from '../dist/modules/cms/cms.service.js';

const service = new CmsService();
const isPublic = (address) => service.isPublicUnicastAddress(address);
const normalize = (domain) => service.normalizeCustomDomain(domain);

assert.equal(isPublic('8.8.8.8'), true);
assert.equal(isPublic('127.0.0.1'), false);
assert.equal(isPublic('10.20.30.40'), false);
assert.equal(isPublic('172.16.0.1'), false);
assert.equal(isPublic('192.168.1.1'), false);
assert.equal(isPublic('169.254.169.254'), false);
assert.equal(isPublic('::1'), false);
assert.equal(isPublic('fe80::1'), false);
assert.equal(isPublic('fd00::1'), false);
assert.equal(isPublic('::ffff:127.0.0.1'), false);

assert.equal(normalize('Member.Example.id'), 'member.example.id');
assert.throws(() => normalize('localhost'));
assert.throws(() => normalize('127.0.0.1'));
assert.throws(() => normalize('fraksi.go.id'));
assert.throws(() => normalize('sub.polaris.id'));
assert.throws(() => normalize('https://member.example.id/path'));

console.log('DNS SSRF address and custom-domain validation checks passed');