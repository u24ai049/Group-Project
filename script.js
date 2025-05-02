document.addEventListener('DOMContentLoaded', function() {
    try {
        init();
        setupSearchAndFilters();
        setupNotifications();
        setupModalInteractions();
        setupViewButtons();
        setupFormValidation();
    } catch (error) {
        console.error('Initialization error:', error);
        alert('System error: Please check console for details');
    }
});

// Data Models
let patients = JSON.parse(localStorage.getItem('patients')) || [];
let doctors = JSON.parse(localStorage.getItem('doctors')) || [];
let staff = JSON.parse(localStorage.getItem('staff')) || [];
let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
let medicalRecords = JSON.parse(localStorage.getItem('medicalRecords')) || [];
let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
let wards = JSON.parse(localStorage.getItem('wards')) || [];
let bills = JSON.parse(localStorage.getItem('bills')) || [];
let activityLog = JSON.parse(localStorage.getItem('activityLog')) || [];

// DOM Elements
const pageTitle = document.getElementById('page-title');
const navLinks = document.querySelectorAll('nav ul li a');
const contentSections = document.querySelectorAll('.content-section');

// Utility Functions
function generateId() {
    return 'ID' + Math.random().toString(36).substr(2, 9);
}

function calculateAge(dob) {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatTime(timeStr) {
    if (!timeStr) return 'N/A';
    const [hours, minutes] = timeStr.split(':');
    const hoursNum = parseInt(hours, 10);
    const period = hoursNum >= 12 ? 'PM' : 'AM';
    const formattedHours = hoursNum % 12 || 12;
    return `${formattedHours}:${minutes} ${period}`;
}

function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return 'N/A';
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

function formatCurrency(amount) {
    if (!amount && amount !== 0) return 'N/A';
    return `$${parseFloat(amount).toFixed(2)}`;
}

function addActivity(message) {
    const activity = {
        message,
        timestamp: new Date().toISOString()
    };
    activityLog.unshift(activity);
    if (activityLog.length > 50) activityLog.pop();
    localStorage.setItem('activityLog', JSON.stringify(activityLog));
    updateDashboard();
}

function highlightUpdate(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add('updated');
        setTimeout(() => element.classList.remove('updated'), 1000);
    }
}

// Initialize the application
function init() {
    if (patients.length === 0) {
        loadSampleData();
    }
    setupNavigation();
    setupPatientManagement();
    setupAppointmentManagement();
    setupMedicalRecordManagement();
    setupDoctorManagement();
    setupStaffManagement();
    setupInventoryManagement();
    setupWardManagement();
    setupBillingManagement();
    updateDashboard();
    loadPatientsTable();
    loadAppointmentsTable();
    loadMedicalRecordsTable();
    loadDoctorsTable();
    loadStaffTable();
    loadInventoryTable();
    loadWardsTable();
    loadBillsTable();
    populatePatientSelects();
    populateDoctorSelects();
    showSection('dashboard');
}

