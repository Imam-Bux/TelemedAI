import userModel from '../../model/user.js';
import doctorProfileModel from '../../model/doctorProfile.js';
import bcrypt from 'bcrypt';

const createDoctor = async (payload) => {
    try {
        const hashedPassword = await bcrypt.hash(payload.password, 10);

        const newUser = await userModel.create({
            fullName: payload.fullName,
            email: payload.email,
            password: hashedPassword,
            role: 'doctor',
            mustChangePassword: true
        });

        const newProfile = await doctorProfileModel.create({
            userId: newUser._id,
            specialty: payload.specialty,
            bio: payload.bio || '',
            consultationFee: payload.consultationFee || 0,
            availableTimings: payload.availableTimings || ''
        });

        return {
            user: newUser,
            profile: newProfile,
            tempPassword: payload.password
        };
    } catch (err) {
        return {
            error: true,
            message: err.message
        };
    }
};

const getAllDoctors = async () => {
    try {
        const profiles = await doctorProfileModel.find({}).populate('userId', 'fullName email accountStatus mustChangePassword createdAt');
        return profiles;
    } catch (err) {
        return {
            error: true,
            message: err.message
        };
    }
};

const getMyProfile = async (userId) => {
    try {
        const profile = await doctorProfileModel.findOne({ userId }).populate('userId', 'fullName email');

        if (!profile) {
            return {
                profile: {
                    specialty: '',
                    bio: '',
                    consultationFee: 0,
                    availableTimings: '',
                    availableSlots: []
                }
            };
        }

        return { profile };
    } catch (err) {
        return {
            error: true,
            message: err.message
        };
    }
};

const updateDoctorProfile = async (userId, payload) => {
    try {
        const updateData = {
            specialty: payload.specialty,
            bio: payload.bio,
            consultationFee: payload.consultationFee,
            availableTimings: payload.availableTimings
        };

        // only touch availableSlots if the caller actually sent it
        if (payload.availableSlots !== undefined) {
            updateData.availableSlots = payload.availableSlots;
        }

        const profile = await doctorProfileModel.findOneAndUpdate(
            { userId },
            updateData,
            { new: true, upsert: true }
        );

        return { profile };
    } catch (err) {
        return {
            error: true,
            message: err.message
        };
    }
};

const changePassword = async (userId, newPassword) => {
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            {
                password: hashedPassword,
                mustChangePassword: false
            },
            { new: true }
        );

        return updatedUser;
    } catch (err) {
        return {
            error: true,
            message: err.message
        };
    }
};

export { createDoctor, getAllDoctors, getMyProfile, updateDoctorProfile, changePassword };