import { Observable, of, from, fromEvent, generate, pairs, EMPTY, concat, timer, zip, range, bindCallback, bindNodeCallback, fromEventPattern, interval, NEVER, throwError, defer, combineLatest } from "rxjs";
import { map, take, tap, switchMap, filter, reduce, catchError, delay, concatMap, withLatestFrom, pluck, mergeMap } from "rxjs/operators";
import { fromFetch } from "rxjs/fetch";
import { ajax } from "rxjs/ajax";
import { addItem, run } from './../03-utils';

// Task 1. of()
// Реализуйте тело функции, которая принимает переменное количество параметров 
// и создает Observable, который выдает значения ее аргументов
(function task1(...rest: any[]): void {
    const stream$ = of(...rest); 

    //run(stream$);
})(1, 'string', true, {});

// Task 2.1 from()
// Реализуйте тело функции, которая принимает на вход массив и создает Observable,
// который выдает значения этого массива
(function task2(arr: any[]): void {
    const stream$ = from(arr);
    
    //run(stream$);
})([1, 'string', true, {}]);


// Task 2.2. from()
// Реализуйте тело функции, которая создает Observable, который выдает случайные числа в дианазоне от min до max
// используя генератор. Верните 10 чисел, используя take()
(function task3() {
    function* generator(min, max){
        while (true) {
          yield Math.floor( Math.random() * ( max - min ) ) + min;
        }
      }
      
    const stream$ = from(generator(0,100)).pipe(take(10));
    
    //run(stream$);
})();

// Task 3 fromEvent()
// Реализуйте тело функции, которая принимает 
// id кнопки и создает Observable, который выдает значения времени клика по кнопке
(function task3(buttonId: string): void {
    const stream$ = fromEvent(document.getElementById(buttonId), 'click').pipe(map(e => e.timeStamp));
    // .pipe(pluck('timeStampt'))
    
    //run(stream$, { outputMethod: 'console'});
})('runBtn');

// Task 4. fromEventPattern()
// Реализуйте функцию, которая создаст Observable, который выдает значения,
// передаваемые вызову методу emit();
(function task4() {
    class С1 {
        private listeners: Function[] = [];

        registerListener(listener: Function) {
            this.listeners.push(listener);
        }

        emit(value: any) {
            this.listeners.forEach(listener => listener(value));
        }
    }

    const foo = new С1();

    function addHandler(handler) {
        foo.registerListener(handler);
    }

    const stream$ = fromEventPattern(addHandler);

    //run(stream$);

    foo.emit(1);
    foo.emit(2);
    foo.emit(3);
})();



// Task 5. fromFetch()
// Реализуйте функцию, которая создает Observable, который выдает имена пользователей. 
// Используйте операторы: fromFetch('http://jsonplaceholder.typicode.com/users'), filter(), switchMap(), map()
(function task5() {
    const stream$ = fromFetch('http://jsonplaceholder.typicode.com/users')
        .pipe(
            switchMap(response => {
                if (response.ok) {
                    return response.json();
                }
            }),
            map(arr => arr.map(item => item.name)),
            switchMap(arr => from(arr))
        );

    //run(stream$);
})();

// Task 6. ajax() // Artem Onopriienko
// Получить пользователей, сформировать объекты { name: ..., email: ...} и отсортировать их по массиву из 2 полей
// const fields$ = from(['name', 'email']);
// Используйте операторы: ajax('http://jsonplaceholder.typicode.com/users'), switchMap(), map(), withLatestFrom()
(function task6() {
    const source$ = ajax(`http://jsonplaceholder.typicode.com/users`);
    const fields$ = from(['name', 'email']);

    const stream$ = source$.pipe(
        pluck('response'),
        map(arr => arr.map(item => ({name: item.name, email: item.email}))),
        withLatestFrom(fields$.pipe(reduce((acc, elem) => {acc.push(elem); return acc;}, []))), // Или pairwise()
        map(arr => {
            const [data, fields] = arr;

            data.sort((el1, el2) => {
                const [field1] = fields;
                return el1[field1].localeCompare(el2[field1]);
            });

            
            data.sort((el1, el2) => {
                const [field1, field2] = fields;
                if (el1[field1] === el1[field2]) {
                    return el1[field2].localeCompare(el2[field1]);
                }
            });

            return data;
        }),
        switchMap(data => from(data))
    );

    //run(stream$, {outputMethod: 'console'});
})();

