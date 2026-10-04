const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false }, // not required -> allows OAuth users
    authProvider: { type: String, enum: ['local', 'google', 'linkedin'], default: 'local' },
    providerId: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    avatarUrl: { type: String, default: '' },
    location: { type: String, default: '' },
    targetRole: { type: String, default: '' },
    education: [
      {
        school: String,
        degree: String,
        field: String,
        startYear: Number,
        endYear: Number,
      },
    ],
    experience: [
      {
        company: String,
        title: String,
        startDate: String,
        endDate: String,
        description: String,
      },
    ],
    projects: [
      {
        name: String,
        description: String,
        skills: [String],
        link: String,
      },
    ],
    certifications: [
      {
        name: String,
        issuer: String,
        year: Number,
      },
    ],
    socialLinks: {
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' },
      portfolio: { type: String, default: '' },
    },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
