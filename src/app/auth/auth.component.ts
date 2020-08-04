
import { Component, ComponentFactoryResolver, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { AuthResponseData } from './auth.service';
import { AlertComponent } from '../shared/alert/alert.component';
import { PlaceholderDirective } from '../shared/placeholder/placeholder.directive';
import { Store } from '@ngrx/store';
import * as fromApp from '../store/app.reducer';
import * as AuthActions from './store/auth.actions';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html'
})
export class AuthComponent implements OnInit, OnDestroy {
    @ViewChild(PlaceholderDirective) alertHost: PlaceholderDirective;

    isLoginMode = true;
    isLoading = false;
    error: string = null;

    private closeSub: Subscription;
    private storeSub: Subscription;

    constructor(

        private componentFactoryResolver: ComponentFactoryResolver,
        private store: Store<fromApp.AppState>) {}
    
    
    ngOnInit() {
        this.storeSub = this.store.select('auth')
        .subscribe(
            authState => {
                this.isLoading = authState.loading;
                this.error = authState.authError;
                if (this.error) {
                    this.showError(this.error);
                }
            }
        )
    }
    onSwitchMode() {
        this.isLoginMode = !this.isLoginMode;
    }

    onSubmit(form: NgForm) {
        if (!form.valid) {
            return;
        }

        const email = form.value.email;
        const password = form.value.password;

        let authObs: Observable<AuthResponseData>;

        this.isLoading = true;

        if (!this.isLoginMode) {
            // authObs = this.authService.signup(email, password);
            this.store.dispatch(
                new AuthActions.SignupStart({
                    email: email,
                    password: password
                })
            )
        } else {
            // authObs = this.authService.login(email, password);
            this.store.dispatch(
                new AuthActions.LoginStart({
                    email: email,
                    password: password
                })
            ) 
        }
        form.reset();
    }

    onHandleError() {
        // this.error = null;
        this.store.dispatch(
            new AuthActions.ClearError()
        );
    }

    ngOnDestroy() {
        if (this.closeSub) {
            this.closeSub.unsubscribe();
        }

        if (this.storeSub) {
            this.storeSub.unsubscribe();
        }
    }

    private showError(message: string) {
        const alertCompFactory = this.componentFactoryResolver
        .resolveComponentFactory(AlertComponent);
        const hostViewContainerRef = this.alertHost.viewContainerRef;

        hostViewContainerRef.clear();

        const componentRef = hostViewContainerRef.createComponent(alertCompFactory);

        componentRef.instance.message = message;
        this.closeSub = componentRef.instance.close.subscribe(() => {
            this.closeSub.unsubscribe();
            hostViewContainerRef.clear();
        });
    }
}