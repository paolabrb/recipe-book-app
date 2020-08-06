import { Component, OnInit, OnDestroy } from '@angular/core'; 
import { DataStorageService } from '../shared/data-storage.service';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromApp from '../store/app.reducer';
import { map } from 'rxjs/operators';
import * as AuthActions from '../auth/store/auth.actions';
import * as RecipesActions from '../recipes/store/recipe.actions';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html'
})

export class HeaderComponent implements OnInit, OnDestroy{
    collapsed = true;
    isLoggedIn = false;
    private userSub: Subscription;

    constructor(
        private dataStorageService: DataStorageService, 
        private authService: AuthService,
        private store: Store<fromApp.AppState>) {}

    ngOnInit() {
        this.userSub = this.store.select('auth')
        .pipe(
            map(authState => {
                return authState.user;
            })
        )
        .subscribe(user => {
            this.isLoggedIn = !!user;
        });
    }

    ngOnDestroy() {
        this.userSub.unsubscribe();
    }

    onSaveData() {
        this.dataStorageService.storeRecipes();
    }

    onFetchData() {
        this.store.dispatch(new RecipesActions.FetchRecipes());
    }

    onLogout() {
        this.store.dispatch(
            new AuthActions.Logout()
        );
    }
}