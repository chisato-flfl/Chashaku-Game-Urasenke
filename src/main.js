let masters = [];
let meiData = [];
let currentMode = 'quiz'; // 'etiquette', 'quiz', or 'mei'
let currentQuestionIndex = 0;
let score = 0;

const appContent = document.getElementById('game-content');

async function init() {
  try {
    const response = await fetch('/data.json');
    if (!response.ok) throw new Error('Failed to load data');
    const data = await response.json();
    masters = data.masters;
    meiData = data.meiData;
    console.log('Data loaded:', masters.length, 'masters,', meiData.length, 'mei');
    
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
  document.getElementById('btn-mei').addEventListener('click', () => switchMode('mei'));
  document.getElementById('btn-schedule').addEventListener('click', () => switchMode('schedule'));
}

function switchMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`btn-${mode}`);
  if (activeBtn) activeBtn.classList.add('active');
  
  if (mode === 'quiz') {
    startQuiz();
  } else if (mode === 'mei') {
    startMeiQuiz();
  } else if (mode === 'schedule') {
    showSchedule();
  } else {
    startEtiquette();
  }
}

function showStartScreen() {
  appContent.innerHTML = `
    <div id="start-screen">
        <h2>裏千家 熊谷社中へようこそ</h2>
        <p>お稽古の前に、正しい所作（動画）、歴史（家元）、そして季節の銘をチェックしましょう。</p>
        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
          <button id="start-etiquette" class="primary-btn">作法を学ぶ</button>
          <button id="start-quiz" class="primary-btn">家元を学ぶ</button>
          <button id="start-mei" class="primary-btn">銘を学ぶ</button>
        </div>
    </div>
  `;
  document.getElementById('start-etiquette').addEventListener('click', () => switchMode('etiquette'));
  document.getElementById('start-quiz').addEventListener('click', () => switchMode('quiz'));
  document.getElementById('start-mei').addEventListener('click', () => switchMode('mei'));
}

// --- Quiz Mode (Masters) ---
function startQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  showQuestion();
}

function showQuestion() {
  if (currentQuestionIndex >= 10) {
    showResult('quiz');
    return;
  }
  
  const master = masters[Math.floor(Math.random() * masters.length)];
  const questionType = Math.random() > 0.5 ? 'id' : 'name';
  const options = generateOptions(masters, master, 'id');

  const questionText = questionType === 'id' 
    ? `${master.id}代目は？` 
    : `「<ruby>${master.name}<rt>${master.reading}</rt></ruby>」は何代目？`;

  appContent.innerHTML = `
    <div class="quiz-container">
        <div class="quiz-progress">家元クイズ: 第 ${currentQuestionIndex + 1} 問 / 10</div>
        <div class="quiz-question">${questionText}</div>
        <div class="options-grid">
            ${options.map(opt => {
              const label = questionType === 'id' 
                ? `<ruby>${opt.name}<rt>${opt.reading}</rt></ruby>` 
                : `${opt.id}代`;
              return `<button class="option-btn" data-id="${opt.id}">${label}</button>`;
            }).join('')}
        </div>
        <div id="quiz-feedback" class="feedback"></div>
    </div>
  `;

  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', (e) => checkAnswer(e.currentTarget, master, 'quiz'));
  });
}

// --- Mei Quiz Mode ---
function startMeiQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  showMeiQuestion();
}

function showMeiQuestion() {
  if (currentQuestionIndex >= 10) {
    showResult('mei');
    return;
  }
  
  const mei = meiData[Math.floor(Math.random() * meiData.length)];
  const options = generateOptions(meiData, mei, 'mei');

  appContent.innerHTML = `
    <div class="quiz-container">
        <div class="quiz-progress">五月の銘クイズ: 第 ${currentQuestionIndex + 1} 問 / 10</div>
        <div class="quiz-question" style="font-size: 2rem;">このヒントに合う銘は？<br><br><span style="color: var(--accent-gold);">「${mei.hint}」</span></div>
        <div class="options-grid">
            ${options.map(opt => `<button class="option-btn" data-mei="${opt.mei}"><ruby>${opt.mei}<rt>${opt.reading}</rt></ruby></button>`).join('')}
        </div>
        <div id="quiz-feedback" class="feedback"></div>
    </div>
  `;

  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', (e) => checkAnswer(e.currentTarget, mei, 'mei'));
  });
}

