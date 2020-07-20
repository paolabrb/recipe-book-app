import { Component, OnInit } from '@angular/core';
import { Recipe } from '../recipe.model';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css']
})
export class RecipeListComponent implements OnInit {
  recipes: Recipe[] = [
    new Recipe('A test recipe', 'test desc', 'https://statics.cucchiaio.it/content/cucchiaio/it/ricette/2019/08/cheesecake-fredda/jcr:content/header-par/image-single.img10.jpg/1565969479875.jpg'),
    new Recipe('A second recipe', 'test desc 2', 'https://statics.cucchiaio.it/content/cucchiaio/it/ricette/2019/08/cheesecake-fredda/jcr:content/header-par/image-single.img10.jpg/1565969479875.jpg')
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
