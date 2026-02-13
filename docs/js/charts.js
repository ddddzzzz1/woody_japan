// Chart color palette
const COLORS = {
  blue:    '#3a6ea5',
  blueLt:  '#6a9fd8',
  blueXlt: '#a8ccee',
  slate:   '#5a5a72',
  gray:    '#9ca3af',
  red:     '#e05252',
  green:   '#3aaa6e',
  orange:  '#e5953a',
  purple:  '#7c5cbf',
  teal:    '#2da8a8',
};

Chart.defaults.font.family = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Hiragino Sans', sans-serif";
Chart.defaults.font.size = 13;
Chart.defaults.color = '#5a5a72';
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.padding = 16;

function chartTitle(text) {
  return { display: true, text, font: { size: 15, weight: 'bold' }, color: '#1a1a2e', padding: { bottom: 12 } };
}
function yenAxis() {
  return { beginAtZero: true, ticks: { callback: v => (v / 10000).toFixed(0) + '만' }, grid: { color: '#e2e4e9' } };
}

// 1인 가구 소비지출 (Doughnut)
function buildSingleExpenseChart(canvas, single) {
  const main = single.categories.filter(c => c.share >= 5);
  const others = single.categories.filter(c => c.share < 5);
  const otherSum = others.reduce((s, c) => s + c.amount, 0);
  const labels = [...main.map(c => c.name), '기타'];
  const data = [...main.map(c => c.amount), otherSum];
  const colors = [COLORS.blue, COLORS.orange, COLORS.teal, COLORS.purple, COLORS.red, COLORS.green, COLORS.gray];

  new Chart(canvas, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 2, borderColor: '#fff' }] },
    options: {
      responsive: true,
      plugins: {
        title: chartTitle(`1인 가구 월 소비지출 구성 (${single.totalExpense.toLocaleString()}엔)`),
        tooltip: { callbacks: { label: ctx => {
          const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
          return ` ${ctx.label}: ¥${ctx.raw.toLocaleString()} (${((ctx.raw/total)*100).toFixed(1)}%)`;
        }}}
      }
    }
  });
}

// 기업 규모별 (Grouped Bar)
function buildCompanySizeChart(canvas, companySize) {
  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: companySize.map(c => c.label),
      datasets: [
        { label: '월급여 (만엔)', data: companySize.map(c => c.monthlySalary / 10000), backgroundColor: COLORS.blue, borderRadius: 4 },
        { label: '연 상여금 (만엔)', data: companySize.map(c => c.annualBonus / 10000), backgroundColor: COLORS.blueLt, borderRadius: 4 }
      ]
    },
    options: {
      responsive: true,
      plugins: { title: chartTitle('기업 규모별 임금 비교 (만엔)'), tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.raw.toFixed(1)}만엔` } } },
      scales: { y: { beginAtZero: true, ticks: { callback: v => v + '만' }, grid: { color: '#e2e4e9' } }, x: { grid: { display: false } } }
    }
  });
}

// 도시별 렌트 (Grouped Bar)
function buildRentChart(canvas, rentData) {
  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: rentData.map(r => r.city),
      datasets: [
        { label: '1BR 시내 중심', data: rentData.map(r => r.center1br), backgroundColor: COLORS.blue, borderRadius: 4 },
        { label: '1BR 시내 외곽', data: rentData.map(r => r.suburb1br), backgroundColor: COLORS.blueXlt, borderRadius: 4 }
      ]
    },
    options: {
      responsive: true,
      plugins: { title: chartTitle('도시별 1BR 월 렌트 비교 (엔)'), tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ¥${ctx.raw.toLocaleString()}` } } },
      scales: { y: yenAxis(), x: { grid: { display: false } } }
    }
  });
}

// 도시별 세후 월급 (Horizontal Bar)
function buildSalaryChart(canvas, salaryData) {
  const barColors = [COLORS.blue, COLORS.blueLt, COLORS.teal, COLORS.purple, COLORS.orange];
  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: salaryData.map(s => s.city),
      datasets: [{ label: '세후 월급', data: salaryData.map(s => s.netMonthly), backgroundColor: barColors, borderRadius: 4 }]
    },
    options: {
      indexAxis: 'y', responsive: true,
      plugins: { title: chartTitle('도시별 평균 세후 월급 (엔)'), legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ¥${ctx.raw.toLocaleString()}/월` } } },
      scales: { x: yenAxis(), y: { grid: { display: false } } }
    }
  });
}

// 도시별 월 예산 vs 월급 (Mixed)
function buildBudgetChart(canvas, allCities) {
  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: allCities.names,
      datasets: [
        { label: '절약형', data: allCities.frugal, backgroundColor: COLORS.blueXlt, borderRadius: 4 },
        { label: '여유형', data: allCities.comfort, backgroundColor: COLORS.blue, borderRadius: 4 },
        { label: '세후 월급', data: allCities.netSalary, backgroundColor: 'transparent', borderColor: COLORS.red, borderWidth: 2, borderDash: [6,3], type: 'line', pointStyle: 'circle', pointRadius: 5, pointBackgroundColor: COLORS.red, order: 0 }
      ]
    },
    options: {
      responsive: true,
      plugins: { title: chartTitle('도시별 월 예산 vs 세후 월급 (엔)'), tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ¥${ctx.raw.toLocaleString()}` } } },
      scales: { y: yenAxis(), x: { grid: { display: false } } }
    }
  });
}

// CPI 카테고리별 (Horizontal Bar)
function buildCPIChart(canvas, chartData) {
  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: chartData.labels,
      datasets: [{ label: '전년 대비 (%)', data: chartData.values, backgroundColor: ctx => ctx.raw < 0 ? COLORS.blue : ctx.raw > 5 ? COLORS.red : COLORS.orange, borderRadius: 4 }]
    },
    options: {
      indexAxis: 'y', responsive: true,
      plugins: { title: chartTitle('2024 CPI 카테고리별 전년 대비 변화율 (%)'), legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.raw > 0 ? '+' : ''}${ctx.raw}%` } } },
      scales: { x: { grid: { color: '#e2e4e9' }, ticks: { callback: v => (v > 0 ? '+' : '') + v + '%' } }, y: { grid: { display: false } } }
    }
  });
}
