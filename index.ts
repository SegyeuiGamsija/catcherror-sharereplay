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
  // defaults to last 1 value -- no it doesn't...
  shareReplay(1),
  takeUntil(term$),
  catchError((e) => { console.warn(e); return of('oops'); }),
);
// requires initial subscription
//const initialSubscriber = lastUrl.subscribe(d => console.log('init:', d));
// simulate route change
// logged: 'executed', 'my-path'
console.log('new data:  my-path');
routeEnd.next({ data: {}, url: 'my-path' });
// logged: 'my-path'
console.log('subscribing #0/init');
const initialSubscriber = lastUrl.subscribe(d => console.log('init:', d));
console.log('subscribing #1/late');
const lateSubscriber = lastUrl.subscribe(d => console.log('late:', d));
console.log(initialSubscriber.closed, lateSubscriber.closed);

console.log('new data:  his-path');
routeEnd.next({ data: 0, url: 'his-path' });
console.log(initialSubscriber.closed, lateSubscriber.closed);

console.log('subscribing #2/dead');
const lateSubscriber2 = lastUrl.subscribe(d => console.log('dead:', d));

//term$.next(true);

console.log('new data:  the-path');
routeEnd.next({ data: 2, url: 'the-path' });

console.log('subscribing #3/doornail');
const lateSubscriber3 = lastUrl.subscribe(d => console.log('doornail:', d));

console.log(initialSubscriber.closed, lateSubscriber.closed, lateSubscriber2.closed, lateSubscriber3.closed);

term$.next(true);


console.log(initialSubscriber.closed, lateSubscriber.closed, lateSubscriber2.closed, lateSubscriber3.closed);
