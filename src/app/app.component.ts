// angular
import { Component, OnInit } from '@angular/core';
// ngrx
import { Store } from '@ngrx/store';
// auth
import { AuthService } from './auth/auth.service';
import * as AuthActions from './auth/store/auth.actions';
//
import * as fromApp from './store/app.reducer';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

  constructor(private authService: AuthService,
              private store: Store<fromApp.AppState>) {}
  
  ngOnInit() {
    this.store.dispatch(
      new AuthActions.AutoLogin()
    );
  }
 }
