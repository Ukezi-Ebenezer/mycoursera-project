'use strict';

const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    price: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative'],
    },
    tags: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      trim: true,
      default: '',
    },
    level: {
      type: String,
      trim: true,
      default: '',
    },
    availability: {
      type: Boolean,
      default: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes for query performance ─────────────────────────────────────────────
courseSchema.index({ createdAt: -1 });
courseSchema.index({ category: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ availability: 1 });
courseSchema.index({ title: 1 });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
