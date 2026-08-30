import joi from 'joi';
import * as chatRepo from './repositories.js';

const roomIdSchema = joi.string().required();

const getOrCreateRoom = async (appointmentId, currentUser) => {
    const validation = roomIdSchema.validate(appointmentId);
    if (validation.error) {
        return { error: true, message: validation.error.details[0].message };
    }

    const result = await chatRepo.getOrCreateRoomForAppointment(appointmentId);
    if (result?.error) {
        return result;
    }

    const room = result.room;
    if (currentUser.role !== 'admin') {
        const isParticipant =
            String(room.patientId) === String(currentUser.id) ||
            String(room.doctorId) === String(currentUser.id);
        if (!isParticipant) {
            return { error: true, message: 'You are not part of this chat' };
        }
    }

    return result;
};

const sendMessage = async (roomId, currentUser, message) => {
    const schema = joi.object({
        roomId: roomIdSchema,
        message: joi.string().trim().min(1).required()
    });
    const validation = schema.validate({ roomId, message });
    if (validation.error) {
        return { error: true, message: validation.error.details[0].message };
    }

    const senderRole = currentUser.role === 'doctor' ? 'doctor' : 'patient';
    const result = await chatRepo.addMessageToRoom(roomId, currentUser.id, senderRole, message);
    return result;
};

const getAdminRooms = async () => {
    return chatRepo.getAllRooms();
};

const getMyRooms = async (currentUser) => {
    return chatRepo.getUserRooms(currentUser.id);
};

const getAdminRoom = async (roomId) => {
    const validation = roomIdSchema.validate(roomId);
    if (validation.error) {
        return { error: true, message: validation.error.details[0].message };
    }
    return chatRepo.getRoomFull(roomId);
};

export { getOrCreateRoom, sendMessage, getAdminRooms, getAdminRoom, getMyRooms };
