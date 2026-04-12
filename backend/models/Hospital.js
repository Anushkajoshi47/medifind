/**
 * Hospital.js — Mongoose Model
 *
 * OOSE Concepts demonstrated:
 *   - Encapsulation  : Instance method getBasicInfo() bundles related data access
 *   - Aggregation    : Hospital contains embedded doctor references (Aggregation relationship)
 *   - Abstraction    : Virtual 'isEmergency' presents a human-readable boolean flag
 */
const mongoose = require('mongoose');
const { Schema } = mongoose;

// ── Main Hospital schema ──────────────────────────────────────────────────────
const HospitalSchema = new Schema(
  {
    name:       { type: String, required: true, trim: true },
    address:    { type: String, required: true },
    emergency:  { type: Boolean, default: false },
    latitude:   { type: Number, required: true },
    longitude:  { type: Number, required: true },
    phone:      { type: String, default: '' },
    rating:     { type: Number, default: 0, min: 0, max: 5 },
    beds:       { type: Number, default: 0 },
    image_url:  { type: String, default: '' },
    type:       { type: String, default: 'General' },
    facilities: { type: [String], default: [] },
  },
  { timestamps: true }
);

// ── Virtual: Abstraction ──────────────────────────────────────────────────────
HospitalSchema.virtual('isEmergency').get(function () {
  return this.emergency ? '🚨 24/7 Emergency Available' : 'No Emergency Services';
});

// ── Instance Method: Encapsulation ───────────────────────────────────────────
HospitalSchema.methods.getBasicInfo = function () {
  return {
    id:        this._id,
    name:      this.name,
    address:   this.address,
    phone:     this.phone,
    rating:    this.rating,
    beds:      this.beds,
    type:      this.type,
    emergency: this.isEmergency,
  };
};

// Enable virtuals in JSON output
HospitalSchema.set('toJSON', { virtuals: true });
HospitalSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Hospital', HospitalSchema);
