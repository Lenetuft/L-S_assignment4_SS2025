/*
Mapping from MealDB Categories to TheCocktailDB drink ingredient
You can customize or expand this object to suit your needs.
*/
const mealCategoryToCocktailIngredient = {
  Beef: "whiskey",
  Chicken: "gin",
  Dessert: "amaretto",
  Lamb: "vodka",
  Miscellaneous: "vodka",
  Pasta: "tequila",
  Pork: "tequila",
  Seafood: "rum",
  Side: "brandy",
  Starter: "rum",
  Vegetarian: "gin",
  Breakfast: "vodka",
  Goat: "whiskey",
  Vegan: "rum",
  // Add more if needed; otherwise default to something like 'cola'
};

/*
    2) Main Initialization Function
       Called on page load to start all the requests:
       - Fetch random meal
       - Display meal
       - Map meal category to spirit
       - Fetch matching (or random) cocktail
       - Display cocktail
*/
function init() {
  fetchRandomMeal()
    .then((meal) => {
      displayMealData(meal);
      const spirit = mapMealCategoryToDrinkIngredient(meal.strCategory);
      return fetchCocktailByDrinkIngredient(spirit);
    })
    .then((cocktail) => {
      displayCocktailData(cocktail);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

/*
 Fetch a Random Meal from TheMealDB
 Returns a Promise that resolves with the meal object
 */
function fetchRandomMeal() {
  return fetch('https://www.themealdb.com/api/json/v1/1/random.php')
  .then(response => response.json())
  .then(data => {
    console.log(data); //Sjå innhaldet i meals-api
    return data.meals[0];
  })
  .catch (error => {
    console.error('Feilmelding:', error) //Usikker på om me skal ha med feilmeldingar.
  })

}

/*
Display Meal Data in the DOM
Receives a meal object with fields like:
  strMeal, strMealThumb, strCategory, strInstructions,
  strIngredientX, strMeasureX, etc.
*/


// MÅ FJERNE ELEMENTER SOM ER KNYTTET TIL INGREDIENSER SOM LENE PRØVDE I EGEN FUNKSJON I EGEN FIL. 
// PROBLEM MED getIngredientsList. 
function displayMealData(meal) {
  const mealContainer = document.getElementById('meal-container');
  mealContainer.innerHTML =`
      <h2>${meal.strMeal}</h2>
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
      <p><strong>Category:</strong> ${meal.strCategory}</p>
      <h3>Ingredients:</h3>
      <ul>
        ${getIngredientsList(meal).map(ingredient => `<li>${ingredient}</li>`).join('')}
      </ul>
      <h3>Instructions:</h3>
      <p>${meal.strInstructions}</p>
    `;
  }
  function getIngredientsList(meal) {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient) {
        ingredients.push(`${ingredient} - ${measure}`);
      }
    }
    return ingredients;
  }
/*
Convert MealDB Category to a TheCocktailDB Spirit
Looks up category in our map, or defaults to 'cola'
*/
function mapMealCategoryToDrinkIngredient(category) {
  if (!category) return "cola";
  return mealCategoryToCocktailIngredient[category] || "cola";
}

/*
Fetch a Cocktail Using a Spirit from TheCocktailDB
Returns Promise that resolves to cocktail object
We call https://www.thecocktaildb.com/api/json/v1/1/search.php?s=DRINK_INGREDIENT to get a list of cocktails
Don't forget encodeURIComponent()
If no cocktails found, fetch random
*/
function fetchCocktailByDrinkIngredient(drinkIngredient) {
    return fetch (`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(drinkIngredient)}`)
      .then(response=>response.json())
      .then(data=>{
        if (data.drinks && data.drinks.length > 0) {
          const randomCocktail = data.drinks[Math.floor(Math.random()* data.drinks.length)];
          return randomCocktail;
        } else {
          return fetchRandomCocktail();
        }
      })
      .catch(error => console.error("Error fetching cocktail:", error));
}

/*
Fetch a Random Cocktail (backup in case nothing is found by the search)
Returns a Promise that resolves to cocktail object
*/
function fetchRandomCocktail() {
    return fetch('https://www.thecocktaildb.com/api/json/v1/1/random.php') //Skifta api-adresse
      .then(response=>response.json())
      .then(data=>data.drinks[0])
      .catch(error=>console.error("Error fetching cocktail:", error));
}

/*
Display Cocktail Data in the DOM
*/

//Manglar category og instructions: 
function displayCocktailData(cocktail) {
    const cocktailContainer = document.getElementById("cocktail-container");
    if(!cocktail) {
      cocktailContainer.innerHTML = "No cocktail found";
      return;
    }

    const {strDrink, strDrinkThumb} = cocktail;
    const Ingredients=[];
    for (let i = 1; i <= 15; i++) {
      if(cocktail[`strIngredient${i}`]) {
        Ingredients.push(`${cocktail[`strIngredient${i}`]}- ${cocktail[`strMeasure${i}`] || ""}`);
      }
    }
    cocktailContainer.innerHTML = `
    <h2>${strDrink}</h2>
    <img src="${strDrinkThumb}" alt="${strDrink}">
    <p><strong>Category:</strong> ${cocktail.strCategory}</p> 
    <h3>Ingredients:</h3>
    <ul>${Ingredients.map(ing => `<li>${ing}</li>`).join('')}</ul>
    <h3>Instructions:</h3>
    <p>${cocktail.strInstructions}</p>
  `;
}

/*
Call init() when the page loads
*/
//TRUR IKKJE ME TRENG DETTE: 

// function init() {
//   fetchRandomMeal()
//       .then(meal => {
//           displayMealData(meal);
//           const mealCategory = meal.strCategory; 
//           const drinkIngredient = mapMealCategoryToDrinkIngredient(mealCategory);
//           return fetchCocktailByDrinkIngredient(drinkIngredient);
//       })
//       .then(displayCocktailData)
// }

window.onload = init;
