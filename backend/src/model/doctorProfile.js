import mongoose from 'mongoose';

const doctorProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        unique: true
    },
    specialty: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        default: ''
    },
    consultationFee: {
        type: Number,
        default: 0
    },
    availableTimings: {
        type: String,
        default: ''
    },
    // structured list of bookable time slots, e.g. ["09:00 AM", "10:00 AM"]
    availableSlots: {
        type: [String],
        default: []
    },
    activeStatus: {
        type: Boolean,
        default: true
    },
    createdByAdmin: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const doctorProfileModel = mongoose.models.doctorProfile || mongoose.model('doctorProfile', doctorProfileSchema);

export default doctorProfileModel;