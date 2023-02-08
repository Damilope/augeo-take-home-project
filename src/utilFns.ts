import {get, isFunction, isNil} from 'lodash';

/**
 * Returns item at `path` in `data` if `path` is provided, otherwise, returns
 * `data` stringified.
 */
function indexArrayDefaultIndexer(
  data: unknown,
  path?: string | number | symbol
) {
  if (path) {
    return get(data, path);
  }
  if (data && isFunction(data.toString)) {
    return data.toString();
  }
  return String(data);
}

type TryGetObjectKeys<T> = T extends {[key: string | number | symbol]: unknown}
  ? keyof T
  : undefined;

export interface IIndexArrayOptions<T, R = T> {
  /**
   * Path to use for indexing of array is a list of objects.
   */
  path?: TryGetObjectKeys<T>;

  /**
   * Indexer function that returns a unique string for each item passed.
   */
  indexer?: (
    current: T,
    path: TryGetObjectKeys<T>,
    arr: T[],
    index: number
  ) => string;

  /**
   * Reducer function for transforming the indexed data if you want the data
   * transformed instead of indexed as is. `reducer` is called after `indexer`
   * so don't rely on the return type of `reducer` in `indexer`.
   */
  reducer?: (current: T, arr: T[], index: number) => R;
}

/**
 * Indexes an array, that is, returns a key-value map from an array using the
 * options provided.
 */
export function indexArray<T, R = T>(
  arr: T[] = [],
  opts: IIndexArrayOptions<T, R> = {}
): {[key: string]: R} {
  const indexer = opts.indexer || indexArrayDefaultIndexer;
  const path = opts.path;
  const reducer = opts.reducer;
  if (!isFunction(indexer)) {
    if (isNil(path)) {
      throw new Error('Path must be provided if an indexer is not provided');
    }
  }

  const result = arr.reduce((accumulator, current, index) => {
    const key = indexer(current, path, arr, index);
    accumulator[key] = reducer
      ? reducer(current, arr, index)
      : (current as unknown as R);
    return accumulator;
  }, {} as {[key: string]: R});

  return result;
}
