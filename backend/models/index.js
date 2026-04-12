/**
 * models/index.js
 *
 * OOSE Concept: Single Responsibility
 *   - Each model is defined in its own file.
 *   - This file just re-exports them for convenient destructuring.
 *   - No association logic needed here — relationships are embedded in schemas.
 */
const Doctor   = require('./Doctor');
const Hospital = require('./Hospital');
const User     = require('./User');

module.exports = { Doctor, Hospital, User };
