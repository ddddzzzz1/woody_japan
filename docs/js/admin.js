// ── Admin Panel ──
const REPO_OWNER = 'ddddzzzz1';
const REPO_NAME = 'woody_japan';
const BRANCH = 'main';

const FILES = {
  research: [
    { id: 'household', label: '가계조사', path: 'docs/data/household.json' },
    { id: 'wages',     label: '임금',     path: 'docs/data/wages.json' },
    { id: 'cities',    label: '도시별',   path: 'docs/data/cities.json' },
    { id: 'budget',    label: '예산',     path: 'docs/data/budget.json' },
    { id: 'cpi',       label: 'CPI',      path: 'docs/data/cpi.json' },
    { id: 'insights',  label: '인사이트', path: 'docs/data/insights.json' },
  ],
  living: [
    { id: 'rent',      label: '렌트/주거', path: 'docs/data/living/rent.json' },
    { id: 'food',      label: '음식',      path: 'docs/data/living/food.json' },
    { id: 'utilities', label: '유틸리티',  path: 'docs/data/living/utilities.json' },
    { id: 'banking',   label: '은행/금융', path: 'docs/data/living/banking.json' },
    { id: 'insurance', label: '보험/의료', path: 'docs/data/living/insurance.json' },
    { id: 'transport', label: '교통',      path: 'docs/data/living/transport.json' },
  ],
};

// ── State ──
let token = '';
let currentCategory = 'research';
let currentFile = null;
let fileCache = {};     // { path: { content, sha, original } }

// ── DOM refs ──
const $token = document.getElementById('gh-token');
const $btnAuth = document.getElementById('btn-auth');
const $authStatus = document.getElementById('auth-status');
const $authSection = document.getElementById('auth-section');
const $editorSection = document.getElementById('editor-section');
const $categoryTabs = document.getElementById('category-tabs');
const $fileTabs = document.getElementById('file-tabs');
const $editor = document.getElementById('json-editor');
const $filename = document.getElementById('editor-filename');
const $status = document.getElementById('editor-status');
const $meta = document.getElementById('editor-meta');
const $btnFormat = document.getElementById('btn-format');
const $btnValidate = document.getElementById('btn-validate');
const $btnSave = document.getElementById('btn-save');

// ── GitHub API ──
async function ghAPI(endpoint, opts = {}) {
  const res = await fetch(`https://api.github.com${endpoint}`, {
    ...opts,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `GitHub API ${res.status}`);
  }
  return res.json();
}

