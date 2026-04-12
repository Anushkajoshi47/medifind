/**
 * User.js — Mongoose Model
 *
 * OOSE Concepts demonstrated:
 *   - Encapsulation  : toSafeObject() hides password from external callers
 *   - Single Responsibility : User model manages only user data + auth helpers
 */
const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },

    // Bookmark lists (Association by reference)
    bookmarked_doctors:   [{ type: Schema.Types.ObjectId, ref: 'Doctor' }],
    bookmarked_hospitals: [{ type: Schema.Types.ObjectId, ref: 'Hospital' }],
  },
  { timestamps: true }
);

// ── Instance Method: Encapsulation ───────────────────────────────────────────
// Strips sensitive fields before returning to the client
UserSchema.methods.toSafeObject = function () {
  return {
    id:                   this._id,
    name:                 this.name,
    email:                this.email,
    bookmarked_doctors:   this.bookmarked_doctors,
    bookmarked_hospitals: this.bookmarked_hospitals,
    createdAt:            this.createdAt,
  };
};

module.exports = mongoose.model('User', UserSchema);
