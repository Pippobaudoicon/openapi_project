import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  action: { type: String, required: true },
  description: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  ipAddress: String,
  userAgent: String
}, { timestamps: true });

activitySchema.statics.log = async function({ userId, type, action, description, metadata = {}, req }) {
  if (!userId) throw new Error('Activity.log: userId is required');
  const castUserId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
  const activity = new this({
    userId: castUserId,
    type,
    action,
    description,
    metadata,
    ipAddress: req?.ip || req?.connection?.remoteAddress,
    userAgent: req?.get?.('User-Agent')
  });
  return activity.save();
};

activitySchema.statics.getRecent = function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'name email')
    .lean();
};

export default mongoose.model('Activity', activitySchema);
