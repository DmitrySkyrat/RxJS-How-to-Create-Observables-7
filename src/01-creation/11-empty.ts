// const EMPTY: Observable<never>

import { EMPTY } from 'rxjs';
import { addItem, run } from './../03-utils';
import { startWith } from 'rxjs/operators';

export function emptyDemo() {
  const stream$ = EMPTY;
  // const stream$ = EMPTY.pipe(startWith(0));

  // run(stream$); // emit value and complete
}
