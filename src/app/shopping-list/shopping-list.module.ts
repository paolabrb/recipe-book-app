// modules
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
// components
import { ShoppingEditComponent } from './shopping-edit/shopping-edit.component';
import { ShoppingListComponent } from './shopping-list.component';


@NgModule({
    declarations: [
        ShoppingListComponent,
        ShoppingEditComponent,
    ],
    imports: [
        FormsModule,
        RouterModule
            .forChild(
                [
                    { path: '', 
                    component: ShoppingListComponent 
                    }
                ]
            ),
        SharedModule
    ],
})

export class ShoppingListModule {}