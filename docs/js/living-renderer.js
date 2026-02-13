// ── Living Page Renderer ──
const fmt = typeof window.fmt === 'undefined'
  ? (n => n == null ? '—' : n.toLocaleString())
  : window.fmt;

async function fetchJSON(path) {
  const res = await fetch(path);
  return res.json();
}

// ── DOM Helpers ──
function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
}

function buildTable(headers, rows, opts = {}) {
  const wrap = el('div', 'table-wrap');
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
      if (isLast) td.innerHTML = '<strong>' + cell + '</strong>';
      else td.textContent = cell;
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
  const div = el('div', 'insight');
  div.innerHTML = html;
  return div;
}

function buildSteps(steps) {
  const wrap = el('div', 'steps-list');
  steps.forEach(s => {
    const item = el('div', 'step-item');
    const num = el('div', 'step-num', s.step);
    const body = el('div', 'step-body');
    body.appendChild(el('div', 'step-title', `<strong>${s.title}</strong>`));
    body.appendChild(el('div', 'step-desc', s.desc));
    if (s.tip) body.appendChild(el('div', 'step-tip', '💡 ' + s.tip));
    item.appendChild(num);
    item.appendChild(body);
    wrap.appendChild(item);
  });
  return wrap;
}

function buildTips(tips) {
  const ul = document.createElement('ul');
  ul.className = 'tips-list';
  tips.forEach(t => {
    const li = document.createElement('li');
    li.textContent = t;
    ul.appendChild(li);
  });
  return ul;
}

function buildSiteLinks(sites) {
  const wrap = el('div', 'site-links');
  sites.forEach(s => {
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.className = 'site-link';
    a.innerHTML = `<img src="https://www.google.com/s2/favicons?domain=${new URL(s.url).hostname}&sz=32" alt="" class="site-link__icon"><div><strong>${s.name}</strong><span>${s.desc}</span></div>`;
    wrap.appendChild(a);
  });
  return wrap;
}

// ── Section 1: Rent ──
async function renderRent(container) {
  const d = await fetchJSON('data/living/rent.json');

  // 초기 비용
  container.appendChild(el('h3', '', '초기 비용 (入居費用)'));
  container.appendChild(el('p', '', d.initialCosts.description));
  const icRows = d.initialCosts.items.map(i => [
    i.name, i.amount, i.note, i.refundable ? '환급 가능' : '환급 불가'
  ]);
  container.appendChild(buildTable(['항목', '금액', '설명', '환급'], icRows));
  container.appendChild(buildInsight(
    `<strong>예시:</strong> ${d.initialCosts.example.note}`
  ));

  // 계약 절차
  container.appendChild(el('h3', '', '계약 절차'));
  container.appendChild(buildSteps(d.contractProcess));

  // 갱신
  container.appendChild(buildInsight(
    `<strong>갱신 (更新):</strong> ${d.renewal.period}마다 갱신료 ${d.renewal.fee}. ${d.renewal.note}`
  ));

  // 팁
  container.appendChild(el('h3', '', '렌트 팁'));
  container.appendChild(buildTips(d.tips));

  // 부동산 사이트
  container.appendChild(el('h3', '', '부동산 검색 사이트'));
  container.appendChild(buildSiteLinks(d.sites));
}

// ── Section 2: Food ──
async function renderFood(container) {
  const d = await fetchJSON('data/living/food.json');

  // 슈퍼마켓
  container.appendChild(el('h3', '', '슈퍼마켓 체인'));
  const smRows = d.supermarkets.map(s => [s.name, s.tier, s.note]);
  container.appendChild(buildTable(['이름', '가격대', '특징'], smRows));

  // 가격 비교
  container.appendChild(el('h3', '', '주요 식료품 가격 (엔)'));
  const prRows = d.priceSamples.items.map(i => [i.item, fmt(i.low), fmt(i.mid), fmt(i.high)]);
  container.appendChild(buildTable(d.priceSamples.columns, prRows, { numCols: [1, 2, 3] }));

  // 월 식비
  container.appendChild(el('h3', '', '월 식비 예상'));
  const mcRows = d.monthlyCost.types.map(t => [t.type, t.cost, t.note]);
  container.appendChild(buildTable(d.monthlyCost.columns, mcRows));

  // 외식
  container.appendChild(el('h3', '', '외식 가격대'));
  const eoRows = d.eatingOut.items.map(i => [i.category, i.price, i.examples]);
  container.appendChild(buildTable(d.eatingOut.columns, eoRows));

  // 팁
  container.appendChild(el('h3', '', '절약 팁'));
  container.appendChild(buildTips(d.tips));
}

