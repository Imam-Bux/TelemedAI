import Groq from 'groq-sdk';
import PDFParser from 'pdf2json';
import * as patientService from './service.js';
import { emitProfileUpdated, emitReportCreated } from '../../socket.js';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || undefined
});

const parsePdfBuffer = (buffer) => {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, 1);
        pdfParser.on("pdfParser_dataError", (err) => reject(err.parserError));
        pdfParser.on("pdfParser_dataReady", () => {
            resolve(pdfParser.getRawTextContent());
        });
        pdfParser.parseBuffer(buffer);
    });
};

const saveOnboarding = async (req, res) => {
    const user = res.locals.user;
    const payload = {
        userId: user.id,
        fullName: req.body.fullName,
        age: req.body.age,
        gender: req.body.gender,
        weight: req.body.weight,
        height: req.body.height,
        allergies: req.body.allergies,
        currentMedications: req.body.currentMedications,
        preExistingConditions: req.body.preExistingConditions,
        emergencyContact: req.body.emergencyContact,
        bloodGroup: req.body.bloodGroup,
        notes: req.body.notes,
        pastSurgeries: req.body.pastSurgeries,
        smokingStatus: req.body.smokingStatus
    };
    const result = await patientService.saveOnboarding(payload);
    if (result?.error) {
        return res.status(400).json(result);
    }
    emitProfileUpdated(result);
    res.json(result);
};

const getProfile = async (req, res) => {
    const user = res.locals.user;
    const result = await patientService.getProfile(user.id);
    if (result?.error) {
        return res.status(400).json(result);
    }
    res.json(result);
};

const saveReport = async (req, res) => {
    const user = res.locals.user;
    if (!req.file) {
        return res.status(400).json({ error: true, message: 'No file uploaded' });
    }

    try {
        const extractedText = await parsePdfBuffer(req.file.buffer);

        const prompt = "Act as a medical assistant. Explain this medical report in simple, easy-to-understand language for a patient. Avoid complex terminology and summarize key findings, possible concerns, and general meaning. Return the response as a JSON object with keys summary, keyFindings, and concerns.";

        const completion = await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages: [{ role: "user", content: `${prompt}\n\nReport Text:\n${extractedText}` }],
            response_format: { type: "json_object" }
        });

        const aiSummary = JSON.parse(completion.choices[0].message.content || "{}");

        const payload = {
            patientId: user.id,
            fileName: req.file.originalname,
            fileType: req.file.mimetype,
            aiSummary: aiSummary,
            uploadStatus: 'Completed'
        };

        const result = await patientService.saveReport(payload);
        if (result?.error) {
            return res.status(400).json(result);
        }
        emitReportCreated(result);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
};

const getReports = async (req, res) => {
    const user = res.locals.user;
    const result = await patientService.getReports(user.id);
    if (result?.error) {
        return res.status(400).json(result);
    }
    res.json(result);
};

const getAdminProfiles = async (req, res) => {
    const result = await patientService.getAdminProfiles();
    if (result?.error) {
        return res.status(400).json(result);
    }
    res.json(result);
};

const getAdminReports = async (req, res) => {
    const result = await patientService.getAdminReports();
    if (result?.error) {
        return res.status(400).json(result);
    }
    res.json(result);
};

export { saveOnboarding, getProfile, saveReport, getReports, getAdminProfiles, getAdminReports };