import { User } from '../models/User.js';
import { Guest } from '../models/Guest.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ROLES } from '../utils/constants.js';

/**
 * GET /api/profile
 * Returns the current principal's profile (guest or registered user).
 */
export const getProfile = asyncHandler(async (req, res) => {
  if (req.auth.role === ROLES.GUEST) {
    const guest = await Guest.findById(req.auth.id);
    if (!guest) throw ApiError.notFound('Guest session expired');
    return res.json({ success: true, user: guest.toPublic() });
  }

  const user = await User.findById(req.auth.id);
  if (!user) throw ApiError.notFound('User not found');
  res.json({ success: true, user: user.toPublic() });
});

/**
 * PUT /api/profile
 * Update profile fields. Registered users only (enforced by route middleware).
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.auth.id);
  if (!user) throw ApiError.notFound('User not found');

  const { name, bio, status, avatar } = req.body;
  if (name !== undefined) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (status !== undefined) user.status = status;
  if (avatar !== undefined) user.avatar = avatar;

  await user.save();
  res.json({ success: true, user: user.toPublic() });
});
