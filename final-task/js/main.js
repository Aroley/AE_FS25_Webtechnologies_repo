class CocktailApp {
  constructor() {
    this.allDrinks = [];
    this.seenDrinkIds = new Set();
    this.currentFilter = "All";
    this.isLoading = false;
    this.drinkPool = []; // Used by spinForDrink
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadDrinkOfTheDay();
    this.loadRandomDrinks(12);
  }

  bindEvents() {
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleFilter(e));
    });

    document.getElementById("spin-btn").addEventListener("click", () => {
      this.spinForDrink();
    });

    document.getElementById("load-more-btn").addEventListener("click", () => {
      this.loadRandomDrinks(6);
    });

    document.getElementById("close-overlay").addEventListener("click", () => {
      this.closeOverlay();
    });

    document.getElementById("recipe-overlay").addEventListener("click", (e) => {
      if (e.target.id === "recipe-overlay") {
        this.closeOverlay();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeOverlay();
      }
    });
  }

  async loadDrinkOfTheDay() {
    try {
      const response = await fetch(
        "https://www.thecocktaildb.com/api/json/v1/1/random.php"
      );
      const data = await response.json();
      const drink = data.drinks[0];
      const card = this.createDrinkCard(drink);
      document.getElementById("drink-of-day").appendChild(card);
    } catch (error) {
      console.error("Error loading drink of the day:", error);
    }
  }

  async loadRandomDrinks(count) {
    if (this.isLoading) return;

    this.isLoading = true;
    const loadBtn = document.getElementById("load-more-btn");
    loadBtn.disabled = true;
    loadBtn.classList.add("loading");
    loadBtn.textContent = "";

    try {
      let drinks = [];

      if (this.currentFilter === "All") {
        while (drinks.length < count) {
          const res = await fetch(
            "https://www.thecocktaildb.com/api/json/v1/1/random.php"
          );
          const data = await res.json();
          const drink = data.drinks[0];
          if (!this.seenDrinkIds.has(drink.idDrink)) {
            this.seenDrinkIds.add(drink.idDrink);
            drinks.push(drink);
          }
        }
      } else {
        const url = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(
          this.currentFilter
        )}`;
        const res = await fetch(url);
        const data = await res.json();
        const allOptions = data.drinks.filter(
          (d) => !this.seenDrinkIds.has(d.idDrink)
        );

        for (let i = allOptions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
        }

        for (let i = 0; i < allOptions.length && drinks.length < count; i++) {
          const drinkData = allOptions[i];
          const fullRes = await fetch(
            `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${drinkData.idDrink}`
          );
          const fullData = await fullRes.json();
          const fullDrink = fullData.drinks[0];
          this.seenDrinkIds.add(fullDrink.idDrink);
          drinks.push(fullDrink);
        }
      }

      this.allDrinks.push(...drinks);
      const grid = document.getElementById("drinks-grid");

      drinks.forEach((drink) => {
        const card = this.createDrinkCard(drink);
        grid.appendChild(card);
      });

      if (this.currentFilter === "All") {
        const cards = document.querySelectorAll("#drinks-grid .drink-card");
        cards.forEach((card) => {
          card.style.display = "flex";
        });
      } else {
        this.applyFilter(this.currentFilter);
      }
    } catch (error) {
      console.error("Error loading drinks:", error);
    } finally {
      this.isLoading = false;
      loadBtn.disabled = false;
      loadBtn.classList.remove("loading");
      loadBtn.textContent = "Load More Drinks";
    }
  }

  createDrinkCard(drink) {
    const drinkCard = document.createElement("div");
    drinkCard.classList.add("drink-card");
    drinkCard.dataset.alcoholic = drink.strAlcoholic;

    drinkCard.innerHTML = `
      <div class="drink-image">
        <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}" loading="lazy">
        <button class="recipe-btn" title="View Recipe">i</button>
      </div>
      <div class="drink-badge-container">
        <span class="drink-badge">${drink.strAlcoholic}</span>
      </div>
      <div class="drink-info">
        <h3 class="drink-title">${drink.strDrink}</h3>
        <div class="drink-details">
          <p><strong>Category:</strong><br> ${drink.strCategory}</p>
          <p><strong>Serve in:</strong><br> ${drink.strGlass}</p>
        </div>
      </div>
    `;

    const badgeContainer = drinkCard.querySelector(".drink-badge-container");

    if (drink.strAlcoholic === "Alcoholic") {
      badgeContainer.classList.add("badge-alcoholic");
    } else if (drink.strAlcoholic === "Non alcoholic") {
      badgeContainer.classList.add("badge-non-alcoholic");
    } else {
      badgeContainer.classList.add("badge-optional");
    }

    drinkCard.addEventListener("click", () => {
      this.showRecipe(drink);
    });

    const recipeBtn = drinkCard.querySelector(".recipe-btn");
    recipeBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent parent card click
      this.showRecipe(drink);
    });

    return drinkCard;
  }

  showRecipe(drink) {
    const ingredients = [];
    for (let i = 1; i <= 15; i++) {
      const ingredient = drink[`strIngredient${i}`];
      const measure = drink[`strMeasure${i}`];
      if (ingredient) {
        ingredients.push(`${measure || ""} ${ingredient}`.trim());
      }
    }

    const recipeDetails = document.getElementById("recipe-details");
    recipeDetails.innerHTML = `
      <h2 class="recipe-title">${drink.strDrink}</h2>
      <h3>Ingredients</h3>
      <ul class="ingredients-list">
        ${ingredients.map((ing) => `<li>${ing}</li>`).join("")}
      </ul>
      <h3>Instructions</h3>
      <p class="instructions">${drink.strInstructions}</p>
    `;

    document.getElementById("recipe-overlay").classList.add("show");
  }

  closeOverlay() {
    document.getElementById("recipe-overlay").classList.remove("show");
  }

  handleFilter(e) {
    document
      .querySelectorAll(".filter-btn")
      .forEach((btn) => btn.classList.remove("active"));
    e.target.classList.add("active");

    this.currentFilter = e.target.dataset.type;
    this.applyFilter(this.currentFilter);
  }

  applyFilter(filterType) {
    const cards = document.querySelectorAll("#drinks-grid .drink-card");

    cards.forEach((card, index) => {
      const drinkType = card.dataset.alcoholic;
      const shouldShow = filterType === "All" || drinkType === filterType;

      if (shouldShow) {
        card.style.display = "flex";
        card.style.animation = "none";
        setTimeout(() => {
          card.style.animation = "fadeInUp 0.4s ease-out forwards";
        }, index * 50);
      } else {
        card.style.display = "none";
      }
    });
  }

  loadInitialHeroCard(drink) {
    const hero = document.getElementById("drink-of-day");
    hero.querySelectorAll(".drink-card").forEach((card) => card.remove());
    const newCard = this.createDrinkCard(drink);
    newCard.classList.add("fade-in");
    hero.prepend(newCard);
  }

  updateDrinkOfDay(drink) {
    if (drink) {
      const drinkCard = this.createDrinkCard(drink);
      const drinkOfDay = document.getElementById("drink-of-day");
      drinkOfDay.innerHTML = "";
      drinkOfDay.appendChild(drinkCard);
    }
  }

  async fetchRandomDrinks(count = 10) {
    try {
      const drinks = [];
      for (let i = 0; i < count; i++) {
        const response = await fetch(
          "https://www.thecocktaildb.com/api/json/v1/1/random.php"
        );
        const data = await response.json();
        drinks.push(data.drinks[0]);
      }
      return drinks;
    } catch (error) {
      console.error("Error fetching random drinks:", error);
      return [];
    }
  }

  async spinForDrink() {
    if (this.drinkPool.length === 0) {
      this.drinkPool = await this.fetchRandomDrinks(12);
    }

    let interval = 100;
    let elapsedTime = 0;

    const spinBtn = document.getElementById("spin-btn");
    spinBtn.disabled = true;

    const spinInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * this.drinkPool.length);
      const randomDrink = this.drinkPool[randomIndex];
      this.updateDrinkOfDay(randomDrink);
      elapsedTime += interval;
      if (elapsedTime >= 3000) {
        clearInterval(spinInterval);
        this.showFinalDrink();
      } else {
        interval += 50;
      }
    }, interval);
  }

  showFinalDrink() {
    const finalDrink =
      this.drinkPool[Math.floor(Math.random() * this.drinkPool.length)];
    this.updateDrinkOfDay(finalDrink);

    // Make sure the spin button is re-enabled
    const spinBtn = document.getElementById("spin-btn");
    if (spinBtn) {
      spinBtn.disabled = false;
      spinBtn.style.display = "flex";
    }
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".floating-icons");
  const MAX_BUBBLES = 20;
  let currentBubbles = 0;

  function createBubble() {
    if (currentBubbles >= MAX_BUBBLES) return;

    const bubble = document.createElement("img");
    bubble.src = "img/bubble.svg";
    bubble.classList.add("float-icon", "bubble");
    bubble.draggable = false;

    const size = Math.random() * 40 + 20;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${Math.random() * 100}%`;
    bubble.style.animationDuration = `${5 + Math.random() * 5}s`;

    // Increase bubble count
    currentBubbles++;

    bubble.addEventListener("click", (e) => {
      const rect = bubble.getBoundingClientRect();
      const parentRect = container.getBoundingClientRect();
      const top = rect.top - parentRect.top;
      const left = rect.left - parentRect.left;

      bubble.style.animation = "none";
      bubble.style.top = `${top}px`;
      bubble.style.left = `${left}px`;
      bubble.style.position = "absolute";
      bubble.style.transform = `scale(1)`;
      bubble.style.pointerEvents = "none";
      bubble.style.animation = "pop 0.3s forwards";

      bubble.addEventListener("animationend", () => {
        bubble.remove();
        currentBubbles--;
      });
    });

    bubble.addEventListener("animationend", () => {
      if (bubble.parentElement) {
        bubble.remove();
        currentBubbles--;
      }
    });

    container.appendChild(bubble);
  }

  setInterval(createBubble, 600);
});

// Initialize the app when the page is ready
document.addEventListener("DOMContentLoaded", async () => {
  const app = new CocktailApp();

  const res = await fetch(
    "https://www.thecocktaildb.com/api/json/v1/1/random.php"
  );
  const data = await res.json();
  const initialDrink = data.drinks[0];

  app.loadInitialHeroCard(initialDrink);
});
