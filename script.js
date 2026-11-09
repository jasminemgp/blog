// --- DATABASE INITIALIZATION ---
// Changed to a mutable let variable so the fetched JSON can be stored here safely.
let blogPosts = [];

// --- CORE INTERACTION LOGIC ---
const timelineContainer = document.getElementById('timeline-container');
const activePostContainer = document.getElementById('active-post-container');
const postContentWrapper = document.getElementById('post-view-content');
const closeBtn = document.getElementById('close-btn');

// Converted to async function to support file streaming transfers
async function initBlog() {
  try {
    // Fetch data asynchronously from the JSON file next to your HTML file
    const response = await fetch('./posts.json');
    
    if (!response.ok) {
      throw new Error(`HTTP network error! Status code reported: ${response.status}`);
    }
    
    // Store data inside your global blog list
    blogPosts = await response.json();
    
    if (blogPosts.length === 0) {
      timelineContainer.innerHTML = '<p class="status-msg">No entries found.</p>';
      return;
    }
    
    renderTimeline();
    
    // Keep split pane populated by auto-loading the first post on desktop layout launch
    if (window.innerWidth > 768) {
      displayPost(0);
    }
    
  } catch (error) {
    console.error('Initialization error fetching database assets:', error);
    timelineContainer.innerHTML = '<p class="status-msg">Error loading journal entries.</p>';
  }
}

function renderTimeline() {
  timelineContainer.innerHTML = '';
  blogPosts.forEach((post, index) => {
    const item = document.createElement('div');
    item.className = 'timeline-item';
    item.setAttribute('data-index', index);
    
    // Displays ONLY the dynamic post dates
    item.innerHTML = `
      <span class="timeline-date">${post.date}</span>
    `;
    
    item.addEventListener('click', () => displayPost(index));
    timelineContainer.appendChild(item);
  });
}

function displayPost(index) {
  const post = blogPosts[index];
  if (!post) return;

  // Track and lock active visual brand-blue highlight colors
  document.querySelectorAll('.timeline-item').forEach((node, idx) => {
    const dateSpan = node.querySelector('.timeline-date');
    if (idx === index) {
      dateSpan.classList.add('active-date');
    } else {
      dateSpan.classList.remove('active-date');
    }
  });

  // Check if an image path was provided in the JSON file and is not an empty string
  const imageHTML = post.image ? `<img src="${post.image}" alt="${post.title}" class="post-header-image">` : '';

  // Audio:
  const audioHTML = post.audio ? `<audio controls src="${post.audio}" class="post-audio-player"></audio>` : '';

  // Split the content string by <br> tags and wrap each piece in  <p> tag
  const formattedContent = post.content
  .split('<br>')
  .map(paragraphText => `<p>${paragraphText.trim()}</p>`)
  .join('');

  // Inject chosen data directly into right hand view panel (with image placeholder embedded)
  postContentWrapper.innerHTML = `
    <article class="post-view">
      ${imageHTML}
      <h2>${post.title}</h2>
      <span class="post-date">${post.date}</span>
      ${audioHTML}
      ${formattedContent}
    </article>
  `;

  // Mobile layout overlay support controls
  if (window.innerWidth <= 768) {
    activePostContainer.classList.add('mobile-open');
    document.body.classList.add('has-open-modal');
  }
}

function closeMobilePost() {
  activePostContainer.classList.remove('mobile-open');
  document.body.classList.remove('has-open-modal');
  
  // On mobile only, clear highlights when closing the modal popup window frame
  if (window.innerWidth <= 768) {
    document.querySelectorAll('.timeline-date').forEach(dateSpan => {
      dateSpan.classList.remove('active-date');
    });
  }
}

closeBtn.addEventListener('click', closeMobilePost);

window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    document.body.classList.remove('has-open-modal');
    activePostContainer.classList.remove('mobile-open');
    // Ensure an entry stays active when resizing back up to web desktops
    if (!document.querySelector('.active-date') && blogPosts.length > 0) {
        displayPost(0);
    }
  }
});

document.addEventListener('DOMContentLoaded', initBlog);