// Sample Data
function loadSampleData() {
    patients = [
        {
            id: generateId(),
            firstName: 'John',
            lastName: 'Doe',
            dob: '1985-06-15',
            gender: 'male',
            address: '123 Main St',
            phone: '555-0123',
            email: 'john.doe@example.com',
            bloodGroup: 'O+',
            allergies: 'None',
            medicalHistory: 'Hypertension',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];
    doctors = [
        {
            id: generateId(),
            firstName: 'Sarah',
            lastName: 'Smith',
            specialization: 'Cardiologist',
            phone: '555-0456',
            email: 'sarah.smith@example.com',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];
    staff = [
        {
            id: generateId(),
            firstName: 'Emma',
            lastName: 'Wilson',
            role: 'Nurse',
            department: 'General',
            phone: '555-0789',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];
    appointments = [
        {
            id: generateId(),
            patientId: patients[0].id,
            doctorId: doctors[0].id,
            date: new Date().toISOString().split('T')[0],
            time: '10:00',
            status: 'scheduled',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];
    medicalRecords = [
        {
            id: generateId(),
            patientId: patients[0].id,
            date: new Date().toISOString().split('T')[0],
            diagnosis: 'Hypertension',
            treatment: 'Prescribed Lisinopril',
            notes: 'Follow-up in 1 month',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];
    inventory = [
        {
            id: generateId(),
            name: 'Aspirin',
            category: 'Medication',
            quantity: 100,
            unitPrice: 0.10,
            description: 'Pain relief medication',
            status: 'available',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];
    wards = [
        {
            id: generateId(),
            number: '101',
            type: 'General',
            capacity: 4,
            patientId: null,
            status: 'available',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];
    bills = [
        {
            id: generateId(),
            patientId: patients[0].id,
            amount: 150.00,
            date: new Date().toISOString().split('T')[0],
            description: 'Consultation fee',
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];
    localStorage.setItem('patients', JSON.stringify(patients));
    localStorage.setItem('doctors', JSON.stringify(doctors));
    localStorage.setItem('staff', JSON.stringify(staff));
    localStorage.setItem('appointments', JSON.stringify(appointments));
    localStorage.setItem('medicalRecords', JSON.stringify(medicalRecords));
    localStorage.setItem('inventory', JSON.stringify(inventory));
    localStorage.setItem('wards', JSON.stringify(wards));
    localStorage.setItem('bills', JSON.stringify(bills));
}

// Navigation System
function setupNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            link.classList.add('active');
            showSection(sectionId);
        });
    });
}

function showSection(sectionId) {
    contentSections.forEach(section => {
        section.classList.remove('active');
        if (section.id === sectionId) {
            section.classList.add('active');
            pageTitle.textContent = section.querySelector('h2')?.textContent || 'Dashboard';
            updateBreadcrumb(sectionId);
        }
    });
}

function updateBreadcrumb(sectionName) {
    const breadcrumb = document.querySelector('.breadcrumb');
    if (breadcrumb) {
        breadcrumb.innerHTML = `
            <span>Home</span>
            <i class="fas fa-chevron-right"></i>
            <span>${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}</span>
        `;
    }
}

// Dashboard Updates
function updateDashboard() {
    // Update stats
    document.getElementById('total-patients').textContent = patients.length;
    highlightUpdate('total-patients');

    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(a => a.date === today && a.status === 'scheduled').length;
    document.getElementById('today-appointments').textContent = todayAppointments;
    highlightUpdate('today-appointments');

    const availableBeds = wards.filter(w => w.status === 'available').length;
    document.getElementById('available-beds').textContent = availableBeds;
    highlightUpdate('available-beds');

    const totalRevenue = bills.reduce((sum, bill) => bill.status === 'paid' ? sum + bill.amount : sum, 0);
    document.getElementById('revenue').textContent = formatCurrency(totalRevenue);
    highlightUpdate('revenue');

    // Update recent appointments
    const recentAppointments = appointments
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5);
    const recentAppointmentsTable = document.getElementById('recent-appointments');
    if (recentAppointmentsTable) {
        recentAppointmentsTable.innerHTML = recentAppointments.map(appointment => {
            const patient = patients.find(p => p.id === appointment.patientId);
            const doctor = doctors.find(d => d.id === appointment.doctorId);
            return `
                <tr>
                    <td>${patient ? `${patient.firstName} ${patient.lastName}` : 'N/A'}</td>
                    <td>${doctor ? `${doctor.firstName} ${doctor.lastName}` : 'N/A'}</td>
                    <td>${formatTime(appointment.time)}</td>
                    <td><span class="status-badge ${appointment.status}">${appointment.status}</span></td>
                    <td>
                        <button class="btn btn-sm" onclick="openAppointmentModal('${appointment.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Update recent patients
    const recentPatients = patients
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5);
    const recentPatientsTable = document.getElementById('recent-patients');
    if (recentPatientsTable) {
        recentPatientsTable.innerHTML = recentPatients.map(patient => {
            const lastRecord = medicalRecords
                .filter(r => r.patientId === patient.id)
                .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            return `
                <tr>
                    <td>${patient.id}</td>
                    <td>${patient.firstName} ${patient.lastName}</td>
                    <td>${patient.gender?.charAt(0).toUpperCase() + patient.gender?.slice(1) || 'N/A'}</td>
                    <td>${lastRecord ? formatDate(lastRecord.date) : 'N/A'}</td>
                    <td>
                        <button class="btn btn-sm" onclick="openPatientModal('${patient.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Update activity log
    const activityLogDiv = document.getElementById('activity-log');
    if (activityLogDiv) {
        activityLogDiv.innerHTML = activityLog.slice(0, 10).map(activity => `
            <div class="activity-item">
                <div class="activity-icon"><i class="fas fa-info-circle"></i></div>
                <div class="activity-content">
                    <div class="activity-message">${activity.message}</div>
                    <div class="activity-time">${formatDateTime(activity.timestamp)}</div>
                </div>
            </div>
        `).join('');
    }
}

// Patient Management
function setupPatientManagement() {
    const addPatientBtn = document.getElementById('add-patient-btn');
    if (addPatientBtn) {
        addPatientBtn.addEventListener('click', () => {
            openPatientModal();
        });
    }

    const patientForm = document.getElementById('patient-form');
    if (patientForm) {
        patientForm.addEventListener('submit', (e) => {
            e.preventDefault();
            savePatient();
        });
    }

    document.querySelectorAll('#patient-modal .close-btn, #patient-modal .close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal('patient-modal');
        });
    });
}

function openPatientModal(patientId = null) {
    const modal = document.getElementById('patient-modal');
    const form = document.getElementById('patient-form');
    if (!modal || !form) return;

    if (patientId) {
        const patient = patients.find(p => p.id === patientId);
        if (patient) {
            document.getElementById('patient-first-name').value = patient.firstName;
            document.getElementById('patient-last-name').value = patient.lastName;
            document.getElementById('patient-dob').value = patient.dob;
            document.getElementById('patient-gender').value = patient.gender;
            document.getElementById('patient-address').value = patient.address;
            document.getElementById('patient-phone').value = patient.phone;
            document.getElementById('patient-email').value = patient.email;
            document.getElementById('patient-blood-group').value = patient.bloodGroup;
            document.getElementById('patient-allergies').value = patient.allergies;
            document.getElementById('patient-medical-history').value = patient.medicalHistory;

            modal.querySelector('h3').textContent = 'Edit Patient';
            form.dataset.patientId = patientId;
        }
    } else {
        form.reset();
        modal.querySelector('h3').textContent = 'Add New Patient';
        delete form.dataset.patientId;
    }

    modal.classList.add('active');
}

function savePatient() {
    const form = document.getElementById('patient-form');
    if (!form) return;

    const patientId = form.dataset.patientId;

    const patientData = {
        id: patientId || generateId(),
        firstName: document.getElementById('patient-first-name').value,
        lastName: document.getElementById('patient-last-name').value,
        dob: document.getElementById('patient-dob').value,
        gender: document.getElementById('patient-gender').value,
        address: document.getElementById('patient-address').value,
        phone: document.getElementById('patient-phone').value,
        email: document.getElementById('patient-email').value,
        bloodGroup: document.getElementById('patient-blood-group').value,
        allergies: document.getElementById('patient-allergies').value,
        medicalHistory: document.getElementById('patient-medical-history').value,
        status: 'active',
        createdAt: patientId ? undefined : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    if (patientId) {
        const index = patients.findIndex(p => p.id === patientId);
        if (index !== -1) {
            patients[index] = { ...patients[index], ...patientData };
            addActivity(`Updated patient: ${patientData.firstName} ${patientData.lastName}`);
        }
    } else {
        patients.push(patientData);
        addActivity(`Added new patient: ${patientData.firstName} ${patientData.lastName}`);
    }

    localStorage.setItem('patients', JSON.stringify(patients));
    loadPatientsTable();
    updateDashboard();
    populatePatientSelects();
    closeModal('patient-modal');
}

function deletePatient(patientId) {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    const hasAppointments = appointments.some(a => a.patientId === patientId);
    const hasRecords = medicalRecords.some(r => r.patientId === patientId);
    const hasBills = bills.some(b => b.patientId === patientId);
    const hasWard = wards.some(w => w.patientId === patientId);
    if (hasAppointments || hasRecords || hasBills || hasWard) {
        alert('Cannot delete patient with existing appointments, medical records, bills, or ward assignments.');
        return;
    }

    if (confirm('Are you sure you want to delete this patient?')) {
        patients = patients.filter(p => p.id !== patientId);
        localStorage.setItem('patients', JSON.stringify(patients));
        addActivity(`Deleted patient: ${patient.firstName} ${patient.lastName}`);
        loadPatientsTable();
        updateDashboard();
        populatePatientSelects();
    }
}

function loadPatientsTable() {
    const tableBody = document.querySelector('#patients-table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    patients.forEach(patient => {
        const age = patient.dob ? calculateAge(patient.dob) : 'N/A';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${patient.id}</td>
            <td>${patient.firstName} ${patient.lastName}</td>
            <td>${age}</td>
            <td>${patient.gender?.charAt(0).toUpperCase() + patient.gender?.slice(1) || 'N/A'}</td>
            <td>${patient.phone || 'N/A'}</td>
            <td><span class="status-badge ${patient.status}">${patient.status}</span></td>
            <td>
                <button class="btn btn-sm" onclick="openPatientModal('${patient.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deletePatient('${patient.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Appointment Management
function setupAppointmentManagement() {
    const addAppointmentBtn = document.getElementById('add-appointment-btn');
    if (addAppointmentBtn) {
        addAppointmentBtn.addEventListener('click', () => {
            openAppointmentModal();
        });
    }

    const appointmentForm = document.getElementById('appointment-form');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveAppointment();
        });
    }

    document.querySelectorAll('#appointment-modal .close-btn, #appointment-modal .close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal('appointment-modal');
        });
    });
}

