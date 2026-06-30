import mongoose from 'mongoose';

/**
 * Guests are ephemeral. We persist a thin record so messages can reference a
 * stable id, and let a TTL index reap stale guest documents automatically.
 */
const guestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 40 },
    avatar: { type: String, default: '' },
    lastSeen: { type: Date, default: Date.now },
    // TTL: guest records auto-delete 24h after last activity.
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

guestSchema.methods.toPublic = function toPublic() {
  return {
    id: this._id.toString(),
    name: this.name,
    avatar: this.avatar,
    role: 'guest',
  };
};

export const Guest = mongoose.model('Guest', guestSchema);
