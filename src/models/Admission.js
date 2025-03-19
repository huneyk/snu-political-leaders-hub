import mongoose from 'mongoose';

const targetSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  }
});

const subsectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  }
});

const sectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  subsections: [subsectionSchema],
  targets: [targetSchema]
});

const admissionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  term: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: true
  },
  startMonth: {
    type: String,
    required: true
  },
  endMonth: {
    type: String,
    required: true
  },
  capacity: {
    type: String,
    required: true
  },
  sections: [sectionSchema]
}, {
  timestamps: true
});

export default mongoose.model('Admission', admissionSchema); 