// Task7. interval()
// Реализуйте функцию, которая создает Observable, который запрашивает и выдает имена ползователей каждые 5с 
// Используйте операторы: ajax('http://jsonplaceholder.typicode.com/users'), switchMap(), map()
(function task7() {

    const source$ = ajax(`http://jsonplaceholder.typicode.com/users`);
    const period = 5000;
    const stream$ = interval(period).pipe(
        switchMap(response => 
            ajax(`http://jsonplaceholder.typicode.com/users`),
        ),
        pluck('response'),
        map(arr => arr.map(item => item.name)),
        switchMap(arr => from(arr))
    ); 

    //run(stream$);
})();

// Task 8. from(), timer(), zip()
// Реализуйте функцию, которая создает Observable, который выдает элементы массива каждые 2с 
// Создайте поток на основе массива items, используя from()
// Создайте поток, который будет выдавать значение каждые 2с, используя timer()
// Объедините эти потоки, используя zip
(function task8() {
    const items = [1, 2, 3, 4, 5];
    const firststream$ = from(items);
    const secondstream$ = timer(0, 2000);

    const stream$ = zip(firststream$, secondstream$).pipe(map(arr => arr[0]));
    
    //run(stream$);
})();

// Task 9. range()
// Реализуйте функцию, которая создает Observable, который выдает числа в диапазоне от 1 до 10 
// через случайное количество времени в диапазоне от 1с до 5с
// Используйте функцию randomDelay(), of(), concatMap(), delay()
(function task9() {
    function randomDelay(min: number, max: number) {
        const pause = Math.floor( Math.random() * ( max - min ) ) + min;
        console.log(pause);
        return pause;
    }

    const timer$ = timer(0, 1000);

    const stream$ = range(1, 10).pipe(
        concatMap(i => of(i).pipe(delay(randomDelay(1000, 5000))))
    );

    // run(stream$);
})();

// Task 10. pairs()
// Реализуйте функцию, которая создает Observable.
// Пусть есть поток objAddressStream, который выдает объект и второй поток fieldsStream, который содержит перечень ключей объекта
// Необходимо модифицировать поток так, чтобы он выдавал объект только с данными ключей из 
// второго потока. 
// Используйте pairs(), switchMap(), reduce(), filter(), withLatestFrom()
(function task10() {
    const objAddressStream = of({
        country: 'Ukraine',
        city: 'Kyiv',
        index: '02130',
        street: 'Volodymyra Velikogo',
        build: 100,
        flat: 23
    });

    const  fieldsStream = from(['country', 'street', 'flat']);

    const stream$ = objAddressStream.pipe(
        switchMap(obj => pairs(obj)),
        withLatestFrom(fieldsStream.pipe(reduce((acc, elem) => {acc.push(elem); return acc;}, []))),
        filter(arr => {
            const [data, fields] = arr;
            const [key] = data;
            return fields.includes(key);
        }),
        map(arr => arr[0]),
        reduce((acc, arr) => {
            return {...acc, [arr[0]]: arr[1]}}, {})
    )
    
    //run(stream$); 
})();

// Task 11. EMPTY
// Реализуйте функцию, которая создает Observable.
// Оъявите пустой поток, который завершится через 2с, используйте оператор delay
// Верните из функции поток, который будет выдавать значения массива items, через каждые 2с.
// Используейте EMPTY, delay, from, concatMap, concat
(function task11() {
    const items = [1, 2, 3, 4, 5];

    const stream$ = from(items).pipe(
        concatMap(i => concat(of(i), EMPTY.pipe(delay(2000))))
    );

    //run(stream$);
})();


// Task 12. NEVER
// Реализуйте функцию, которая создает бесконечный Observable из массива значений
// Используейте NEVER, concat, from
(function task12() {
    const items = [1, 2, 3, 4, 5];

    const stream$ = concat(from(items), NEVER); 

    // run(stream$);
})();

