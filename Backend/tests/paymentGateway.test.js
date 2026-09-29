const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
function load(env) {
  for (const [key, value] of Object.entries(env)) process.env[key] = value;
  delete require.cache[require.resolve('../utils/paymentGateway')];
  return require('../utils/paymentGateway');
}
test('unsigned Easypaisa return cannot enable checkout or approve a payment', () => {
  const gateway = load({ PAYMENT_PROVIDER: 'easypaisa', EASYPAISA_STORE_ID: 'store', EASYPAISA_HASH_KEY: '1234567890123456' });
  assert.equal(gateway.enabled, false);
  assert.equal(gateway.verifyReturn({ status: 'PAID', orderRefNum: 'forged', transactionId: 'fake' }).valid, false);
});
test('generic adapter requires a webhook secret and validates exact raw-body signatures', () => {
  let gateway = load({ PAYMENT_PROVIDER: 'bridge', PAYMENT_API_KEY: 'test', PAYMENT_CREATE_URL: 'https://example.invalid', PAYMENT_WEBHOOK_SECRET: '' });
  assert.equal(gateway.enabled, false);
  gateway = load({ PAYMENT_WEBHOOK_SECRET: 'test-webhook-secret' });
  const raw = Buffer.from('{"reference":"TR-test","status":"paid","amount":1000,"currency":"PKR","transaction_id":"txn-1"}');
  const signature = crypto.createHmac('sha256', 'test-webhook-secret').update(raw).digest('hex');
  assert.equal(gateway.verifySignature(raw, signature), true);
  assert.equal(gateway.verifySignature(Buffer.from(raw.toString() + ' '), signature), false);
  assert.equal(gateway.verifySignature(null, signature), false);
  assert.deepEqual(gateway.parseWebhook(JSON.parse(raw)), { ref: 'TR-test', success: true, status: 'paid', txnId: 'txn-1', amount: 1000, currency: 'PKR' });
  assert.ok(Number.isNaN(gateway.parseWebhook({ status: 'paid' }).amount));
});
test('JazzCash verifies merchant, signed amount and currency and rejects altered callbacks', () => {
  const gateway = load({ PAYMENT_PROVIDER: 'jazzcash', JAZZCASH_MERCHANT_ID: 'merchant', JAZZCASH_PASSWORD: 'test', JAZZCASH_INTEGRITY_SALT: 'salt' });
  const params = { pp_MerchantID: 'merchant', pp_ResponseCode: '000', pp_BillReference: 'TR-test', pp_TxnRefNo: 'txn', pp_Amount: '100000', pp_TxnCurrency: 'PKR' };
  params.pp_SecureHash = crypto.createHmac('sha256', 'salt').update('salt&' + Object.keys(params).sort().map(key => params[key]).join('&')).digest('hex');
  assert.equal(gateway.verifyReturn(params).valid, true);
  assert.equal(gateway.verifyReturn(params).amount, 1000);
  assert.equal(gateway.verifyReturn({ ...params, pp_Amount: '1' }).valid, false);
  assert.equal(gateway.verifyReturn({ ...params, pp_SecureHash: 'ع'.repeat(64) }).valid, false);
});