function openAppointmentModal(appointmentId = null) {
    const modal = document.getElementById('appointment-modal');
    const form = document.getElementById('appointment-form');
    if (!modal || !form) return;

    populatePatientSelects();
    populateDoctorSelects();

    if (appointmentId) {
        const appointment = appointments.find(a => a.id === appointmentId);
        if (appointment) {
            document.getElementById('appointment-patient').value = appointment.patientId;
            document.getElementById('appointment-doctor').value = appointment.doctorId;
            document.getElementById('appointment-date').value = appointment.date;
            document.getElementById('appointment-time').value = appointment.time;
            document.getElementById('appointment-status-select').value = appointment.status;

            modal.querySelector('h3').textContent = 'Edit Appointment';
            form.dataset.appointmentId = appointmentId;
        }
    } else {
        form.reset();
        modal.querySelector('h3').textContent = 'Add New Appointment';
        delete form.dataset.appointmentId;
    }

    modal.classList.add('active');
}

function saveAppointment() {
    const form = document.getElementById('appointment-form');
    if (!form) return;

    const appointmentId = form.dataset.appointmentId;

    const appointmentData = {
        id: appointmentId || generateId(),
        patientId: document.getElementById('appointment-patient').value,
        doctorId: document.getElementById('appointment-doctor').value,
        date: document.getElementById('appointment-date').value,
        time: document.getElementById('appointment-time').value,
        status: document.getElementById('appointment-status-select').value,
        createdAt: appointmentId ? undefined : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    if (appointmentId) {
        const index = appointments.findIndex(a => a.id === appointmentId);
        if (index !== -1) {
            appointments[index] = { ...appointments[index], ...appointmentData };
            addActivity(`Updated appointment for patient ID: ${appointmentData.patientId}`);
        }
    } else {
        appointments.push(appointmentData);
        addActivity(`Added new appointment for patient ID: ${appointmentData.patientId}`);
    }

    localStorage.setItem('appointments', JSON.stringify(appointments));
    loadAppointmentsTable();
    updateDashboard();
    closeModal('appointment-modal');
}

function deleteAppointment(appointmentId) {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment) return;

    if (confirm('Are you sure you want to delete this appointment?')) {
        appointments = appointments.filter(a => a.id !== appointmentId);
        localStorage.setItem('appointments', JSON.stringify(appointments));
        addActivity(`Deleted appointment ID: ${appointmentId}`);
        loadAppointmentsTable();
        updateDashboard();
    }
}

function loadAppointmentsTable() {
    const tableBody = document.querySelector('#appointments-table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    appointments.forEach(appointment => {
        const patient = patients.find(p => p.id === appointment.patientId);
        const doctor = doctors.find(d => d.id === appointment.doctorId);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${appointment.id}</td>
            <td>${patient ? `${patient.firstName} ${patient.lastName}` : 'N/A'}</td>
            <td>${doctor ? `${doctor.firstName} ${doctor.lastName}` : 'N/A'}</td>
            <td>${formatDate(appointment.date)}</td>
            <td>${formatTime(appointment.time)}</td>
            <td><span class="status-badge ${appointment.status}">${appointment.status}</span></td>
            <td>
                <button class="btn btn-sm" onclick="openAppointmentModal('${appointment.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteAppointment('${appointment.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Medical Record Management
function setupMedicalRecordManagement() {
    const addRecordBtn = document.getElementById('add-record-btn');
    if (addRecordBtn) {
        addRecordBtn.addEventListener('click', () => {
            openMedicalRecordModal();
        });
    }

    const recordForm = document.getElementById('record-form');
    if (recordForm) {
        recordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveMedicalRecord();
        });
    }

    document.querySelectorAll('#record-modal .close-btn, #record-modal .close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal('record-modal');
        });
    });
}

function openMedicalRecordModal(recordId = null) {
    const modal = document.getElementById('record-modal');
    const form = document.getElementById('record-form');
    if (!modal || !form) return;

    populatePatientSelects();

    if (recordId) {
        const record = medicalRecords.find(r => r.id === recordId);
        if (record) {
            document.getElementById('record-patient-select').value = record.patientId;
            document.getElementById('record-date').value = record.date;
            document.getElementById('record-diagnosis').value = record.diagnosis;
            document.getElementById('record-treatment').value = record.treatment;
            document.getElementById('record-notes').value = record.notes;

            modal.querySelector('h3').textContent = 'Edit Medical Record';
            form.dataset.recordId = recordId;
        }
    } else {
        form.reset();
        modal.querySelector('h3').textContent = 'Add New Medical Record';
        delete form.dataset.recordId;
    }

    modal.classList.add('active');
}

function saveMedicalRecord() {
    const form = document.getElementById('record-form');
    if (!form) return;

    const recordId = form.dataset.recordId;

    const recordData = {
        id: recordId || generateId(),
        patientId: document.getElementById('record-patient-select').value,
        date: document.getElementById('record-date').value,
        diagnosis: document.getElementById('record-diagnosis').value,
        treatment: document.getElementById('record-treatment').value,
        notes: document.getElementById('record-notes').value,
        createdAt: recordId ? undefined : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    if (recordId) {
        const index = medicalRecords.findIndex(r => r.id === recordId);
        if (index !== -1) {
            medicalRecords[index] = { ...medicalRecords[index], ...recordData };
            addActivity(`Updated medical record for patient ID: ${recordData.patientId}`);
        }
    } else {
        medicalRecords.push(recordData);
        addActivity(`Added new medical record for patient ID: ${recordData.patientId}`);
    }

    localStorage.setItem('medicalRecords', JSON.stringify(medicalRecords));
    loadMedicalRecordsTable();
    updateDashboard();
    closeModal('record-modal');
}

function deleteMedicalRecord(recordId) {
    const record = medicalRecords.find(r => r.id === recordId);
    if (!record) return;

    if (confirm('Are you sure you want to delete this medical record?')) {
        medicalRecords = medicalRecords.filter(r => r.id !== recordId);
        localStorage.setItem('medicalRecords', JSON.stringify(medicalRecords));
        addActivity(`Deleted medical record ID: ${recordId}`);
        loadMedicalRecordsTable();
        updateDashboard();
    }
}

function loadMedicalRecordsTable() {
    const tableBody = document.querySelector('#records-table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    medicalRecords.forEach(record => {
        const patient = patients.find(p => p.id === record.patientId);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.id}</td>
            <td>${patient ? `${patient.firstName} ${patient.lastName}` : 'N/A'}</td>
            <td>${formatDate(record.date)}</td>
            <td>${record.diagnosis}</td>
            <td>${record.treatment}</td>
            <td>
                <button class="btn btn-sm" onclick="openMedicalRecordModal('${record.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteMedicalRecord('${record.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Doctor Management
function setupDoctorManagement() {
    const addDoctorBtn = document.getElementById('add-doctor-btn');
    if (addDoctorBtn) {
        addDoctorBtn.addEventListener('click', () => {
            openDoctorModal();
        });
    }

    const doctorForm = document.getElementById('doctor-form');
    if (doctorForm) {
        doctorForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveDoctor();
        });
    }

    document.querySelectorAll('#doctor-modal .close-btn, #doctor-modal .close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal('doctor-modal');
        });
    });
}

