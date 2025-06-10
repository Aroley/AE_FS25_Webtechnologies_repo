class CocktailApp {
  constructor() {
    this.allDrinks = [];
    this.currentFilter = "All";
    this.isLoading = false;
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadDrinkOfTheDay();
    this.loadRandomDrinks(12);
  }

  bindEvents() {
    // Filter buttons
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleFilter(e));
    });

    // Load more button
    document.getElementById("load-more-btn").addEventListener("click", () => {
      this.loadRandomDrinks(6);
    });

    // Modal events
    document.getElementById("close-modal").addEventListener("click", () => {
      this.closeModal();
    });

    document.getElementById("recipe-overlay").addEventListener("click", (e) => {
      if (e.target.id === "recipe-overlay") {
        this.closeModal();
      }
    });

    // Keyboard support
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeModal();
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

      const card = this.createDrinkCard(drink, true);
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
      const promises = Array.from({ length: count }, () =>
        fetch("https://www.thecocktaildb.com/api/json/v1/1/random.php").then(
          (res) => res.json()
        )
      );

      const results = await Promise.all(promises);
      const newDrinks = results.map((res) => res.drinks[0]);
      // Spread operator to add new drinks to the existing array
      this.allDrinks.push(...newDrinks);

      const grid = document.getElementById("drinks-grid");
      newDrinks.forEach((drink, index) => {
        const card = this.createDrinkCard(drink);
        grid.appendChild(card);
      });

      this.applyFilter(this.currentFilter);
    } catch (error) {
      console.error("Error loading drinks:", error);
    } finally {
      this.isLoading = false;
      loadBtn.disabled = false;
      loadBtn.classList.remove("loading");
      loadBtn.textContent = "Load More Drinks";
    }
  }

  /* Building the card */
  createDrinkCard(drink, isDrinkOfDay = false) {
    const card = document.createElement("div");
    card.className = "drink-card";
    card.dataset.alcoholic = drink.strAlcoholic;

    const badgeClass =
      drink.strAlcoholic === "Alcoholic"
        ? "badge-alcoholic"
        : drink.strAlcoholic === "Non alcoholic"
        ? "badge-non-alcoholic"
        : "badge-optional";

    card.innerHTML = `
          <div class="drink-image">
              <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}" loading="lazy">
              <button class="recipe-btn" title="View Recipe">📋</button>
              
          </div>
          <div class="drink-badge-container ${badgeClass}">
          <span class="drink-badge ${badgeClass}">${drink.strAlcoholic}</span>
          </div>
          <div class="drink-info">
              <h3 class="drink-title">${drink.strDrink}</h3>
              
              <div class="drink-details">
                  <p><strong>Category:</strong> ${drink.strCategory}</p>
                  <p><strong>Glass:</strong> ${drink.strGlass}</p>
              </div>
          </div>
      `;

    // Add recipe button event
    card.querySelector(".recipe-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      this.showRecipe(drink);
    });

    return card;
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

  closeModal() {
    document.getElementById("recipe-overlay").classList.remove("show");
  }

  handleFilter(e) {
    // Update active button
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
}

// Init
new CocktailApp();
