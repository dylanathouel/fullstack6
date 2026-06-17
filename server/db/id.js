const crypto = require('crypto');

// Single source of truth for primary-key generation.
// UUID v4: 128 random bits, non-guessable — prevents ID enumeration.
function generateId() {
  return crypto.randomUUID();
}

module.exports = { generateId };
