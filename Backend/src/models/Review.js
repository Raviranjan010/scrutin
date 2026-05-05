const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  review: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
