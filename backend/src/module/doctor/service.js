import joi from 'joi';
import * as doctorRepo from './repositories.js';
import crypto from 'crypto';

const generateRandomPassword = () => {
    return crypto.randomBytes(4).toString('hex') + 'A1!';
};

const createDoctor = async (payload) => {
    const schema = joi.object({
        fullName: joi.string().required(),
        email: joi.string().email().required(),
        specialty: joi.string().required(),
        bio: joi.string().optional().allow(''),
        consultationFee: joi.number().optional(),
        availableTimings: joi.string().optional().allow('')
    });

    const validation = schema.validate(payload);

    if (validation.error) {
        return {
            error: true,
            message: validation.error.details[0].message
        };
    }

    const tempPassword = generateRandomPassword();
    const doctorData = { ...payload, password: tempPassword };
    const result = await doctorRepo.createDoctor(doctorData);

    return result;
};

const getAllDoctors = async () => {
    const result = await doctorRepo.getAllDoctors();
    return result;
};

const getMyProfile = async (userId) => {
    if (!userId) {
        return {
            error: true,
            message: 'User ID is required'
        };
    }

    const result = await doctorRepo.getMyProfile(userId);
    return result;
};

const updateDoctorProfile = async (userId, payload) => {
    if (!userId) {
        return {
            error: true,
            message: 'User ID is required'
        };
    }

    const schema = joi.object({
        specialty: joi.string().required(),
        bio: joi.string().optional().allow(''),
        consultationFee: joi.number().required(),
        availableTimings: joi.string().required(),
        availableSlots: joi.array().items(joi.string()).optional()
    });

    const validation = schema.validate(payload);

    if (validation.error) {
        return {
            error: true,
            message: validation.error.details[0].message
        };
    }

    const result = await doctorRepo.updateDoctorProfile(userId, payload);
    return result;
};

const changePassword = async (userId, newPassword) => {
    if (!userId) {
        return {
            error: true,
            message: 'User ID is required'
        };
    }

    const schema = joi.string().min(6).required();
    const validation = schema.validate(newPassword);

    if (validation.error) {
        return {
            error: true,
            message: 'Password must be at least 6 characters long'
        };
    }

    const result = await doctorRepo.changePassword(userId, newPassword);
    return result;
};

export { createDoctor, getAllDoctors, getMyProfile, updateDoctorProfile, changePassword };