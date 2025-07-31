/*
  MVP Auctions JavaScript

  This script powers interactive features on the MVP Auctions website. At
  present it manages the real‑time countdown timers displayed on auction
  cards. Each card's parent element includes a data‑deadline attribute
  containing an ISO‑formatted date and time string (YYYY‑MM‑DDTHH:MM:SS). The
  countdown function calculates the remaining time until that deadline and
  updates the DOM every second. If the deadline passes, it displays
  "Closed". Additional interactive features can be added to this file in the
  future.
*/

document.addEventListener('DOMContentLoaded', () => {
  // Update all logo images to use the new logo file.
  // The site originally references a logo located under assets/images in each
  // HTML file. Since we've uploaded a new logo (logo.png) to the repository
  // root, set the src attribute of every element with the .logo class to this
  // file so that the navigation bar and footer across all pages display the
  // same branding without modifying each HTML template individually. This
  // executes immediately after the DOM is ready.
  document.querySelectorAll('.logo').forEach((img) => {
    img.src = 'logo.png';
  });

  // Load custom auction data from localStorage and apply to the DOM.  This
  // allows the admin page to persist edits across sessions without a backend.
  function applyAuctionData(sectionId, dataArray) {
    const cards = document.querySelectorAll(`#${sectionId} .auction-card`);
    dataArray.forEach((data, idx) => {
      const card = cards[idx];
      if (!card) return;
      const titleElem = card.querySelector('h3');
      const bidElem = card.querySelector('.current-bid span');
      const endsElem = card.querySelector('.ends-in');
      if (titleElem && data.title !== undefined) titleElem.textContent = data.title;
      if (bidElem && data.bid !== undefined) bidElem.textContent = data.bid;
      if (endsElem && data.deadline) {
        endsElem.setAttribute('data-deadline', data.deadline);
      }
    });
  }

  // Retrieve auction data from the backend API (if available) and fall back
  // to any values stored in localStorage by the admin page. This enables a
  // lightweight integration with a real server without breaking the current
  // localStorage‑based edit functionality.
  fetch('/api/auctions/trending')
    .then((res) => res.json())
    .then((data) => {
      if (Array.isArray(data)) applyAuctionData('trending-cards', data);
    })
    .catch(() => {
      /* ignore network errors */
    })
    .finally(() => {
      // apply any locally stored edits on top of API data
      try {
        const trendingData = JSON.parse(localStorage.getItem('trendingAuctions'));
        if (Array.isArray(trendingData)) {
          applyAuctionData('trending-cards', trendingData);
        }
      } catch (err) {
        /* ignore */
      }
    });
  fetch('/api/auctions/featured')
    .then((res) => res.json())
    .then((data) => {
      if (Array.isArray(data)) applyAuctionData('featured-cards', data);
    })
    .catch(() => {
      /* ignore network errors */
    })
    .finally(() => {
      try {
        const featuredData = JSON.parse(localStorage.getItem('featuredAuctions'));
        if (Array.isArray(featuredData)) {
          applyAuctionData('featured-cards', featuredData);
        }
      } catch (err) {
        /* ignore */
      }
    });
  const countdownElements = document.querySelectorAll('.ends-in');

  function updateCountdown() {
    const now = new Date().getTime();

    countdownElements.forEach((elem) => {
      const deadlineStr = elem.getAttribute('data-deadline');
      const countdownSpan = elem.querySelector('.countdown');
      if (!deadlineStr || !countdownSpan) return;
      const deadline = new Date(deadlineStr).getTime();
      const distance = deadline - now;

      if (distance <= 0) {
        countdownSpan.textContent = 'Closed';
        return;
      }
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      // Format with leading zeros
      const parts = [];
      if (days > 0) parts.push(`${days}d`);
      parts.push(String(hours).padStart(2, '0'));
      parts.push(String(minutes).padStart(2, '0'));
      parts.push(String(seconds).padStart(2, '0'));
      countdownSpan.textContent = parts.join(':');
    });
  }

  // Initial call
  updateCountdown();
  // Update every second
  setInterval(updateCountdown, 1000);
});