function openDoctorModal(doctorId = null) {
    const modal = document.getElementById('doctor-modal');
    const form = document.getElementById('doctor-form');
    if (!modal || !form) return;

    if (doctorId) {
        const doctor = doctors.find(d => d.id === doctorId);
        if (doctor) {
            document.getElementById('doctor-first-name').value = doctor.firstName;
            document.getElementById('doctor-last-name').value = doctor.lastName;
            document.getElementById('doctor-specialization-select').value = doctor.specialization;
            document.getElementById('doctor-phone').value = doctor.phone;
            document.getElementById('doctor-email').value = doctor.email;

            modal.querySelector('h3').textContent = 'Edit Doctor';
            form.dataset.doctorId = doctorId;
        }
    } else {
        form.reset();
        modal.querySelector('h3').textContent = 'Add New Doctor';
        delete form.dataset.doctorId;
    }

    modal.classList.add('active');
}

function saveDoctor() {
    const form = document.getElementById('doctor-form');
    if (!form) return;

    const doctorId = form.dataset.doctorId;

    const doctorData = {
        id: doctorId || generateId(),
        firstName: document.getElementById('doctor-first-name').value,
        lastName: document.getElementById('doctor-last-name').value,
        specialization: document.getElementById('doctor-specialization-select').value,
        phone: document.getElementById('doctor-phone').value,
        email: document.getElementById('doctor-email').value,
        createdAt: doctorId ? undefined : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    if (doctorId) {
        const index = doctors.findIndex(d => d.id === doctorId);
        if (index !== -1) {
            doctors[index] = { ...doctors[index], ...doctorData };
            addActivity(`Updated doctor: ${doctorData.firstName} ${doctorData.lastName}`);
        }
    } else {
        doctors.push(doctorData);
        addActivity(`Added new doctor: ${doctorData.firstName} ${doctorData.lastName}`);
    }

    localStorage.setItem('doctors', JSON.stringify(doctors));
    loadDoctorsTable();
    populateDoctorSelects();
    closeModal('doctor-modal');
}

function deleteDoctor(doctorId) {
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) return;

    if (appointments.some(a => a.doctorId === doctorId)) {
        alert('Cannot delete doctor with existing appointments.');
        return;
    }

    if (confirm('Are you sure you want to delete this doctor?')) {
        doctors = doctors.filter(d => d.id !== doctorId);
        localStorage.setItem('doctors', JSON.stringify(doctors));
        addActivity(`Deleted doctor: ${doctor.firstName} ${doctor.lastName}`);
        loadDoctorsTable();
        populateDoctorSelects();
    }
}

function loadDoctorsTable() {
    const tableBody = document.querySelector('#doctors-table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    doctors.forEach(doctor => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${doctor.id}</td>
            <td>${doctor.firstName} ${doctor.lastName}</td>
            <td>${doctor.specialization}</td>
            <td>${doctor.phone || 'N/A'}</td>
            <td>${doctor.email || 'N/A'}</td>
            <td>
                <button class="btn btn-sm" onclick="openDoctorModal('${doctor.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteDoctor('${doctor.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Staff Management
function setupStaffManagement() {
    const addStaffBtn = document.getElementById('add-staff-btn');
    if (addStaffBtn) {
        addStaffBtn.addEventListener('click', () => {
            openStaffModal();
        });
    }

    const staffForm = document.getElementById('staff-form');
    if (staffForm) {
        staffForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveStaff();
        });
    }

    document.querySelectorAll('#staff-modal .close-btn, #staff-modal .close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal('staff-modal');
        });
    });
}

function openStaffModal(staffId = null) {
    const modal = document.getElementById('staff-modal');
    const form = document.getElementById('staff-form');
    if (!modal || !form) return;

    if (staffId) {
        const staffMember = staff.find(s => s.id === staffId);
        if (staffMember) {
            document.getElementById('staff-first-name').value = staffMember.firstName;
            document.getElementById('staff-last-name').value = staffMember.lastName;
            document.getElementById('staff-role-select').value = staffMember.role;
            document.getElementById('staff-department').value = staffMember.department;
            document.getElementById('staff-phone').value = staffMember.phone;

            modal.querySelector('h3').textContent = 'Edit Staff';
            form.dataset.staffId = staffId;
        }
    } else {
        form.reset();
        modal.querySelector('h3').textContent = 'Add New Staff';
        delete form.dataset.staffId;
    }

    modal.classList.add('active');
}

