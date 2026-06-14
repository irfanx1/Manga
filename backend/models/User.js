const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin', 'owner'], default: 'user' },
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Manga' }],
  readHistory: [{
    manga: { type: mongoose.Schema.Types.ObjectId, ref: 'Manga' },
    chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' },
    page: { type: Number, default: 1 },
    readAt: { type: Date, default: Date.now }
  }],
  isActive: { type: Boolean, default: true },
  isBanned: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
