// ── Utility ──
const fmt = (n) => n == null ? '—' : n.toLocaleString();
const fmtYen = (n) => '¥' + n.toLocaleString();
const fmtPct = (n) => n == null ? '—' : (n > 0 ? '+' : '') + n + '%';

async function fetchJSON(path) {
  const res = await fetch(path);
  return res.json();
}

// ── Table Builder ──
function buildTable(headers, rows, opts = {}) {
  // opts.numCols: array of column indices that are numeric (right-aligned)
  // opts.highlightLast: bold the last row
  const wrap = document.createElement('div');
  wrap.className = 'table-wrap';
  const table = document.createElement('table');

  const thead = document.createElement('thead');
  const headTr = document.createElement('tr');
  headers.forEach((h, i) => {
    const th = document.createElement('th');
    th.textContent = h;
    if (opts.numCols && opts.numCols.includes(i)) th.className = 'num';
    headTr.appendChild(th);
  });
  thead.appendChild(headTr);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  rows.forEach((row, ri) => {
    const tr = document.createElement('tr');
    row.forEach((cell, ci) => {
      const td = document.createElement('td');
      const isLast = ri === rows.length - 1 && opts.highlightLast;
      if (isLast) {
        td.innerHTML = '<strong>' + cell + '</strong>';
      } else {
        td.textContent = cell;
      }
      if (opts.numCols && opts.numCols.includes(ci)) td.className = 'num';
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  wrap.appendChild(table);
  return wrap;
}

function buildInsight(html) {
  const div = document.createElement('div');
  div.className = 'insight';
  div.innerHTML = html;
  return div;
}

// ── Section 1: Household ──
async function renderHousehold(container) {
  const d = await fetchJSON('data/household.json');
  const s = d.single;
  const m = d.multi;

  // Single household
  const h3s = document.createElement('h3');
  h3s.textContent = `1인 가구 (単身世帯) — 월 소비지출 ${fmt(s.totalExpense)}엔`;
  container.appendChild(h3s);

  const ps = document.createElement('p');
  ps.textContent = `평균 연령 ${s.avgAge}세 (근로자 ${s.workerAge}세, 무직 ${s.unemployedAge}세) | 엥겔 계수 ${s.engelCoeff}%`;
  container.appendChild(ps);

  const sRows = s.categories.map(c => [c.name, fmt(c.amount), c.share + '%', fmtPct(c.yoy)]);
  container.appendChild(buildTable(
    ['카테고리', '월평균 (엔)', '비중', '전년 대비'],
    sRows,
    { numCols: [1, 2, 3] }
  ));

  // Chart: doughnut
  const chartWrap = document.createElement('div');
  chartWrap.className = 'chart-wrap';
  const canvas = document.createElement('canvas');
  chartWrap.appendChild(canvas);
  container.appendChild(chartWrap);
  buildSingleExpenseChart(canvas, s);

  const wi = s.workerIncome;
  container.appendChild(buildInsight(
    `<strong>근로자 1인 가구 수입:</strong> 실수입 ${fmt(wi.realIncome)}엔/월 (실질 +${wi.realIncomeYoy}%) — 근로소득 ${fmt(wi.laborIncome)}엔 (급여 ${fmt(wi.salary)}엔 + 상여 ${fmt(wi.bonus)}엔)`
  ));

  // Multi household
  const h3m = document.createElement('h3');
  h3m.textContent = `2인 이상 가구 (二人以上の世帯) — 월 소비지출 ${fmt(m.totalExpense)}엔`;
  container.appendChild(h3m);

  const pm = document.createElement('p');
  pm.textContent = `평균 가구원 ${m.avgMembers}명 | 세대주 평균 연령 ${m.headAge}세 | 엥겔 계수 ${m.engelCoeff}%`;
  container.appendChild(pm);

  const mRows = m.categories.map(c => [c.name, fmt(c.amount), c.share + '%']);
  container.appendChild(buildTable(
    ['카테고리', '월평균 (엔)', '비중'],
    mRows,
    { numCols: [1, 2] }
  ));

  container.appendChild(buildInsight(
    `<strong>근로자 2인 이상 가구:</strong> 실수입 ${fmt(m.workerIncome)}엔/월, 소비지출 ${fmt(m.workerExpense)}엔/월`
  ));

  const f = d.flash2025;
  container.appendChild(buildInsight(
    `<strong>2025년 속보치:</strong> 2인 이상 가구 ${fmt(f.multiExpense)}엔/월 (명목 +${f.multiNominalYoy}%, 실질 +${f.multiRealYoy}%) — 근로자 가구 수입 ${fmt(f.workerIncome)}엔/월`
  ));
}

// ── Section 2: Wages ──
async function renderWages(container) {
  const d = await fetchJSON('data/wages.json');

  // Overall
  const h3o = document.createElement('h3');
  h3o.textContent = '전체 평균';
  container.appendChild(h3o);
  container.appendChild(buildTable(
    ['항목', '금액 (엔)'],
    [
      ['월 소정내 급여 (所定内給与)', fmt(d.overall.monthlySalary)],
      ['연간 상여금', fmt(d.overall.annualBonus)],
      ['연 환산 총액', '약 ' + fmt(d.overall.annualTotal)]
    ],
    { numCols: [1] }
  ));

  // Gender
  const h3g = document.createElement('h3');
  h3g.textContent = '성별 격차';
  container.appendChild(h3g);
  container.appendChild(buildTable(
    ['구분', '월급여 (엔)', '비율'],
    d.gender.map(g => [g.label, fmt(g.monthlySalary), g.ratio + '%']),
    { numCols: [1, 2] }
  ));

  // Company size
  const h3c = document.createElement('h3');
  h3c.textContent = '기업 규모별';
  container.appendChild(h3c);
  container.appendChild(buildTable(
    ['규모', '월급여 (엔)', '연 상여금 (엔)'],
    d.companySize.map(c => [c.label, fmt(c.monthlySalary), fmt(c.annualBonus)]),
    { numCols: [1, 2] }
  ));

  // Chart
  const chartWrap = document.createElement('div');
  chartWrap.className = 'chart-wrap';
  const canvas = document.createElement('canvas');
  chartWrap.appendChild(canvas);
  container.appendChild(chartWrap);
  buildCompanySizeChart(canvas, d.companySize);

  container.appendChild(buildInsight(
    `<strong>연령별 피크:</strong> 남성 ${d.agePeak.male.ageRange} ${fmt(d.agePeak.male.amount)}엔/월, 여성 ${d.agePeak.female.ageRange} ${fmt(d.agePeak.female.amount)}엔/월`
  ));
}

// ── Section 3: Cities ──
async function renderCities(container) {
  const d = await fetchJSON('data/cities.json');

  // Rent
  const h3r = document.createElement('h3');
  h3r.textContent = '렌트 (월)';
  container.appendChild(h3r);
  const rentRows = d.rent.data.map(r => [r.city, fmt(r.center1br), fmt(r.suburb1br), fmt(r.center3br), fmt(r.suburb3br)]);
  const avg = d.rent.nationalAvg;
  rentRows.push(['전국 평균', fmt(avg.center1br), fmt(avg.suburb1br), fmt(avg.center3br), fmt(avg.suburb3br)]);
  container.appendChild(buildTable(d.rent.columns, rentRows, { numCols: [1,2,3,4], highlightLast: true }));

  // Rent chart
  const cw1 = document.createElement('div');
  cw1.className = 'chart-wrap';
  const cv1 = document.createElement('canvas');
  cw1.appendChild(cv1);
  container.appendChild(cw1);
  buildRentChart(cv1, d.rent.data);

  // Utilities
  const h3u = document.createElement('h3');
  h3u.textContent = `유틸리티 (${d.utilities.note})`;
  container.appendChild(h3u);
  const utilRows = d.utilities.data.map(u => [u.city, fmt(u.basic), fmt(u.internet), fmt(u.mobile)]);
  const ua = d.utilities.nationalAvg;
  utilRows.push(['전국 평균', fmt(ua.basic), fmt(ua.internet), fmt(ua.mobile)]);
  container.appendChild(buildTable(d.utilities.columns, utilRows, { numCols: [1,2,3], highlightLast: true }));

  container.appendChild(buildInsight(
    '<strong>삿포로 유틸리티가 전국 평균의 2.1배</strong> — 겨울 난방비 영향으로 기본 유틸리티 53,126엔'
  ));

  // Transport
  const h3t = document.createElement('h3');
  h3t.textContent = '교통 (월정기권)';
  container.appendChild(h3t);
  const transRows = d.transport.data.map(t => [t.city, fmt(t.monthlyPass), fmt(t.oneWay)]);
  const ta = d.transport.nationalAvg;
  transRows.push(['전국 평균', fmt(ta.monthlyPass), fmt(ta.oneWay)]);
  container.appendChild(buildTable(['도시', '월정기권 (엔)', '편도 1회 (엔)'], transRows, { numCols: [1,2], highlightLast: true }));

  // Dining
  const h3d = document.createElement('h3');
  h3d.textContent = '외식';
  container.appendChild(h3d);
  const dCities = [...d.cityOrder, '전국 평균'];
  const dHeaders = ['항목', ...dCities];
  const dRows = d.dining.items.map((item, i) => {
    return [item, ...dCities.map(c => fmt(d.dining.data[c][i]))];
  });
  container.appendChild(buildTable(dHeaders, dRows, { numCols: [1,2,3,4,5,6] }));

  // Salary
  const h3sal = document.createElement('h3');
  h3sal.textContent = '평균 세후 월급';
  container.appendChild(h3sal);
  const salRows = d.salary.map(s => [s.city, fmt(s.netMonthly)]);
  salRows.push(['전국 평균', fmt(d.salaryNationalAvg)]);
  container.appendChild(buildTable(['도시', '세후 월급 (엔)'], salRows, { numCols: [1], highlightLast: true }));

  // Salary chart
  const cw2 = document.createElement('div');
  cw2.className = 'chart-wrap';
  const cv2 = document.createElement('canvas');
  cw2.appendChild(cv2);
  container.appendChild(cw2);
  buildSalaryChart(cv2, d.salary);
}

// ── Section 4: Budget ──
async function renderBudget(container) {
  const d = await fetchJSON('data/budget.json');

  // Tokyo
  const h3t = document.createElement('h3');
  h3t.textContent = '도쿄';
  container.appendChild(h3t);
  const tRows = d.tokyo.categories.map((cat, i) => [cat, fmt(d.tokyo.frugal[i]), fmt(d.tokyo.comfort[i]), d.tokyo.basis[i]]);
  tRows.push(['합계', '~' + fmt(d.tokyo.totalFrugal), '~' + fmt(d.tokyo.totalComfort), '']);
  container.appendChild(buildTable(['카테고리', '절약형 (엔)', '여유형 (엔)', '근거'], tRows, { numCols: [1,2] }));
  container.appendChild(buildInsight(`세후 월급 대비: 절약형 <strong>${d.tokyo.salaryRatioFrugal}%</strong>, 여유형 <strong>${d.tokyo.salaryRatioComfort}%</strong>`));

  // Osaka
  const h3o = document.createElement('h3');
  h3o.textContent = '오사카';
  container.appendChild(h3o);
  const oRows = d.osaka.categories.map((cat, i) => [cat, fmt(d.osaka.frugal[i]), fmt(d.osaka.comfort[i]), d.osaka.basis[i]]);
  oRows.push(['합계', '~' + fmt(d.osaka.totalFrugal), '~' + fmt(d.osaka.totalComfort), '']);
  container.appendChild(buildTable(['카테고리', '절약형 (엔)', '여유형 (엔)', '근거'], oRows, { numCols: [1,2] }));
  container.appendChild(buildInsight(`세후 월급 대비: 절약형 <strong>${d.osaka.salaryRatioFrugal}%</strong>, 여유형 <strong>${d.osaka.salaryRatioComfort}%</strong>`));

  // Regional
  const h3reg = document.createElement('h3');
  h3reg.textContent = '지방 도시 비교';
  container.appendChild(h3reg);
  const r = d.regional;
  const regRows = [
    ['렌트 (1BR 외곽)', ...r.rent1brSuburb.map(fmt)],
    ['유틸리티',         ...r.utilities.map(fmt)],
    ['교통 (월정기)',     ...r.transportPass.map(fmt)],
    ['세후 월급',        ...r.netSalary.map(fmt)],
    ['월 예산 절약형',    ...r.totalFrugal.map(v => '~' + fmt(v))],
    ['월 예산 여유형',    ...r.totalComfort.map(v => '~' + fmt(v))]
  ];
  container.appendChild(buildTable(['항목', ...r.cities], regRows, { numCols: [1,2,3] }));

  // Budget chart
  const cw = document.createElement('div');
  cw.className = 'chart-wrap';
  const cv = document.createElement('canvas');
  cw.appendChild(cv);
  container.appendChild(cw);
  buildBudgetChart(cv, d.allCities);

  container.appendChild(buildInsight(
    '<strong>삿포로는 렌트 최저(44,000)</strong>이지만 유틸리티 최고(53,126)로 총액은 역전됨'
  ));
}

// ── Section 5: CPI ──
async function renderCPI(container) {
  const d = await fetchJSON('data/cpi.json');

  // Annual
  const h3a = document.createElement('h3');
  h3a.textContent = '연간 CPI';
  container.appendChild(h3a);
  const aRows = d.annual.map(a => {
    const cat = a.highlight ? a.category : a.category;
    return [cat, a.index ? String(a.index) : '—', fmtPct(a.yoy)];
  });
  container.appendChild(buildTable(['카테고리', '2024 지수', '전년 대비'], aRows, { numCols: [1,2] }));

  // Monthly
  const h3m = document.createElement('h3');
  h3m.textContent = '2024년 월별 추이';
  container.appendChild(h3m);
  const mRows = d.monthly.map(m => [m.month, fmtPct(m.yoy), m.note]);
  container.appendChild(buildTable(['월', '전년 대비', '특기사항'], mRows, { numCols: [1] }));

  // Surging
  const h3s = document.createElement('h3');
  h3s.textContent = '급등 품목 (2024)';
  container.appendChild(h3s);
  container.appendChild(buildTable(
    ['품목', '전년 대비'],
    d.surging.map(s => [s.item, fmtPct(s.yoy)]),
    { numCols: [1] }
  ));

  // CPI chart
  const cw = document.createElement('div');
  cw.className = 'chart-wrap';
  const cv = document.createElement('canvas');
  cw.appendChild(cv);
  container.appendChild(cw);
  buildCPIChart(cv, d.chartData);

  container.appendChild(buildInsight(
    '2024년 CPI +2.7%로 2023년(+3.2%) 대비 소폭 둔화. <strong>식료품이 여전히 인플레이션 주도.</strong> 교육만 유일하게 마이너스(-0.4%).'
  ));
}

// ── Section 6: Insights ──
async function renderInsights(container) {
  const d = await fetchJSON('data/insights.json');
  d.groups.forEach(group => {
    const h3 = document.createElement('h3');
    h3.textContent = group.title;
    container.appendChild(h3);
    group.items.forEach(item => {
      container.appendChild(buildInsight(
        `<strong>${item.bold}</strong> — ${item.text}`
      ));
    });
  });
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  const sections = {
    'section-household': renderHousehold,
    'section-wages': renderWages,
    'section-cities': renderCities,
    'section-budget': renderBudget,
    'section-cpi': renderCPI,
    'section-insights': renderInsights,
  };

  Object.entries(sections).forEach(([id, renderFn]) => {
    const el = document.getElementById(id);
    if (el) renderFn(el);
  });
});