function saveStaff() {
    const form = document.getElementById('staff-form');
    if (!form) return;

    const staffId = form.dataset.staffId;

    const staffData = {
        id: staffId || generateId(),
        firstName: document.getElementById('staff-first-name').value,
        lastName: document.getElementById('staff-last-name').value,
        role: document.getElementById('staff-role-select').value,
        department: document.getElementById('staff-department').value,
        phone: document.getElementById('staff-phone').value,
        createdAt: staffId ? undefined : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    if (staffId) {
        const index = staff.findIndex(s => s.id === staffId);
        if (index !== -1) {
            staff[index] = { ...staff[index], ...staffData };
            addActivity(`Updated staff: ${staffData.firstName} ${staffData.lastName}`);
        }
    } else {
        staff.push(staffData);
        addActivity(`Added new staff: ${staffData.firstName} ${staffData.lastName}`);
    }

    localStorage.setItem('staff', JSON.stringify(staff));
    loadStaffTable();
    closeModal('staff-modal');
}

function deleteStaff(staffId) {
    const staffMember = staff.find(s => s.id === staffId);
    if (!staffMember) return;

    if (confirm('Are you sure you want to delete this staff member?')) {
        staff = staff.filter(s => s.id !== staffId);
        localStorage.setItem('staff', JSON.stringify(staff));
        addActivity(`Deleted staff: ${staffMember.firstName} ${staffMember.lastName}`);
        loadStaffTable();
    }
}

function loadStaffTable() {
    const tableBody = document.querySelector('#staff-table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    staff.forEach(staffMember => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${staffMember.id}</td>
            <td>${staffMember.firstName} ${staffMember.lastName}</td>
            <td>${staffMember.role}</td>
            <td>${staffMember.department}</td>
            <td>${staffMember.phone || 'N/A'}</td>
            <td>
                <button class="btn btn-sm" onclick="openStaffModal('${staffMember.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteStaff('${staffMember.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Inventory Management
function setupInventoryManagement() {
    const addInventoryBtn = document.getElementById('add-inventory-btn');
    if (addInventoryBtn) {
        addInventoryBtn.addEventListener('click', () => {
            openInventoryModal();
        });
    }

    const inventoryForm = document.getElementById('inventory-form');
    if (inventoryForm) {
        inventoryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveInventory();
        });
    }

    document.querySelectorAll('#inventory-modal .close-btn, #inventory-modal .close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal('inventory-modal');
        });
    });
}

function openInventoryModal(itemId = null) {
    const modal = document.getElementById('inventory-modal');
    const form = document.getElementById('inventory-form');
    if (!modal || !form) return;

    if (itemId) {
        const item = inventory.find(i => i.id === itemId);
        if (item) {
            document.getElementById('inventory-name').value = item.name;
            document.getElementById('inventory-category-select').value = item.category;
            document.getElementById('inventory-quantity').value = item.quantity;
            document.getElementById('inventory-unit-price').value = item.unitPrice;
            document.getElementById('inventory-description').value = item.description;

            modal.querySelector('h3').textContent = 'Edit Inventory Item';
            form.dataset.itemId = itemId;
        }
    } else {
        form.reset();
        modal.querySelector('h3').textContent = 'Add New Inventory Item';
        delete form.dataset.itemId;
    }

    modal.classList.add('active');
}

function saveInventory() {
    const form = document.getElementById('inventory-form');
    if (!form) return;

    const itemId = form.dataset.itemId;

    const quantity = parseInt(document.getElementById('inventory-quantity').value);
    const status = quantity <= 10 ? 'low' : 'available';

    const inventoryData = {
        id: itemId || generateId(),
        name: document.getElementById('inventory-name').value,
        category: document.getElementById('inventory-category-select').value,
        quantity: quantity,
        unitPrice: parseFloat(document.getElementById('inventory-unit-price').value),
        description: document.getElementById('inventory-description').value,
        status: status,
        createdAt: itemId ? undefined : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    if (itemId) {
        const index = inventory.findIndex(i => i.id === itemId);
        if (index !== -1) {
            inventory[index] = { ...inventory[index], ...inventoryData };
            addActivity(`Updated inventory item: ${inventoryData.name}`);
        }
    } else {
        inventory.push(inventoryData);
        addActivity(`Added new inventory item: ${inventoryData.name}`);
    }

    localStorage.setItem('inventory', JSON.stringify(inventory));
    loadInventoryTable();
    closeModal('inventory-modal');
}

function deleteInventory(itemId) {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    if (confirm('Are you sure you want to delete this inventory item?')) {
        inventory = inventory.filter(i => i.id !== itemId);
        localStorage.setItem('inventory', JSON.stringify(inventory));
        addActivity(`Deleted inventory item: ${item.name}`);
        loadInventoryTable();
    }
}

function loadInventoryTable() {
    const tableBody = document.querySelector('#inventory-table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    inventory.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>${item.quantity}</td>
            <td>${formatCurrency(item.unitPrice)}</td>
            <td><span class="status-badge ${item.status}">${item.status}</span></td>
            <td>
                <button class="btn btn-sm" onclick="openInventoryModal('${item.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteInventory('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Ward Management
function setupWardManagement() {
    const addWardBtn = document.getElementById('add-ward-btn');
    if (addWardBtn) {
        addWardBtn.addEventListener('click', () => {
            openWardModal();
        });
    }

    const wardForm = document.getElementById('ward-form');
    if (wardForm) {
        wardForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveWard();
        });
    }

    document.querySelectorAll('#ward-modal .close-btn, #ward-modal .close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal('ward-modal');
        });
    });
}

function openWardModal(wardId = null) {
    const modal = document.getElementById('ward-modal');
    const form = document.getElementById('ward-form');
    if (!modal || !form) return;

    populatePatientSelects();

    if (wardId) {
        const ward = wards.find(w => w.id === wardId);
        if (ward) {
            document.getElementById('ward-number').value = ward.number;
            document.getElementById('ward-type').value = ward.type;
            document.getElementById('ward-capacity').value = ward.capacity;
            document.getElementById('ward-status-select').value = ward.status;
            document.getElementById('ward-patient').value = ward.patientId || '';

            modal.querySelector('h3').textContent = 'Edit Ward';
            form.dataset.wardId = wardId;
        }
    } else {
        form.reset();
        modal.querySelector('h3').textContent = 'Add New Ward';
        delete form.dataset.wardId;
    }

    modal.classList.add('active');
}

