import { User } from '../models/User.js';
import { Guest } from '../models/Guest.js';
import { verifyFirebaseToken, isFirebaseConfigured } from '../config/firebase.js';
import { signUserToken, signGuestToken } from '../utils/jwt.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * POST /api/auth/google
 * Verify a Firebase Google ID token, upsert the user, and issue an app JWT.
 */
export const googleAuth = asyncHandler(async (req, res) => {
  if (!isFirebaseConfigured) {
    throw ApiError.badRequest('Google authentication is not configured on the server');
  }

  const { idToken } = req.body;
  const decoded = await verifyFirebaseToken(idToken);

  const { uid, email, name, picture } = decoded;
  if (!email) throw ApiError.badRequest('Google account did not return an email');

  let user = await User.findOne({ firebaseUid: uid });
  if (!user) {
    user = await User.create({
      firebaseUid: uid,
      email,
      name: name || email.split('@')[0],
      avatar: picture || '',
    });
  } else {
    // Keep avatar/name fresh from the provider if the user has not customized them.
    if (picture && !user.avatar) user.avatar = picture;
    user.lastSeen = new Date();
    await user.save();
  }

  const token = signUserToken({ id: user._id.toString(), name: user.name });
  res.json({ success: true, token, user: user.toPublic() });
});

/**
 * POST /api/guest
 * Create an ephemeral guest identity and issue a short-lived JWT.
 */
export const createGuest = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const guest = await Guest.create({ name });
  const token = signGuestToken({ id: guest._id.toString(), name: guest.name });

  res.status(201).json({ success: true, token, user: guest.toPublic() });
});
