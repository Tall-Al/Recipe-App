const mealsEl = document.getElementById('meals');
const favoriteContainer = document.getElementById("fav-meals");
const mealInfoEl = document.getElementById("meal-info-popup");
const mealPopUpData = document.getElementById('meal-popup');
const mealDataCloseBtn = document.getElementById('close-x')

const searchBar = document.getElementById("search-bar");
const searchButton = document.getElementById('searchButton');



getRandomMeal();
fetchFavoriteMeals();

async function getRandomMeal() {
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
    const respData = await resp.json();
    const randomMeal = respData.meals[0];
    

    addMeal(randomMeal, true);

}


async function getMealId(id){
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/lookup.php?i=" +id);

    const respData = await resp.json();
    const meal = respData.meals[0];


    console.log(meal)

    return meal;

    
}

async function getMealsBySearch(term){
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' +term);

    const respData = await resp.json();
    const meals = respData.meals;

    return meals;
}

 function addMeal(mealData, random = false){
     const meal = document.createElement('div');
     meal.classList.add('meal');

     meal.innerHTML = `

        <div class="meal-header">
            ${random ? `<span class="random">Recipe of Random</span>`
            : " "}
            <img src="${mealData.strMealThumb}" 
            alt="${mealData.strMeal}">
        </div>
        <div class="meal-text">
            <h4>${mealData.strMeal}</h4>
            <button class="heartButton">
            <i class="fas fa-heart"></i>
            </button>
        </div> `;
     
    const btn = meal.querySelector(".meal-text .heartButton");
  
    btn.addEventListener('click',() => {
        if (btn.classList.contains('active')) {
            removeMealsToList(mealData.idMeal)
            btn.classList.remove('active');
        } else {
            addMealsToList(mealData.idMeal)
            btn.classList.add('active');
        }
        fetchFavoriteMeals();
       // Get this to show
     });

     meal.addEventListener("click", () => {
         mealInfoBox(mealData);
     });

    mealsEl.appendChild(meal);
};

function addMealsToList(mealId) {
    const mealIds = getMealsFromList();

    localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId])); // <-- Is supposed to be ",mealId]"...
}

function removeMealsToList(mealId) {
    const mealIds = getMealsFromList();

    localStorage.setItem("mealIds", JSON.stringify(mealIds.filter((id) => id !== mealId))// <-- Is supposed to be ",mealId]"...
    );
}

function getMealsFromList() {
     const mealIds = JSON.parse(localStorage.getItem("mealIds"));

     return mealIds === null ? [] : mealIds;
};

async function fetchFavoriteMeals() {
    // clean the container
    favoriteContainer.innerHTML = "";

    const mealIds = getMealsFromList();

    for (let i = 0; i < mealIds.length; i++) {
        const mealId = mealIds[i];

        meal = await getMealId(mealId);

        addMealFavorite(meal);
    }
}

function addMealFavorite(mealData) {
    const favMeal = document.createElement("li")

    favMeal.innerHTML = `
        <img
            src="${mealData.strMealThumb}"
            alt="${mealData.strMeal}"
        /><span>${mealData.strMeal}</span>
        <button class="clear"><i class="far fa-window-close"></i></button>
        `;

        const button = favMeal.querySelector(".clear")

        button.addEventListener("click", () => {
            removeMealsToList(mealData.idMeal);

            fetchFavoriteMeals();
        });

        favMeal.addEventListener("click", () => {
            mealInfoBox(mealData);
        });

    favoriteContainer.appendChild(favMeal);
};

function mealInfoBox(mealData) {

     mealInfoEl.innerHTML="";


     const mealEl = document.createElement("div");

     const ingredients = [];



     for (let i = 1; i <= 20; i++) {
         if (mealData["strIngredient" + i]) {
             ingredients.push(`
                 ${mealData["strIngredient" + i]} - ${
                     mealData ["strMeasure" + i]
                    } `
             );
         } else {
             break;
         }
     }

     mealEl.innerHTML = `
       <h1>${mealData.strMeal}</h1>
       <img
         src="${mealData.strMealThumb}"
         alt="${mealData.strMeal}"
        />
       <p>
       ${mealData.strInstructions}
        </p>
       <h3>Ingredients:</h3>
       <ul>
       ${ingredients
           .map(
               (ing) => `
       <li>${ing}</li>
       `
           )
           .join("")}
        </ul>
     `;

     mealInfoEl.appendChild(mealEl);

     mealPopUpData.classList.remove("hidden");
};

searchButton.addEventListener("click", async () => {
    // clean container
    mealsEl.innerHTML = "";

    const search = searchBar.value;
    const meals = await getMealsBySearch(search);

    if (meals) {
        meals.forEach((meal) => {
            addMeal(meal);
        });
    }
});


mealDataCloseBtn.addEventListener("click", () => {
    mealPopUpData.classList.add("hidden");
});
