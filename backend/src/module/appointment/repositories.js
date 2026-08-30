import mongoose from 'mongoose';
import appointmentModel from '../../model/appointmentModel.js';
import doctorProfileModel from '../../model/doctorProfile.js';

const DAY_INDEX = {
    sun: 0, sunday: 0,
    mon: 1, monday: 1,
    tue: 2, tuesday: 2,
    wed: 3, wednesday: 3,
    thu: 4, thursday: 4,
    fri: 5, friday: 5,
    sat: 6, saturday: 6
};

const parseTimeString = (t) => {
    const trimmed = String(t).trim().toLowerCase();
    const match = trimmed.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
    if (!match) return null;
    let hours = parseInt(match[1], 10);
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    const ampm = match[3];
    if (ampm === 'pm' && hours < 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;
    if (!ampm && hours < 8) hours += 12;
    return hours * 60 + minutes;
};

const formatSlot = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    const mm = String(m).padStart(2, '0');
    return `${hour12}:${mm} ${ampm}`;
};

const parseDays = (dayPart) => {
    const days = new Set();
    const ranges = String(dayPart).toLowerCase().replace(/\s+/g, ' ').split(',');
    for (const part of ranges) {
        const trimmed = part.trim();
        if (!trimmed) continue;
        const rangeMatch = trimmed.match(/^([a-z]+)\s*(?:-|to|–)\s*([a-z]+)$/);
        if (rangeMatch) {
            const start = DAY_INDEX[rangeMatch[1]];
            const end = DAY_INDEX[rangeMatch[2]];
            if (start === undefined || end === undefined) continue;
            let i = start;
            while (true) {
                days.add(i);
                if (i === end) break;
                i = (i + 1) % 7;
            }
        } else {
            const name = trimmed.replace(/\./g, '').trim();
            const idx = DAY_INDEX[name];
            if (idx !== undefined) days.add(idx);
        }
    }
    return [...days].sort((a, b) => a - b);
};

const parseSchedule = (profile) => {
    if (Array.isArray(profile.availableSlots) && profile.availableSlots.length > 0) {
        const strings = profile.availableSlots.map((s) => String(s).trim()).filter(Boolean);
        return { days: [0, 1, 2, 3, 4, 5, 6], slots: strings };
    }

    const text = String(profile.availableTimings || '').trim();
    if (!text) return { days: [], slots: [] };

    const timePattern = /(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*(?:-|to|–)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i;
    const timeMatch = text.match(timePattern);
    if (!timeMatch) return { days: [], slots: [] };

    const dayPart = text.slice(0, timeMatch.index).trim();
    const days = parseDays(dayPart);

    const slots = [];
    const start = parseTimeString(timeMatch[1]);
    const end = parseTimeString(timeMatch[2]);
    if (start !== null && end !== null && end > start) {
        for (let minutes = start; minutes < end; minutes += 60) {
            slots.push(formatSlot(minutes));
        }
    }

    return { days, slots };
};

const findDoctorProfile = async (doctorId) => {
    let profile = await doctorProfileModel.findOne({ userId: doctorId });

    if (!profile && mongoose.Types.ObjectId.isValid(doctorId)) {
        profile = await doctorProfileModel.findById(doctorId);
    }

    return profile;
};

const getDoctorSchedule = async (doctorId) => {
    const profile = await findDoctorProfile(doctorId);
    if (!profile) {
        return { error: true, message: 'Doctor not found' };
    }
    return parseSchedule(profile);
};

const getDoctorSlotsForDate = async (doctorId, date) => {
    try {
        const profile = await findDoctorProfile(doctorId);
        if (!profile) {
            return { error: true, message: 'Doctor not found' };
        }

        const schedule = parseSchedule(profile);
        const allSlots = schedule.slots;
        if (allSlots.length === 0) {
            return { error: true, message: 'Doctor not found' };
        }

        const weekday = new Date(date + 'T00:00:00').getDay();
        if (!schedule.days.includes(weekday)) {
            return { error: true, message: 'Doctor not found' };
        }

        const bookedAppointments = await appointmentModel.find({
            doctorId,
            date,
            status: { $ne: 'Cancelled' }
        });

        const bookedTimes = bookedAppointments.map((a) => a.time);
        const availableSlots = allSlots.filter((slot) => !bookedTimes.includes(slot));

        return availableSlots;
    } catch (err) {
        return { error: true, message: err.message };
    }
};

const createAppointment = async (payload) => {
    try {
        const appointment = await appointmentModel.create(payload);
        return appointment;
    } catch (err) {
        if (err.code === 11000) {
            return {
                error: true,
                message: 'That slot was just booked by someone else. Please pick another.'
            };
        }
        return { error: true, message: err.message };
    }
};

const getPatientAppointments = async (patientId) => {
    try {
        const appointments = await appointmentModel
            .find({ patientId })
            .populate('doctorId', 'fullName email')
            .sort({ date: 1, time: 1 });
        return appointments;
    } catch (err) {
        return { error: true, message: err.message };
    }
};

const getDoctorAppointments = async (doctorId) => {
    try {
        const appointments = await appointmentModel
            .find({ doctorId })
            .populate('patientId', 'fullName email')
            .sort({ date: 1, time: 1 });
        return appointments;
    } catch (err) {
        return { error: true, message: err.message };
    }
};

const getAllAppointments = async () => {
    try {
        const appointments = await appointmentModel
            .find({})
            .populate('doctorId', 'fullName email')
            .populate('patientId', 'fullName email')
            .sort({ date: 1, time: 1 });

        const doctorProfiles = await doctorProfileModel.find({}).lean();
        const feeByDoctor = {};
        for (const p of doctorProfiles) {
            feeByDoctor[String(p.userId)] = p.consultationFee || 0;
        }

        const enriched = appointments.map((a) => {
            const obj = a.toObject();
            obj.appointmentId = String(a._id);
            obj.consultationFee = feeByDoctor[String(a.doctorId?._id)] || 0;
            return obj;
        });

        return enriched;
    } catch (err) {
        return { error: true, message: err.message };
    }
};

const setAppointmentStatus = async (appointmentId, doctorId, status) => {
    try {
        const appointment = await appointmentModel.findOneAndUpdate(
            { _id: appointmentId, doctorId },
            { status },
            { new: true }
        );
        if (!appointment) {
            return { error: true, message: 'Appointment not found' };
        }
        return appointment;
    } catch (err) {
        return { error: true, message: err.message };
    }
};

export {
    getDoctorSlotsForDate,
    getDoctorSchedule,
    createAppointment,
    getPatientAppointments,
    getDoctorAppointments,
    getAllAppointments,
    setAppointmentStatus
};