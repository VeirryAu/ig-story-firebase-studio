/**
 * Artillery processor for generating auth headers
 */

function generateAuthHeaders(context, events, done) {
  const userId = context.vars.user_ids[
    Math.floor(Math.random() * context.vars.user_ids.length)
  ];
  const timestamp = new Date().toISOString();
  const sign = Buffer.from(timestamp + userId).toString('base64');
  
  context.vars.timestamp = timestamp;
  context.vars.userId = userId;
  context.vars.sign = sign;
  
  return done();
}

module.exports = {
  generateAuthHeaders,
};

