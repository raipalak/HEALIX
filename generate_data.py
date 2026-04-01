import json
import random
from datetime import datetime, timedelta

def random_date(start, end):
    return start + timedelta(days=random.randint(0, int((end - start).days)))

names = ["Aarav Sharma", "Vihaan Patel", "Aditya Singh", "Arjun Verma", "Sai Kumar", "Reyansh Reddy", "Ayaan Gupta", "Krishna Iyer", "Ishaan Joshi", "Ojas Deshmukh",
         "Diya Patel", "Anya Sharma", "Myra Singh", "Ananya Verma", "Kavya Reddy", "Prisha Gupta", "Riya Iyer", "Sara Joshi", "Anika Deshmukh", "Naira Kumar",
         "Karan Mehta", "Rahul Nair", "Vikram Singh", "Priya Das", "Neha Gupta", "Sneha Patil", "Amit Shah", "Suresh Menon", "Gita Rao", "Pooja Bose"]

cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur"]
diseases = ["Viral Fever", "Type 2 Diabetes", "Hypertension", "Bone Fracture", "COVID-19", "Dengue", "Malaria", "Migraine", "Asthma", "Gastritis", "Food Poisoning"]
blood_groups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]

patients = []
for i in range(1, 40):
    status = random.choices(["Outpatient", "Admitted", "Critical"], weights=[60, 30, 10])[0]
    
    # Enforce minimums (at least 5 admitted, 3 ICU/critical... let's do it manually if stats don't match, but out of 40 it's likely)
    if i <= 3: status = "Critical"
    elif i <= 8: status = "Admitted"
    
    p = {
        "patientId": f"PAT{1000+i}",
        "fullName": names[i % len(names)],
        "age": random.randint(5, 85),
        "gender": random.choice(["Male", "Female"]),
        "phone": f"+91 {random.randint(9000000000, 9999999999)}",
        "email": f"patient{i}@example.com",
        "address": f"{random.randint(10, 99)}, {random.choice(cities)}",
        "disease": random.choice(diseases),
        "bloodGroup": random.choice(blood_groups),
        "allergies": random.choice(["None", "Dust", "Penicillin", "Peanuts"]) if random.random() > 0.5 else "None",
        "emergencyContact": f"+91 {random.randint(9000000000, 9999999999)}",
        "status": status,
        "createdAt": "2026-03-01T10:00:00Z"
    }
    if status in ["Admitted", "Critical"]:
        p["bedNumber"] = f"{'ICU' if status == 'Critical' else 'GEN'}-{10+i}"
        p["admissionDate"] = "2026-03-25"
    
    patients.append(p)

with open('src/data/patients.json', 'w') as f:
    json.dump(patients, f, indent=2)

doctors = [
    {"doctorId": "DOC01", "fullName": "Dr. Ramesh Gupta", "specialization": "Cardiologist", "experience": 15, "phone": "+91 9876543210", "availability": "Available", "assignedPatients": 12},
    {"doctorId": "DOC02", "fullName": "Dr. Sunita Sharma", "specialization": "Neurologist", "experience": 10, "phone": "+91 9876543211", "availability": "In Surgery", "assignedPatients": 8},
    {"doctorId": "DOC03", "fullName": "Dr. Anil Kumar", "specialization": "General Physician", "experience": 8, "phone": "+91 9876543212", "availability": "Available", "assignedPatients": 25},
    {"doctorId": "DOC04", "fullName": "Dr. Priya Patel", "specialization": "Orthopedic", "experience": 12, "phone": "+91 9876543213", "availability": "On Leave", "assignedPatients": 0},
    {"doctorId": "DOC05", "fullName": "Dr. Vikram Singh", "specialization": "Pediatrician", "experience": 20, "phone": "+91 9876543214", "availability": "Available", "assignedPatients": 15},
    {"doctorId": "DOC06", "fullName": "Dr. Neha Desai", "specialization": "General Physician", "experience": 5, "phone": "+91 9876543215", "availability": "Available", "assignedPatients": 30},
    {"doctorId": "DOC07", "fullName": "Dr. Rajesh Shah", "specialization": "Cardiologist", "experience": 18, "phone": "+91 9876543216", "availability": "Available", "assignedPatients": 10},
    {"doctorId": "DOC08", "fullName": "Dr. Kavita Joshi", "specialization": "Neurologist", "experience": 7, "phone": "+91 9876543217", "availability": "Available", "assignedPatients": 5},
    {"doctorId": "DOC09", "fullName": "Dr. Sameer Reddy", "specialization": "Orthopedic", "experience": 14, "phone": "+91 9876543218", "availability": "Available", "assignedPatients": 18},
    {"doctorId": "DOC10", "fullName": "Dr. Pooja Iyer", "specialization": "Pediatrician", "experience": 9, "phone": "+91 9876543219", "availability": "In Surgery", "assignedPatients": 11},
]

# assign random doctors to patients
for p in patients:
    p['assignedDoctor'] = random.choice([d['fullName'] for d in doctors])

with open('src/data/patients.json', 'w') as f:
    json.dump(patients, f, indent=2)

with open('src/data/doctors.json', 'w') as f:
    json.dump(doctors, f, indent=2)

appointments = []
for i in range(1, 35):
    appointments.append({
        "appointmentId": f"APT{1000+i}",
        "patientId": random.choice(patients)["patientId"],
        "patientName": random.choice(patients)["fullName"],
        "doctorId": random.choice(doctors)["doctorId"],
        "doctorName": random.choice(doctors)["fullName"],
        "date": f"2026-04-{random.randint(1, 15):02d}",
        "time": f"{random.randint(9, 16):02d}:00",
        "status": random.choice(["Scheduled", "Completed", "Cancelled"]),
        "reason": random.choice(["Follow-up", "Consultation", "Routine Checkup", "Pain", "Fever"])
    })

with open('src/data/appointments.json', 'w') as f:
    json.dump(appointments, f, indent=2)

beds = []
for i in range(1, 16):
    is_icu = i <= 5
    status = "Available"
    patient_id = None
    if random.random() > 0.4:
        status = "Occupied"
        patient_id = random.choice(patients)["patientId"]
    
    beds.append({
        "bedId": f"{'ICU' if is_icu else 'GEN'}-{100+i}",
        "ward": "ICU Ward" if is_icu else "General Ward",
        "status": status,
        "assignedPatientId": patient_id
    })

with open('src/data/beds.json', 'w') as f:
    json.dump(beds, f, indent=2)

billing = []
for i in range(1, 26):
    billing.append({
        "billId": f"INV-{2026000+i}",
        "patientId": random.choice(patients)["patientId"],
        "patientName": random.choice(patients)["fullName"],
        "amount": round(random.uniform(500, 15000), 2),
        "status": random.choice(["Paid", "Pending"]),
        "services": "Consultation, Lab Tests",
        "date": f"2026-04-{random.randint(1, 5):02d}"
    })

with open('src/data/billing.json', 'w') as f:
    json.dump(billing, f, indent=2)

print("Data generation complete.")
