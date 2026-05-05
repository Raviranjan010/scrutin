const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() { return this.provider === 'local'; }
  },
  githubId: {
    type: String,
    unique: true,
    sparse: true
  },
  username: String,
  isPro: {
    type: Boolean,
    default: false
  },
  provider: {
    type: String,
    enum: ['local', 'github'],
    default: 'local'
  },
  usage: {
    type: Map,
    of: Number,
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
