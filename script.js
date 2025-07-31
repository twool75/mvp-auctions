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
  // Ensure all logos point to the root-level logo file rather than assets/images
  document.querySelectorAll('.logo').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && src !== 'logo.png') {
      img.setAttribute('src', 'logo.png');
    }
  });

  // AI description generator for the sell page
  const generateBtn = document.getElementById('generate-description-btn');
  if (generateBtn) {
    generateBtn.addEventListener('click', () => {
      const nameInput = document.getElementById('item-name');
      const categorySelect = document.getElementById('item-category');
      const bidInput = document.getElementById('starting-bid');
      const descTextarea = document.getElementById('item-description');
      const name = nameInput ? nameInput.value.trim() : '';
      const category = categorySelect ? categorySelect.value : '';
      const bid = bidInput ? bidInput.value.trim() : '';
      const descParts = [];
      if (name) {
        descParts.push(`Presenting ${name}`);
      }
      if (category) {
        descParts.push(`perfect for ${category} collectors`);
      }
      if (bid) {
        descParts.push(`starting at just $${bid}`);
      }
      let description = descParts.join(', ');
      if (description) {
        description += '. ';
      }
      description += "This item is a must-have addition to your collection. Don't miss your chance to own this unique piece of sports history!";
      if (descTextarea) {
        descTextarea.value = description;
      }
    });
  }

  // Shipping cost calculator for the sell page
  const calcShipBtn = document.getElementById('calc-shipping-btn');
  if (calcShipBtn) {
    calcShipBtn.addEventListener('click', () => {
      const carrierSelect = document.getElementById('shipping-carrier');
      const weightInput = document.getElementById('item-weight');
      const costInput = document.getElementById('shipping-cost');
      const carrier = carrierSelect ? carrierSelect.value : '';
      const weight = weightInput ? parseFloat(weightInput.value) : NaN;
      if (!carrier || !weight || weight <= 0 || Number.isNaN(weight)) {
        alert('Please select a shipping carrier and enter a valid item weight to calculate shipping cost.');
        return;
      }
      let base = 0;
      switch (carrier) {
        case 'usps':
          base = 4.95;
          break;
        case 'ups':
          base = 6.99;
          break;
        case 'fedex':
          base = 7.99;
          break;
        case 'dhl':
          base = 10.95;
          break;
        default:
          base = 5.0;
      }
      const cost = base + 0.5 * weight;
      if (costInput) {
        costInput.value = cost.toFixed(2);
      }
    });
  }

  // Track first-time sellers and enter them into a giveaway
  const sellForm = document.querySelector('form.contact-form');
  if (sellForm) {
    sellForm.addEventListener('submit', () => {
      const hasSold = localStorage.getItem('hasSoldBefore');
      if (!hasSold) {
        alert('Thank you for your first listing! You have been entered into our giveaway.');
        localStorage.setItem('hasSoldBefore', 'true');
      }
    });
  }
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