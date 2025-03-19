import mongoose from 'mongoose';

const footerSchema = new mongoose.Schema({
  wordFile: {
    type: String,
    default: ''
  },
  hwpFile: {
    type: String,
    default: ''
  },
  pdfFile: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model('Footer', footerSchema); 