async function getFileContent(path) {
  const data = await ghAPI(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}?ref=${BRANCH}`);
  const content = decodeURIComponent(escape(atob(data.content.replace(/\n/g, ''))));
  return { content, sha: data.sha };
}

async function putFileContent(path, content, sha, message) {
  const encoded = btoa(unescape(encodeURIComponent(content)));
  return ghAPI(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify({
      message,
      content: encoded,
      sha,
      branch: BRANCH,
    }),
  });
}

// ── Auth ──
$btnAuth.addEventListener('click', async () => {
  const val = $token.value.trim();
  if (!val) return;
  token = val;
  $authStatus.textContent = '연결 중...';
  $authStatus.className = 'auth-status';
  try {
    const user = await ghAPI('/user');
    $authStatus.textContent = `연결 성공: ${user.login}`;
    $authStatus.className = 'auth-status ok';
    sessionStorage.setItem('gh_token', token);
    showEditor();
  } catch (e) {
    $authStatus.textContent = `인증 실패: ${e.message}`;
    $authStatus.className = 'auth-status err';
    token = '';
  }
});

// Auto-restore token
(function restoreToken() {
  const saved = sessionStorage.getItem('gh_token');
  if (saved) {
    $token.value = saved;
    $btnAuth.click();
  }
})();

// ── Editor UI ──
function showEditor() {
  $editorSection.style.display = '';
  renderFileTabs();
  selectFile(FILES[currentCategory][0]);
}

function renderFileTabs() {
  $fileTabs.innerHTML = '';
  FILES[currentCategory].forEach(f => {
    const btn = document.createElement('button');
    btn.className = 'file-tab' + (currentFile && currentFile.id === f.id ? ' active' : '');
    btn.textContent = f.label;
    btn.dataset.id = f.id;
    if (fileCache[f.path] && fileCache[f.path].content !== fileCache[f.path].original) {
      btn.classList.add('modified');
    }
    btn.addEventListener('click', () => selectFile(f));
    $fileTabs.appendChild(btn);
  });
}

async function selectFile(file) {
  currentFile = file;
  $filename.textContent = file.path;
  $editor.value = '';
  showStatus('info', '로딩 중...');
  updateMeta();

  // Update tab active state
  $fileTabs.querySelectorAll('.file-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.id === file.id);
  });

  try {
    if (!fileCache[file.path]) {
      const { content, sha } = await getFileContent(file.path);
      const formatted = JSON.stringify(JSON.parse(content), null, 2);
      fileCache[file.path] = { content: formatted, sha, original: formatted };
    }
    $editor.value = fileCache[file.path].content;
    hideStatus();
    updateMeta();
  } catch (e) {
    showStatus('err', `로드 실패: ${e.message}`);
  }
}

// Category tabs
$categoryTabs.addEventListener('click', (e) => {
  const btn = e.target.closest('.tab');
  if (!btn || !btn.dataset.category) return;
  currentCategory = btn.dataset.category;
  $categoryTabs.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t === btn));
  currentFile = null;
  renderFileTabs();
  selectFile(FILES[currentCategory][0]);
});

// Track editor changes
$editor.addEventListener('input', () => {
  if (currentFile && fileCache[currentFile.path]) {
    fileCache[currentFile.path].content = $editor.value;
    renderFileTabs();
    updateMeta();
  }
});

// ── Toolbar Actions ──
$btnFormat.addEventListener('click', () => {
  try {
    const parsed = JSON.parse($editor.value);
    const formatted = JSON.stringify(parsed, null, 2);
    $editor.value = formatted;
    if (currentFile && fileCache[currentFile.path]) {
      fileCache[currentFile.path].content = formatted;
    }
    showStatus('ok', 'JSON 포맷 완료');
    renderFileTabs();
    updateMeta();
  } catch (e) {
    showStatus('err', `JSON 오류: ${e.message}`);
  }
});

$btnValidate.addEventListener('click', () => {
  try {
    JSON.parse($editor.value);
    showStatus('ok', 'JSON 유효함');
  } catch (e) {
    showStatus('err', `JSON 오류: ${e.message}`);
  }
});

$btnSave.addEventListener('click', async () => {
  if (!currentFile) return;
  const path = currentFile.path;
  const cache = fileCache[path];
  if (!cache) return;

  // Validate first
  try {
    JSON.parse($editor.value);
  } catch (e) {
    showStatus('err', `JSON 오류 — 저장 불가: ${e.message}`);
    return;
  }

  // Check if modified
  if (cache.content === cache.original) {
    showStatus('info', '변경 사항 없음');
    return;
  }

  $btnSave.disabled = true;
  showStatus('info', '커밋 중...');

  try {
    const content = cache.content.endsWith('\n') ? cache.content : cache.content + '\n';
    const result = await putFileContent(
      path,
      content,
      cache.sha,
      `Update ${path.split('/').pop()} via admin panel`
    );
    cache.sha = result.content.sha;
    cache.original = cache.content;
    showStatus('ok', `커밋 완료! SHA: ${result.commit.sha.slice(0, 7)}`);
    renderFileTabs();
  } catch (e) {
    showStatus('err', `커밋 실패: ${e.message}`);
  } finally {
    $btnSave.disabled = false;
  }
});

// ── Helpers ──
function showStatus(type, msg) {
  $status.textContent = msg;
  $status.className = `editor-status show ${type}`;
  if (type === 'ok') {
    setTimeout(hideStatus, 3000);
  }
}

function hideStatus() {
  $status.className = 'editor-status';
}

function updateMeta() {
  if (!currentFile || !fileCache[currentFile.path]) {
    $meta.textContent = '';
    return;
  }
  const content = $editor.value;
  const lines = content.split('\n').length;
  const bytes = new Blob([content]).size;
  const modified = fileCache[currentFile.path].content !== fileCache[currentFile.path].original;
  $meta.innerHTML = `<span>줄: ${lines}</span><span>크기: ${(bytes / 1024).toFixed(1)} KB</span><span>${modified ? '수정됨' : '저장됨'}</span>`;
}

// ── Keyboard Shortcuts ──
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 's') {
    e.preventDefault();
    $btnSave.click();
  }
  if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'f') {
    e.preventDefault();
    $btnFormat.click();
  }
});
