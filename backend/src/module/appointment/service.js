import joi from 'joi';
import * as appointmentRepo from './repositories.js';

const dateSchema = joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required();

const getAvailableSlots = async (doctorId, date) => {
    const schema = joi.object({
        doctorId: joi.string().required(),
        date: dateSchema
    });
    const validation = schema.validate({ doctorId, date });
    if (validation.error) {
        return { error: true, message: validation.error.details[0].message };
    }

    const result = await appointmentRepo.getDoctorSlotsForDate(doctorId, date);
    return result;
};

const getDoctorSchedule = async (doctorId) => {
    const schema = joi.object({
        doctorId: joi.string().required()
    });
    const validation = schema.validate({ doctorId });
    if (validation.error) {
        return { error: true, message: validation.error.details[0].message };
    }

    const result = await appointmentRepo.getDoctorSchedule(doctorId);
    return result;
};

const bookAppointment = async (patientId, payload) => {
    const schema = joi.object({
        doctorId: joi.string().required(),
        date: dateSchema,
        time: joi.string().required()
    });
    const validation = schema.validate(payload);
    if (validation.error) {
        return { error: true, message: validation.error.details[0].message };
    }

    const availableSlots = await appointmentRepo.getDoctorSlotsForDate(payload.doctorId, payload.date);
    if (availableSlots?.error) {
        return availableSlots;
    }
    if (!availableSlots.includes(payload.time)) {
        return { error: true, message: 'This slot is no longer available' };
    }

    const result = await appointmentRepo.createAppointment({
        patientId,
        doctorId: payload.doctorId,
        date: payload.date,
        time: payload.time
    });
    return result;
};

const getMyAppointments = async (patientId) => {
    const result = await appointmentRepo.getPatientAppointments(patientId);
    return result;
};

const getDoctorAppointments = async (doctorId) => {
    const result = await appointmentRepo.getDoctorAppointments(doctorId);
    return result;
};

const getAllAppointments = async () => {
    const result = await appointmentRepo.getAllAppointments();
    return result;
};

const completeAppointment = async (appointmentId, doctorId) => {
    const result = await appointmentRepo.setAppointmentStatus(appointmentId, doctorId, 'Completed');
    return result;
};

export {
    getAvailableSlots,
    getDoctorSchedule,
    bookAppointment,
    getMyAppointments,
    getDoctorAppointments,
    getAllAppointments,
    completeAppointment
};