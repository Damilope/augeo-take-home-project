import {indexArray} from './utilFns';

/**
 * Checks that `list1` contains every item in `list2` using the `indexer`
 * provided. The `indexer` should return a unique string for each unique item in
 * the list. Also, the same unique string should be returned for the same item
 * no matter how many times `indexer` is called.
 */
export function containsEveryItemIn<T2, T1 extends T2>(
  list1: T1[],
  list2: T2[],
  indexer: (item: T2) => string
) {
  const list1Map = indexArray(list1, {indexer});
  list2.forEach(item1 => {
    const k = indexer(item1);
    const item2 = list1Map[k];
    expect(item2).toBeTruthy();
  });
}

/**
 * Checks that `list1` contains none of the items in `list2` using the `indexer`
 * provided. The `indexer` should return a unique string for each unique item in
 * the list. Also, the same unique string should be returned for the same item
 * no matter how many times `indexer` is called.
 */
export function containsNoneIn<T2, T1 extends T2>(
  list1: T1[],
  list2: T2[],
  indexer: (item: T2) => string
) {
  const list1Map = indexArray(list1, {indexer});
  list2.forEach(item1 => {
    const k = indexer(item1);
    const item2 = list1Map[k];
    expect(item2).toBeFalsy();
  });
}

/**
 * Checks that `list1` and `list2` should contain the same items using the
 * `indexer` provided. The `indexer` should return a unique string for each
 * unique item in the list. Also, the same unique string should be returned for
 * the same item no matter how many times `indexer` is called.
 */
export function containsExactly<T2, T1 extends T2>(
  list1: T1[],
  list2: T2[],
  indexer: (item: T2) => string
) {
  expect(list1.length).toEqual(list2.length);
  containsEveryItemIn(list1, list2, indexer);
}
