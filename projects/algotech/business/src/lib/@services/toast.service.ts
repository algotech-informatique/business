import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Animation, createAnimation } from '@ionic/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root'
})
export class ToastService {

    toast: any;

    constructor(
        public toastController: ToastController,
        public translate: TranslateService,
    ) { }

    async presentToast(msg: string, timer: number, color?: string) {
        this.dismiss();
        this.toast = await this.toastController.create({
            message: msg,
            duration: timer,
            color,
        });
        this.toast.present();
    }

    async dismiss() {
        try {
            this.toast.dismiss();
        } catch (e) { }
    }

    async success(msg: string) {
        this._createToast('success', this.translate.instant('TOAST.SUCCESS'), msg, 'bottom');
    }

    async fail(msg: string) {
        this._createToast('danger', this.translate.instant('TOAST.FAIL'), msg, 'bottom');
    }

    async presentToastWithOptions(header: string, msg: string, pos: 'top' | 'bottom' | 'middle') {
        this.dismiss();
        this.toast = await this.toastController.create({
            header: header,
            message: msg,
            position: pos,
            color: 'danger',
            animated: true,
            enterAnimation: this.toastEnter,
            buttons: [
                {
                    icon: 'arrow-back',
                    text: this.translate.instant('TOAST.OPTIONS.BUTTON.PREVIOUS'),
                    handler: () => {
                        console.log('Précédent clicked');
                        window.history.back();
                    }
                }, {
                    text: this.translate.instant('TOAST.OPTIONS.BUTTON.CANCEL'),
                    role: 'cancel',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                }
            ]
        });
        this.toast.present();
    }

    async _createToast(color: string, header: string, msg: string, pos: 'top' | 'bottom' | 'middle') {
        this.dismiss();
        this.toast = await this.toastController.create({
            header: header,
            message: msg,
            position: pos,
            color,
            animated: true,
            duration: 3000
        });
        this.toast.present();
    }

    toastEnter(baseEl: any, position: string): Animation {
        const baseAnimation = createAnimation();

        const wrapperAnimation = createAnimation();

        const hostEl = (baseEl.host || baseEl) as HTMLElement;
        const wrapperEl = baseEl.shadowRoot.querySelector('.toast-wrapper') as HTMLElement;

        wrapperAnimation.addElement(wrapperEl);

        const bottom = `calc(8px + var(--ion-safe-area-bottom, 0px))`;
        const top = `calc(8px + var(--ion-safe-area-top, 0px))`;

        switch (position) {
            case 'top':
                wrapperEl.style.top = top;
                wrapperEl.style.opacity = '1';
                wrapperAnimation.fromTo('transform', `translateY(-${hostEl.clientHeight}px)`, 'translateY(10px)');
                break;
            case 'middle':
                const topPosition = Math.floor(
                    hostEl.clientHeight / 2 - wrapperEl.clientHeight / 2
                );
                wrapperEl.style.top = `${topPosition}px`;
                wrapperAnimation.fromTo('opacity', 0.01, 1);
                break;
            default:
                wrapperEl.style.bottom = bottom;
                wrapperAnimation.fromTo('opacity', 0.01, 1);
                break;
        }
        return createAnimation()
            .addElement(hostEl)
            .easing('cubic-bezier(.36,.66,.04,1)')
            .duration(400)
            .addAnimation([baseAnimation, wrapperAnimation]);
    }

}