// ── Section 3: Utilities ──
async function renderUtilities(container) {
  const d = await fetchJSON('data/living/utilities.json');

  // 기본 인프라
  container.appendChild(el('h3', '', '전기/가스/수도 개통'));
  const setupRows = d.setup.map(s => [s.name, s.avgMonthly, s.how, s.tip]);
  container.appendChild(buildTable(['항목', '월 평균 (1인)', '개통 방법', '팁'], setupRows));

  // 인터넷
  container.appendChild(el('h3', '', '인터넷'));
  const netRows = d.internet.options.map(o => [o.type, o.price, o.speed, o.pros, o.cons]);
  container.appendChild(buildTable(['유형', '월 요금', '속도', '장점', '단점'], netRows));
  container.appendChild(buildInsight('💡 ' + d.internet.tip));

  // 모바일
  container.appendChild(el('h3', '', '모바일 통신'));
  const mobRows = d.mobile.carriers.map(c => [c.name, c.examples, c.price, c.data, c.pros]);
  container.appendChild(buildTable(['구분', '예시', '월 요금', '데이터', '장점'], mobRows));

  // 추천
  const r = d.mobile.recommended;
  const recRows = r.plans.map(p => [p.data, fmt(p.price) + '엔']);
  container.appendChild(buildInsight(
    `<strong>추천: ${r.name}</strong> — ${r.note}`
  ));
  container.appendChild(buildTable(['데이터', '월 요금'], recRows, { numCols: [1] }));

  // 월 합계
  container.appendChild(el('h3', '', '유틸리티 월 합계 (1인)'));
  const sumRows = d.monthlySummary.items.map(i => {
    const row = [i.item, fmt(i.frugal) + '엔', fmt(i.normal) + '엔'];
    return row;
  });
  container.appendChild(buildTable(d.monthlySummary.columns, sumRows, { numCols: [1, 2], highlightLast: true }));
  container.appendChild(el('p', '', d.monthlySummary.note));

  // 팁
  container.appendChild(el('h3', '', '유틸리티 팁'));
  container.appendChild(buildTips(d.tips));
}

// ── Section 4: Banking ──
async function renderBanking(container) {
  const d = await fetchJSON('data/living/banking.json');

  // 계좌 개설
  container.appendChild(el('h3', '', '계좌 개설 필요 서류'));
  const reqUl = document.createElement('ul');
  reqUl.className = 'tips-list';
  d.accountOpening.requirements.forEach(r => {
    const li = document.createElement('li');
    li.textContent = r;
    reqUl.appendChild(li);
  });
  container.appendChild(reqUl);
  container.appendChild(buildInsight('💡 ' + d.accountOpening.timing));

  // 절차
  container.appendChild(el('h3', '', '개설 절차'));
  container.appendChild(buildSteps(d.accountOpening.steps));

  // 은행 비교
  container.appendChild(el('h3', '', '주요 은행 비교'));
  const bankRows = d.banks.map(b => [
    b.recommended ? '⭐ ' + b.name : b.name,
    b.english,
    b.pros,
    b.cons,
  ]);
  container.appendChild(buildTable(['은행', '영문명', '장점', '단점'], bankRows));

  // 해외 송금
  container.appendChild(el('h3', '', '해외 송금'));
  const remRows = d.remittance.map(r => [
    r.recommended ? '⭐ ' + r.name : r.name,
    r.fee,
    r.speed,
    r.note
  ]);
  container.appendChild(buildTable(['서비스', '수수료', '속도', '특징'], remRows));

  // 캐시리스
  container.appendChild(el('h3', '', '캐시리스 결제'));
  container.appendChild(el('p', '', d.cashless.description));
  const cashRows = d.cashless.services.map(s => [s.name, s.type, s.note]);
  container.appendChild(buildTable(['서비스', '유형', '특징'], cashRows));

  // 팁
  container.appendChild(el('h3', '', '금융 팁'));
  container.appendChild(buildTips(d.tips));
}

