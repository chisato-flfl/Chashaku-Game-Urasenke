let masters = [];
let meiData = [];
let teaData = [];
let currentMode = 'quiz'; // 'etiquette', 'quiz', 'mei', or 'tea'
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
    teaData = data.teaData;
    console.log('Data loaded:', masters.length, 'masters,', meiData.length, 'mei,', teaData.length, 'tea names');
    
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
  document.getElementById('btn-tea').addEventListener('click', () => switchMode('tea'));
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
  } else if (mode === 'tea') {
    startTeaQuiz();
  } else if (mode === 'schedule') {
    showSchedule();
  } else {
    startEtiquette();
  }
}

function showStartScreen() {
  appContent.innerHTML = `
    <div id="start-screen">
        <h2><ruby>裏千家<rt>うらせんけ</rt></ruby> <ruby>熊谷<rt>くまがい</rt></ruby><ruby>社中<rt>しゃちゅう</rt></ruby>へようこそ</h2>
        <p>お<ruby>稽古<rt>けいこ</rt></ruby>の<ruby>前<rt>まえ</rt></ruby>に、<ruby>正<rt>ただ</rt></ruby>しい<ruby>所作<rt>しょさ</rt></ruby>（<ruby>動画<rt>どうが</rt></ruby>）、<ruby>歴史<rt>れきし</rt></ruby>（<ruby>家元<rt>いえもと</rt></ruby>）、そして<ruby>季節<rt>きせつ</rt></ruby>の<ruby>銘<rt>めい</rt></ruby>をチェックしましょう。</p>
        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
          <button id="start-etiquette" class="primary-btn"><ruby>作法<rt>さほう</rt></ruby>を<ruby>学<rt>まな</rt></ruby>ぶ</button>
          <button id="start-quiz" class="primary-btn"><ruby>家元<rt>いえもと</rt></ruby>を<ruby>学<rt>まな</rt></ruby>ぶ</button>
          <button id="start-mei" class="primary-btn"><ruby>銘<rt>めい</rt></ruby>を<ruby>学<rt>まな</rt></ruby>ぶ</button>
          <button id="start-tea" class="primary-btn">お<ruby>茶名<rt>ちゃめい</rt></ruby>を<ruby>学<rt>まな</rt></ruby>ぶ</button>
        </div>
    </div>
  `;
  document.getElementById('start-etiquette').addEventListener('click', () => switchMode('etiquette'));
  document.getElementById('start-quiz').addEventListener('click', () => switchMode('quiz'));
  document.getElementById('start-mei').addEventListener('click', () => switchMode('mei'));
  document.getElementById('start-tea').addEventListener('click', () => switchMode('tea'));
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
    ? `${master.id}<ruby>代<rt>だい</rt></ruby><ruby>目<rt>め</rt></ruby>は？` 
    : `「<ruby>${master.name}<rt>${master.reading}</rt></ruby>」は<ruby>何<rt>なん</rt></ruby><ruby>代<rt>だい</rt></ruby><ruby>目<rt>め</rt></ruby>？`;

  appContent.innerHTML = `
    <div class="quiz-container">
        <div class="quiz-progress"><ruby>家元<rt>いえもと</rt></ruby>クイズ: <ruby>第<rt>だい</rt></ruby> ${currentQuestionIndex + 1} <ruby>問<rt>もん</rt></ruby> / 10</div>
        <div class="quiz-question">${questionText}</div>
        <div class="options-grid">
            ${options.map(opt => {
              const label = questionType === 'id' 
                ? `<ruby>${opt.name}<rt>${opt.reading}</rt></ruby>` 
                : `${opt.id}<ruby>代<rt>だい</rt></ruby>`;
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
        <div class="quiz-progress"><ruby>六月<rt>ろくがつ</rt></ruby>の<ruby>銘<rt>めい</rt></ruby>クイズ: <ruby>第<rt>だい</rt></ruby> ${currentQuestionIndex + 1} <ruby>問<rt>もん</rt></ruby> / 10</div>
        <div class="quiz-question" style="font-size: 2rem;">このヒントに<ruby>合<rt>あ</rt></ruby>う<ruby>銘<rt>めい</rt></ruby>は？<br><br><span style="color: var(--accent-gold);">「${mei.hint}」</span></div>
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

// --- Tea Quiz Mode ---
function startTeaQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  showTeaQuestion();
}

function showTeaQuestion() {
  if (currentQuestionIndex >= 10) {
    showResult('tea');
    return;
  }
  
  const tea = teaData[Math.floor(Math.random() * teaData.length)];
  const options = generateOptions(teaData, tea, 'name');

  appContent.innerHTML = `
    <div class="quiz-container">
        <div class="quiz-progress">お<ruby>茶名<rt>ちゃめい</rt></ruby>クイズ: <ruby>第<rt>だい</rt></ruby> ${currentQuestionIndex + 1} <ruby>問<rt>もん</rt></ruby> / 10</div>
        <div class="quiz-question" style="font-size: 2rem;">「<ruby>${tea.name}<rt>${tea.reading}</rt></ruby>」は<ruby>濃茶<rt>こいちゃ</rt></ruby>でしょうか、<ruby>薄茶<rt>うすちゃ</rt></ruby>でしょうか？<br><br><span style="color: var(--accent-gold); font-size: 1.2rem;">（${tea.preference}）</span></div>
        <div class="options-grid" style="grid-template-columns: 1fr 1fr;">
            <button class="option-btn" data-type="濃茶"><ruby>濃茶<rt>こいちゃ</rt></ruby></button>
            <button class="option-btn" data-type="薄茶"><ruby>薄茶<rt>うすちゃ</rt></ruby></button>
        </div>
        <div id="quiz-feedback" class="feedback"></div>
    </div>
  `;

  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', (e) => checkAnswer(e.currentTarget, tea, 'tea'));
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
  let selectedValue;
  let correctValue;
  
  if (type === 'quiz') {
    selectedValue = parseInt(btn.getAttribute('data-id'));
    correctValue = correctItem.id;
  } else if (type === 'mei') {
    selectedValue = btn.getAttribute('data-mei');
    correctValue = correctItem.mei;
  } else {
    selectedValue = btn.getAttribute('data-type');
    correctValue = correctItem.type;
  }
  
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
        <p class="status-text ${isCorrect ? 'correct-text' : 'wrong-text'}">${isCorrect ? '<ruby>正解<rt>せいかい</rt></ruby>です' : '<ruby>惜<rt>お</rt></ruby>しいです'}</p>
        ${!isCorrect ? `<p><ruby>正解<rt>せいかい</rt></ruby>は <strong>${correctItem.id}<ruby>代<rt>だい</rt></ruby> ${correctItem.name}</strong> でした。</p>` : ''}
        <div class="master-card">
          <div class="master-badge">${correctItem.id}<ruby>代<rt>だい</rt></ruby></div>
          <h3><ruby>${correctItem.name}<rt>${correctItem.reading}</rt></ruby></h3>
          <p class="honorific">${correctItem.honorific}</p>
          <hr>
          <p class="master-desc">${correctItem.description || '<ruby>千家<rt>せんけ</rt></ruby><ruby>茶道<rt>さどう</rt></ruby>の<ruby>発展<rt>はってん</rt></ruby>に<ruby>大<rt>おお</rt></ruby>きく<ruby>寄与<rt>きよ</rt></ruby>されました。'}</p>
        </div>
        <button id="next-question" class="primary-btn"><ruby>次<rt>つぎ</rt></ruby>へ<ruby>進<rt>すす</rt></ruby>む</button>
      </div>
    `;
  } else if (type === 'mei') {
    feedback.innerHTML = `
      <div class="result-animate animate-in">
        <p class="status-text ${isCorrect ? 'correct-text' : 'wrong-text'}">${isCorrect ? '<ruby>正解<rt>せいかい</rt></ruby>です' : '<ruby>惜<rt>お</rt></ruby>しいです'}</p>
        <p><ruby>正解<rt>せいかい</rt></ruby>は <strong>${correctItem.mei}（${correctItem.reading}）</strong> です。</p>
        <div class="master-card">
          <p class="master-desc"><strong>${correctItem.mei}</strong>: ${correctItem.hint}</p>
        </div>
        <button id="next-question" class="primary-btn"><ruby>次<rt>つぎ</rt></ruby>へ<ruby>進<rt>すす</rt></ruby>む</button>
      </div>
    `;
  } else {
    feedback.innerHTML = `
      <div class="result-animate animate-in">
        <p class="status-text ${isCorrect ? 'correct-text' : 'wrong-text'}">${isCorrect ? '<ruby>正解<rt>せいかい</rt></ruby>です' : '<ruby>惜<rt>お</rt></ruby>しいです'}</p>
        <p><ruby>正解<rt>せいかい</rt></ruby>は <strong>${correctItem.type}</strong> です。</p>
        <div class="master-card">
          <p class="master-desc"><strong>${correctItem.name}（${correctItem.reading}）</strong>は<ruby>主<rt>おも</rt></ruby>に${correctItem.type}として<ruby>用<rt>もち</rt></ruby>いられます。<br>【お<ruby>好<rt>ごの</rt></ruby>み・<ruby>取扱<rt>とりあつかい</rt></ruby>】${correctItem.preference}</p>
        </div>
        <button id="next-question" class="primary-btn"><ruby>次<rt>つぎ</rt></ruby>へ<ruby>進<rt>すす</rt></ruby>む</button>
      </div>
    `;
  }
  
  document.getElementById('next-question').addEventListener('click', () => {
    currentQuestionIndex++;
    if (type === 'quiz') showQuestion();
    else if (type === 'mei') showMeiQuestion();
    else showTeaQuestion();
  });
}

