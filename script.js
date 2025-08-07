const questionEl = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const nextBtn = document.getElementById("next-btn");
const timerEl = document.getElementById("time");
const progressBar = document.getElementById("progress");
const scoreBox = document.getElementById("score-box");

let currentQuestionIndex = 0;
let questions = [];
let score = 0;
let timer;
let timeLeft = 15;

async function fetchQuestions() {
  const res = await fetch("https://opentdb.com/api.php?amount=5&type=multiple");
  const data = await res.json();
  questions = data.results.map(q => ({
    question: decodeHTML(q.question),
    answers: shuffle([...q.incorrect_answers.map(decodeHTML), decodeHTML(q.correct_answer)]),
    correct: decodeHTML(q.correct_answer)
  }));
  startQuiz();
}

function decodeHTML(html) {
  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function startQuiz() {
  score = 0;
  currentQuestionIndex = 0;
  scoreBox.style.display = "none";
  showQuestion();
}

function showQuestion() {
  resetState();
  let current = questions[currentQuestionIndex];
  questionEl.innerText = current.question;
  current.answers.forEach(answer => {
    const button = document.createElement("button");
    button.innerText = answer;
    button.classList.add("btn");
    button.addEventListener("click", () => selectAnswer(button, current.correct));
    answerButtons.appendChild(button);
  });
  startTimer();
}

function resetState() {
  clearInterval(timer);
  timeLeft = 15;
  timerEl.innerText = timeLeft;
  nextBtn.style.display = "none";
  answerButtons.innerHTML = "";
  progressBar.style.width = "100%";
}

function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    timerEl.innerText = timeLeft;
    progressBar.style.width = (timeLeft / 15) * 100 + "%";
    if (timeLeft <= 0) {
      clearInterval(timer);
      disableAnswers();
      nextBtn.style.display = "block";
    }
  }, 1000);
}

function selectAnswer(button, correct) {
  clearInterval(timer);
  const isCorrect = button.innerText === correct;
  if (isCorrect) {
    button.classList.add("correct");
    score++;
  } else {
    button.classList.add("wrong");
  }
  Array.from(answerButtons.children).forEach(btn => {
    btn.disabled = true;
    if (btn.innerText === correct) btn.classList.add("correct");
  });
  nextBtn.style.display = "block";
}

nextBtn.addEventListener("click", () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showScore();
  }
});

function showScore() {
  resetState();
  questionEl.innerText = "🎉 Quiz Finished!";
  scoreBox.innerText = `You scored ${score} out of ${questions.length}`;
  scoreBox.style.display = "block";
  nextBtn.innerText = "Play Again";
  nextBtn.style.display = "block";
  nextBtn.onclick = () => location.reload();
}

fetchQuestions();
