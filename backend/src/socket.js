import { Server } from 'socket.io';

let io = null;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: 'http://localhost:3000',
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        const { userId, role } = socket.handshake.auth || {};
        if (userId) {
            socket.data.userId = String(userId);
            socket.data.role = role || null;
            socket.join(`user:${String(userId)}`);
        }
        if (role === 'admin') {
            socket.join('admins');
        }
    });

    return io;
};

const getIO = () => io;

const emitAppointmentBooked = (appointment) => {
    if (!io) return;
    const doctorId = appointment?.doctorId ? String(appointment.doctorId) : null;
    if (doctorId) {
        io.to(`user:${doctorId}`).emit('appointment:booked', { appointment });
    }
    io.to('admins').emit('appointment:booked', { appointment });
};

const emitAppointmentUpdated = (appointment) => {
    if (!io) return;
    const doctorId = appointment?.doctorId ? String(appointment.doctorId) : null;
    const patientId = appointment?.patientId ? String(appointment.patientId) : null;
    if (doctorId) io.to(`user:${doctorId}`).emit('appointment:updated', { appointment });
    if (patientId) io.to(`user:${patientId}`).emit('appointment:updated', { appointment });
    io.to('admins').emit('appointment:updated', { appointment });
};

const emitChatMessage = (roomId, message) => {
    if (!io) return;
    io.to('admins').emit('chat:message', { roomId: String(roomId), message });
    const patientId = message?.patientId;
    const doctorId = message?.doctorId;
    [patientId, doctorId].forEach((id) => {
        if (id) io.to(`user:${String(id)}`).emit('chat:message', { roomId: String(roomId), message });
    });
};

const emitRoomCreated = (room) => {
    if (!io) return;
    const roomData = {
        id: room?.id ? String(room.id) : null,
        appointmentId: room?.appointmentId ? String(room.appointmentId) : null,
        patientId: room?.patientId ? String(room.patientId) : null,
        doctorId: room?.doctorId ? String(room.doctorId) : null
    };
    [roomData.patientId, roomData.doctorId].forEach((id) => {
        if (id) io.to(`user:${id}`).emit('chat:room-created', { room: roomData });
    });
    io.to('admins').emit('chat:room-created', { room: roomData });
};

const emitReportCreated = (report) => {
    if (!io) return;
    const patientId = report?.patientId ? String(report.patientId) : null;
    if (patientId) io.to(`user:${patientId}`).emit('report:created', { report });
    io.to('admins').emit('report:created', { report });
};

const emitProfileUpdated = (profile) => {
    if (!io) return;
    io.to('admins').emit('patient:profile-updated', { profile });
};

const emitDoctorCreated = (doctor) => {
    if (!io) return;
    io.to('admins').emit('doctor:created', { doctor });
};

export {
    initSocket,
    getIO,
    emitAppointmentBooked,
    emitAppointmentUpdated,
    emitChatMessage,
    emitRoomCreated,
    emitReportCreated,
    emitProfileUpdated,
    emitDoctorCreated
};
