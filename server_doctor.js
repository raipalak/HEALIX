const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Helper to read JSON data from the main project data folder
const getDataPath = (filename) => path.join(__dirname, 'src', 'data', filename);

const readData = (filename) => {
    try {
        const data = fs.readFileSync(getDataPath(filename), 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error reading ${filename}:`, err);
        return [];
    }
};

const writeData = (filename, data) => {
    try {
        fs.writeFileSync(getDataPath(filename), JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error(`Error writing ${filename}:`, err);
        return false;
    }
};

// --- API ENDPOINTS ---

// 1. Dashboard Stats (Using shared hospital data)
app.get('/api/doctor/stats', (req, res) => {
    const patients = readData('patients.json');
    const appointments = readData('appointments.json');
    
    // Simulate real-time stats
    const stats = {
        totalPatients: patients.length,
        todayAppointments: appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length || 8,
        pendingReports: 5,
        emergencyCases: patients.filter(p => p.status === 'Critical').length
    };
    res.json(stats);
});

// 2. Patient Management (CRUD) sync with Admin Portal data
app.get('/api/doctor/patients', (req, res) => {
    const patients = readData('patients.json');
    res.json(patients);
});

app.post('/api/doctor/patients', (req, res) => {
    const patients = readData('patients.json');
    const newPatient = {
        patientId: `PAT${1000 + patients.length + 1}`,
        ...req.body,
        createdAt: new Date().toISOString()
    };
    patients.push(newPatient);
    writeData('patients.json', patients);
    res.status(201).json(newPatient);
});

// 3. Appointments CRUD
app.get('/api/doctor/appointments', (req, res) => {
    const appointments = readData('appointments.json');
    res.json(appointments);
});

app.put('/api/doctor/appointments/:id', (req, res) => {
    const appointments = readData('appointments.json');
    const index = appointments.findIndex(a => a.id === req.params.id || a.appointmentId === req.params.id);
    if (index !== -1) {
        appointments[index] = { ...appointments[index], ...req.body };
        writeData('appointments.json', appointments);
        res.json(appointments[index]);
    } else {
        res.status(404).json({ message: 'Appointment not found' });
    }
});

// 4. Emergency CRUD
app.get('/api/doctor/emergencies', (req, res) => {
    const patients = readData('patients.json');
    const emergencies = patients.filter(p => p.status === 'Critical');
    res.json(emergencies);
});

app.listen(PORT, () => {
    console.log(`Doctor Portal Backend running at http://localhost:${PORT}`);
});
