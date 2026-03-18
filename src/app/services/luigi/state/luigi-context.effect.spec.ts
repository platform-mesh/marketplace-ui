import { initAction } from './init.action';
import { luigiContextUpdate } from './luigi-context-update.action';
import { LuigiContextEffect } from './luigi-context.effect';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DxpContext } from '@dxp/ngx-core/common';
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi';
import {
  IContextMessage,
  ILuigiContextTypes,
} from '@luigi-project/client-support-angular';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { MockProvider } from 'ng-mocks';
import { Observable, Subject, of } from 'rxjs';

describe('LuigiContextEffect', () => {
  let actions$: Observable<Action>;
  let effect: LuigiContextEffect;
  let luigiContextSubject: Subject<IContextMessage>;

  beforeEach(() => {
    actions$ = new Observable<Action>();

    luigiContextSubject = new Subject();

    TestBed.configureTestingModule({
      providers: [
        provideMockActions(() => actions$),
        MockProvider(DxpLuigiContextService, {
          contextObservable: jest.fn().mockReturnValue(luigiContextSubject),
        }),
      ],
    });

    effect = TestBed.inject(LuigiContextEffect);
  });

  describe('init', () => {
    it('should set the context on init', fakeAsync(() => {
      actions$ = of(initAction());

      let emittedAction: Action | undefined;
      effect.registerForLuigiContextChanges$.subscribe((action) => {
        emittedAction = action;
      });
      tick();

      const contextPayload = createContext('token');
      luigiContextSubject.next({
        context: contextPayload,
        contextType: ILuigiContextTypes.INIT,
      });

      expect(emittedAction).toEqual(
        luigiContextUpdate({ luigiContext: contextPayload }),
      );
    }));

    it('should filter context that have no token', fakeAsync(() => {
      actions$ = of(initAction());

      let emittedAction: Action | undefined;
      effect.registerForLuigiContextChanges$.subscribe((action) => {
        emittedAction = action;
      });
      tick();

      const contextPayload = createContext('token');
      const contextPayload2 = createContext('');
      luigiContextSubject.next({
        context: contextPayload,
        contextType: ILuigiContextTypes.INIT,
      });
      luigiContextSubject.next({
        context: contextPayload2,
        contextType: ILuigiContextTypes.UPDATE,
      });

      expect(emittedAction).toEqual(
        luigiContextUpdate({ luigiContext: contextPayload }),
      );
    }));

    it('should observe the luigi context', fakeAsync(() => {
      actions$ = of(initAction());

      let emittedAction: Action | undefined;
      effect.registerForLuigiContextChanges$.subscribe((action) => {
        emittedAction = action;
      });
      tick();

      const contextPayload = createContext('token');
      const contextPayload2 = createContext('token2');
      luigiContextSubject.next({
        context: contextPayload,
        contextType: ILuigiContextTypes.INIT,
      });
      luigiContextSubject.next({
        context: contextPayload2,
        contextType: ILuigiContextTypes.UPDATE,
      });

      expect(emittedAction).toEqual(
        luigiContextUpdate({ luigiContext: contextPayload2 }),
      );
    }));

    function createContext(token: string): DxpContext {
      return {
        token,
        tenantid: 'tenantId',
        userid: 'userId',
        frameContext: {},
      } as DxpContext;
    }
  });
});
