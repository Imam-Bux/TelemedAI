import mongoose from 'mongoose';

const patientProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    weight: {
        type: String,
        required: true
    },
    height: {
        type: String,
        required: true
    },
    allergies: {
        type: String,
        required: true
    },
    currentMedications: {
        type: String,
        required: true
    },
    preExistingConditions: {
        type: String,
        required: true
    },
    emergencyContact: {
        type: String,
        required: true
    },
    bloodGroup: {
        type: String
    },
    notes: {
        type: String
    },
    pastSurgeries: {
        type: String
    },
    smokingStatus: {
        type: String
    },
    completedOnboarding: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const patientProfileModel = mongoose.model('patientProfile', patientProfileSchema);

export default patientProfileModel;