// ── Section 5: Insurance ──
async function renderInsurance(container) {
  const d = await fetchJSON('data/living/insurance.json');

  // 보험 종류
  container.appendChild(el('h3', '', '건강보험 종류'));
  d.types.forEach(t => {
    container.appendChild(buildInsight(
      `<strong>${t.name} (${t.abbr})</strong><br>
      대상: ${t.who}<br>
      비용: ${t.cost}<br>
      보장: ${t.coverage}<br>
      가입: ${t.enrollment}<br>
      ${t.note}`
    ));
  });

  // 비교 테이블
  container.appendChild(el('h3', '', '국민건강보험 vs 사회보험'));
  container.appendChild(buildTable(d.comparison.headers, d.comparison.rows));

  // 의료비
  container.appendChild(el('h3', '', '의료비 목안 (30% 부담 기준)'));
  const medRows = d.medicalCosts.items.map(m => [m.item, m.cost, m.note]);
  container.appendChild(buildTable(['진료 내용', '본인 부담', '비고'], medRows, { numCols: [1] }));

  // 연금
  container.appendChild(el('h3', '', '연금 제도'));
  const penRows = d.pension.types.map(p => [p.name, p.who, p.monthly, p.benefit]);
  container.appendChild(buildTable(['종류', '대상', '월 보험료', '수령액'], penRows));

  // 탈퇴일시금
  const ls = d.pension.lumpSum;
  container.appendChild(buildInsight(
    `<strong>${ls.title}</strong> — ${ls.description}<br>
    조건: ${ls.conditions}<br>
    최대 ${ls.maxMonths}개월분 환급. ${ls.note}`
  ));

  // 팁
  container.appendChild(el('h3', '', '의료/보험 팁'));
  container.appendChild(buildTips(d.tips));
}

// ── Section 6: Transport ──
async function renderTransport(container) {
  const d = await fetchJSON('data/living/transport.json');

  // IC카드
  container.appendChild(el('h3', '', 'IC카드 (교통카드)'));
  container.appendChild(el('p', '', d.icCards.description));
  const icRows = d.icCards.cards.map(c => [c.name, c.area, c.note]);
  container.appendChild(buildTable(['카드', '지역', '비고'], icRows));
  container.appendChild(buildInsight(
    `<strong>구매:</strong> ${d.icCards.howToGet}<br>
    <strong>사용:</strong> ${d.icCards.usage}<br>
    💡 ${d.icCards.tip}`
  ));

  // 정기권
  container.appendChild(el('h3', '', '통근정기권 (定期券)'));
  container.appendChild(el('p', '', d.commute.pass.description));
  const passRows = d.commute.pass.periods.map(p => [p.period, p.discount, p.note]);
  container.appendChild(buildTable(['기간', '할인율', '비고'], passRows));

  const ex = d.commute.pass.example;
  container.appendChild(buildInsight(
    `<strong>예시: ${ex.route}</strong><br>
    편도 ${fmt(ex.oneWay)}엔 → 1개월 ${fmt(ex.monthly1)}엔 / 3개월 ${fmt(ex.monthly3)}엔 / 6개월 ${fmt(ex.monthly6)}엔<br>
    💡 ${d.commute.pass.taxFree}`
  ));

  // 자전거
  container.appendChild(el('h3', '', '자전거 (自転車)'));
  container.appendChild(buildTable(
    ['구분', '내용'],
    [
      ['방범등록', d.bicycle.registration],
      ['주륜장', d.bicycle.parking],
      ['중고', d.bicycle.cost.used],
      ['새 자전거', d.bicycle.cost.new],
      ['전동 어시스트', d.bicycle.cost.electric]
    ]
  ));

  container.appendChild(el('h3', '', '자전거 규칙'));
  const ruleUl = document.createElement('ul');
  ruleUl.className = 'tips-list';
  d.bicycle.rules.forEach(r => {
    const li = document.createElement('li');
    li.textContent = r;
    ruleUl.appendChild(li);
  });
  container.appendChild(ruleUl);

  // 택시
  container.appendChild(el('h3', '', '택시'));
  container.appendChild(buildTable(
    ['항목', '내용'],
    [
      ['기본요금', d.taxi.baseFare],
      ['km당', d.taxi.perKm],
      ['심야 할증', d.taxi.nightSurcharge]
    ]
  ));
  const appRows = d.taxi.apps.map(a => [a.name, a.note]);
  container.appendChild(buildTable(['앱', '특징'], appRows));

  // 팁
  container.appendChild(el('h3', '', '교통 팁'));
  container.appendChild(buildTips(d.tips));
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  const sections = {
    'section-rent': renderRent,
    'section-food': renderFood,
    'section-utilities': renderUtilities,
    'section-banking': renderBanking,
    'section-insurance': renderInsurance,
    'section-transport': renderTransport,
  };
  Object.entries(sections).forEach(([id, fn]) => {
    const el = document.getElementById(id);
    if (el) fn(el);
  });
});
