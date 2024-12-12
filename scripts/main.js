import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';
import * as header from './header.js';
import {lessons} from '../data/lessons.js';

header.renderHeaderDate();
header.toggleDarkMode();

/* Navigation Handling */
// For toggling the active button and rendering the section
const navButtons = document.querySelectorAll('.nav-options > button');
const sections = document.querySelectorAll('.content');

navButtons.forEach((button) => {
  button.addEventListener('click', () => {
    removeActiveBtn();
    button.classList.add('active');

    renderActiveSection(button);
  });
});

function removeActiveBtn() {
  navButtons.forEach(btn => btn.classList.remove('active'));
}

function removeActiveSection() {
  sections.forEach((section) => section.classList.remove("active"));
}

function renderActiveSection(button) {
  removeActiveSection();
  
  const targetId = button.getAttribute("data-target");
  document.getElementById(targetId).classList.add("active");
}






/* Add Lessons Handling */
const today = dayjs().format('YYYYMMDD');

const storedLessons = JSON.parse(localStorage.getItem('lessons')) || [];
lessons.push(...storedLessons); /*******/

function filterTodaysLessons(lessons, today) {
  return lessons.filter((lesson) => lesson.date === today);
}

displayInputLessons(filterTodaysLessons(lessons, today));

// Add new lesson and update display
document.querySelector('.add-lessons-btn').addEventListener('click', () => {
  const detailsElement = document.querySelector('.lesson-details-textarea');
  const titleElement = document.querySelector('.lessons-title-input');

  const details = detailsElement.value.trim();
  const title = titleElement.value.trim();

  if (title && details) {
    const newLesson = addLessons(title, details, today)
    
    lessons.push(newLesson);

    localStorage.setItem('lessons', JSON.stringify(lessons));

    displayInputLessons(filterTodaysLessons(lessons, today));

    detailsElement.value = '';
    titleElement.value = '';
  }
});

function addLessons(title, details, date) {
  const dayjsDate = dayjs(date);

  const revisionDates = [
    dayjsDate.add(1, 'day').format('YYYYMMDD'),
    dayjsDate.add(3, 'days').format('YYYYMMDD'),
    dayjsDate.add(1, 'month').format('YYYYMMDD'),
    dayjsDate.add(3, 'months').format('YYYYMMDD'),
  ];


  return {
    id: `${title}-${dayjsDate.format('YYYYMMDD')}`.replace(/\s+/g, '-').toLowerCase(), /*******/
    title,
    details,
    date: dayjsDate.format('YYYYMMDD'),
    revisionDates,
  };
}

/* Display Lessons */ 
function displayInputLessons(lessons) {
  const lessonsGrid = document.querySelector('.lessons-input-display-grid');
  let lessonsHTML = '';

  if (!lessons || lessons.length === 0) {
    lessonsGrid.innerHTML = `<p class="no-lessons-entered">No lessons for today. Do you want to add some to get started?</p>`;
    return;
  }

  lessons.forEach((lesson) => {
    lessonsHTML += `
      <div class="today-lesson">
        <h2>${lesson.title}</h2>
        <p>${lesson.details.replace(/\n/g, '<br>')}</p>
      </div>
    `;
  });

  lessonsGrid.innerHTML = lessonsHTML;
}





/* Today Lessons Handling */
const todayLessons = getTodayLessons(lessons, today);
displayTodayLessons(todayLessons);

document.querySelector('.nav-options > button:first-child')
  .addEventListener('click', () => {
    const lessons = JSON.parse(localStorage.getItem('lessons')) || [];

    displayTodayLessons(todayLessons);
  });

function getTodayLessons(lessons, today) {
  return lessons.filter((lesson) => lesson.revisionDates.includes(today));
}

function displayTodayLessons(lessons) {
  const todayLessonGrid = document.querySelector('.today-lessons-grid');

  if (!lessons || lessons.length === 0) {
    todayLessonGrid.innerHTML = `
      <div class="no-lessons">
        <p>No lessons to revise for today!
        </br>
          Do you want to <button class="add-lessons">add lessons</button>?
        </p>
      </div>
    `;
    return;
  }

  const gradients = [
    'linear-gradient(135deg, #ffc3d0, #96c2ff)',
    'linear-gradient(80deg, #ddbbff, #96c2ff)',
    'linear-gradient(135deg, #dee8ff, #ffbf94)',
    'linear-gradient(135deg, #bfffe5, #faa9c2)',
    'linear-gradient(#c5e2ba, #dfc5ec)'
  ];
  let gradientIndex = 0;

  const todayLessonsHTML = lessons
    .map((lesson) => {
      const backgroundGradient = gradients[gradientIndex % gradients.length]; /*******/
      gradientIndex++;

      return `
        <div class="lesson-block" style="background: ${backgroundGradient};">
          <h2>${lesson.title}</h2>
          <p>${lesson.details.replace(/\n/g, '<br>')}</p>
        </div>
      `;
    })
    .join('');

  todayLessonGrid.innerHTML = todayLessonsHTML;
}