// Task 13. throwError()
// Реализуйте функцию, которая создаст Observable, который завершиться с ошибкой, если в массиве встретится число 3.
// Используейте from, switchMap, of, throwError
(function task13() {
    const items = [1, 2, 3, 4, 5];

    const stream$ = from(items).pipe(
        switchMap(item => {
            if (item === 3) {
                return throwError('3 is in array')
            }
            return of(item);
        }),
        
    );

    //run(stream$, {outputMethod: 'console'});
})();

// Task 14. bindCallback()
// Пусть есть некоторая функция doAsyncJob, которая выполняет асинхронную операцию и вызывает колбек, 
// когда эта операция завершается.
// Используя bindCallback, создайте функцию reactiveDoAsyncJob, вызовов которой создаст поток с передаваемым ей значением.
(function task14() {
    function doAsyncJob(data: any, callback: (data: any) => void) {
        // imitation of some request 
        setTimeout(() => {
            callback(data)
        }, 3000);
    }

    const reactiveDoAsyncJob = bindCallback(doAsyncJob);

    const stream$ = reactiveDoAsyncJob({ name: 'Anna' });

    //run(stream$);
})();

// Task 15. bindNodeCallback()
// Пусть есть некоторая функция doAsyncJob, которая выполняет асинхронную операцию и вызывает колбек в "формате ноды", 
// когда эта операция завершается.
// Используя bindNodeCallback, создайте функцию reactiveDoAsyncJob, вызовов которой создаст поток,
// который завершится ошибкой.
(function task15() {
    function doAsyncJob(data: any, callback: (error: any, data: any) => void) {
        // imitation of some request 
        setTimeout(() => {
            callback('Error', data)
        }, 3000);
    }

    const reactiveDoAsyncJob = bindNodeCallback(doAsyncJob);

    const stream$ = reactiveDoAsyncJob({ name: 'Anna' });

    //run(stream$);
})();

// Task 16. defer()
// Пусть есть некоторая функция getUsers(), которая возвращает коллекцию пользователей с помощью fetch()
// Создать Observable, в котром запуск функции getUser() произойдет в момент подписки на поток
// Используйте defer, switchMap
(function task16() {
    function getUsers(): Promise<any> {
        addItem("fetching data");
        return fetch(`http://jsonplaceholder.typicode.com/users`);
    }

    //getUsers().then(data => data.json()).then(addItem);


    const stream$ = defer(() => getUsers()).pipe(switchMap(data => data.json()));

    // addItem("I don't want that request now");
    //run(stream$);
})();



// Task 17. generate()
// Реализуйте функцию, которая создает Observable, который будет выдавать в поток значения, 
// хранящихся в свойстве sequence класса С
(function task17() {
    class C<T> {
        private sequence: T[] = [];

        get size(): number {
            return this.sequence.length;
        }

        add(elem: T) {
            this.sequence.push(elem);
            return this;
        }

        get(index: number): T {
            return this.sequence[index];
        }
    }

    const sequence = new C<number>().add(1).add(10).add(1000).add(10000);

    const initialState = 0;
    const condition = (value: number) => value < sequence.size;
    const iterate = (value: number) => value + 1;
    const resultSelector = (value: number) => sequence.get(value);
  
    const stream$ = generate(initialState, condition, iterate, resultSelector);

    //run(stream$);
})();

// Task 18. hometask1 ajax(), map()
// Реализуйте функцию, которая выведет все аватары (avatar_url) пользователей GitHub по
// запросу 'https://api.github.com/search/users?q=javascript'. Используется оператор ajax для
// создания запроса, оператор map для преобразований.
(function task18() {
    const source$ = ajax('https://api.github.com/search/users?q=javascript');

    const stream$ = source$.pipe(
        pluck('response'),
        map(res => res.items),
        mergeMap<any, Observable<any>>(items => items),
        map(user => user.avatar_url),
    )

    //run(stream$, {outputMethod: 'console'});
})();

// Task 19. hometask2 switchMap()
// Реализуйте функцию, которая по клику на документ создаст интервал с периодом в 500 мс и
// выведет сумму первых 5-ти чисел интервала.
(function task19() {
    const source$ = fromEvent(document, 'click');

    const stream$ = source$.pipe(
        switchMap(event => interval(500)),
        take(5),
        reduce((acc, item) => {
            return acc + item
        }, 0)
    )

    //run(stream$);
})();

export function runner() {}