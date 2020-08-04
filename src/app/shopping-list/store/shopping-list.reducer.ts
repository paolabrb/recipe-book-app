// ALL the code in reducer is syncronous

import { Ingredient } from '../../shared/ingredient.model';
import * as ShoppingListActions from './shopping-list.actions';

// define interfaces for state and AppState to reference in other components
export interface State {
    ingredients: Ingredient[],
    editedIngredient: Ingredient,
    editedIngredientIndex: number
}

export interface AppState {
    shoppingList: State;
}

// set initial state with ingredients array (could be empty), editedIngredient as null and its index -1 (0 would be valid)

const initialState: State = {
    ingredients: [
        new Ingredient('Apples', 5),
        new Ingredient('Tomatoes', 10)
    ],
    editedIngredient: null,
    editedIngredientIndex: -1
};

// action is of type declared in actions file

export function shoppingListReducer(
    state: State = initialState, 
    action: ShoppingListActions.ShoppingListActions) {

    switch(action.type) {
      case ShoppingListActions.ADD_INGREDIENT:
          return {
              ...state,
              ingredients: [
                  ...state.ingredients,
                  action.payload
              ]
            };
      case ShoppingListActions.ADD_INGREDIENTS:
            return {
                ...state,
                ingredients: [
                    ...state.ingredients,
                    ...action.payload
                ]
            };
      case ShoppingListActions.UPDATE_INGREDIENT:
          // save selected ingredient to a variable 
          const ingredient = state.ingredients[state.editedIngredientIndex];

          // define updatedIng by spreading the old one and then the updated one
          const updatedIngredient = {
              ...ingredient,
              // so you can keep f.e. IDs of the old one 
              ...action.payload
          }

          const updatedIngredients = [...state.ingredients];
          updatedIngredients[state.editedIngredientIndex] = updatedIngredient;
          return {
            ...state,
            ingredients: updatedIngredients,
            editedIngredientIndex: -1,
            editedIngredient: null
          };
      case ShoppingListActions.DELETE_INGREDIENT:
        
        return {
            ...state,
            ingredients: state.ingredients.filter((ig, i) => {
                return i != state.editedIngredientIndex;
            }),
            editedIngredientIndex: -1,
            editedIngredient: null
        };
      case ShoppingListActions.START_EDIT:
          return {
              ...state,
              editedIngredientIndex: action.payload,
              editedIngredient: { ...state.ingredients[action.payload] }
          };
      case ShoppingListActions.STOP_EDIT:
          return {
              ...state,
              editedIngredient: null,
              editedIngredientIndex: -1
          };
      default: 
        return state;
    }
}