function showResult(type) {
  let rank = "<ruby>初心者<rt>しょしんしゃ</rt></ruby>";
  if (score === 10) rank = "<ruby>皆伝<rt>かいでん</rt></ruby>";
  else if (score >= 8) rank = "<ruby>上級者<rt>じょうきゅうしゃ</rt></ruby>";
  else if (score >= 5) rank = "<ruby>中級者<rt>ちゅうきゅうしゃ</rt></ruby>";

  let title = 'クイズ <ruby>修了<rt>しゅうりょう</rt></ruby>';
  let restartFn;
  
  if (type === 'quiz') {
    title = '<ruby>家元<rt>いえもと</rt></ruby>クイズ <ruby>修了<rt>しゅうりょう</rt></ruby>';
    restartFn = startQuiz;
  } else if (type === 'mei') {
    title = '<ruby>六月<rt>ろくがつ</rt></ruby>の<ruby>銘<rt>めい</rt></ruby>クイズ <ruby>修了<rt>しゅうりょう</rt></ruby>';
    restartFn = startMeiQuiz;
  } else {
    title = 'お<ruby>茶名<rt>ちゃめい</rt></ruby>クイズ <ruby>修了<rt>しゅうりょう</rt></ruby>';
    restartFn = startTeaQuiz;
  }

  appContent.innerHTML = `
    <div class="result-screen animate-in">
        <h2>${title}</h2>
        <div class="score-display">
            <span class="score-num">${score}</span> / 10 <ruby>正解<rt>せいかい</rt></ruby>
        </div>
        <p class="rank-text">あなたの<ruby>称号<rt>しょうごう</rt></ruby>: <span class="rank-badge">${rank}</span></p>
        <div class="result-actions">
            <button id="restart-quiz" class="primary-btn">もう<ruby>一度<rt>いちど</rt></ruby><ruby>挑戦<rt>ちょうせん</rt></ruby></button>
            <button id="back-to-home" class="nav-btn" style="margin-top: 1rem; color: white;">ホームへ<ruby>戻<rt>もど</rt></ruby>る</button>
        </div>
    </div>
  `;

  document.getElementById('restart-quiz').addEventListener('click', restartFn);
  document.getElementById('back-to-home').addEventListener('click', showStartScreen);
}