function saveWard() {
    const form = document.getElementById('ward-form');
    if (!form) return;

    const wardId = form.dataset.wardId;

    const wardData = {
        id: wardId || generateId(),
        number: document.getElementById('ward-number').value,
        type: document.getElementById('ward-type').value,
        capacity: parseInt(document.getElementById('ward-capacity').value),
        patientId: document.getElementById('ward-patient').value || null,
        status: document.getElementById('ward-status-select').value,
        createdAt: wardId ? undefined : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    if (wardData.patientId) {
        wardData.status = 'occupied';
    } else if (wardData.status === 'occupied') {
        wardData.status = 'available';
    }

    if (wardData.patientId) {
        const existingWard = wards.find(w => w.id !== wardId && w.patientId === wardData.patientId);
        if (existingWard) {
            alert('This patient is already assigned to another ward.');
            return;
        }
    }

    if (wardId) {
        const index = wards.findIndex(w => w.id === wardId);
        if (index !== -1) {
            wards[index] = { ...wards[index], ...wardData };
            addActivity(`Updated ward: ${wardData.number}`);
        }
    } else {
        wards.push(wardData);
        addActivity(`Added new ward: ${wardData.number}`);
    }

    localStorage.setItem('wards', JSON.stringify(wards));
    loadWardsTable();
    updateDashboard();
    closeModal('ward-modal');
}

function deleteWard(wardId) {
    const ward = wards.find(w => w.id === wardId);
    if (!ward) return;

    if (ward.patientId) {
        alert('Cannot delete ward with assigned patient.');
        return;
    }

    if (confirm('Are you sure you want to delete this ward?')) {
        wards = wards.filter(w => w.id !== wardId);
        localStorage.setItem('wards', JSON.stringify(wards));
        addActivity(`Deleted ward: ${ward.number}`);
        loadWardsTable();
        updateDashboard();
    }
}

function loadWardsTable() {
    const tableBody = document.querySelector('#wards-table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    wards.forEach(ward => {
        const patient = patients.find(p => p.id === ward.patientId);
        const occupied = ward.patientId ? 1 : 0;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${ward.id}</td>
            <td>${ward.number}</td>
            <td>${ward.type}</td>
            <td>${ward.capacity}</td>
            <td>${occupied}</td>
            <td><span class="status-badge ${ward.status}">${ward.status}</span></td>
            <td>
                <button class="btn btn-sm" onclick="openWardModal('${ward.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteWard('${ward.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Billing Management
function setupBillingManagement() {
    const addBillBtn = document.getElementById('add-bill-btn');
    if (addBillBtn) {
        addBillBtn.addEventListener('click', () => {
            openBillModal();
        });
    }

    const billForm = document.getElementById('bill-form');
    if (billForm) {
        billForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveBill();
        });
    }

    document.querySelectorAll('#bill-modal .close-btn, #bill-modal .close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal('bill-modal');
        });
    });
}

function openBillModal(billId = null) {
    const modal = document.getElementById('bill-modal');
    const form = document.getElementById('bill-form');
    if (!modal || !form) return;

    populatePatientSelects();

    if (billId) {
        const bill = bills.find(b => b.id === billId);
        if (bill) {
            document.getElementById('bill-patient').value = bill.patientId;
            document.getElementById('bill-date').value = bill.date;
            document.getElementById('bill-amount').value = bill.amount;
            document.getElementById('bill-status-select').value = bill.status;
            document.getElementById('bill-description').value = bill.description;

            modal.querySelector('h3').textContent = 'Edit Bill';
            form.dataset.billId = billId;
        }
    } else {
        form.reset();
        modal.querySelector('h3').textContent = 'Add New Bill';
        delete form.dataset.billId;
    }

    modal.classList.add('active');
}

