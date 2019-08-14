import { Observable, Subject, ReplaySubject, of } from 'rxjs';
import { pluck, map, share, shareReplay, tap, catchError, takeUntil } from 'rxjs/operators';

const endAllSubscriptions$ = new Subject<boolean>();
// simulate url change with subject
const mockHttpCall = new Subject<{ data: any, url: string }>();
//const mockHttpCall = new ReplaySubject<{ data: any, url: string }>(); // ReplaySubject works, even w/o shareReplay
// grab url and share with subscribers
const lastUrl = mockHttpCall.pipe(
  shareReplay(),
  //tap(d => console.log('executed', d)),
  //tap(d => { if (d.data === 0) { throw 'omg!' } }),
  pluck('url'),
  // defaults to last 1 value -- no it doesn't...
  
  //takeUntil(endAllSubscriptions$),
  //catchError((e) => { console.warn(e); return of('oops'); }),
);

// Does creating an observable of an observable affect the shareReplay?
const lastUrlCap = lastUrl.pipe(
  map(v => v.toString().toUpperCase() )
);

// requires initial subscription
//const alphaSubscriber = lastUrl.subscribe(d => console.log('init:', d));
// simulate route change
// logged: 'executed', 'first-shot'
console.log('new data:  first-shot');
mockHttpCall.next({ data: {}, url: 'first-shot' });
// logged: 'first-shot'
console.log('subscribing #0/alpha - if replay works, then should see "in subr - alpha"');
const alphaSubscriber = lastUrl.subscribe(d => console.log('alpha subr fired:', d));
console.log('subscribing #1/bravo');
const bravoSubscriber = lastUrl.subscribe(d => console.log('bravo subr fired:', d));
console.log(alphaSubscriber.closed, bravoSubscriber.closed);
console.log('subscribing #2/gamma -- uses lastUrlCap');
const gammaSubscriber = lastUrlCap.subscribe(d => console.log('gamma subr fired:', d));
console.log(`Closed? alpha: ${alphaSubscriber.closed}, bravo: ${bravoSubscriber.closed}, gamma: ${gammaSubscriber.closed}`);

console.log('new data:  his-path -- causes error, kills subscriptions');
mockHttpCall.next({ data: 0, url: 'his-path' });
console.log(`Closed? alpha: ${alphaSubscriber.closed}, bravo: ${bravoSubscriber.closed}, gamma: ${gammaSubscriber.closed}`);

console.log('subscribing #4/delta -- can I subscribe to an observable after it has thrown an error?  Yes.');
const deltaSubscriber = lastUrl.subscribe(d => console.log('delta subr fired:', d));
console.log(`Closed? alpha: ${alphaSubscriber.closed}, bravo: ${bravoSubscriber.closed}, gamma: ${gammaSubscriber.closed}, delta: ${deltaSubscriber.closed}`);

//endAllSubscriptions$.next(true);

console.log('new data:  the-path');
mockHttpCall.next({ data: 2, url: 'the-path' });

console.log('subscribing #3/doornail');
const bravoSubscriber3 = lastUrl.subscribe(d => console.log('doornail:', d));

console.log(alphaSubscriber.closed, bravoSubscriber.closed, deltaSubscriber.closed, bravoSubscriber3.closed);

endAllSubscriptions$.next(true);


console.log(alphaSubscriber.closed, bravoSubscriber.closed, deltaSubscriber.closed, bravoSubscriber3.closed);