function generateOptions(data, correctItem, key) {
  let options = [correctItem];
  while (options.length < 4) {
    const randomItem = data[Math.floor(Math.random() * data.length)];
    if (!options.find(m => m[key] === randomItem[key])) {
      options.push(randomItem);
    }
  }
  return options.sort(() => Math.random() - 0.5);
}

function checkAnswer(btn, correctItem, type) {
  const selectedValue = type === 'quiz' ? parseInt(btn.getAttribute('data-id')) : btn.getAttribute('data-mei');
  const correctValue = type === 'quiz' ? correctItem.id : correctItem.mei;
  const feedback = document.getElementById('quiz-feedback');
  
  document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);

  const isCorrect = selectedValue === correctValue;
  if (isCorrect) {
    score++;
    btn.classList.add('correct');
  } else {
    btn.classList.add('wrong');
  }

  if (type === 'quiz') {
    feedback.innerHTML = `
      <div class="result-animate animate-in">
        <p class="status-text ${isCorrect ? 'correct-text' : 'wrong-text'}">${isCorrect ? '正解です' : '惜しいです'}</p>
        ${!isCorrect ? `<p>正解は <strong>${correctItem.id}代 ${correctItem.name}</strong> でした。</p>` : ''}
        <div class="master-card">
          <div class="master-badge">${correctItem.id}代</div>
          <h3><ruby>${correctItem.name}<rt>${correctItem.reading}</rt></ruby></h3>
          <p class="honorific">${correctItem.honorific}</p>
          <hr>
          <p class="master-desc">${correctItem.description || '千家茶道の発展に大きく寄与されました。'}</p>
        </div>
        <button id="next-question" class="primary-btn">次へ進む</button>
      </div>
    `;
  } else {
    feedback.innerHTML = `
      <div class="result-animate animate-in">
        <p class="status-text ${isCorrect ? 'correct-text' : 'wrong-text'}">${isCorrect ? '正解です' : '惜しいです'}</p>
        <p>正解は <strong>${correctItem.mei}（${correctItem.reading}）</strong> です。</p>
        <div class="master-card">
          <p class="master-desc"><strong>${correctItem.mei}</strong>: ${correctItem.hint}</p>
        </div>
        <button id="next-question" class="primary-btn">次へ進む</button>
      </div>
    `;
  }
  
  document.getElementById('next-question').addEventListener('click', () => {
    currentQuestionIndex++;
    if (type === 'quiz') showQuestion();
    else showMeiQuestion();
  });
}

function showResult(type) {
  let rank = "初心者";
  if (score === 10) rank = "皆伝";
  else if (score >= 8) rank = "上級者";
  else if (score >= 5) rank = "中級者";

  const title = type === 'quiz' ? '家元クイズ 修了' : '五月の銘クイズ 修了';

  appContent.innerHTML = `
    <div class="result-screen animate-in">
        <h2>${title}</h2>
        <div class="score-display">
            <span class="score-num">${score}</span> / 10 正解
        </div>
        <p class="rank-text">あなたの称号: <span class="rank-badge">${rank}</span></p>
        <div class="result-actions">
            <button id="restart-quiz" class="primary-btn">もう一度挑戦</button>
            <button id="back-to-home" class="nav-btn" style="margin-top: 1rem; color: white;">ホームへ戻る</button>
        </div>
    </div>
  `;

  document.getElementById('restart-quiz').addEventListener('click', type === 'quiz' ? startQuiz : startMeiQuiz);
  document.getElementById('back-to-home').addEventListener('click', showStartScreen);
}

