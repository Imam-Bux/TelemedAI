import mongoose from 'mongoose';

const medicalReportSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        required: true
    },
    aiSummary: {
        type: Object,
        required: true
    },
    uploadStatus: {
        type: String,
        default: 'Completed'
    }
}, { timestamps: true });

const medicalReportModel = mongoose.model('medicalReport', medicalReportSchema);

export default medicalReportModel;