function saveBill() {
    const form = document.getElementById('bill-form');
    if (!form) return;

    const billId = form.dataset.billId;

    const billData = {
        id: billId || generateId(),
        patientId: document.getElementById('bill-patient').value,
        date: document.getElementById('bill-date').value,
        amount: parseFloat(document.getElementById('bill-amount').value),
        status: document.getElementById('bill-status-select').value,
        description: document.getElementById('bill-description').value,
        createdAt: billId ? undefined : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    if (billId) {
        const index = bills.findIndex(b => b.id === billId);
        if (index !== -1) {
            bills[index] = { ...bills[index], ...billData };
            addActivity(`Updated bill for patient ID: ${billData.patientId}`);
        }
    } else {
        bills.push(billData);
        addActivity(`Added new bill for patient ID: ${billData.patientId}`);
    }

    localStorage.setItem('bills', JSON.stringify(bills));
    loadBillsTable();
    updateDashboard();
    closeModal('bill-modal');
}

function deleteBill(billId) {
    const bill = bills.find(b => b.id === billId);
    if (!bill) return;

    if (bill.status === 'paid') {
        alert('Cannot delete a paid bill.');
        return;
    }

    if (confirm('Are you sure you want to delete this bill?')) {
        bills = bills.filter(b => b.id !== billId);
        localStorage.setItem('bills', JSON.stringify(bills));
        addActivity(`Deleted bill ID: ${billId}`);
        loadBillsTable();
        updateDashboard();
    }
}

function loadBillsTable() {
    const tableBody = document.querySelector('#bills-table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    bills.forEach(bill => {
        const patient = patients.find(p => p.id === bill.patientId);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${bill.id}</td>
            <td>${patient ? `${patient.firstName} ${patient.lastName}` : 'N/A'}</td>
            <td>${formatCurrency(bill.amount)}</td>
            <td>${formatDate(bill.date)}</td>
            <td><span class="status-badge ${bill.status}">${bill.status}</span></td>
            <td>
                <button class="btn btn-sm" onclick="openBillModal('${bill.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteBill('${bill.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Select Population
function populatePatientSelects() {
    const selects = [
        document.getElementById('appointment-patient'),
        document.getElementById('record-patient-select'),
        document.getElementById('bill-patient'),
        document.getElementById('ward-patient')
    ].filter(select => select);

    selects.forEach(select => {
        const currentValue = select.value;
        select.innerHTML = '<option value="">Select Patient</option>';
        patients.forEach(patient => {
            const option = document.createElement('option');
            option.value = patient.id;
            option.textContent = `${patient.firstName} ${patient.lastName}`;
            select.appendChild(option);
        });
        select.value = currentValue;
    });
}

function populateDoctorSelects() {
    const select = document.getElementById('appointment-doctor');
    if (!select) return;

    const currentValue = select.value;
    select.innerHTML = '<option value="">Select Doctor</option>';
    doctors.forEach(doctor => {
        const option = document.createElement('option');
        option.value = doctor.id;
        option.textContent = `${doctor.firstName} ${doctor.lastName} (${doctor.specialization})`;
        select.appendChild(option);
    });
    select.value = currentValue;
}

// Modal Management
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Search and Filter Setup
function setupSearchAndFilters() {
    // Patient Filters
    const patientSearch = document.getElementById('patient-search');
    const patientStatus = document.getElementById('patient-status');
    const patientGender = document.getElementById('patient-gender-filter');

    if (patientSearch) {
        patientSearch.addEventListener('input', filterPatients);
    }
    if (patientStatus) {
        patientStatus.addEventListener('change', filterPatients);
    }
    if (patientGender) {
        patientGender.addEventListener('change', filterPatients);
    }

    function filterPatients() {
        const searchTerm = patientSearch.value.toLowerCase();
        const statusFilter = patientStatus.value;
        const genderFilter = patientGender.value;

        const filteredPatients = patients.filter(patient => {
            const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
            return (
                (fullName.includes(searchTerm) || patient.id.toLowerCase().includes(searchTerm)) &&
                (statusFilter === 'all' || patient.status === statusFilter) &&
                (genderFilter === 'all' || patient.gender === genderFilter)
            );
        });

        const tableBody = document.querySelector('#patients-table tbody');
        if (!tableBody) return;

        tableBody.innerHTML = '';
        filteredPatients.forEach(patient => {
            const age = patient.dob ? calculateAge(patient.dob) : 'N/A';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${patient.id}</td>
                <td>${patient.firstName} ${patient.lastName}</td>
                <td>${age}</td>
                <td>${patient.gender?.charAt(0).toUpperCase() + patient.gender?.slice(1) || 'N/A'}</td>
                <td>${patient.phone || 'N/A'}</td>
                <td><span class="status-badge ${patient.status}">${patient.status}</span></td>
                <td>
                    <button class="btn btn-sm" onclick="openPatientModal('${patient.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deletePatient('${patient.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Appointment Filters
    const appointmentSearch = document.getElementById('appointment-search');
    const appointmentStatus = document.getElementById('appointment-status');

    if (appointmentSearch) {
        appointmentSearch.addEventListener('input', filterAppointments);
    }
    if (appointmentStatus) {
        appointmentStatus.addEventListener('change', filterAppointments);
    }

    function filterAppointments() {
        const searchTerm = appointmentSearch.value.toLowerCase();
        const statusFilter = appointmentStatus.value;

        const filteredAppointments = appointments.filter(appointment => {
            const patient = patients.find(p => p.id === appointment.patientId);
            const doctor = doctors.find(d => d.id === appointment.doctorId);
            const patientName = patient ? `${patient.firstName} ${patient.lastName}`.toLowerCase() : '';
            const doctorName = doctor ? `${doctor.firstName} ${doctor.lastName}`.toLowerCase() : '';
            return (
                (patientName.includes(searchTerm) ||
                 doctorName.includes(searchTerm) ||
                 appointment.id.toLowerCase().includes(searchTerm)) &&
                (statusFilter === 'all' || appointment.status === statusFilter)
            );
        });

        const tableBody = document.querySelector('#appointments-table tbody');
        if (!tableBody) return;

        tableBody.innerHTML = '';
        filteredAppointments.forEach(appointment => {
            const patient = patients.find(p => p.id === appointment.patientId);
            const doctor = doctors.find(d => d.id === appointment.doctorId);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${appointment.id}</td>
                <td>${patient ? `${patient.firstName} ${patient.lastName}` : 'N/A'}</td>
                <td>${doctor ? `${doctor.firstName} ${doctor.lastName}` : 'N/A'}</td>
                <td>${formatDate(appointment.date)}</td>
                <td>${formatTime(appointment.time)}</td>
                <td><span class="status-badge ${appointment.status}">${appointment.status}</span></td>
                <td>
                    <button class="btn btn-sm" onclick="openAppointmentModal('${appointment.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteAppointment('${appointment.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Medical Record Filters
    const recordSearch = document.getElementById('record-search');
    const recordPatient = document.getElementById('record-patient');

    if (recordSearch) {
        recordSearch.addEventListener('input', filterRecords);
    }
    if (recordPatient) {
        recordPatient.addEventListener('change', filterRecords);
    }

    function filterRecords() {
        const searchTerm = recordSearch.value.toLowerCase();
        const patientFilter = recordPatient.value;

        const filteredRecords = medicalRecords.filter(record => {
            const patient = patients.find(p => p.id === record.patientId);
            const patientName = patient ? `${patient.firstName} ${patient.lastName}`.toLowerCase() : '';
            return (
                (patientName.includes(searchTerm) ||
                 record.diagnosis.toLowerCase().includes(searchTerm) ||
                 record.treatment.toLowerCase().includes(searchTerm)) &&
                (patientFilter === 'all' || record.patientId === patientFilter)
            );
        });

        const tableBody = document.querySelector('#records-table tbody');
        if (!tableBody) return;

        tableBody.innerHTML = '';
        filteredRecords.forEach(record => {
            const patient = patients.find(p => p.id === record.patientId);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.id}</td>
                <td>${patient ? `${patient.firstName} ${patient.lastName}` : 'N/A'}</td>
                <td>${formatDate(record.date)}</td>
                <td>${record.diagnosis}</td>
                <td>${record.treatment}</td>
                <td>
                    <button class="btn btn-sm" onclick="openMedicalRecordModal('${record.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteMedicalRecord('${record.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Doctor Filters
    const doctorSearch = document.getElementById('doctor-search');
    const doctorSpecialization = document.getElementById('doctor-specialization');

    if (doctorSearch) {
        doctorSearch.addEventListener('input', filterDoctors);
    }
    if (doctorSpecialization) {
        doctorSpecialization.addEventListener('change', filterDoctors);
    }

    function filterDoctors() {
        const searchTerm = doctorSearch.value.toLowerCase();
        const specializationFilter = doctorSpecialization.value;

        const filteredDoctors = doctors.filter(doctor => {
            const fullName = `${doctor.firstName} ${doctor.lastName}`.toLowerCase();
            return (
                (fullName.includes(searchTerm) || doctor.id.toLowerCase().includes(searchTerm)) &&
                (specializationFilter === 'all' || doctor.specialization === specializationFilter)
            );
        });

        const tableBody = document.querySelector('#doctors-table tbody');
        if (!tableBody) return;

        tableBody.innerHTML = '';
        filteredDoctors.forEach(doctor => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${doctor.id}</td>
                <td>${doctor.firstName} ${doctor.lastName}</td>
                <td>${doctor.specialization}</td>
                <td>${doctor.phone || 'N/A'}</td>
                <td>${doctor.email || 'N/A'}</td>
                <td>
                    <button class="btn btn-sm" onclick="openDoctorModal('${doctor.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteDoctor('${doctor.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Staff Filters
    const staffSearch = document.getElementById('staff-search');
    const staffRole = document.getElementById('staff-role');

    if (staffSearch) {
        staffSearch.addEventListener('input', filterStaff);
    }
    if (staffRole) {
        staffRole.addEventListener('change', filterStaff);
    }

    function filterStaff() {
        const searchTerm = staffSearch.value.toLowerCase();
        const roleFilter = staffRole.value;

        const filteredStaff = staff.filter(staffMember => {
            const fullName = `${staffMember.firstName} ${staffMember.lastName}`.toLowerCase();
            return (
                (fullName.includes(searchTerm) || staffMember.id.toLowerCase().includes(searchTerm)) &&
                (roleFilter === 'all' || staffMember.role === roleFilter)
            );
        });

        const tableBody = document.querySelector('#staff-table tbody');
        if (!tableBody) return;

        tableBody.innerHTML = '';
        filteredStaff.forEach(staffMember => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${staffMember.id}</td>
                <td>${staffMember.firstName} ${staffMember.lastName}</td>
                <td>${staffMember.role}</td>
                <td>${staffMember.department}</td>
                <td>${staffMember.phone || 'N/A'}</td>
                <td>
                    <button class="btn btn-sm" onclick="openStaffModal('${staffMember.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteStaff('${staffMember.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Inventory Filters
    const inventorySearch = document.getElementById('inventory-search');
    const inventoryCategory = document.getElementById('inventory-category');

    if (inventorySearch) {
        inventorySearch.addEventListener('input', filterInventory);
    }
    if (inventoryCategory) {
        inventoryCategory.addEventListener('change', filterInventory);
    }

    function filterInventory() {
        const searchTerm = inventorySearch.value.toLowerCase();
        const categoryFilter = inventoryCategory.value;

        const filteredInventory = inventory.filter(item => {
            return (
                (item.name.toLowerCase().includes(searchTerm) || item.id.toLowerCase().includes(searchTerm)) &&
                (categoryFilter === 'all' || item.category === categoryFilter)
            );
        });

        const tableBody = document.querySelector('#inventory-table tbody');
        if (!tableBody) return;

        tableBody.innerHTML = '';
        filteredInventory.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.unitPrice)}</td>
                <td><span class="status-badge ${item.status}">${item.status}</span></td>
                <td>
                    <button class="btn btn-sm" onclick="openInventoryModal('${item.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteInventory('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Ward Filters
    const wardSearch = document.getElementById('ward-search');
    const wardStatus = document.getElementById('ward-status');

    if (wardSearch) {
        wardSearch.addEventListener('input', filterWards);
    }
    if (wardStatus) {
        wardStatus.addEventListener('change', filterWards);
    }

    function filterWards() {
        const searchTerm = wardSearch.value.toLowerCase();
        const statusFilter = wardStatus.value;

        const filteredWards = wards.filter(ward => {
            const patient = patients.find(p => p.id === ward.patientId);
            const patientName = patient ? `${patient.firstName} ${patient.lastName}`.toLowerCase() : '';
            return (
                (ward.number.toLowerCase().includes(searchTerm) ||
                 ward.type.toLowerCase().includes(searchTerm) ||
                 patientName.includes(searchTerm)) &&
                (statusFilter === 'all' || ward.status === statusFilter)
            );
        });

        const tableBody = document.querySelector('#wards-table tbody');
        if (!tableBody) return;

        tableBody.innerHTML = '';
        filteredWards.forEach(ward => {
            const patient = patients.find(p => p.id === ward.patientId);
            const occupied = ward.patientId ? 1 : 0;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${ward.id}</td>
                <td>${ward.number}</td>
                <td>${ward.type}</td>
                <td>${ward.capacity}</td>
                <td>${occupied}</td>
                <td><span class="status-badge ${ward.status}">${ward.status}</span></td>
                <td>
                    <button class="btn btn-sm" onclick="openWardModal('${ward.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteWard('${ward.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Billing Filters
    const billingSearch = document.getElementById('billing-search');
    const billingStatus = document.getElementById('billing-status');

    if (billingSearch) {
        billingSearch.addEventListener('input', filterBills);
    }
    if (billingStatus) {
        billingStatus.addEventListener('change', filterBills);
    }

    function filterBills() {
        const searchTerm = billingSearch.value.toLowerCase();
        const statusFilter = billingStatus.value;

        const filteredBills = bills.filter(bill => {
            const patient = patients.find(p => p.id === bill.patientId);
            const patientName = patient ? `${patient.firstName} ${patient.lastName}`.toLowerCase() : '';
            return (
                (patientName.includes(searchTerm) ||
                 bill.id.toLowerCase().includes(searchTerm) ||
                 bill.description.toLowerCase().includes(searchTerm)) &&
                (statusFilter === 'all' || bill.status === statusFilter)
            );
        });

        const tableBody = document.querySelector('#bills-table tbody');
        if (!tableBody) return;

        tableBody.innerHTML = '';
        filteredBills.forEach(bill => {
            const patient = patients.find(p => p.id === bill.patientId);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${bill.id}</td>
                <td>${patient ? `${patient.firstName} ${patient.lastName}` : 'N/A'}</td>
                <td>${formatCurrency(bill.amount)}</td>
                <td>${formatDate(bill.date)}</td>
                <td><span class="status-badge ${bill.status}">${bill.status}</span></td>
                <td>
                    <button class="btn btn-sm" onclick="openBillModal('${bill.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteBill('${bill.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
}

// Notification System
function setupNotifications() {
    const notificationsBtn = document.querySelector('.notifications');
    if (notificationsBtn) {
        notificationsBtn.addEventListener('click', toggleNotifications);
    }
}

function toggleNotifications() {
    const existingDropdown = document.querySelector('.notification-dropdown');
    if (existingDropdown) {
        existingDropdown.remove();
        return;
    }

    const lowInventory = inventory.filter(item => item.quantity <= 10);
    const pendingBills = bills.filter(bill => bill.status === 'pending');
    const occupiedWards = wards.filter(ward => ward.status === 'occupied');

    const notifications = [
        ...lowInventory.map(item => `Low inventory: ${item.name} (${item.quantity} left)`),
        ...pendingBills.map(bill => `Pending bill for patient ID: ${bill.patientId} (${formatCurrency(bill.amount)})`),
        ...occupiedWards.map(ward => `Ward ${ward.number} is occupied`)
    ];

    const dropdown = document.createElement('div');
    dropdown.className = 'notification-dropdown';
    dropdown.style.position = 'absolute';
    dropdown.style.top = '60px';
    dropdown.style.right = '20px';

    if (notifications.length === 0) {
        dropdown.innerHTML = '<div class="notification-item">No new notifications</div>';
    } else {
        dropdown.innerHTML = notifications.map(note => `
            <div class="notification-item">
                <i class="fas fa-bell"></i>
                <span>${note}</span>
            </div>
        `).join('');
    }

    document.body.appendChild(dropdown);

    // Close dropdown when clicking outside
    document.addEventListener('click', function closeDropdown(e) {
        if (!dropdown.contains(e.target) && e.target !== notificationsBtn) {
            dropdown.remove();
            document.removeEventListener('click', closeDropdown);
        }
    });
}

// View Buttons Setup (Placeholder for future detailed views)
function setupViewButtons() {
    // Implement detailed view functionality if needed
}

// Form Validation
function setupFormValidation() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            let isValid = true;
            const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('invalid');
                    input.addEventListener('input', () => input.classList.remove('invalid'), { once: true });
                }
            });
            if (!isValid) {
                e.preventDefault();
                alert('Please fill in all required fields.');
            }
        });
    });
}
