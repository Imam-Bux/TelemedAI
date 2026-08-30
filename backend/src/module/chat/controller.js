import * as chatService from './service.js';
import { emitChatMessage, emitRoomCreated } from '../../socket.js';

const getOrCreateRoom = async (req, res) => {
    const currentUser = res.locals.user;
    const result = await chatService.getOrCreateRoom(req.params.appointmentId, currentUser);
    if (result?.error) {
        return res.status(400).json(result);
    }
    if (result?.created) {
        emitRoomCreated(result.room);
    }
    res.json(result);
};

const sendMessage = async (req, res) => {
    const currentUser = res.locals.user;
    const { roomId } = req.params;
    const { message } = req.body;
    const result = await chatService.sendMessage(roomId, currentUser, message);
    if (result?.error) {
        return res.status(400).json(result);
    }
    if (result?.message) {
        emitChatMessage(roomId, result.message);
    }
    res.status(201).json(result);
};

const getAdminRooms = async (req, res) => {
    const result = await chatService.getAdminRooms();
    if (result?.error) {
        return res.status(400).json(result);
    }
    res.json(result);
};

const getMyRooms = async (req, res) => {
    const currentUser = res.locals.user;
    const result = await chatService.getMyRooms(currentUser);
    if (result?.error) {
        return res.status(400).json(result);
    }
    res.json(result);
};

const getAdminRoom = async (req, res) => {
    const result = await chatService.getAdminRoom(req.params.roomId);
    if (result?.error) {
        return res.status(400).json(result);
    }
    res.json(result);
};

export { getOrCreateRoom, sendMessage, getAdminRooms, getAdminRoom, getMyRooms };
