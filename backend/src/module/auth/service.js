import joi from 'joi';
import * as authRepo from './repositries.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const signUP = async (payload) => {
    const signUpSchema = joi.object({
        fullName: joi.string().required(),
        email: joi.string().email().required(),
        password: joi.string().min(6).max(32).required()
    });
    const res = signUpSchema.validate(payload);
    if (res.error && res.error.details[0].message) {
        return { error: true, message: res.error.details[0].message };
    }
    const isEmailExists = await getUserbyEmail(payload.email);
    if (isEmailExists) {
        return { error: true, message: "Email already exists" };
    }
    payload.role = 'patient';
    const hashPassword = await bcrypt.hash(payload.password, 10);
    payload.password = hashPassword;
    const dbResponse = await authRepo.signUp(payload);
    if (dbResponse?.error) {
        return dbResponse;
    }

    const jwtSecret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_2024_myclinic_doctor_portal';
    const userId = String(dbResponse._id);
    const token = jwt.sign({
        userId,
        id: userId,
        email: dbResponse.email,
        fullName: dbResponse.fullName,
        role: dbResponse.role,
        mustChangePassword: dbResponse.mustChangePassword || false
    }, jwtSecret, { expiresIn: '7d' });

    return {
        token,
        completedOnboarding: false,
        mustChangePassword: dbResponse.mustChangePassword || false,
        user: {
            id: dbResponse._id,
            email: dbResponse.email,
            fullName: dbResponse.fullName,
            role: dbResponse.role,
            mustChangePassword: dbResponse.mustChangePassword || false
        }
    };
};

const getUserbyEmail = async (email) => {
    const data = await authRepo.getUserbyEmail(email);
    return data;
};

const login = async (payload) => {
    const loginSchema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().min(6).max(32).required()
    });
    const response = loginSchema.validate(payload);
    if (response.error && response.error.details[0].message) {
        return { error: true, message: response.error.details[0].message };
    }
    const isEmailExists = await getUserbyEmail(payload.email);
    if (!isEmailExists) {
        return { error: true, message: "Invalid email or password" };
    }
    const isPasswordMatch = await bcrypt.compare(payload.password, isEmailExists.password);
    if (!isPasswordMatch) {
        return { error: true, message: "Invalid email or password" };
    }

    const jwtSecret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_2024_myclinic_doctor_portal';

    const userId = String(isEmailExists._id);

    const token = jwt.sign({
        userId,
        id: userId,
        email: isEmailExists.email,
        fullName: isEmailExists.fullName,
        role: isEmailExists.role,
        mustChangePassword: isEmailExists.mustChangePassword || false
    }, jwtSecret, { expiresIn: '7d' });

    let completedOnboarding = false;
    try {
        const profile = await mongoose.connection.db.collection('patientprofiles').findOne({
            $or: [
                { patientId: isEmailExists._id },
                { userId: isEmailExists._id }
            ]
        });
        completedOnboarding = !!profile;
    } catch (err) {
        completedOnboarding = false;
    }

    return {
        token,
        completedOnboarding,
        mustChangePassword: isEmailExists.mustChangePassword,
        user: {
            id: isEmailExists._id,
            email: isEmailExists.email,
            fullName: isEmailExists.fullName,
            role: isEmailExists.role,
            mustChangePassword: isEmailExists.mustChangePassword
        }
    };
};

const getUserProfile = async (id) => {
    const data = await authRepo.getUserById(id);
    return data;
};

const deleteUserAccount = async (id) => {
    const data = await authRepo.deleteUser(id);
    if (!data) {
        return { error: true, message: "User not found" };
    }
    return { success: true, message: "User deleted successfully", data };
};

export { signUP, login, getUserProfile, deleteUserAccount };