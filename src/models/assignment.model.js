import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true,
    },
    task: {
        type: String,
        required: true,
        maxlength: 255, // Optional: limit the length of the task
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
    },
    username: {
        type: String, // New field to store the username
        required: true,
    },
}, { timestamps: true });

// Optional: Adding indexes
assignmentSchema.index({ adminId: 1 });
assignmentSchema.index({ userId: 1 });

const Assignment = mongoose.model('Assignment', assignmentSchema);
export default Assignment;
