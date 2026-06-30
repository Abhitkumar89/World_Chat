import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 200 },
    status: { type: String, default: 'Hey there! I am using WorldChat.', maxlength: 120 },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.methods.toPublic = function toPublic() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    bio: this.bio,
    status: this.status,
    role: 'user',
    lastSeen: this.lastSeen,
    createdAt: this.createdAt,
  };
};

export const User = mongoose.model('User', userSchema);
