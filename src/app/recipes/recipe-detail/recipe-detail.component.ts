// angular
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
// rxjs
import { map } from 'rxjs/operators';
// ngrx
import { Store } from '@ngrx/store';
// models 
import { Recipe } from '../recipe.model';
import { Ingredient } from 'src/app/shared/ingredient.model';
// actions
import * as ShoppingListActions from '../../shopping-list/store/shopping-list.actions';
import * as RecipesActions from '../store/recipe.actions';
//
import * as fromApp from '../../store/app.reducer';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css']
})
export class RecipeDetailComponent implements OnInit {
  recipe: Recipe;
  id: number;
  
  constructor(private store: Store<fromApp.AppState>,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit() {
   this.route.params
   .subscribe(
      (params: Params) => {
        this.id = +params['id'];
        this.store.select('recipes')
        .pipe(
          map(recipesState => {
            return recipesState.recipes.find((recipe, index) => {
              return index === this.id;
            })
          })
        )
        .subscribe(recipe => {
          this.recipe = recipe;
        })
      }
    );
  }

  addIngredientsToList(ingredients: Ingredient[]) {
    this.store.dispatch(new ShoppingListActions.AddIngredients(ingredients))
  }

  onEditRecipe() {
    this.router.navigate(['edit'], {relativeTo: this.route});
  }

  onDeleteRecipe() {
    this.store.dispatch(
      new RecipesActions.DeleteRecipe(this.id)
    );
    this.router.navigate(['/recipes']);
  }
}
