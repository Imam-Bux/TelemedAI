import chatRoomModel from '../../model/chatRoom.js';
import appointmentModel from '../../model/appointmentModel.js';
import userModel from '../../model/user.js';

const attachSenderNames = async (messages) => {
    const senderIds = [...new Set(messages.map((m) => String(m.senderId)))];
    const users = await userModel.find({ _id: { $in: senderIds } }).select('fullName email role');
    const nameById = {};
    for (const u of users) {
        nameById[String(u._id)] = u.fullName;
    }
    return messages.map((m) => ({
        id: m._id,
        senderId: m.senderId,
        senderRole: m.senderRole || '',
        senderName: nameById[String(m.senderId)] || (m.senderRole === 'doctor' ? 'Doctor' : 'Patient'),
        message: m.message,
        createdAt: m.createdAt
    }));
};

const getOrCreateRoomForAppointment = async (appointmentId) => {
    try {
        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment) {
            return { error: true, message: 'Appointment not found' };
        }

        let room = await chatRoomModel.findOne({ appointmentId });
        let created = false;
        if (!room) {
            room = await chatRoomModel.create({
                appointmentId,
                patientId: appointment.patientId,
                doctorId: appointment.doctorId
            });
            created = true;
        }

        const rawMessages = room.messages
            .map((m) => ({
                id: m._id,
                senderId: m.senderId,
                senderRole: m.senderRole,
                message: m.message,
                createdAt: m.createdAt
            }))
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        const messages = await attachSenderNames(rawMessages);

        return {
            room: {
                id: room._id,
                appointmentId: room.appointmentId,
                patientId: room.patientId,
                doctorId: room.doctorId,
                status: room.status
            },
            messages,
            created
        };
    } catch (err) {
        return { error: true, message: err.message };
    }
};

const addMessageToRoom = async (roomId, senderId, senderRole, message) => {
    try {
        const room = await chatRoomModel.findById(roomId);
        if (!room) {
            return { error: true, message: 'Chat room not found' };
        }

        const isParticipant =
            String(room.patientId) === String(senderId) ||
            String(room.doctorId) === String(senderId);
        if (!isParticipant) {
            return { error: true, message: 'You are not part of this chat' };
        }

        room.messages.push({
            senderId,
            senderRole,
            message
        });
        await room.save();

        const saved = room.messages[room.messages.length - 1];
        const sender = await userModel.findById(senderId).select('fullName');
        return {
            message: {
                id: saved._id,
                senderId: saved.senderId,
                senderRole: saved.senderRole,
                senderName: sender?.fullName || (senderRole === 'doctor' ? 'Doctor' : 'Patient'),
                message: saved.message,
                createdAt: saved.createdAt,
                roomId: room._id,
                patientId: room.patientId,
                doctorId: room.doctorId
            }
        };
    } catch (err) {
        return { error: true, message: err.message };
    }
};

const getAllRooms = async () => {
    try {
        const rooms = await chatRoomModel
            .find({})
            .populate('patientId', 'fullName email')
            .populate('doctorId', 'fullName email')
            .sort({ updatedAt: -1 });

        return rooms.map((room) => {
            const messages = room.messages || [];
            const last = messages[messages.length - 1];
            return {
                id: room._id,
                appointmentId: room.appointmentId,
                patient: room.patientId
                    ? { id: room.patientId._id, fullName: room.patientId.fullName, email: room.patientId.email }
                    : null,
                doctor: room.doctorId
                    ? { id: room.doctorId._id, fullName: room.doctorId.fullName, email: room.doctorId.email }
                    : null,
                messageCount: messages.length,
                lastMessage: last ? last.message : null,
                lastMessageAt: last ? last.createdAt : room.createdAt,
                status: room.status,
                createdAt: room.createdAt
            };
        });
    } catch (err) {
        return { error: true, message: err.message };
    }
};

const getUserRooms = async (userId) => {
    try {
        const rooms = await chatRoomModel
            .find({ $or: [{ patientId: userId }, { doctorId: userId }] })
            .populate('appointmentId', 'date time status')
            .populate('patientId', 'fullName email')
            .populate('doctorId', 'fullName email')
            .sort({ updatedAt: -1 });

        return rooms.map((room) => {
            const messages = room.messages || [];
            const last = messages[messages.length - 1];
            const isPatient = String(room.patientId?._id) === String(userId);
            return {
                id: room._id,
                appointmentId: room.appointmentId?._id || room.appointmentId,
                appointment: room.appointmentId
                    ? { date: room.appointmentId.date, time: room.appointmentId.time, status: room.appointmentId.status }
                    : null,
                role: isPatient ? 'patient' : 'doctor',
                patient: room.patientId
                    ? { id: room.patientId._id, fullName: room.patientId.fullName, email: room.patientId.email }
                    : null,
                doctor: room.doctorId
                    ? { id: room.doctorId._id, fullName: room.doctorId.fullName, email: room.doctorId.email }
                    : null,
                messageCount: messages.length,
                lastMessage: last ? last.message : null,
                lastMessageAt: last ? last.createdAt : room.createdAt,
                status: room.status
            };
        });
    } catch (err) {
        return { error: true, message: err.message };
    }
};

const getRoomFull = async (roomId) => {    try {
        const room = await chatRoomModel
            .findById(roomId)
            .populate('patientId', 'fullName email')
            .populate('doctorId', 'fullName email')
            .populate('appointmentId', 'date time status');

        if (!room) {
            return { error: true, message: 'Chat room not found' };
        }

        const rawMessages = (room.messages || [])
            .map((m) => ({
                id: m._id,
                senderId: m.senderId,
                senderRole: m.senderRole,
                message: m.message,
                createdAt: m.createdAt
            }))
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        const messages = await attachSenderNames(rawMessages);

        return {
            room: {
                id: room._id,
                appointmentId: room.appointmentId,
                appointment: room.appointmentId
                    ? { date: room.appointmentId.date, time: room.appointmentId.time, status: room.appointmentId.status }
                    : null,
                patient: room.patientId
                    ? { id: room.patientId._id, fullName: room.patientId.fullName, email: room.patientId.email }
                    : null,
                doctor: room.doctorId
                    ? { id: room.doctorId._id, fullName: room.doctorId.fullName, email: room.doctorId.email }
                    : null,
                status: room.status
            },
            messages
        };
    } catch (err) {
        return { error: true, message: err.message };
    }
};

export { getOrCreateRoomForAppointment, addMessageToRoom, getAllRooms, getRoomFull, getUserRooms };
