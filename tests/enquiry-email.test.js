import test from 'node:test';
import assert from 'node:assert/strict';
import { sendEnquiryEmail } from '../lib/enquiry-email.js';

const enquiry = {
  id: '42', name: 'Website test', email: 'visitor@example.com', projectType: 'Furniture',
  message: 'Phone: 0000000000\nCity: Karachi\n\nA clearly labelled website test.',
};
const config = { apiKey: 'test-only', domain: 'juniperhomes.pk', pause: async () => {} };

test('routes the complete enquiry to Shama with visitor reply-to', async () => {
  let sent;
  const id = await sendEnquiryEmail(enquiry, { ...config, fetchEmail: async (url, options) => {
    sent = { url, options, body: JSON.parse(options.body) };
    return Response.json({ id: 'message-test' });
  } });
  assert.equal(id, 'message-test');
  assert.equal(sent.url, 'https://api.resend.com/emails');
  assert.deepEqual(sent.body.to, ['shamaamin69@gmail.com']);
  assert.equal(sent.body.reply_to, 'visitor@example.com');
  assert.equal(sent.body.from, 'Juniper Homes <enquiries@juniperhomes.pk>');
  assert.ok(sent.body.text.includes(enquiry.message));
});

test('retries a transient failure with the same idempotency key', async () => {
  const keys = [];
  const id = await sendEnquiryEmail(enquiry, { ...config, fetchEmail: async (url, options) => {
    keys.push(options.headers['Idempotency-Key']);
    return keys.length === 1 ? new Response(null, { status: 503 }) : Response.json({ id: 'retried' });
  } });
  assert.equal(id, 'retried');
  assert.deepEqual(keys, ['juniper-enquiry/42', 'juniper-enquiry/42']);
});

test('retries a connection error and limits attempts', async () => {
  let calls = 0;
  await assert.rejects(sendEnquiryEmail(enquiry, { ...config, fetchEmail: async () => {
    calls++;
    throw new Error('network failure');
  } }), /connection failed/);
  assert.equal(calls, 2);
});

test('does not retry permanent errors or expose the provider response', async () => {
  let calls = 0;
  await assert.rejects(sendEnquiryEmail(enquiry, { ...config, fetchEmail: async () => {
    calls++;
    return Response.json({ message: enquiry.email }, { status: 403 });
  } }), { message: 'Email service returned status 403' });
  assert.equal(calls, 1);
});

test('rejects missing credentials before sending', async () => {
  await assert.rejects(sendEnquiryEmail(enquiry, { ...config, apiKey: '' }), /not configured/);
});
