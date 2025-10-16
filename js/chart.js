
/**
 * Chart rendering logic. Expects diagnosis_history array with objects that include
 * a year (or timestamp) and blood_pressure with systolic and diastolic values.
 */
function aggregateBPByYear(history) {
  const byYear = {};
  if (!Array.isArray(history)) return { years: [], systolic: [], diastolic: [] };
  history.forEach(entry => {
    let year = entry.year;
    if (!year && entry.date) {
      const d = new Date(entry.date);
      if (!isNaN(d)) year = d.getFullYear();
    }
    if (!year && entry.month && entry.year) {
      year = entry.year;
    }
    if (!year) return;
    // prefer latest for year
    byYear[year] = entry;
  });
  const years = Object.keys(byYear).sort((a,b)=> a - b);
  const systolic = years.map(y => {
    const e = byYear[y];
    return e?.blood_pressure?.systolic?.value || null;
  });
  const diastolic = years.map(y => {
    const e = byYear[y];
    return e?.blood_pressure?.diastolic?.value || null;
  });
  return { years, systolic, diastolic };
}

function showChartError() {
  const el = document.getElementById('chart-error');
  if (el) el.style.display = 'block';
}

window.renderBPChart = function(diagnosis_history) {
  try {
    const { years, systolic, diastolic } = aggregateBPByYear(diagnosis_history);
    if (!years.length) {
      showChartError();
      return;
    }
    const ctx = document.getElementById('bpChart')?.getContext('2d');
    if (!ctx) return;
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: years,
        datasets: [
          {
            label: 'Systolic',
            data: systolic,
            borderWidth: 3,
            tension: 0.4,
            pointRadius: 6,
            pointHoverRadius: 8,
            borderColor: '#705AAA',
            backgroundColor: 'rgba(112,90,170,0.1)',
            fill: true,
            yAxisID: 'y',
          },
          {
            label: 'Diastolic',
            data: diastolic,
            borderWidth: 3,
            tension: 0.4,
            pointRadius: 6,
            pointHoverRadius: 8,
            borderColor: '#084C77',
            backgroundColor: 'rgba(8,76,119,0.1)',
            fill: true,
            yAxisID: 'y',
          }
        ]
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false
        },
        scales: {
          x: {
            grid: { display: false },
            title: { display: false },
            ticks: {
              color: 'rgba(7,38,53,0.8)',
              font: { family: 'Manrope', size: 12 }
            }
          },
          y: {
            grid: {
              color: 'rgba(255,255,255,0.5)',
              borderDash: [8, 4],
              drawBorder: false
            },
            ticks: {
              color: 'rgba(7,38,53,0.8)',
              font: { family: 'Manrope', size: 12 }
            },
            beginAtZero: false
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              font: { family: 'Manrope', size: 12 }
            }
          },
          tooltip: {
            padding: 10,
            titleFont: { family: 'Manrope', weight: '700' },
            bodyFont: { family: 'Manrope' }
          }
        }
      }
    });
  } catch (e) {
    console.error('Chart render failed', e);
    showChartError(); 
  }
};
