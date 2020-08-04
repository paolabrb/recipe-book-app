import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { throwError, BehaviorSubject } from 'rxjs';
import { User } from './user.model';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Store } from '@ngrx/store';
import * as fromApp from '../store/app.reducer';
import * as AuthActions from './store/auth.actions';

// interface to show TS how the response data is structured (taken from Firebase, depends on API)
export interface AuthResponseData {
    kind: string;
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    registered?: boolean;
}

@Injectable({ providedIn: 'root' })

export class AuthService {
    // user as BehaviorSubject can be started as null and subscribed to to update with new data (localstorage Data to have an autologin)
    // user = new BehaviorSubject<User>(null);

    //token expiration timer set to a property - it gets set with the autologout and cleared on logout to not fire autologout
    private tokenExpTimer: any;

    constructor(
        private http: HttpClient,
        private router: Router,
        private store: Store<fromApp.AppState>
    ) {}


    // autoLogin() parses localStorage for user data and parses it to have an object and build a User with it; then if a token is provided a session w/ new loadedUser is fired, expiration duration is set (time of now - token exp date in milliseconds) and autologout is set

    autoLogin() {
        const userData: {
            email: string;
            id: string;
            _token: string;
            _tokenExpirationDate: string;
        } = JSON.parse(localStorage.getItem('userData'));

        if (!userData) {
            return;
        }

        const loadedUser = new User(
            userData.email, 
            userData.id, 
            userData._token, 
            new Date(userData._tokenExpirationDate)
            );
        
        if (loadedUser.token) {
            this.store.dispatch(
                new AuthActions.AuthenticateSuccess({
                    email: loadedUser.email,
                    userId: loadedUser.id,
                    token: loadedUser.token,
                    expirationDate: new Date(userData._tokenExpirationDate)
                })
            );
            const expDuration = new Date(
                userData._tokenExpirationDate
            ).getTime() - new Date().getTime();
            this.autoLogout(expDuration);
        }
    }

    // logout sets user to null, navigates back to auth route, removes the user data from the local storage and clears the expiration timer
    logout() {
    //    this.user.next(null); 
       this.store.dispatch(
           new AuthActions.Logout()
       )
       localStorage.removeItem('userData');
       if (this.tokenExpTimer) {
           clearTimeout(this.tokenExpTimer);
       }
    }

    // autologout takes the expiration duration milliseconds and sets the property tokenExpTimer to a timeout that fires logout()

    autoLogout(expirationDuration: number) {
        this.tokenExpTimer = setTimeout(() => {
            this.logout();
        }, expirationDuration)
    }

    // PRIVATE METHODS

    // it sets needed parameters, calculates the expirationDate based on the number, creates a new user and updates the observable, sets autologout and passes the data as a string to localstorage

    private handleAuthentication(
        email: string, 
        userId: string, 
        token: string,          
        expiresIn: number
    ) {
        const expirationDate = new Date(new Date().getTime() + +expiresIn * 1000);

        // this.user.next(user);
        const user = new User(email, userId, token, expirationDate);

        this.store.dispatch(
            new AuthActions.AuthenticateSuccess({
                email: email,
                userId: userId,
                token: token,
                expirationDate: expirationDate
            })
        )
        this.autoLogout(expiresIn * 1000);

        localStorage.setItem('userData', JSON.stringify(user));
    }

    // handleError sets a default message and checks if the response data contains errors, then checks via switch statement to display custom messages

    private handleError(errorRes: HttpErrorResponse) {
        let errorMessage = 'An unknown error occurred!';

        if (!errorRes.error || !errorRes.error.error) {
            return throwError(errorMessage);
        }
        switch (errorRes.error.error.message) {
            case 'EMAIL_EXISTS':
                errorMessage = 'This email is already taken';
                break;
            case 'EMAIL_NOT_FOUND':
                errorMessage = 'This email does not exist.';
                break;
            case 'INVALID_PASSWORD':
                errorMessage = 'Invalid password!';
                break;
        }
        return throwError(errorMessage);
    }
}