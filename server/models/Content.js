const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['greeting', 'recommendations', 'objectives', 'benefits', 'professors', 'schedules']
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
  },
  signText: {
    type: String
  },
  category: {
    type: String,
    enum: ['spring', 'fall']
  },
  term: {
    type: Number,
    min: 1,
    max: 4
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

contentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Content', contentSchema); 