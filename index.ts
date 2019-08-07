import { Observable, Subject, ReplaySubject, of } from 'rxjs';
import { pluck, share, shareReplay, tap, catchError, takeUntil } from 'rxjs/operators';

const term$ = new Subject<boolean>();
// simulate url change with subject
const routeEnd = new Subject<{ data: any, url: string }>();
// grab url and share with subscribers
const lastUrl = routeEnd.pipe(
  tap(d => console.log('executed', d)),
  tap(d => { if (d.data === 0) { throw 'omg!' } }),
  pluck('url'),
  catchError((e) => { console.warn(e); return of('oops'); }),
  // defaults to last 1 value -- no it doesn't...
  shareReplay(1),
  takeUntil(term$)
);
// requires initial subscription
const initialSubscriber = lastUrl.subscribe(d => console.log('init:', d))
// simulate route change
// logged: 'executed', 'my-path'
routeEnd.next({ data: {}, url: 'my-path' });
// logged: 'my-path'
const lateSubscriber = lastUrl.subscribe(d => console.log('late:', d));
console.log(initialSubscriber.closed, lateSubscriber.closed);

routeEnd.next({ data: 1, url: 'his-path' });

const lateSubscriber2 = lastUrl.subscribe(d => console.log('dead:', d));

term$.next(true);


routeEnd.next({ data: 2, url: 'the-path' });

const lateSubscriber3 = lastUrl.subscribe(d => console.log('doornail:', d));

console.log(initialSubscriber.closed, lateSubscriber.closed, lateSubscriber2.closed, lateSubscriber3.closed);

term$.next(true);


console.log(initialSubscriber.closed, lateSubscriber.closed, lateSubscriber2.closed, lateSubscriber3.closed);
