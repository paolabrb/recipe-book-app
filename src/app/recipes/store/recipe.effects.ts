import { Actions, Effect, ofType } from '@ngrx/effects';
import { switchMap, map } from 'rxjs/operators';
import * as RecipesActions from './recipe.actions';
import { HttpClient } from '@angular/common/http';
import { Recipe } from '../recipe.model';
import { Injectable } from '@angular/core';


@Injectable()
export class RecipeEffects {

    @Effect()
    fetchRecipes = this.actions$
    .pipe(
        ofType(RecipesActions.FETCH_RECIPES),
        switchMap(() => {
            return this.http
            .get<Recipe[]>(
                'https://recipe-book-angular-ecf7b.firebaseio.com/recipes.json')
        }),
        map(recipes => {
            return recipes.map(recipe => {
                return {
                    ...recipe,
                    ingredients: recipe.ingredients ? recipe.ingredients : []
                };
            });
        }),
        map(recipes => {
            return new RecipesActions.SetRecipes(recipes);
        })
    )

    constructor(
        private actions$: Actions,
        private http: HttpClient
    ) {}
}