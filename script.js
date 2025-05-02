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
    updateDashboard();
    loadPatientsTable();
    loadAppointmentsTable();
    loadMedicalRecordsTable();
    loadDoctorsTable();
    loadStaffTable();
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
    localStorage.setItem('patients', JSON.stringify(patients));
    localStorage.setItem('doctors', JSON.stringify(doctors));
    localStorage.setItem('staff', JSON.stringify(staff));
    localStorage.setItem('appointments', JSON.stringify(appointments));
    localStorage.setItem('medicalRecords', JSON.stringify(medicalRecords));
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

    document.querySelectorAll('.close-btn, .close-modal').forEach(btn => {
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
    closeModal('patient-modal');
}

function deletePatient(patientId) {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    const hasAppointments = appointments.some(a => a.patientId === patientId);
    const hasRecords = medicalRecords.some(r => r.patientId === patientId);
    if (hasAppointments || hasRecords) {
        alert('Cannot delete patient with existing appointments or medical records.');
        return;
    }

    if (confirm('Are you sure you want to delete this patient?')) {
        patients = patients.filter(p => p.id !== patientId);
        localStorage.setItem('patients', JSON.stringify(patients));
        addActivity(`Deleted patient: ${patient.firstName} ${patient.lastName}`);
        loadPatientsTable();
        updateDashboard();
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

    const patient = patients.find(p => p.id === appointmentData.patientId);
    const doctor = doctors.find(d => d.id === appointmentData.doctorId);

    if (!patient || !doctor) {
        alert('Invalid patient or doctor selected.');
        return;
    }

    if (appointmentId) {
        const index = appointments.findIndex(a => a.id === appointmentId);
        if (index !== -1) {
            appointments[index] = { ...appointments[index], ...appointmentData };
            addActivity(`Updated appointment for ${patient.firstName} ${patient.lastName}`);
        }
    } else {
        appointments.push(appointmentData);
        addActivity(`Added new appointment for ${patient.firstName} ${patient.lastName}`);
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
        const patient = patients.find(p => p.id === appointment.patientId);
        appointments = appointments.filter(a => a.id !== appointmentId);
        localStorage.setItem('appointments', JSON.stringify(appointments));
        addActivity(`Deleted appointment for ${patient?.firstName || 'N/A'} ${patient?.lastName || 'N/A'}`);
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
            <td>${doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'N/A'}</td>
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

    const patient = patients.find(p => p.id === recordData.patientId);
    if (!patient) {
        alert('Invalid patient selected.');
        return;
    }

    if (recordId) {
        const index = medicalRecords.findIndex(r => r.id === recordId);
        if (index !== -1) {
            medicalRecords[index] = { ...medicalRecords[index], ...recordData };
            addActivity(`Updated medical record for ${patient.firstName} ${patient.lastName}`);
        }
    } else {
        medicalRecords.push(recordData);
        addActivity(`Added new medical record for ${patient.firstName} ${patient.lastName}`);
    }

    localStorage.setItem('medicalRecords', JSON.stringify(medicalRecords));
    loadMedicalRecordsTable();
    updateDashboard();
    closeModal('record-modal');
}

function deleteMedicalRecord(recordId) {
    const record = medicalRecords.find(r => r.id === recordId);
    if (!record) { // Fixed syntax error from if (!!)
        return;
    }

    if (confirm('Are you sure you want to delete this medical record?')) {
        const patient = patients.find(p => p.id === record.patientId);
        medicalRecords = medicalRecords.filter(r => r.id !== recordId);
        localStorage.setItem('medicalRecords', JSON.stringify(medicalRecords));
        addActivity(`Deleted medical record for ${patient?.firstName || 'N/A'} ${patient?.lastName || 'N/A'}`);
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
    updateDashboard();
    closeModal('doctor-modal');
}

function deleteDoctor(doctorId) {
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) return;

    const hasAppointments = appointments.some(a => a.doctorId === doctorId);
    if (hasAppointments) {
        alert('Cannot delete doctor with existing appointments.');
        return;
    }

    if (confirm('Are you sure you want to delete this doctor?')) {
        doctors = doctors.filter(d => d.id !== doctorId);
        localStorage.setItem('doctors', JSON.stringify(doctors));
        addActivity(`Deleted doctor: ${doctor.firstName} ${doctor.lastName}`);
        loadDoctorsTable();
        populateDoctorSelects();
        updateDashboard();
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
    updateDashboard();
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
        updateDashboard();
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

// Dashboard Functions
function updateDashboard() {
    console.log('Updating dashboard...'); // Debug log

    const totalPatients = document.getElementById('total-patients');
    if (totalPatients) {
        totalPatients.textContent = patients.length;
        highlightUpdate('total-patients');
    } else {
        console.warn('Element #total-patients not found');
    }

    const today = new Date().toISOString().split('T')[0];
    const todaysAppointments = appointments.filter(appt => appt.date === today).length;
    const todayAppointments = document.getElementById('today-appointments');
    if (todayAppointments) {
        todayAppointments.textContent = todaysAppointments;
        highlightUpdate('today-appointments');
    } else {
        console.warn('Element #today-appointments not found');
    }

    const totalBeds = 50;
    const occupiedBeds = patients.filter(p => p.status === 'admitted').length;
    const availableBeds = document.getElementById('available-beds');
    if (availableBeds) {
        availableBeds.textContent = totalBeds - occupiedBeds;
        highlightUpdate('available-beds');
    } else {
        console.warn('Element #available-beds not found');
    }

    const revenueElement = document.getElementById('revenue');
    if (revenueElement) {
        revenueElement.textContent = 'N/A'; // Placeholder until bills are implemented
        highlightUpdate('revenue');
    } else {
        console.warn('Element #revenue not found');
    }

    loadRecentAppointments();
    loadRecentPatients();
    loadActivityLog();
}

function loadRecentAppointments() {
    const container = document.getElementById('recent-appointments');
    if (!container) {
        console.warn('Element #recent-appointments not found');
        return;
    }

    container.innerHTML = '';

    const recentAppointments = [...appointments]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    recentAppointments.forEach(appt => {
        const patient = patients.find(p => p.id === appt.patientId);
        const doctor = doctors.find(d => d.id === appt.doctorId);

        const row = document.createElement('tr');
        row.classList.add('updated'); // Highlight new/updated rows
        setTimeout(() => row.classList.remove('updated'), 1000);
        row.innerHTML = `
            <td>${patient ? `${patient.firstName} ${patient.lastName}` : 'N/A'}</td>
            <td>${doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'N/A'}</td>
            <td>${formatTime(appt.time)}</td>
            <td><span class="status-badge ${appt.status}">${appt.status}</span></td>
            <td>
                <button class="btn btn-sm" onclick="openAppointmentModal('${appt.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        container.appendChild(row);
    });
}

function loadRecentPatients() {
    const container = document.getElementById('recent-patients');
    if (!container) {
        console.warn('Element #recent-patients not found');
        return;
    }

    container.innerHTML = '';

    const recentPatients = [...patients]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    recentPatients.forEach(patient => {
        const lastVisit = medicalRecords
            .filter(r => r.patientId === patient.id)
            .sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.date;

        const row = document.createElement('tr');
        row.classList.add('updated'); // Highlight new/updated rows
        setTimeout(() => row.classList.remove('updated'), 1000);
        row.innerHTML = `
            <td>${patient.id}</td>
            <td>${patient.firstName} ${patient.lastName}</td>
            <td>${patient.gender?.charAt(0).toUpperCase() + patient.gender?.slice(1) || 'N/A'}</td>
            <td>${lastVisit ? formatDate(lastVisit) : 'N/A'}</td>
            <td>
                <button class="btn btn-sm" onclick="openPatientModal('${patient.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        container.appendChild(row);
    });
}

function loadActivityLog() {
    const container = document.getElementById('activity-log');
    if (!container) {
        console.warn('Element #activity-log not found');
        return;
    }

    container.innerHTML = '';

    activityLog.slice(0, 5).forEach(activity => {
        const div = document.createElement('div');
        div.className = 'activity-item';
        div.innerHTML = `
            <div class="activity-icon"><i class="fas fa-bell"></i></div>
            <div class="activity-content">
                <div class="activity-message">${activity.message}</div>
                <div class="activity-time">${formatDateTime(activity.timestamp)}</div>
            </div>
        `;
        container.appendChild(div);
    });
}

// Select Population
function populatePatientSelects() {
    const selects = document.querySelectorAll('#appointment-patient, #record-patient-select');
    selects.forEach(select => {
        select.innerHTML = '<option value="">Select Patient</option>';
        patients.forEach(patient => {
            const option = document.createElement('option');
            option.value = patient.id;
            option.textContent = `${patient.firstName} ${patient.lastName}`;
            select.appendChild(option);
        });
    });
}

function populateDoctorSelects() {
    const select = document.getElementById('appointment-doctor');
    if (select) {
        select.innerHTML = '<option value="">Select Doctor</option>';
        doctors.forEach(doctor => {
            const option = document.createElement('option');
            option.value = doctor.id;
            option.textContent = `Dr. ${doctor.firstName} ${doctor.lastName} (${doctor.specialization})`;
            select.appendChild(option);
        });
    }
}

// Search and Filters
function setupSearchAndFilters() {
    const patientSearch = document.getElementById('patient-search');
    if (patientSearch) {
        patientSearch.addEventListener('input', () => {
            filterPatients();
        });
    }

    const patientStatus = document.getElementById('patient-status');
    if (patientStatus) {
        patientStatus.addEventListener('change', filterPatients);
    }

    const patientGender = document.getElementById('patient-gender-filter');
    if (patientGender) {
        patientGender.addEventListener('change', filterPatients);
    }

    const appointmentSearch = document.getElementById('appointment-search');
    if (appointmentSearch) {
        appointmentSearch.addEventListener('input', () => {
            filterAppointments();
        });
    }

    const appointmentStatus = document.getElementById('appointment-status');
    if (appointmentStatus) {
        appointmentStatus.addEventListener('change', filterAppointments);
    }

    const recordSearch = document.getElementById('record-search');
    if (recordSearch) {
        recordSearch.addEventListener('input', () => {
            filterMedicalRecords();
        });
    }

    const recordPatient = document.getElementById('record-patient');
    if (recordPatient) {
        recordPatient.addEventListener('change', filterMedicalRecords);
    }

    const doctorSearch = document.getElementById('doctor-search');
    if (doctorSearch) {
        doctorSearch.addEventListener('input', () => {
            filterDoctors();
        });
    }

    const doctorSpecialization = document.getElementById('doctor-specialization');
    if (doctorSpecialization) {
        doctorSpecialization.addEventListener('change', filterDoctors);
    }

    const staffSearch = document.getElementById('staff-search');
    if (staffSearch) {
        staffSearch.addEventListener('input', () => {
            filterStaff();
        });
    }

    const staffRole = document.getElementById('staff-role');
    if (staffRole) {
        staffRole.addEventListener('change', filterStaff);
    }
}

function filterPatients() {
    const search = document.getElementById('patient-search')?.value.toLowerCase() || '';
    const status = document.getElementById('patient-status')?.value || 'all';
    const gender = document.getElementById('patient-gender-filter')?.value || 'all';

    const filteredPatients = patients.filter(patient => {
        const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
        const matchesSearch = fullName.includes(search) || patient.id.toLowerCase().includes(search);
        const matchesStatus = status === 'all' || patient.status === status;
        const matchesGender = gender === 'all' || patient.gender === gender;
        return matchesSearch && matchesStatus && matchesGender;
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

function filterAppointments() {
    const search = document.getElementById('appointment-search')?.value.toLowerCase() || '';
    const status = document.getElementById('appointment-status')?.value || 'all';

    const filteredAppointments = appointments.filter(appointment => {
        const patient = patients.find(p => p.id === appointment.patientId);
        const doctor = doctors.find(d => d.id === appointment.doctorId);
        const patientName = patient ? `${patient.firstName} ${patient.lastName}`.toLowerCase() : '';
        const doctorName = doctor ? `${doctor.firstName} ${doctor.lastName}`.toLowerCase() : '';
        const matchesSearch = patientName.includes(search) || doctorName.includes(search) || appointment.id.toLowerCase().includes(search);
        const matchesStatus = status === 'all' || appointment.status === status;
        return matchesSearch && matchesStatus;
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
            <td>${doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'N/A'}</td>
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

function filterMedicalRecords() {
    const search = document.getElementById('record-search')?.value.toLowerCase() || '';
    const patientId = document.getElementById('record-patient')?.value || 'all';

    const filteredRecords = medicalRecords.filter(record => {
        const patient = patients.find(p => p.id === record.patientId);
        const patientName = patient ? `${patient.firstName} ${patient.lastName}`.toLowerCase() : '';
        const matchesSearch = patientName.includes(search) || record.diagnosis.toLowerCase().includes(search) || record.id.toLowerCase().includes(search);
        const matchesPatient = patientId === 'all' || record.patientId === patientId;
        return matchesSearch && matchesPatient;
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

function filterDoctors() {
    const search = document.getElementById('doctor-search')?.value.toLowerCase() || '';
    const specialization = document.getElementById('doctor-specialization')?.value || 'all';

    const filteredDoctors = doctors.filter(doctor => {
        const fullName = `${doctor.firstName} ${doctor.lastName}`.toLowerCase();
        const matchesSearch = fullName.includes(search) || doctor.id.toLowerCase().includes(search);
        const matchesSpecialization = specialization === 'all' || doctor.specialization === specialization;
        return matchesSearch && matchesSpecialization;
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

function filterStaff() {
    const search = document.getElementById('staff-search')?.value.toLowerCase() || '';
    const role = document.getElementById('staff-role')?.value || 'all';

    const filteredStaff = staff.filter(staffMember => {
        const fullName = `${staffMember.firstName} ${staffMember.lastName}`.toLowerCase();
        const matchesSearch = fullName.includes(search) || staffMember.id.toLowerCase().includes(search);
        const matchesRole = role === 'all' || staffMember.role === role;
        return matchesSearch && matchesRole;
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

// Modal Interactions
function setupModalInteractions() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Notifications
function setupNotifications() {
    const notificationBtn = document.querySelector('.notifications');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', toggleNotifications);
    }
}

function toggleNotifications() {
    const dropdown = document.querySelector('.notification-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

// View Buttons
function setupViewButtons() {
    document.addEventListener('click', (e) => {
        const viewBtn = e.target.closest('.btn .fa-eye');
        if (viewBtn) {
            const row = viewBtn.closest('tr');
            const id = row.cells[0].textContent;
            if (row.closest('#recent-appointments')) {
                openAppointmentModal(id);
            } else if (row.closest('#recent-patients')) {
                openPatientModal(id);
            }
        }
    });
}

// Form Validation
function setupFormValidation() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            let isValid = true;
            form.querySelectorAll('input[required], select[required], textarea[required]').forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('invalid');
                    setTimeout(() => field.classList.remove('invalid'), 1000);
                }
            });
            if (!isValid) {
                e.preventDefault();
                alert('Please fill in all required fields.');
            }
        });
    });
}
