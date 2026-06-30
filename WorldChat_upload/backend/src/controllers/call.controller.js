import { Call } from '../models/Call.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { CALL_STATUS } from '../utils/constants.js';

/**
 * POST /api/call
 * Persist a call record. Real signaling happens over Socket.IO; this endpoint
 * creates the call log / history entry. Registered users only.
 */
export const createCall = asyncHandler(async (req, res) => {
  const { receiverId, callType } = req.body;

  const receiver = await User.findById(receiverId).lean();
  if (!receiver) throw ApiError.notFound('Receiver not found');

  const call = await Call.create({
    callerId: req.auth.id,
    callerName: req.auth.name,
    receiverId,
    receiverName: receiver.name,
    callType,
    status: CALL_STATUS.RINGING,
  });

  res.status(201).json({ success: true, call: { id: call._id.toString(), ...call.toObject() } });
});

/**
 * GET /api/call/history
 * Recent calls involving the current user.
 */
export const getCallHistory = asyncHandler(async (req, res) => {
  const me = req.auth.id;
  const calls = await Call.find({ $or: [{ callerId: me }, { receiverId: me }] })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  res.json({ success: true, calls });
});
