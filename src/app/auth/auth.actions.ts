import { Action } from "@ngrx/store";

export const SET_AUTHENTICATED = '[Auth] Set Authneticated';
export const SET_UNAUTHENTICATED = '[Auth] Set Unauthneticated';

export class SetAuthneticated implements Action {
  readonly type = SET_AUTHENTICATED;
}

export class SetUnauthneticated implements Action {
  readonly type = SET_UNAUTHENTICATED;
}

export type AuthActions = SetAuthneticated | SetUnauthneticated;
