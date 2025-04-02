import mongoose from 'mongoose';

const footerSchema = new mongoose.Schema({
  wordFile: {
    type: String,
    default: ''
  },
  wordFileName: {
    type: String,
    default: ''
  },
  hwpFile: {
    type: String,
    default: ''
  },
  hwpFileName: {
    type: String,
    default: ''
  },
  pdfFile: {
    type: String,
    default: ''
  },
  pdfFileName: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: 'plp@snu.ac.kr'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Footer', footerSchema); 