// --- Etiquette Mode ---
function startEtiquette() {
  appContent.innerHTML = `
    <div class="etiquette-container animate-in">
        <h2>作法の確認（裏千家）</h2>
        <p>お稽古の前に、帛紗（ふくさ）のさばき方と茶杓の清め方を確認しましょう。</p>
        
        <div class="video-category">
            <h2 class="category-title">準備（道具の扱い）</h2>
            <div class="video-section">
                <h3 class="video-title">1. 帛紗のさばき方 <span class="duration-badge">2:03</span></h3>
                <div class="video-container">
                    <iframe width="100%" height="315" src="https://www.youtube.com/embed/kVHSKHfkU_w" frameborder="0" allowfullscreen></iframe>
                </div>
            </div>
            <div class="video-section">
                <h3 class="video-title">2. 茶杓の清め方 <span class="duration-badge">3:05</span></h3>
                <div class="video-container">
                    <iframe width="100%" height="315" src="https://www.youtube.com/embed/Eye4IJpFMZw" frameborder="0" allowfullscreen></iframe>
                </div>
            </div>
            <div class="video-section">
                <h3 class="video-title">3. 茶碗の拭き方 <span class="duration-badge">4:03</span></h3>
                <div class="video-container">
                    <iframe width="100%" height="315" src="https://www.youtube.com/embed/XWFoc9TNzeM" frameborder="0" allowfullscreen></iframe>
                </div>
            </div>
            <div class="video-section">
                <h3 class="video-title">4. 柄杓の扱い方 <span class="duration-badge">6:18</span></h3>
                <div class="video-container">
                    <iframe width="100%" height="315" src="https://www.youtube.com/embed/a3X35nru5fM" frameborder="0" allowfullscreen></iframe>
                </div>
            </div>
        </div>

        <div class="video-category" style="margin-top: 4rem;">
            <h2 class="category-title">客の作法（席入り・頂き方）</h2>
            <div class="video-section">
                <h3 class="video-title">5. 席入り・拝見 <span class="duration-badge">2:29</span></h3>
                <div class="video-container">
                    <iframe width="100%" height="315" src="https://www.youtube.com/embed/k3lNvXyKytE" frameborder="0" allowfullscreen></iframe>
                </div>
            </div>
            <div class="video-section">
                <h3 class="video-title">6. 薄茶の頂き方 <span class="duration-badge">6:24</span></h3>
                <div class="video-container">
                    <iframe width="100%" height="315" src="https://www.youtube.com/embed/gcHH4yoVBeU" frameborder="0" allowfullscreen></iframe>
                </div>
            </div>
            <div class="video-section">
                <h3 class="video-title">7. お菓子の頂き方 <span class="duration-badge">3:45</span></h3>
                <div class="video-container">
                    <iframe width="100%" height="315" src="https://www.youtube.com/embed/N7b2WXl3rIs" frameborder="0" allowfullscreen></iframe>
                </div>
            </div>
        </div>

        <button id="back-home-from-etiquette" class="primary-btn" style="margin-top: 4rem;">ホームへ戻る</button>
    </div>
  `;
  
  document.getElementById('back-home-from-etiquette').addEventListener('click', showStartScreen);
}

// Previous animation logic removed

function showSchedule() {
  const lessonDays = [8, 16, 23, 29, 30];
  const daysInMonth = 31;
  const startDay = 5; // May 1st 2026 is Friday (0: Sun, 1: Mon, ..., 5: Fri)
  
  let calendarHtml = '';
  // Empty slots for days before the 1st
  for (let i = 0; i < startDay; i++) {
    calendarHtml += '<div class="calendar-day empty"></div>';
  }
  
  // Day slots
  for (let day = 1; day <= daysInMonth; day++) {
    const isLesson = lessonDays.includes(day);
    calendarHtml += `
      <div class="calendar-day ${isLesson ? 'lesson-day' : ''}">
        <span class="day-num">${day}</span>
        ${isLesson ? '<span class="lesson-label">お稽古</span>' : ''}
      </div>
    `;
  }

  appContent.innerHTML = `
    <div class="schedule-container animate-in">
        <h2>五月のお稽古カレンダー</h2>
        <p>熊谷社中の五月のお稽古日は以下の通りです。</p>
        
        <div class="calendar-card">
            <div class="calendar-header">
                <div>日</div><div>月</div><div>火</div><div>水</div><div>木</div><div>金</div><div>土</div>
            </div>
            <div class="calendar-grid">
                ${calendarHtml}
            </div>
        </div>

        <div class="info-section">
            <div class="info-item">
                <span class="info-label">場所</span>
                <span class="info-value">熊谷社中 茶室</span>
            </div>
            <div class="info-item">
                <span class="info-label">備考</span>
                <span class="info-value">お時間は通常 14:00〜20:00 です。<br>変更がある場合は別途ご連絡いたします。</span>
            </div>
        </div>

        <button id="back-home-from-schedule" class="primary-btn" style="margin-top: 2rem;">ホームへ戻る</button>
    </div>
  `;
  document.getElementById('back-home-from-schedule').addEventListener('click', showStartScreen);
}

init();
