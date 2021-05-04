// const NEVER: Observable<never>

import { NEVER, of } from 'rxjs';
import { addItem, run } from './../03-utils';
import { startWith } from 'rxjs/operators';

export function neverDemo() {
  // const stream$ = of(0); // finite stream
  const stream$ = NEVER.pipe(startWith(0)); // infinite stream

  // run(stream$); // emit velue and never complete
}
