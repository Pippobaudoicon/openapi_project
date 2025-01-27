import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
    id: { type: mongoose.Schema.Types.ObjectId },
    roleName: { type: String, required: true, unique: true },
    permissions: { type: [String], required: true }
});

export default mongoose.model('Role', roleSchema);