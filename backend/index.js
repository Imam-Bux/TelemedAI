import 'dotenv/config';
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { initSocket } from './src/socket.js';
import authRoute from './src/module/auth/route.js';
import patientRoute from './src/module/patient/route.js';
import doctorRoute from './src/module/doctor/route.js';
import appointmentRoute from './src/module/appointment/route.js';
import chatRoute from './src/module/chat/route.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRoute);
app.use('/patient', patientRoute);
app.use('/doctor', doctorRoute);
app.use('/appointment', appointmentRoute);
app.use('/chat', chatRoute);

mongoose.connect(process.env.MONGODB_URI, {
    family: 4
})
.then(() => {
    console.log('Database connected');
})
.catch((err) => {
    console.error('Database connection error:', err);
});

app.get('/', (req, res) => {
    res.send('Server is running!');
});

const server = http.createServer(app);
initSocket(server);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

export default app;