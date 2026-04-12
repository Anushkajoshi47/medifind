/**
 * Doctor.js — Mongoose Model
 *
 * OOSE Concepts demonstrated:
 *   - Encapsulation  : Instance method getFullProfile() hides formatting logic inside the object
 *   - Abstraction    : Virtual 'isHighlyRated' exposes a computed property without exposing calculation
 *   - Association    : hospitals field holds ObjectId references → populated via populate()
 */
const mongoose = require('mongoose');
const { Schema } = mongoose;

// ── Sub-schema: hospital slot embedded inside Doctor ──────────────────────────
const HospitalSlotSchema = new Schema(
  {
    hospital:      { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
    visiting_days: { type: [String], default: [] },
    timing:        { type: String, default: '' },
  },
  { _id: false }
);

// ── Main Doctor schema ────────────────────────────────────────────────────────
const DoctorSchema = new Schema(
  {
    name:             { type: String, required: true, trim: true },
    specialization:   { type: String, required: true },
    experience:       { type: Number, required: true, min: 0 },
    education:        { type: String, required: true },
    rating:           { type: Number, default: 0, min: 0, max: 5 },
    reviews_count:    { type: Number, default: 0 },
    latitude:         { type: Number, required: true },
    longitude:        { type: Number, required: true },
    phone:            { type: String, default: '' },
    image_url:        { type: String, default: '' },
    bio:              { type: String, default: '' },
    languages:        { type: [String], default: [] },
    consultation_fee: { type: Number, default: 500 },

    // Association: Doctor → many Hospitals (with scheduling metadata)
    hospitals: [HospitalSlotSchema],
  },
  { timestamps: true }
);

// ── Virtual: Abstraction ──────────────────────────────────────────────────────
DoctorSchema.virtual('isHighlyRated').get(function () {
  return this.rating >= 4.5;
});

// ── Instance Method: Encapsulation ───────────────────────────────────────────
DoctorSchema.methods.getFullProfile = function () {
  return {
    id:               this._id,
    name:             this.name,
    specialization:   this.specialization,
    experience:       this.experience,
    education:        this.education,
    rating:           this.rating,
    reviews_count:    this.reviews_count,
    phone:            this.phone,
    bio:              this.bio,
    languages:        this.languages,
    consultation_fee: this.consultation_fee,
    latitude:         this.latitude,
    longitude:        this.longitude,
    isHighlyRated:    this.isHighlyRated,
    hospitals:        this.hospitals,
  };
};

// Enable virtuals in JSON output
DoctorSchema.set('toJSON', { virtuals: true });
DoctorSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Doctor', DoctorSchema);
