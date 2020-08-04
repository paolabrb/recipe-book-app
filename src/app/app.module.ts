// modules imports

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

// components

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';

// services

import { RecipeService } from './recipes/recipe.service';
import { AuthInterceptorService } from './auth/auth-interceptor.service';

// reducers 

import * as fromRoot from './store/app.reducer';

// effects

import { AuthEffects } from './auth/store/auth.effects';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    StoreModule.forRoot(fromRoot.appReducer),
    HttpClientModule, 
    SharedModule,
    EffectsModule.forRoot([AuthEffects]) 
  ],
  providers: [
    RecipeService, 
    {provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptorService,
    multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