document.querySelector('.today-lessons-grid')
  .addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('add-lessons')) {
      sections.forEach(section => section.classList.remove('active'));

      navButtons.forEach(button => button.classList.remove('active'));

      const addLessonsBtn = document.querySelector('.nav-options > #add-lessons-btn');
      addLessonsBtn.classList.add('active');

      document.querySelector('#add-lessons').classList.add('active');
    }
  });




  
/* Schedule Button Handling */
document.querySelector('#schedule-lessons-search').addEventListener('input', (e) => {
  const searchValue = e.target.value.trim().toLowerCase(); 
  
  const upcomingLessons = getUpcomingLessons(lessons, today);

  const filteredLessons = upcomingLessons.filter((lesson) => {
    return (
      lesson.title.toLowerCase().includes(searchValue) ||
      lesson.details.toLowerCase().includes(searchValue)
    );
  });

  if (searchValue && filteredLessons.length === 0) {
    return; 
  }

  displayUpcomingLessons(filteredLessons, searchValue, document.querySelector('.lessons-to-review-grid'));
});

function highlightText(text, searchValue) {
  if (!searchValue) return text; 

  /*******/
  const regex = new RegExp(`(${searchValue})`, 'gi'); // Case-insensitive matching  
  return text.replace(regex, '<mark>$1</mark>'); // Wrap matched text in <mark> tags
}

function displayUpcomingLessons(upcomingLessons, searchValue = '', targetContainer) {
  targetContainer.innerHTML = ''; // Clear existing content

  if (!upcomingLessons || upcomingLessons.length === 0) {
    targetContainer.innerHTML = `
      <p class="no-upcoming-lessons">No upcoming lessons to revise! 🎉</p>
    `;
    return;
  }

  // Group lessons by date
  const groupedLessons = upcomingLessons.reduce((groups, lesson) => {  /*******/
    if (!groups[lesson.date]) {   /*******/
      groups[lesson.date] = [];
    }
    groups[lesson.date].push(lesson);
    return groups;
  }, {});

  const colors = ['#FFD6E6', '#B3D9FF', '#FFF4B3', '#E1F7D5', '#FFEBF2'];
  let colorIndex = 0;

  const lessonsHTML = Object.entries(groupedLessons)    /*******/
    .map(([date, lessons]) => {   /*******/
      const backgroundColor = colors[colorIndex % colors.length];
      colorIndex++;

      const lessonBlocks = lessons
        .map((lesson) => {
          const highlightedTitle = highlightText(lesson.title, searchValue);
          const highlightedDetails = highlightText(lesson.details, searchValue);

          return `
            <div class="lesson-block">
              <h3>${highlightedTitle}</h3>
              <p>${highlightedDetails.replace(/\n/g, '<br>')}</p>
            </div>
          `;
        })
        .join('');

      return `
        <div class="lesson-group" style="background-color: ${backgroundColor}">
          <h2>${dayjs(date).format('MMMM DD, YYYY')}</h2>
          <div>${lessonBlocks}</div>
        </div>
      `;
    })
    .join('');

  targetContainer.innerHTML = lessonsHTML;
}

function getUpcomingLessons(lessons, today) {
  // Flatten all lessons with their revisionDates into an array of objects
  const upcoming = lessons.flatMap((lesson) =>    /*******/
    lesson.revisionDates.map((date) => ({
      title: lesson.title,
      details: lesson.details,
      date,
    }))
  );

  const upcomingFiltered = upcoming.filter(
    (item) => dayjs(item.date).diff(today, 'day') >= 0    /*******/
  );    

  return upcomingFiltered.sort((a, b) => dayjs(a.date) - dayjs(b.date));   /*******/
}

// Handle "Schedule" button click
document.querySelector('.nav-options > button:last-child').addEventListener('click', () => {
  const lessons = JSON.parse(localStorage.getItem('lessons')) || [];
  const today = dayjs().format('YYYYMMDD');

  const upcomingLessons = getUpcomingLessons(lessons, today);

  displayUpcomingLessons(upcomingLessons, '', document.querySelector('.lessons-to-review-grid'));
});
