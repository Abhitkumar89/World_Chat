import mongoose from 'mongoose';
import { CALL_TYPES, CALL_STATUS } from '../utils/constants.js';

const callSchema = new mongoose.Schema(
  {
    callerId: { type: String, required: true, index: true },
    callerName: { type: String, required: true },
    receiverId: { type: String, required: true, index: true },
    receiverName: { type: String, default: '' },
    callType: { type: String, enum: Object.values(CALL_TYPES), required: true },
    status: {
      type: String,
      enum: Object.values(CALL_STATUS),
      default: CALL_STATUS.RINGING,
    },
    startedAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
    durationSec: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Call = mongoose.model('Call', callSchema);
