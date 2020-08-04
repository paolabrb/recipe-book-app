import { Actions, ofType, Effect } from '@ngrx/effects';
import { switchMap, catchError, map, tap } from 'rxjs/operators';
import * as AuthActions from './auth.actions';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { of, throwError, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../user.model';
import { AuthService } from '../auth.service';

export interface AuthResponseData {
    kind: string;
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    registered?: boolean;
}

@Injectable()
export class AuthEffects {

    constructor(
        private actions$: Actions,
        private http: HttpClient,
        private router: Router,
        private authService: AuthService
    ) {}
    

    // LOGIN
    @Effect()
    // property authlogin is observable
    authLogin = this.actions$.pipe(
        // filter for type of action named login start
        ofType(AuthActions.LOGIN_START),
        // return values for login 
        switchMap((authData: AuthActions.LoginStart) => {
            // send a post req of type AuthResponseData to Firebase with data from the action payload
            return this.http.post<AuthResponseData>(
                'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + environment.firebaseApiKey,
                {
                    email: authData.payload.email,
                    password: authData.payload.password,
                    returnSecureToken: true
                }
            ).pipe(
                tap(resData => {
                    this.authService.setLogoutTimer(+resData.expiresIn * 1000)
                }),
                // take the response data and map it
                map(resData => {
                    return handleAuthentication(resData);
                }),
                catchError(errorRes => {
                    return handleError(errorRes);
                }
            ))
        }),

    );

    // AUTOLOGIN
    // autoLogin() parses localStorage for user data and parses it to have an object and build a User with it; then if a token is provided a session w/ new loadedUser is fired, expiration duration is set (time of now - token exp date in milliseconds) and autologout is set

    @Effect()
    autoLogin = this.actions$
    .pipe(
       ofType(AuthActions.AUTOLOGIN),
       map(() => {
        const userData: {
            email: string;
            id: string;
            _token: string;
            _tokenExpirationDate: string;
        } = JSON.parse(localStorage.getItem('userData'));

        if (!userData) {
            return { type: 'Test'};
        }

        const loadedUser = new User(
            userData.email, 
            userData.id, 
            userData._token, 
            new Date(userData._tokenExpirationDate)
            );
        
        if (loadedUser.token) {
            const expDuration = new Date(
            userData._tokenExpirationDate
            ).getTime() - new Date().getTime();

            this.authService.setLogoutTimer(expDuration);

            return new AuthActions.AuthenticateSuccess({
                    email: loadedUser.email,
                    userId: loadedUser.id,
                    token: loadedUser.token,
                    expirationDate: new Date(userData._tokenExpirationDate)
                })

        }
        return { type: 'Test'};
       })
    )

    // SIGNUP

    @Effect()
    authSignup = this.actions$
    .pipe(
        ofType(AuthActions.SIGNUP_START),
        switchMap((signupAction: AuthActions.SignupStart) => {
            return this.http.post<AuthResponseData>(
                'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + environment.firebaseApiKey, 
                {
                    email: signupAction.payload.email,
                    password: signupAction.payload.password,
                    returnSecureToken: true
                }
            ).pipe(
                tap(resData => {
                    this.authService.setLogoutTimer(+resData.expiresIn * 1000)
                }),
                // take the response data and map it
                map(resData => {
                    return handleAuthentication(resData);
                }),
                catchError(errorRes => {
                    return handleError(errorRes);
                }
            ))
        })
    )

    // LOGOUT sets user to null, navigates back to auth route, removes the user data from the local storage and clears the expiration timer

    @Effect({dispatch: false})
    authLogout = this.actions$
    .pipe(
        ofType(AuthActions.LOGOUT),
        tap(() => {
            this.authService.clearLogoutTimer();
            localStorage.removeItem('userData');
            this.router.navigate(['/auth']);
        })
    )


    // REDIRECT - handle redirect to homepage after successful login - it will not yield any dispatchable action

    @Effect({dispatch: false})
    authRedirect = this.actions$
    .pipe(
        ofType(AuthActions.AUTHENTICATE_SUCCESS),
        tap(() => {
            this.router.navigate(['/']);
        })
    )
}

// it sets needed parameters, calculates the expirationDate based on the number, creates a new user and updates the observable, sets autologout and passes the data as a string to localstorage

const handleAuthentication = (responseData) => {
    const expirationDate = new Date(new Date().getTime() + +responseData.expiresIn * 1000);

    const user = new User(
        responseData.email,
        responseData.localId,
        responseData.idToken,
        expirationDate
    );

    localStorage.setItem('userData', JSON.stringify(user));
    // return new login action with data from response
    return new AuthActions.AuthenticateSuccess({
            email: responseData.email,
            userId: responseData.localId,
            token: responseData.idToken,
            expirationDate: expirationDate
        });
};

// handleError sets a default message and checks if the response data contains errors, then checks via switch statement to display custom messages

const handleError = (errorResponse) => {
    let errorMessage = 'An unknown error occurred!';

    if (!errorResponse.error || !errorResponse.error.error) {
        return of(
            new AuthActions.AuthenticateFail(errorMessage)
        )
    }
    switch (errorResponse.error.error.message) {
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
    return of(
        new AuthActions.AuthenticateFail(errorMessage)
    )
};