// --- Etiquette Mode ---
function startEtiquette() {
  appContent.innerHTML = `
    <div class="etiquette-container animate-in">
        <h2><ruby>作法<rt>さほう</rt></ruby>の<ruby>確認<rt>かくにん</rt></ruby>（<ruby>裏千家<rt>うらせんけ</rt></ruby>）</h2>
        <p>お<ruby>稽古<rt>けいこ</rt></ruby>の<ruby>前<rt>まえ</rt></ruby>に、<ruby>帛紗<rt>ふくさ</rt></ruby>（ふくさ）のさばき<ruby>方<rt>かた</rt></ruby>と<ruby>茶杓<rt>ちゃしゃく</rt></ruby>の<ruby>清<rt>きよ</rt></ruby>め<ruby>方<rt>かた</rt></ruby>を<ruby>確認<rt>かくにん</rt></ruby>しましょう。</p>
        
        <div class="video-category">
            <h2 class="category-title"><ruby>準備<rt>じゅんび</rt></ruby>（<ruby>道具<rt>どうぐ</rt></ruby>の<ruby>扱<rt>あつか</rt></ruby>い）</h2>
            <div class="video-section">
                <h3 class="video-title">1. <ruby>帛紗<rt>ふくさ</rt></ruby>のさばき<ruby>方<rt>かた</rt></ruby> <span class="duration-badge">2:03</span></h3>
                <div class="video-container">
                    <iframe width="100%" height="315" src="https://www.youtube.com/embed/kVHSKHfkU_w" frameborder="0" allowfullscreen></iframe>
                </div>
            </div>
            <div class="video-section">
                <h3 class="video-title">2. <ruby>茶杓<rt>ちゃしゃく</rt></ruby>の<ruby>清<rt>きよ</rt></ruby>め<ruby>方<rt>かた</rt></ruby> <span class="duration-badge">3:05</span></h3>
                <div class="video-container">
                    <iframe width="100%" height="315" src="https://www.youtube.com/embed/Eye4IJpFMZw" frameborder="0" allowfullscreen></iframe>
                </div>
            </div>
            <div class="video-section">
                <h3 class="video-title">3. <ruby>茶碗<rt>ちゃわん</rt></ruby>の<ruby>拭<rt>ふ</rt></ruby>き<ruby>方<rt>かた</rt></ruby> <span class="duration-badge">4:03</span></h3>
                <div class="video-container">
                    <iframe width="100%" height="315" src="https://www.youtube.com/embed/XWFoc9TNzeM" frameborder="0" allowfullscreen></iframe>
                </div>
            </div>
            <div class="video-section">
                <h3 class="video-title">4. <ruby>柄杓<rt>ひしゃく</rt></ruby>の<ruby>扱<rt>あつか</rt></ruby>い<ruby>方<rt>かた</rt></ruby> <span class="duration-badge">6:18</span></h3>
                <div class="video-container">
                    <iframe width="100%" height="315" src="https://www.youtube.com/embed/a3X35nru5fM" frameborder="0" allowfullscreen></iframe>
                </div>
            </div>
        </div>

        <div class="video-category" style="margin-top: 4rem;">
            <h2 class="category-title"><ruby>客<rt>きゃく</rt></ruby>の<ruby>作法<rt>さほう</rt></ruby>（<ruby>席入<rt>せきい</rt></ruby>り・<ruby>頂<rt>いただ</rt></ruby>き<ruby>方<rt>かた</rt></ruby>）</h2>
            <div class="video-section">
                <h3 class="video-title">5. <ruby>席入<rt>せきい</rt></ruby>り・<ruby>拝見<rt>はいけん</rt></ruby> <span class="duration-badge">2:29</span></h3>
                <div class="video-container">
                    <iframe width="100%" height="315" src="https://www.youtube.com/embed/k3lNvXyKytE" frameborder="0" allowfullscreen></iframe>
                </div>
            </div>
            <div class="video-section">
                <h3 class="video-title">6. <ruby>薄茶<rt>うすちゃ</rt></ruby>の<ruby>頂<rt>いただ</rt></ruby>き<ruby>方<rt>かた</rt></ruby> <span class="duration-badge">6:24</span></h3>
                <div class="video-container">
                    <iframe width="100%" height="315" src="https://www.youtube.com/embed/gcHH4yoVBeU" frameborder="0" allowfullscreen></iframe>
                </div>
            </div>
            <div class="video-section">
                <h3 class="video-title">7. お<ruby>菓子<rt>かし</rt></ruby>の<ruby>頂<rt>いただ</rt></ruby>き<ruby>方<rt>かた</rt></ruby> <span class="duration-badge">3:45</span></h3>
                <div class="video-container">
                    <iframe width="100%" height="315" src="https://www.youtube.com/embed/N7b2WXl3rIs" frameborder="0" allowfullscreen></iframe>
                </div>
            </div>
        </div>

        <button id="back-home-from-etiquette" class="primary-btn" style="margin-top: 4rem;">ホームへ<ruby>戻<rt>もど</rt></ruby>る</button>
    </div>
  `;
  
  document.getElementById('back-home-from-etiquette').addEventListener('click', showStartScreen);
}

