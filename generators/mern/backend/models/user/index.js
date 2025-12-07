// generators/mern/backend/model/user.js

async function mongoose(ctx = {}) {
  const content = `// src/models/user.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.statics.findByCredentials = async function(email, password) {
  const user = await this.findOne({ email });
  if (!user) throw new Error('Invalid credentials');

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error('Invalid credentials');

  return user;
};

module.exports = mongoose.model('User', UserSchema);
`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return mongoose(ctx);
}

module.exports = {
  mongoose,
  default: defaultVariant,
};
