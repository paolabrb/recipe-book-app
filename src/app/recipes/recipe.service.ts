import { Recipe } from './recipe.model';
import { EventEmitter } from '@angular/core';

export class RecipeService {
    recipeSelected = new EventEmitter<Recipe>();
    
    private recipes: Recipe[] = [
        new Recipe('A test recipe', 'test desc', 'https://statics.cucchiaio.it/content/cucchiaio/it/ricette/2019/08/cheesecake-fredda/jcr:content/header-par/image-single.img10.jpg/1565969479875.jpg'),
        new Recipe('A second recipe', 'test desc 2', 'https://statics.cucchiaio.it/content/cucchiaio/it/ricette/2019/08/cheesecake-fredda/jcr:content/header-par/image-single.img10.jpg/1565969479875.jpg')
      ];

    getRecipes() {
        // returns a copy of the original array
        return this.recipes.slice();
    }

}