console.log("...fetching cocktails 🍸");

// DOM elements
const specialSection = document.querySelector("#special .dotd-card");
const menuSection = document.querySelector(".drink-menu");

// === Helper to create drink card ===
function createDrinkCard(drink) {
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.alcoholic = drink.strAlcoholic; // <-- For filter logic

  const title = document.createElement("h2");
  title.textContent = drink.strDrink;

  const imgWrapper = document.createElement("div");
  imgWrapper.className = "main-image";
  const img = document.createElement("img");
  img.src = drink.strDrinkThumb;
  img.alt = drink.strDrink;
  imgWrapper.appendChild(img);

  const desc = document.createElement("div");
  desc.className = "description";
  desc.innerHTML = `
    <p><strong>Category:</strong> ${drink.strCategory}</p>
    <p><strong>Glass:</strong> ${drink.strGlass}</p>
  `;

  // Alcohol badge
  const badge = document.createElement("span");
  badge.className =
    "badge " +
    (drink.strAlcoholic.includes("Non") ? "non-alcoholic" : "alcoholic");
  badge.textContent = `${drink.strAlcoholic}`;

  desc.prepend(badge);

  // Full recipe box
  const recipe = document.createElement("div");
  recipe.className = "full-recipe";
  let ingredients = "";
  for (let i = 1; i <= 15; i++) {
    const ing = drink[`strIngredient${i}`];
    const measure = drink[`strMeasure${i}`];
    if (ing) ingredients += `<li>${measure || ""} ${ing}</li>`;
  }

  recipe.innerHTML = `
    <h4>Ingredients</h4>
    <ul>${ingredients}</ul>
    <h4>Instructions</h4>
    <p>${drink.strInstructions}</p>
  `;

  card.appendChild(title);
  card.appendChild(imgWrapper);
  card.appendChild(desc);
  card.appendChild(recipe);

  return card;
}

// Drink of the Day
fetch("https://www.thecocktaildb.com/api/json/v1/1/random.php")
  .then((res) => res.json())
  .then((data) => {
    const drink = data.drinks[0];
    const heroCard = createDrinkCard(drink);
    specialSection.appendChild(heroCard);
  })
  .catch((err) => console.error("Error fetching hero drink:", err));

// 12 drinks for the menu
async function fetchMultipleDrinks(count = 12) {
  const promises = Array.from({ length: count }, () =>
    fetch("https://www.thecocktaildb.com/api/json/v1/1/random.php").then(
      (res) => res.json()
    )
  );

  try {
    const results = await Promise.all(promises);
    results.forEach((result) => {
      const drink = result.drinks[0];
      const card = createDrinkCard(drink);
      menuSection.appendChild(card);
    });
  } catch (error) {
    console.error("Error fetching multiple drinks:", error);
  }
}

fetchMultipleDrinks();

// Filter
const filterSelect = document.getElementById("type-filter");

filterSelect.addEventListener("change", () => {
  const value = filterSelect.value;

  document.querySelectorAll(".drink-menu .card").forEach((card) => {
    const text = card.querySelector(".description").textContent;
    const isMatch = value === "all" || text.includes(value.replace("_", " "));
    card.style.display = isMatch ? "block" : "none";
  });
});

// State manipulation
const filterButtons = document.querySelectorAll(".filter-btn");

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    // Remove active class from all, then add to clicked one
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const selected = btn.dataset.type;

    document.querySelectorAll(".drink-menu .card").forEach((card) => {
      const type = card.dataset.alcoholic;
      const match = selected === "all" || type === selected;
      card.style.display = match ? "block" : "none";
    });
  });
});
