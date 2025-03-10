const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['greeting', 'recommendations', 'courseGoals', 'courseBenefits', 'curriculum']
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
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

// updatedAt 필드 자동 업데이트
ContentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Content', ContentSchema); 