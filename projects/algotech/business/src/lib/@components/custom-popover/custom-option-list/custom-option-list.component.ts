import { Component, Input, Output, EventEmitter, OnInit, ViewEncapsulation } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { ListDto } from '@algotech/core';

@Component({
  selector: 'at-custom-option-list',
  templateUrl: './custom-option-list.component.html',
  styleUrls: ['./custom-option-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CustomOptionListComponent implements OnInit {


  listElements: ListDto[];

  _onAdEmiter: EventEmitter<any>;

  @Input()
  maxHeight = 300;

  // @Output() optionEvent = new EventEmitter();
  constructor( navParam: NavParams) {
    this._onAdEmiter = navParam.data.optionEmitter;
    this.listElements = navParam.data.listOption;
  }

  ngOnInit() {
  }

  sendInfo(typeMessage) {
    this._onAdEmiter.emit(typeMessage);
  }


}
