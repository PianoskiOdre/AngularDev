import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { AlertStockComponent } from './alert-stock/alert-stock.component';
import { NotificationComponent } from './notification/notification.component';
import { AlertComponent } from "./alert/alert.component";
import { DangerIconCompoment } from "./icons/danger-icon.component";
import { InfoIconComponent } from "./icons/info-icon.component";
import { SuccessIconComponent } from "./icons/success-icon.component";
import { WarningIconComponent } from "./icons/warning-icon.component";
import { ModalComponent } from "./modal/modal.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ButtonComponent } from "./button/button.component";
import { InputComponent } from "./input/input.component";
import { CheckboxComponent } from "./checkbox/checkbox.component";
import { SelectComponent } from "./select/select.component";
import { CardComponent } from "./card/card.component";
import { PaginationComponent } from "./pagination/pagination.component";
import { CardsComponent } from "./cards/cards.component";
import { TooltipComponent } from "./tooltip/tooltip.component";
import { SearchComponent } from "./search/search.component";

@NgModule({
  declarations: [
    ButtonComponent,
    AlertStockComponent,
    NotificationComponent,
    AlertComponent,
    ModalComponent,
    InputComponent,
    CheckboxComponent,
    SelectComponent,
    CardComponent,
    CardsComponent,
    PaginationComponent,
    TooltipComponent,
    SearchComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DangerIconCompoment,
    InfoIconComponent,
    SuccessIconComponent,
    WarningIconComponent
  ],
  exports: [
    ButtonComponent,
    AlertStockComponent,
    NotificationComponent,
    AlertComponent,
    ModalComponent,
    InputComponent,
    CheckboxComponent,
    SelectComponent,
    CardComponent,
    CardsComponent,
    PaginationComponent,
    TooltipComponent,
    SearchComponent,
    ReactiveFormsModule
  ]
})
export class MagnumDesignSystemModule {}