// SHOW
document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".floating-icons");
  // Customize the maximum number of bubbles
  const MAX_BUBBLES = 20;
  let currentBubbles = 0;

  function createBubble() {
    // Early exit if the maximum number of bubbles is reached
    if (currentBubbles >= MAX_BUBBLES) return;
    // Otherwise, make new bubble
    const bubble = document.createElement("img");
    bubble.src = "img/bubble.svg";
    bubble.classList.add("float-icon", "bubble");
    // Make it so the img isn't being pulled when clicking for too long
    bubble.draggable = false;

    // Randomize bubble size and position
    const size = Math.random() * 40 + 20;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${Math.random() * 100}%`;

    // Randomize bubble animation duration
    bubble.style.animationDuration = `${5 + Math.random() * 5}s`;

    // Increase bubble count
    currentBubbles++;

    bubble.addEventListener("click", (e) => {
      // Get position of bubble relative to the container
      const rect = bubble.getBoundingClientRect();
      const parentRect = container.getBoundingClientRect();
      const top = rect.top - parentRect.top;
      const left = rect.left - parentRect.left;

      // Remove the bubble from the DOM and reset its position to play the animation at current location
      bubble.style.animation = "none";
      bubble.style.top = `${top}px`;
      bubble.style.left = `${left}px`;
      bubble.style.position = "absolute";
      bubble.style.transform = `scale(1)`;
      bubble.style.pointerEvents = "none";
      bubble.style.animation = "pop 0.3s forwards";

      // Remove the bubble after the animation ends
      bubble.addEventListener("animationend", () => {
        bubble.remove();
        currentBubbles--;
      });
    });

    // Add the bubble to the container
    container.appendChild(bubble);
  }

  // Bubble creation interval
  setInterval(createBubble, 600);