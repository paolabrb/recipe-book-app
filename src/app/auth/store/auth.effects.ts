import { Actions, ofType, Effect } from '@ngrx/effects';
import { switchMap, catchError, map, tap } from 'rxjs/operators';
import * as AuthActions from './auth.actions';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { of, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

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
        private router: Router
    ) {}
    

    // first effect authLogin
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

    // second effect to handle redirect to homepage after successful login - it will not yield any dispatchable action

    @Effect({dispatch: false})
    authRedirect = this.actions$
    .pipe(
        ofType(AuthActions.AUTHENTICATE_SUCCESS, AuthActions.LOGOUT),
        tap(() => {
            this.router.navigate(['/']);
        })
    )

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
}

const handleAuthentication = (responseData) => {
    const expirationDate = new Date(new Date().getTime() + +responseData.expiresIn * 1000);
    // return new login action with data from response
    return new AuthActions.AuthenticateSuccess({
            email: responseData.email,
            userId: responseData.localId,
            token: responseData.idToken,
            expirationDate: expirationDate
        });
};

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