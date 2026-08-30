import joi from 'joi';
import * as patientRepo from './repositries.js';

const saveOnboarding = async (payload) => {
    const schema = joi.object({
        userId: joi.string().required(),
        fullName: joi.string().required(),
        age: joi.number().required(),
        gender: joi.string().required(),
        weight: joi.string().required(),
        height: joi.string().required(),
        allergies: joi.string().required(),
        currentMedications: joi.string().required(),
        preExistingConditions: joi.string().required(),
        emergencyContact: joi.string().required(),
        bloodGroup: joi.string().optional().allow(''),
        notes: joi.string().optional().allow(''),
        pastSurgeries: joi.string().optional().allow(''),
        smokingStatus: joi.string().optional().allow('')
    });
    const validation = schema.validate(payload);
    if (validation.error && validation.error.details[0].message) {
        return {
            error: true,
            message: validation.error.details[0].message
        };
    }
    const dbResponse = await patientRepo.saveOnboarding(payload);
    return dbResponse;
};

const getProfile = async (userId) => {
    const schema = joi.string().required();
    const validation = schema.validate(userId);
    if (validation.error) {
        return {
            error: true,
            message: 'Invalid user id'
        };
    }
    const dbResponse = await patientRepo.getProfile(userId);
    if (!dbResponse) {
        return {
            error: true,
            message: 'Profile not found'
        };
    }
    return dbResponse;
};

const saveReport = async (payload) => {
    const schema = joi.object({
        patientId: joi.string().required(),
        fileName: joi.string().required(),
        fileType: joi.string().required(),
        aiSummary: joi.object().required(),
        uploadStatus: joi.string().optional()
    });
    const validation = schema.validate(payload);
    if (validation.error && validation.error.details[0].message) {
        return {
            error: true,
            message: validation.error.details[0].message
        };
    }
    const dbResponse = await patientRepo.saveReport(payload);
    return dbResponse;
};

const getReports = async (patientId) => {
    const schema = joi.string().required();
    const validation = schema.validate(patientId);
    if (validation.error) {
        return {
            error: true,
            message: 'Invalid user id'
        };
    }
    const dbResponse = await patientRepo.getReports(patientId);
    return dbResponse;
};

const getAdminProfiles = async () => {
    const dbResponse = await patientRepo.getAdminProfiles();
    return dbResponse;
};

const getAdminReports = async () => {
    const dbResponse = await patientRepo.getAdminReports();
    return dbResponse;
};

export { saveOnboarding, getProfile, saveReport, getReports, getAdminProfiles, getAdminReports };