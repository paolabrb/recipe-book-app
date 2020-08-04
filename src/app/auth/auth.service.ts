import { Injectable } from '@angular/core';
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
    //token expiration timer set to a property - it gets set with the autologout and cleared on logout to not fire autologout
    private tokenExpTimer: any;

    constructor(
        private store: Store<fromApp.AppState>
    ) {}


    // autologout takes the expiration duration milliseconds and sets the property tokenExpTimer to a timeout that fires logout()

    setLogoutTimer(expirationDuration: number) {
        this.tokenExpTimer = setTimeout(() => {
            this.store.dispatch(
                new AuthActions.Logout()
            );
        }, expirationDuration)
    }

    clearLogoutTimer() {
        if (this.tokenExpTimer) {
            clearTimeout(this.tokenExpTimer);
            this.tokenExpTimer = null;
        }
    }
}