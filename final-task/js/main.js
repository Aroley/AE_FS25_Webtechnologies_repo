class CocktailApp {
  constructor() {
    this.allDrinks = [];
    this.seenDrinkIds = new Set();
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
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleFilter(e));
    });

    document.getElementById("load-more-btn").addEventListener("click", () => {
      this.loadRandomDrinks(6);
    });

    document.getElementById("close-modal").addEventListener("click", () => {
      this.closeModal();
    });

    document.getElementById("recipe-overlay").addEventListener("click", (e) => {
      if (e.target.id === "recipe-overlay") {
        this.closeModal();
      }
    });

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

        // Shuffle
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
        <img src="${drink.strDrinkThumb}" alt="${
      drink.strDrink
    }" loading="lazy">
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
          ${
            drink.strTags
              ? `<p><strong>Tags:</strong> ${drink.strTags}</p>`
              : ""
          }
        </div>
      </div>
    `;

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

new CocktailApp();
