// Chart color palette (matching site design)
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

// Shared defaults
Chart.defaults.font.family = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Hiragino Sans', sans-serif";
Chart.defaults.font.size = 13;
Chart.defaults.color = '#5a5a72';
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.padding = 16;

// Helper: number formatter for JPY
const fmtYen = (v) => '¥' + v.toLocaleString();

// ─── 1. 1인 가구 소비지출 (Doughnut) ───
new Chart(document.getElementById('chart-single-expense'), {
  type: 'doughnut',
  data: {
    labels: ['식료', '주거', '교통/통신', '교양/오락', '광열수도', '보건의료', '기타'],
    datasets: [{
      data: [43941, 23372, 20418, 19519, 12816, 8501, 41121],
      backgroundColor: [
        COLORS.blue, COLORS.orange, COLORS.teal, COLORS.purple,
        COLORS.red, COLORS.green, COLORS.gray
      ],
      borderWidth: 2,
      borderColor: '#fff',
    }]
  },
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: '1인 가구 월 소비지출 구성 (169,547엔)',
        font: { size: 15, weight: 'bold' },
        color: '#1a1a2e',
        padding: { bottom: 12 },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const pct = ((ctx.raw / total) * 100).toFixed(1);
            return ` ${ctx.label}: ${fmtYen(ctx.raw)} (${pct}%)`;
          }
        }
      }
    }
  }
});

// ─── 2. 기업 규모별 임금 (Bar) ───
new Chart(document.getElementById('chart-company-size'), {
  type: 'bar',
  data: {
    labels: ['대기업\n(1,000명+)', '중기업\n(100~999명)', '소기업\n(10~99명)'],
    datasets: [
      {
        label: '월급여 (만엔)',
        data: [36.45, 32.31, 29.93],
        backgroundColor: COLORS.blue,
        borderRadius: 4,
      },
      {
        label: '연 상여금 (만엔)',
        data: [127.18, 91.94, 62.29],
        backgroundColor: COLORS.blueLt,
        borderRadius: 4,
      }
    ]
  },
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: '기업 규모별 임금 비교 (만엔)',
        font: { size: 15, weight: 'bold' },
        color: '#1a1a2e',
        padding: { bottom: 12 },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw.toFixed(1)}만엔`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (v) => v + '만'
        },
        grid: { color: '#e2e4e9' },
      },
      x: {
        grid: { display: false },
      }
    }
  }
});

// ─── 3. 도시별 1BR 렌트 비교 (Grouped Bar) ───
new Chart(document.getElementById('chart-rent-city'), {
  type: 'bar',
  data: {
    labels: ['도쿄', '오사카', '나고야', '후쿠오카', '삿포로'],
    datasets: [
      {
        label: '1BR 시내 중심',
        data: [184084, 112000, 82920, 84278, 72000],
        backgroundColor: COLORS.blue,
        borderRadius: 4,
      },
      {
        label: '1BR 시내 외곽',
        data: [101867, 84000, 55800, 52100, 44000],
        backgroundColor: COLORS.blueXlt,
        borderRadius: 4,
      }
    ]
  },
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: '도시별 1BR 월 렌트 비교 (엔)',
        font: { size: 15, weight: 'bold' },
        color: '#1a1a2e',
        padding: { bottom: 12 },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${fmtYen(ctx.raw)}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (v) => (v / 10000).toFixed(0) + '만'
        },
        grid: { color: '#e2e4e9' },
      },
      x: {
        grid: { display: false },
      }
    }
  }
});

// ─── 4. 도시별 세후 월급 (Horizontal Bar) ───
new Chart(document.getElementById('chart-salary-city'), {
  type: 'bar',
  data: {
    labels: ['도쿄', '오사카', '나고야', '삿포로', '후쿠오카'],
    datasets: [{
      label: '세후 월급',
      data: [408799, 324141, 290146, 253719, 249390],
      backgroundColor: [COLORS.blue, COLORS.blueLt, COLORS.teal, COLORS.purple, COLORS.orange],
      borderRadius: 4,
    }]
  },
  options: {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: '도시별 평균 세후 월급 (엔)',
        font: { size: 15, weight: 'bold' },
        color: '#1a1a2e',
        padding: { bottom: 12 },
      },
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${fmtYen(ctx.raw)}/월`
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: (v) => (v / 10000).toFixed(0) + '만'
        },
        grid: { color: '#e2e4e9' },
      },
      y: {
        grid: { display: false },
      }
    }
  }
});

// ─── 5. 도시별 월 예산 절약형 vs 여유형 (Grouped Bar) ───
new Chart(document.getElementById('chart-budget-city'), {
  type: 'bar',
  data: {
    labels: ['도쿄', '오사카', '나고야', '후쿠오카', '삿포로'],
    datasets: [
      {
        label: '절약형',
        data: [206000, 140000, 140000, 140000, 155000],
        backgroundColor: COLORS.blueXlt,
        borderRadius: 4,
      },
      {
        label: '여유형',
        data: [342000, 248000, 230000, 240000, 260000],
        backgroundColor: COLORS.blue,
        borderRadius: 4,
      },
      {
        label: '세후 월급',
        data: [408799, 324141, 290146, 249390, 253719],
        backgroundColor: 'transparent',
        borderColor: COLORS.red,
        borderWidth: 2,
        borderDash: [6, 3],
        type: 'line',
        pointStyle: 'circle',
        pointRadius: 5,
        pointBackgroundColor: COLORS.red,
        order: 0,
      }
    ]
  },
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: '도시별 월 예산 vs 세후 월급 (엔)',
        font: { size: 15, weight: 'bold' },
        color: '#1a1a2e',
        padding: { bottom: 12 },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${fmtYen(ctx.raw)}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (v) => (v / 10000).toFixed(0) + '만'
        },
        grid: { color: '#e2e4e9' },
      },
      x: {
        grid: { display: false },
      }
    }
  }
});

// ─── 6. CPI 카테고리별 변화율 (Horizontal Bar) ───
new Chart(document.getElementById('chart-cpi'), {
  type: 'bar',
  data: {
    labels: ['과일', '채소', '곡류', '전기요금', '생선식품', '교양/오락', '식료 전체', '에너지', '총합 (General)', '주거', '교육'],
    datasets: [{
      label: '전년 대비 (%)',
      data: [10.7, 8.6, 8.5, 7.4, 7.0, 5.4, 4.3, 3.8, 2.7, 0.5, -0.4],
      backgroundColor: (ctx) => ctx.raw < 0 ? COLORS.blue : ctx.raw > 5 ? COLORS.red : COLORS.orange,
      borderRadius: 4,
    }]
  },
  options: {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: '2024 CPI 카테고리별 전년 대비 변화율 (%)',
        font: { size: 15, weight: 'bold' },
        color: '#1a1a2e',
        padding: { bottom: 12 },
      },
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.raw > 0 ? '+' : ''}${ctx.raw}%`
        }
      }
    },
    scales: {
      x: {
        grid: { color: '#e2e4e9' },
        ticks: {
          callback: (v) => (v > 0 ? '+' : '') + v + '%'
        }
      },
      y: {
        grid: { display: false },
      }
    }
  }
});
