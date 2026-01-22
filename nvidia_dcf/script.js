const initialFCF = 77324; // $M (Trailing 12-month Free Cash Flow as of Jan 2026)
const initialShares = 24483; // Millions (Diluted)
const netCash = 52141; // $M

const sliders = {
    growthY1_5: document.getElementById('growth-1-5'),
    growthY6_10: document.getElementById('growth-6-10'),
    wacc: document.getElementById('wacc'),
    terminalGrowth: document.getElementById('terminal-growth')
};

const labels = {
    growthY1_5: document.getElementById('label-growth-1-5'),
    growthY6_10: document.getElementById('label-growth-6-10'),
    wacc: document.getElementById('label-wacc'),
    terminalGrowth: document.getElementById('label-terminal-growth'),
    valuation: document.getElementById('valuation-result')
};

let chart;

function calculateDCF() {
    const r1 = parseFloat(sliders.growthY1_5.value) / 100;
    const r2 = parseFloat(sliders.growthY6_10.value) / 100;
    const wacc = parseFloat(sliders.wacc.value) / 100;
    const g = parseFloat(sliders.terminalGrowth.value) / 100;

    let totalPV = 0;
    let currentFCF = initialFCF;
    const projections = [];
    const years = [];

    // Stage 1: Years 1-5
    for (let i = 1; i <= 5; i++) {
        currentFCF *= (1 + r1);
        const pv = currentFCF / Math.pow(1 + wacc, i);
        totalPV += pv;
        projections.push(Math.round(currentFCF));
        years.push(`Year ${i}`);
    }

    // Stage 2: Years 6-10
    for (let i = 6; i <= 10; i++) {
        currentFCF *= (1 + r2);
        const pv = currentFCF / Math.pow(1 + wacc, i);
        totalPV += pv;
        projections.push(Math.round(currentFCF));
        years.push(`Year ${i}`);
    }

    // Terminal Value
    const terminalFCF = currentFCF * (1 + g);
    const terminalValue = terminalFCF / (wacc - g);
    const pvTerminal = terminalValue / Math.pow(1 + wacc, 10);
    
    totalPV += pvTerminal;

    // Equity Value
    const equityValue = totalPV + netCash;
    const sharePrice = equityValue / initialShares;

    updateUI(sharePrice, years, projections);
}

function updateUI(price, years, projections) {
    labels.valuation.textContent = `$${price.toFixed(2)}`;
    
    labels.growthY1_5.textContent = `${sliders.growthY1_5.value}%`;
    labels.growthY6_10.textContent = `${sliders.growthY6_10.value}%`;
    labels.wacc.textContent = `${sliders.wacc.value}%`;
    labels.terminalGrowth.textContent = `${sliders.terminalGrowth.value}%`;

    updateChart(years, projections);
}

function updateChart(labels, data) {
    if (chart) {
        chart.data.labels = labels;
        chart.data.datasets[0].data = data;
        chart.update();
    } else {
        const ctx = document.getElementById('fcf-chart').getContext('2d');
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Projected FCF ($M)',
                    data: data,
                    borderColor: '#76b900',
                    backgroundColor: 'rgba(118, 185, 0, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#76b900'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: '#1a202c',
                        titleColor: '#fff',
                        bodyColor: '#a0aec0',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#a0aec0'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#a0aec0'
                        }
                    }
                }
            }
        });
    }
}

// Event Listeners
Object.values(sliders).forEach(slider => {
    slider.addEventListener('input', calculateDCF);
});

// Initial Calculation
document.addEventListener('DOMContentLoaded', calculateDCF);