// Previous animation logic removed

function showSchedule() {
  const lessonDays = [8, 16, 22, 23, 29, 30];
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
        ${isLesson ? '<span class="lesson-label">お<ruby>稽古<rt>けいこ</rt></ruby></span>' : ''}
      </div>
    `;
  }

  // June
  const lessonDaysJune = [5, 6, 13, 19, 26, 27];
  const daysInMonthJune = 30;
  const startDayJune = 1; // June 1st 2026 is Monday (1)
  
  let calendarHtmlJune = '';
  for (let i = 0; i < startDayJune; i++) {
    calendarHtmlJune += '<div class="calendar-day empty"></div>';
  }
  
  for (let day = 1; day <= daysInMonthJune; day++) {
    const isLesson = lessonDaysJune.includes(day);
    calendarHtmlJune += `
      <div class="calendar-day ${isLesson ? 'lesson-day' : ''}">
        <span class="day-num">${day}</span>
        ${isLesson ? '<span class="lesson-label">お<ruby>稽古<rt>けいこ</rt></ruby></span>' : ''}
      </div>
    `;
  }

  appContent.innerHTML = `
    <div class="schedule-container animate-in">
        <h2>お<ruby>稽古<rt>けいこ</rt></ruby>カレンダー</h2>
        <p><ruby>熊谷<rt>くまがい</rt></ruby><ruby>社中<rt>しゃちゅう</rt></ruby>のお<ruby>稽古<rt>けいこ</rt></ruby><ruby>日<rt>び</rt></ruby>は<ruby>以下<rt>いか</rt></ruby>の<ruby>通<rt>とお</rt></ruby>りです。</p>
        
        <h3 style="margin-top: 1rem; margin-bottom: 0.5rem;"><ruby>六月<rt>ろくがつ</rt></ruby></h3>
        <div class="calendar-card">
            <div class="calendar-header">
                <div><ruby>日<rt>にち</rt></ruby></div><div><ruby>月<rt>げつ</rt></ruby></div><div><ruby>火<rt>か</rt></ruby></div><div><ruby>水<rt>すい</rt></ruby></div><div><ruby>木<rt>もく</rt></ruby></div><div><ruby>金<rt>きん</rt></ruby></div><div><ruby>土<rt>ど</rt></ruby></div>
            </div>
            <div class="calendar-grid">
                ${calendarHtmlJune}
            </div>
        </div>

        <h3 style="margin-top: 2rem; margin-bottom: 0.5rem;"><ruby>五月<rt>ごがつ</rt></ruby></h3>
        <div class="calendar-card">
            <div class="calendar-header">
                <div><ruby>日<rt>にち</rt></ruby></div><div><ruby>月<rt>げつ</rt></ruby></div><div><ruby>火<rt>か</rt></ruby></div><div><ruby>水<rt>すい</rt></ruby></div><div><ruby>木<rt>もく</rt></ruby></div><div><ruby>金<rt>きん</rt></ruby></div><div><ruby>土<rt>ど</rt></ruby></div>
            </div>
            <div class="calendar-grid">
                ${calendarHtml}
            </div>
        </div>

        <div class="info-section">
            <div class="info-item">
                <span class="info-label"><ruby>場所<rt>ばしょ</rt></ruby></span>
                <span class="info-value"><ruby>熊谷<rt>くまがい</rt></ruby><ruby>社中<rt>しゃちゅう</rt></ruby> <ruby>茶室<rt>ちゃしつ</rt></ruby></span>
            </div>
            <div class="info-item">
                <span class="info-label"><ruby>備考<rt>びこう</rt></ruby></span>
                <span class="info-value">お<ruby>時間<rt>じかん</rt></ruby>は<ruby>通常<rt>つうじょう</rt></ruby> 13:30〜17:00 です。<br><ruby>変更<rt>へんこう</rt></ruby>がある<ruby>場合<rt>ばあい</rt></ruby>は<ruby>別途<rt>べっと</rt></ruby>ご<ruby>連絡<rt>れんらく</rt></ruby>いたします。</span>
            </div>
        </div>

        <button id="back-home-from-schedule" class="primary-btn" style="margin-top: 2rem;">ホームへ<ruby>戻<rt>もど</rt></ruby>る</button>
    </div>
  `;
  document.getElementById('back-home-from-schedule').addEventListener('click', showStartScreen);
}

init();
