// Constants
const API_BASE = 'http://localhost:5000'; // Target FastAPI backend
const DEVICE_ID = 'demo-user';

let vitalsChart;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Generate some mock startup-style UI elements to fulfill visual UX goals
    document.getElementById('mockSteps').innerText = (Math.floor(Math.random() * 5000) + 5000).toLocaleString();
    document.getElementById('mockCals').innerText = (Math.floor(Math.random() * 800) + 1800).toLocaleString();
    
    // Check local storage for theme
    const isNight = localStorage.getItem('theme') === 'night';
    if(isNight) document.body.classList.add('night');

    fetchHistory();
});

// Theme Toggle
function toggleTheme() {
    document.body.classList.toggle('night');
    const mode = document.body.classList.contains('night') ? 'night' : 'day';
    localStorage.setItem('theme', mode);

    // Re-render chart defaults for correct font coloring dynamically
    if (vitalsChart) {
        const isNight = document.body.classList.contains('night');
        Chart.defaults.color = isNight ? '#94a3b8' : '#64748b';
        Chart.defaults.scale.grid.color = isNight ? '#334155' : '#e2e8f0';
        vitalsChart.update();
    }
}

// Fetch Data from app.py
async function fetchHistory() {
    try {
        const res = await fetch(`${API_BASE}/health-history/${DEVICE_ID}`);
        if(!res.ok) throw new Error("Failed to fetch history");
        const data = await res.json();
        
        // Update Chart and Table
        if(data.history && data.history.length > 0) {
            updateDashboard(data.history);
        } else {
            document.getElementById('historyTable').innerHTML = '<tr><td colspan="7">No history found. Try logging some vitals!</td></tr>';
            // Clear chart
            if (vitalsChart) vitalsChart.destroy();
        }
    } catch (err) {
        console.error("Fetch Error: ", err);
        document.getElementById('historyTable').innerHTML = '<tr><td colspan="7">Error loading data. Ensure the backend is running.</td></tr>';
    }
}

// UI Updaters
function updateDashboard(history) {
    // 1. Update Table
    const tbody = document.getElementById('historyTable');
    tbody.innerHTML = '';

    history.forEach(entry => {
        const tr = document.createElement('tr');
        
        // Risk Badge coloring
        let riskClass = 'normal';
        if(entry.risk.includes('High')) riskClass = 'high';
        else if(entry.risk.includes('Moderate')) riskClass = 'moderate';

        tr.innerHTML = `
            <td>${entry.date}</td>
            <td><strong>${entry.sys}</strong> / ${entry.dia}</td>
            <td>${entry.sugar} mg/dL</td>
            <td><strong>${entry.score}</strong> / 100</td>
            <td><span class="badge ${riskClass}">${entry.risk}</span></td>
            <td><small>${entry.suggestion}</small></td>
            <td><button onclick="deleteEntry(${entry.id})" style="background:transparent; border:none; cursor:pointer; color:var(--danger)">🗑️</button></td>
        `;
        tbody.appendChild(tr);
    });

    // 2. Update Chart
    // Get last 15 entries & Reverse for chronological order left-to-right
    const chartData = history.slice(0, 15).reverse();
    
    const labels = chartData.map(e => e.date);
    const sysData = chartData.map(e => e.sys);
    const diaData = chartData.map(e => e.dia);

    const ctx = document.getElementById('healthChart').getContext('2d');
    
    if (vitalsChart) vitalsChart.destroy();

    // Theming ChartJS depending on mode
    const isNight = document.body.classList.contains('night');
    Chart.defaults.color = isNight ? '#94a3b8' : '#64748b';
    Chart.defaults.scale.grid.color = isNight ? '#334155' : '#e2e8f0';
    Chart.defaults.font.family = "'Inter', sans-serif";

    vitalsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Systolic',
                    data: sysData,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.3,
                    fill: true,
                    borderWidth: 2
                },
                {
                    label: 'Diastolic',
                    data: diaData,
                    borderColor: '#38bdf8',
                    backgroundColor: 'rgba(56, 189, 248, 0.1)',
                    tension: 0.3,
                    fill: true,
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { 
                    beginAtZero: false,
                    suggestedMin: 50,
                    suggestedMax: 180
                }
            },
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// POST new vitals
async function saveVitals() {
    const sys = parseInt(document.getElementById('sysIn').value);
    const dia = parseInt(document.getElementById('diaIn').value);
    const sugar = parseInt(document.getElementById('sugarIn').value);
    const hr = parseInt(document.getElementById('hrIn').value);
    const spo2 = parseInt(document.getElementById('spo2In').value);
    const temp = parseFloat(document.getElementById('tempIn').value);

    // Validate
    if(!sys || !dia || !sugar || !hr || !spo2 || !temp) {
        alert("Please fill in all vitals to get an accurate Health Index score.");
        return;
    }

    // Pydantic Expected Payload matches app.py HealthData schema
    const payload = {
        device_id: DEVICE_ID,
        age: 30, // Default demographic for tracking demo
        gender: "Male",
        height: 175,
        weight: 70,
        hr: hr,
        sys: sys,
        dia: dia,
        sugar: sugar,
        temp: temp,
        spo2: spo2,
        symptoms: [], 
        duration: "None"
    };

    try {
        const res = await fetch(`${API_BASE}/health-data`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if(res.ok) {
            // Clear fields on success
            document.querySelectorAll('.input-group input').forEach(el => el.value = '');
            // Reload history to see the new backend AI prediction score
            fetchHistory();
        } else {
            const err = await res.json();
            console.log("Validation Error:", err);
            alert("Error saving data: Check your vital formats.");
        }

    } catch(err) {
        console.error(err);
        alert("Network Error: Could not reach the backend at " + API_BASE);
    }
}

// Delete Entry
async function deleteEntry(entryId) {
    if(!confirm("Are you sure you want to delete this vital log?")) return;
    
    try {
        const res = await fetch(`${API_BASE}/health-entry/${entryId}`, { method: 'DELETE' });
        if(res.ok) fetchHistory();
    } catch(err) {
        console.error(err);
    }
}
