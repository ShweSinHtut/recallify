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

// Fetch lessons from localStorage
const storedLessons = JSON.parse(localStorage.getItem('lessons')) || [];
lessons.push(...storedLessons);

// Filter lessons to display only today's lessons
function filterTodaysLessons(lessons, today) {
  return lessons.filter((lesson) => lesson.date === today);
}

// Display lessons immediately on page load
displayInputLessons(filterTodaysLessons(lessons, today));

// Add new lesson and update display
document.querySelector('.add-lessons-btn').addEventListener('click', () => {
  const detailsElement = document.querySelector('.lesson-details-textarea');
  const titleElement = document.querySelector('.lessons-title-input');

  const details = detailsElement.value.trim();
  const title = titleElement.value.trim();

  if (title && details) {
    // Create a new lesson using addLessons method
    const newLesson = addLessons(title, details, today)
    
    // Add the new lesson to the lessons array
    lessons.push(newLesson);

    // Save updated lessons to localStorage
    localStorage.setItem('lessons', JSON.stringify(lessons));

    // Display the updated lessons
    displayInputLessons(filterTodaysLessons(lessons, today));

    // Clear input fields
    detailsElement.value = '';
    titleElement.value = '';
  }
});

function addLessons(title, details, date) {
  const dayjsDate = dayjs(date);

  // Generate revision dates
  const revisionDates = [
    dayjsDate.add(1, 'day').format('YYYYMMDD'),
    dayjsDate.add(3, 'days').format('YYYYMMDD'),
    dayjsDate.add(1, 'month').format('YYYYMMDD'),
    dayjsDate.add(3, 'months').format('YYYYMMDD'),
  ];


  return {
    id: `${title}-${dayjsDate.format('YYYYMMDD')}`.replace(/\s+/g, '-').toLowerCase(),
    title,
    details,
    date: dayjsDate.format('YYYYMMDD'),
    revisionDates,
  };

  // Fetch existing lessons from localStorage
  // const lessons = JSON.parse(localStorage.getItem('lessons')) || [];

  // Append the new lesson
  // lessons.push(newLesson);

  // Save the updated lessons back to localStorage
  // localStorage.setItem('lessons', JSON.stringify(lessons));
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

  // Update the lessons display grid
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

  if(!lessons || lessons.length === 0) {
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

  const todayLessonsHTML = lessons.map((lesson) => {
    return `
      <div>
        <h2>${lesson.title}</h2>
        <p>
          ${lesson.details.replace(/\n/g, '<br>')}
        </p>
      </div>
    `;
  }).join('');

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
  const searchValue = e.target.value.trim().toLowerCase(); // Get user input
  
  // Get all upcoming lessons
  const upcomingLessons = getUpcomingLessons(lessons, today);

  // Filter lessons based on search query
  const filteredLessons = upcomingLessons.filter((lesson) => {
    return (
      lesson.title.toLowerCase().includes(searchValue) ||
      lesson.details.toLowerCase().includes(searchValue)
    );
  });

  // If no search value or lessons match the search, do not update the content
  if (searchValue && filteredLessons.length === 0) {
    return; // Exit the function and keep the existing displayed lessons
  }

  // Display the filtered lessons, highlighting the search query
  displayUpcomingLessons(filteredLessons, searchValue, document.querySelector('.lessons-to-review-grid'));
});

function highlightText(text, searchValue) {
  if (!searchValue) return text; // No highlighting if searchValue is empty

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
  const groupedLessons = upcomingLessons.reduce((groups, lesson) => {
    if (!groups[lesson.date]) {
      groups[lesson.date] = [];
    }
    groups[lesson.date].push(lesson);
    return groups;
  }, {});

  // Predefined colors for alternating backgrounds
  const colors = ['#FFD6E6', '#B3D9FF', '#FFF4B3', '#E1F7D5', '#FFEBF2'];
  let colorIndex = 0;

  // Generate HTML for each group
  const lessonsHTML = Object.entries(groupedLessons)
    .map(([date, lessons]) => {
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
  const upcoming = lessons.flatMap((lesson) =>
    lesson.revisionDates.map((date) => ({
      title: lesson.title,
      details: lesson.details,
      date,
    }))
  );

  // Filter to include only dates that are today or later
  const upcomingFiltered = upcoming.filter(
    (item) => dayjs(item.date).diff(today, 'day') >= 0
  );    

  // Sort the array by date (earliest first)
  return upcomingFiltered.sort((a, b) => dayjs(a.date) - dayjs(b.date));
}

// Handle "Schedule" button click
document.querySelector('.nav-options > button:last-child').addEventListener('click', () => {
  const lessons = JSON.parse(localStorage.getItem('lessons')) || [];
  const today = dayjs().format('YYYYMMDD');

  const upcomingLessons = getUpcomingLessons(lessons, today);

  displayUpcomingLessons(upcomingLessons, '', document.querySelector('.lessons-to-review-grid'));
});