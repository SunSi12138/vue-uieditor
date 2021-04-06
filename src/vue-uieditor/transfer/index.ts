import _ from 'lodash';
import { UERender } from '../base/ue-render';
import { BaseTransfer } from "./base-transfer";
import { VueTransfer } from './vue-transfer';

UERender.AddGlobalTransfer(BaseTransfer, VueTransfer);
