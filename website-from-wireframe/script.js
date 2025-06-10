document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const searchInput = form.querySelector("input[name='search']");
  const nextBtn = document.getElementById("nextMatch");
  const prevBtn = document.getElementById("prevMatch");
  const searchNav = document.getElementById("search-nav");
  const counter = document.getElementById("match-counter");

  let matches = [];
  let currentIndex = 0;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const term = searchInput.value.trim();
    if (!term) return;

    clearHighlights();
    matches = highlightAll(term);
    currentIndex = 0;

    if (matches.length > 0) {
      scrollToMatch(matches[currentIndex]);
      updateCounter();
      searchNav.style.display = "flex";
    } else {
      alert(`No matches found for "${term}"`);
      searchNav.style.display = "none";
    }
  });

  nextBtn.addEventListener("click", () => {
    if (matches.length === 0) return;
    currentIndex = (currentIndex + 1) % matches.length;
    scrollToMatch(matches[currentIndex]);
    updateCounter();
  });

  prevBtn.addEventListener("click", () => {
    if (matches.length === 0) return;
    currentIndex = (currentIndex - 1 + matches.length) % matches.length;
    scrollToMatch(matches[currentIndex]);
    updateCounter();
  });

  document.addEventListener("keydown", (e) => {
    if (matches.length === 0) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      currentIndex = (currentIndex + 1) % matches.length;
      scrollToMatch(matches[currentIndex]);
      updateCounter();
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      currentIndex = (currentIndex - 1 + matches.length) % matches.length;
      scrollToMatch(matches[currentIndex]);
      updateCounter();
    }
  });

  function highlightAll(term) {
    const regex = new RegExp(`(${escapeRegExp(term)})`, "gi");
    const elements = document.querySelectorAll(
      "p, h1, h2, h3, h4, h5, h6, li, a"
    );

    elements.forEach((el) => {
      if (regex.test(el.innerHTML)) {
        el.innerHTML = el.innerHTML.replace(
          regex,
          `<mark class="highlighted">$1</mark>`
        );
      }
    });

    // RESELECT mark elements fresh from DOM
    return Array.from(document.querySelectorAll("mark.highlighted"));
  }

  function scrollToMatch(el) {
    matches.forEach((m) => m.classList.remove("current-highlight"));
    el.classList.add("current-highlight");
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function clearHighlights() {
    document.querySelectorAll("mark.highlighted").forEach((mark) => {
      const parent = mark.parentNode;
      parent.replaceChild(document.createTextNode(mark.textContent), mark);
      parent.normalize(); // Merge text nodes
    });
    matches = [];
    currentIndex = 0;
    updateCounter();
  }

  function updateCounter() {
    if (matches.length > 0) {
      counter.textContent = `${currentIndex + 1} of ${matches.length}`;
    } else {
      counter.textContent = "";
    }
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
});
