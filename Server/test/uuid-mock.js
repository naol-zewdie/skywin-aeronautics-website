const crypto = require('crypto');
module.exports = {
  v4: () => crypto.randomUUID(),
  validate: (uuid) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid)
};
