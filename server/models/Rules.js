const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  items: {
    type: [String],
    default: []
  },
  order: {
    type: Number,
    default: 0
  }
}, { _id: true });

const rulesSchema = new mongoose.Schema({
  introText: {
    type: String,
    default: ''
  },
  articles: {
    type: [articleSchema],
    default: []
  },
  externalLinkText: {
    type: String,
    default: ''
  },
  externalLinkUrl: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'rules',
  strict: false
});

module.exports = mongoose.model('Rules', rulesSchema);
