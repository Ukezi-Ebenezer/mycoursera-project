'use strict';

const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    amountPaid: {
      type: Number,
      required: [true, 'Amount paid is required'],
      min: [0, 'Amount paid cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
      trim: true,
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['free', 'paid', 'refunded'],
        message: '{VALUE} is not a valid payment status',
      },
      required: [true, 'Payment status is required'],
    },
    paymentReference: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'completed', 'dropped'],
        message: '{VALUE} is not a valid enrollment status',
      },
      default: 'active',
    },
    progress: {
      type: Number,
      min: [0, 'Progress cannot be less than 0'],
      max: [100, 'Progress cannot exceed 100'],
      default: 0,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    droppedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// ── Compound & query indexes ──────────────────────────────────────────────────
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ course: 1, status: 1 });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

module.exports = Enrollment;
