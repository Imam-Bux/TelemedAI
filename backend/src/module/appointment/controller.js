import * as appointmentService from './service.js';

const getAvailableSlots = async (req, res) => {
    const { doctorId } = req.params;
    const { date } = req.query;
    const result = await appointmentService.getAvailableSlots(doctorId, date);
    if (result?.error) {
        return res.status(400).json(result);
    }
    res.json(result);
};

const getDoctorSchedule = async (req, res) => {
    const { doctorId } = req.params;
    const result = await appointmentService.getDoctorSchedule(doctorId);
    if (result?.error) {
        return res.status(400).json(result);
    }
    res.json(result);
};

const bookAppointment = async (req, res) => {
    const user = res.locals.user;
    const result = await appointmentService.bookAppointment(user.id, req.body);
    if (result?.error) {
        return res.status(400).json(result);
    }
    res.status(201).json(result);
};

const getMyAppointments = async (req, res) => {
    const user = res.locals.user;
    const result = await appointmentService.getMyAppointments(user.id);
    if (result?.error) {
        return res.status(400).json(result);
    }
    res.json(result);
};

const getAllAppointments = async (req, res) => {
    const result = await appointmentService.getAllAppointments();
    if (result?.error) {
        return res.status(400).json(result);
    }
    res.json(result);
};

export { getAvailableSlots, getDoctorSchedule, bookAppointment, getMyAppointments, getAllAppointments };