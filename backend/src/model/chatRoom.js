import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    senderRole: {
        type: String,
        enum: ['patient', 'doctor'],
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true });

const chatRoomSchema = new mongoose.Schema({
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'appointment',
        required: true,
        unique: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    messages: [chatMessageSchema],
    status: {
        type: String,
        enum: ['open', 'closed'],
        default: 'open'
    }
}, { timestamps: true });

const chatRoomModel = mongoose.models.chatRoom || mongoose.model('chatRoom', chatRoomSchema);

export default chatRoomModel;
