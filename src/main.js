// Data will be fetched from public/data.json

let masters = [];
let currentMode = 'quiz'; // 'etiquette' or 'quiz'
let currentQuestionIndex = 0;
let score = 0;

const appContent = document.getElementById('game-content');

async function init() {
  try {
    const response = await fetch('/data.json');
    if (!response.ok) throw new Error('Failed to load data');
    masters = await response.json();
    console.log('Masters data loaded:', masters.length);
    
    setupNav();
    showStartScreen();
  } catch (error) {
    console.error('Initialization error:', error);
    appContent.innerHTML = `<p style="color: red;">データの読み込みに失敗しました。ページを再読み込みしてください。</p>`;
  }
}

function setupNav() {
  document.getElementById('btn-etiquette').addEventListener('click', () => switchMode('etiquette'));
  document.getElementById('btn-quiz').addEventListener('click', () => switchMode('quiz'));
}

function switchMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`btn-${mode}`).classList.add('active');
  
  if (mode === 'quiz') {
    startQuiz();
  } else {
    startEtiquette();
  }
}

function showStartScreen() {
  appContent.innerHTML = `
    <div id="start-screen">
        <h2>裏千家へようこそ</h2>
        <p>茶杓（ちゃしゃく）は、抹茶をすくうための大切な道具です。<br>清める所作と、それを作った家元（お作）について学びましょう。</p>
        <button id="start-game" class="primary-btn">始める</button>
    </div>
  `;
  document.getElementById('start-game').addEventListener('click', () => switchMode('quiz'));
}

// --- Quiz Mode ---
function startQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  showQuestion();
}

function showQuestion() {
  if (masters.length === 0) {
    appContent.innerHTML = `<p>データを読み込んでいます...</p>`;
    return;
  }
  
  const master = masters[Math.floor(Math.random() * masters.length)];
  const options = generateOptions(master);

  appContent.innerHTML = `
    <div class="quiz-container">
        <h2>家元クイズ</h2>
        <div class="quiz-question">${master.id}代は？</div>
        <div class="options-grid">
            ${options.map(opt => `<button class="option-btn" data-id="${opt.id}"><ruby>${opt.name}<rt>${opt.reading}</rt></ruby></button>`).join('')}
        </div>
        <div id="quiz-feedback" class="feedback"></div>
    </div>
  `;

  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', (e) => checkAnswer(e.target, master));
  });
}

function generateOptions(correctMaster) {
  let options = [correctMaster];
  while (options.length < 4) {
    const randomMaster = masters[Math.floor(Math.random() * masters.length)];
    if (!options.find(m => m.id === randomMaster.id)) {
      options.push(randomMaster);
    }
  }
  return options.sort(() => Math.random() - 0.5);
}

function checkAnswer(btn, correctMaster) {
  const selectedId = parseInt(btn.getAttribute('data-id'));
  const feedback = document.getElementById('quiz-feedback');
  
  // Disable all buttons after selection
  document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);

  if (selectedId === correctMaster.id) {
    btn.classList.add('correct');
    feedback.innerHTML = `
      <div class="result-animate animate-in">
        <p class="status-text correct-text">正解です</p>
        <div class="master-card">
          <div class="master-badge">${correctMaster.id}代</div>
          <h3><ruby>${correctMaster.name}<rt>${correctMaster.reading}</rt></ruby></h3>
          <p class="honorific">${correctMaster.honorific}</p>
          <hr>
          <p class="master-desc">${correctMaster.description || '千家茶道の発展に大きく寄与されました。'}</p>
        </div>
        <button id="next-question" class="primary-btn">次へ進む</button>
      </div>
    `;
  } else {
    btn.classList.add('wrong');
    feedback.innerHTML = `
      <div class="result-animate animate-in">
        <p class="status-text wrong-text">惜しいです</p>
        <p>正解は <strong>${correctMaster.name}</strong> でした。</p>
        <div class="master-card">
          <div class="master-badge">${correctMaster.id}代</div>
          <p class="master-desc">${correctMaster.description || ''}</p>
        </div>
        <button id="next-question" class="primary-btn">次へ進む</button>
      </div>
    `;
  }
  document.getElementById('next-question').addEventListener('click', showQuestion);
}

// --- Etiquette Mode ---
function startEtiquette() {
  appContent.innerHTML = `
    <div class="etiquette-container">
        <h2>茶杓を清める</h2>
        <p>帛紗（ふくさ）をドラッグして、茶杓を上から下へ3回清めましょう。</p>
        <div class="chashaku-area">
            <div id="chashaku" class="chashaku"></div>
            <div id="fukusa" class="fukusa"></div>
        </div>
        <div id="etiquette-status">清めた回数: 0 / 3</div>
        <div id="etiquette-feedback"></div>
    </div>
  `;
  
  initEtiquetteLogic();
}

function initEtiquetteLogic() {
  const fukusa = document.getElementById('fukusa');
  const chashaku = document.getElementById('chashaku');
  const status = document.getElementById('etiquette-status');
  const feedback = document.getElementById('etiquette-feedback');
  let cleanCount = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;

  fukusa.style.left = '100px';
  fukusa.style.top = '50px';

  fukusa.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX - fukusa.offsetLeft;
    startY = e.clientY - fukusa.offsetTop;
    fukusa.style.cursor = 'grabbing';
    fukusa.style.transition = 'none';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const rect = document.querySelector('.chashaku-area').getBoundingClientRect();
    let x = e.clientX - rect.left - (fukusa.offsetWidth / 2);
    let y = e.clientY - rect.top - (fukusa.offsetHeight / 2);
    
    // Boundary check
    x = Math.max(0, Math.min(x, rect.width - fukusa.offsetWidth));
    y = Math.max(0, Math.min(y, rect.height - fukusa.offsetHeight));

    fukusa.style.left = `${x}px`;
    fukusa.style.top = `${y}px`;

    // Collision detection with chashaku
    const cRect = chashaku.getBoundingClientRect();
    const fRect = fukusa.getBoundingClientRect();

    if (fRect.right > cRect.left && fRect.left < cRect.right &&
        fRect.bottom > cRect.top && fRect.top < cRect.bottom) {
      chashaku.style.filter = 'brightness(1.5) drop-shadow(0 0 10px gold)';
    } else {
      chashaku.style.filter = 'none';
    }
  });

  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    fukusa.style.cursor = 'grab';
    fukusa.style.transition = 'all 0.3s';
    
    const cRect = chashaku.getBoundingClientRect();
    const fRect = fukusa.getBoundingClientRect();

    // Check if fukusa passed over chashaku sufficiently
    if (fRect.right > cRect.left && fRect.left < cRect.right && cleanCount < 3) {
      cleanCount++;
      status.innerText = `清めた回数: ${cleanCount} / 3`;
      
      if (cleanCount === 3) {
        feedback.innerHTML = `
          <div class="animate-in">
            <p style="color: var(--accent-gold); margin-top: 1rem; font-weight: bold;">清めが完了しました。心が整いましたね。</p>
            <button id="etiquette-finish" class="primary-btn" style="margin-top: 1rem;">お作の拝見へ</button>
          </div>
        `;
        document.getElementById('etiquette-finish').addEventListener('click', () => switchMode('quiz'));
      }
    }
  });
}

init();
