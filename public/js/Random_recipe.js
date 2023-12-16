async function getRandomRecipe() {
    try {
      const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
      const randomRecipe = await response.json();
  
      const recipeList = document.getElementById('recipeList');
      recipeList.innerHTML = '';
  
      randomRecipe.meals.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.innerHTML = `
        <div class='recipe-cards'>
    
    <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
    <div class='recipe-info'>
    <h2>${recipe.strMeal}</h2>
    <h3>Ingredients:</h3>
    <ul>
      ${getIngredientsList(recipe)}
    </ul>
    <h2>Instructions</h2>
    <p>${recipe.strInstructions}</p>
    </div>
    </div>
        `;
        recipeList.appendChild(recipeCard);
      });
    } catch (error) {
      console.error('Error fetching random recipe:', error.message);
    }
  }