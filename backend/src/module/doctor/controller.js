import * as doctorService from './service.js';
import * as appointmentService from '../appointment/service.js';
import * as patientRepo from '../patient/repositries.js';
import patientProfileModel from '../../model/patientProfile.js';
import userModel from '../../model/user.js';
import { emitAppointmentUpdated, emitDoctorCreated } from '../../socket.js';

const createDoctor = async (req, res) => {
    const result = await doctorService.createDoctor(req.body);
    if (result?.error) {
        return res.status(400).json(result);
    }
    emitDoctorCreated(result);
    res.status(201).json(result);
};

const getAllDoctors = async (req, res) => {
    const result = await doctorService.getAllDoctors();
    if (result?.error) {
        return res.status(400).json(result);
    }
    res.json(result);
};

const getMyProfile = async (req, res) => {
    try {
        const user = res.locals.user;

        if (!user || !user.id) {
            return res.status(401).json({
                error: true,
                message: 'User not found in token'
            });
        }

        const result = await doctorService.getMyProfile(user.id);

        if (result?.error) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (err) {
        res.status(500).json({
            error: true,
            message: err.message
        });
    }
};

const updateDoctorProfile = async (req, res) => {
    try {
        const user = res.locals.user;

        if (!user || !user.id) {
            return res.status(401).json({
                error: true,
                message: 'User not found in token'
            });
        }

        const result = await doctorService.updateDoctorProfile(user.id, req.body);

        if (result?.error) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (err) {
        res.status(500).json({
            error: true,
            message: err.message
        });
    }
};

const changePassword = async (req, res) => {
    try {
        const user = res.locals.user;
        const { newPassword } = req.body;

        if (!user || !user.id) {
            return res.status(401).json({
                error: true,
                message: 'User not found in token'
            });
        }

        const result = await doctorService.changePassword(user.id, newPassword);

        if (result?.error) {
            return res.status(400).json(result);
        }

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (err) {
        res.status(500).json({
            error: true,
            message: err.message
        });
    }
};

const getMyAppointments = async (req, res) => {
    try {
        const user = res.locals.user;
        const result = await appointmentService.getDoctorAppointments(user.id);

        if (result?.error) {
            return res.status(400).json(result);
        }

        // shaped to match what the doctor dashboard's appointments component expects
        const shaped = result.map((appt) => ({
            id: appt._id,
            patient_id: appt.patientId?._id,
            patient_name: appt.patientId?.fullName,
            date: appt.date,
            time: appt.time,
            status: appt.status
        }));

        res.json(shaped);
    } catch (err) {
        res.status(500).json({
            error: true,
            message: err.message
        });
    }
};

const completeAppointment = async (req, res) => {
    try {
        const user = res.locals.user;
        const { id } = req.params;

        const result = await appointmentService.completeAppointment(id, user.id);

        if (result?.error) {
            return res.status(400).json(result);
        }

        emitAppointmentUpdated(result);
        res.json(result);
    } catch (err) {
        res.status(500).json({
            error: true,
            message: err.message
        });
    }
};

const getPatientProfile = async (req, res) => {
    try {
        const { patientId } = req.params;

        const profile = await patientProfileModel.findOne({ userId: patientId });
        const user = await userModel.findById(patientId).select('fullName email');

        const result = {
            ...(profile ? profile.toObject() : {}),
            name: profile?.fullName || user?.fullName || '',
            fullName: profile?.fullName || user?.fullName || '',
            email: user?.email || ''
        };

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
};

const getPatientReports = async (req, res) => {
    try {
        const { patientId } = req.params;
        const reports = await patientRepo.getReports(patientId);

        if (reports?.error) {
            return res.status(400).json(reports);
        }

        const shaped = reports.map((rep) => {
            const obj = rep.toObject ? rep.toObject() : rep;
            return {
                id: obj._id,
                fileName: obj.fileName,
                fileType: obj.fileType,
                aiSummary: obj.aiSummary || {},
                uploadStatus: obj.uploadStatus,
                createdAt: obj.createdAt
            };
        });

        res.json({ reports: shaped });
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
};

export {
    createDoctor,
    getAllDoctors,
    getMyProfile,
    updateDoctorProfile,
    changePassword,
    getMyAppointments,
    completeAppointment,
    getPatientProfile,
    getPatientReports
};