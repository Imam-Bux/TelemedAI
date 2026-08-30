import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
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
    date: {
        type: String, // 'YYYY-MM-DD'
        required: true
    },
    time: {
        type: String, // e.g. '09:00 AM'
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Cancelled'],
        default: 'Pending'
    }
}, { timestamps: true });

// prevents two patients ever booking the exact same doctor/date/time slot
appointmentSchema.index({ doctorId: 1, date: 1, time: 1 }, { unique: true });

const appointmentModel = mongoose.models.appointment || mongoose.model('appointment', appointmentSchema);

export default appointmentModel;