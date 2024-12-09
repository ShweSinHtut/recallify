import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';

/* Render Current Date */
export function renderHeaderDate() {
  const currentMonth = dayjs().format('MMMM');
  const currentFullDate = dayjs().format('dddd, MMM D, YYYY');
  
  document.querySelector('.current-month').textContent = currentMonth;;
  document.querySelector('.current-full-date').textContent = currentFullDate;
}


/*  Day-Night Mode Handling */
export function toggleDarkMode() {
  let darkMode = localStorage.getItem('darkMode');
  const mode = document.querySelector('.header-right-section');
  
  // Apply previously saved theme on page load
  if (darkMode === 'enabled') enableDarkMode();
  
  mode.addEventListener('click', () => {
    darkMode = localStorage.getItem('darkMode');
  
    if (darkMode !== 'enabled') {
      enableDarkMode();
    }
    else {
      disableDarkMode();
    }
  });
}

function enableDarkMode() {
  document.body.classList.add('darkmode');
  localStorage.setItem('darkMode', 'enabled');
}

function disableDarkMode() {
  document.body.classList.remove('darkmode');
  localStorage.setItem('darkMode', null);
}