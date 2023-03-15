import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
    selector: '[scrollbar]'
})
export class ScrollbarDirective implements OnInit {

    hostElement: HTMLElement

    constructor(public elementRef: ElementRef) { }

    ngOnInit() {
        this.hostElement = this.elementRef.nativeElement
        if (this.hostElement && this.hostElement.tagName && this.hostElement.tagName == 'ION-CONTENT') {
            let el = document.createElement('style')
            el.innerText = this.getCustomStyle()
            this.hostElement.shadowRoot.appendChild(el)
        }
    }

    getCustomStyle() {
        return `
        @media(pointer: fine) {
            ::-webkit-scrollbar {
                width: var(--SCROLLBAR-SIZE, 10px) !important;
                height: var(--SCROLLBAR-SIZE, 10px) !important;
            }
    
            ::-webkit-scrollbar-track {
                box-shadow: none;
                border-radius: 0px;
                background-color: var(--SCROLLBAR-BG-TRACK, var(--ALGOTECH-BACKGROUND-HOVER));
            }
    
            ::-webkit-scrollbar-thumb {
                box-shadow: none;
                border-radius: calc(var(--SCROLLBAR-SIZE, 10px) / 2);
                border: calc(var(--SCROLLBAR-SIZE, 10px) / 3) solid var(--SCROLLBAR-BG-TRACK, var(--ALGOTECH-BACKGROUND-HOVER));
                background-color: var(--SCROLLBAR-BG, #9e9e9e50);
            }
    
            ::-webkit-scrollbar-thumb:hover {
                box-shadow: none;
                border: calc((var(--SCROLLBAR-SIZE, 10px) / 3) - 1px) solid var(--SCROLLBAR-BG-TRACK, var(--ALGOTECH-BACKGROUND-HOVER)) !important;
                background: var(--SCROLLBAR-COLOR-HOVER, #9e9e9e);
            }

            ::-webkit-scrollbar-corner {
                background: var(--SCROLLBAR-BG-TRACK, var(--ALGOTECH-BACKGROUND-HOVER));
            }
      }`
    }
}