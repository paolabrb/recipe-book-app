import { Recipe } from './recipe.model';
import { EventEmitter } from '@angular/core';
import { Ingredient } from '../shared/ingredient.model';
import { Subject } from 'rxjs';

export class RecipeService {
    recipeSelected = new EventEmitter<Recipe>();
    recipesChanged = new Subject<Recipe[]>();

    private recipes: Recipe[] = [
        new Recipe('Tiramisu', 'Italian traditional tiramisu', 'https://images.lacucinaitaliana.it/gallery/84543/Big/f9f08f5d-9e23-42ce-8340-5d96ee99cf7c.jpg', [
            new Ingredient('Italian Sponge Fingers', 30),
            new Ingredient('Coffee', 1),
            new Ingredient('Mascarpone', 500),
            new Ingredient('Eggs', 3),
            new Ingredient('Sugar', 150),
            new Ingredient('Cocoa', 1)
        ]),
        new Recipe('Cheeseburger', 'American Cheeseburger', 'https://i2.wp.com/www.foodrepublic.com/wp-content/uploads/2012/03/033_FR11785.jpg?fit=1000%2C665&ssl=1', [
            new Ingredient('Buns', 1),
            new Ingredient('Patty', 1),
            new Ingredient('Onions', 1),
            new Ingredient('Pickles', 2),
            new Ingredient('Lettuce', 2),
            new Ingredient('Tomatoes', 1),
            new Ingredient('Cheese', 3)
        ])
      ];

    getRecipes() {
        // returns a copy of the original array
        return this.recipes.slice();
    }

    getRecipe(id: number) {
        return this.recipes[id];
    }

    addRecipe(recipe: Recipe) {
        this.recipes.push(recipe);
        this.recipesChanged.next(this.recipes.slice());
    }

    updateRecipe(index: number, newRecipe: Recipe) {
        this.recipes[index] = newRecipe;
        this.recipesChanged.next(this.recipes.slice());
    }
    
    deleteRecipe(index: number) {
        this.recipes.splice(index, 1);
        this.recipesChanged.next(this.recipes.slice());
    }
}