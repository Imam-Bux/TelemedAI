import patientProfileModel from '../../model/patientProfile.js';
import medicalReportModel from './medicalReportModel.js';

const saveOnboarding = async (payload) => {
    try {
        const profile = await patientProfileModel.findOneAndUpdate(
            { userId: payload.userId },
            payload,
            { upsert: true, new: true }
        );
        return profile;
    } catch (err) {
        return {
            error: true,
            message: err.message
        };
    }
};

const getProfile = async (userId) => {
    try {
        const profile = await patientProfileModel.findOne({ userId });
        return profile;
    } catch (err) {
        return {
            error: true,
            message: err.message
        };
    }
};

const saveReport = async (payload) => {
    try {
        const report = await medicalReportModel.create(payload);
        return report;
    } catch (err) {
        return {
            error: true,
            message: err.message
        };
    }
};

const getReports = async (patientId) => {
    try {
        const reports = await medicalReportModel.find({ patientId });
        return reports;
    } catch (err) {
        return {
            error: true,
            message: err.message
        };
    }
};

const getAdminProfiles = async () => {
    try {
        const profiles = await patientProfileModel.find({});
        return profiles;
    } catch (err) {
        return {
            error: true,
            message: err.message
        };
    }
};

const getAdminReports = async () => {
    try {
        const reports = await medicalReportModel.find({});
        return reports;
    } catch (err) {
        return {
            error: true,
            message: err.message
        };
    }
};

export { saveOnboarding, getProfile, saveReport, getReports, getAdminProfiles, getAdminReports };