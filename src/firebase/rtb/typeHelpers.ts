import {
  child,
  Database,
  DatabaseReference,
  DataSnapshot,
  onChildAdded,
  onChildChanged,
  onValue,
  orderByChild,
  Query,
  query,
  QueryConstraint,
  ref,
  set,
  update as updateDb,
} from "firebase/database";

// note that the literal ${string} includes the empty string !
// empty string can be used as a key !

/* export type Paths<T> = {
  [K in keyof T]: K extends string
    ? T[K] extends object
      ? `${K}` | `${K}/${Paths<T[K]>}`
      : `${K}`
    : never;
}[keyof T]; */

type IsRecord<T> =
  T extends Record<string, unknown>
    ? string extends keyof T
      ? true
      : false
    : false;

// although this does provide the correct type, it does not prevent incorrect paths due to ${string}
// capturing everything
type Paths<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? IsRecord<T[K]> extends true
          ?
              | `${K}`
              | `${K}/${string}`
              | `${K}/${string}/${Paths<T[K][string & keyof T[K]]>}`
          : T[K] extends object
            ? `${K}` | `${K}/${Paths<T[K]>}`
            : `${K}`
        : never;
    }[keyof T]
  : never;

type PathValue<
  T,
  TPath extends string,
> = TPath extends `${infer K}/${infer Rest}` // If TPath contains `/`, split it into K and the rest
  ? K extends keyof T
    ? PathValue<T[K], Rest> // Recursively resolve the type for the rest of the path
    : never
  : TPath extends keyof T // If no `/`, just resolve the key directly
    ? T[TPath]
    : never;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface TypedDatabaseReference<TRoot, TPath extends Paths<TRoot>>
  extends DatabaseReference {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createTypedRefHelper<TRoot>(root: TRoot) {
  /*
        could expose refTyped and get intellisense on the path this way

        const childPath: Paths<DemoRoot> = "child1/grandchild";
        const grandchildReference = refTyped<DemoRoot, typeof childPath>(
        database,
        "child1/grandchild",
);
    */
  function refTyped<TRoot, TPath extends Paths<TRoot>>(
    db: Database,
    path: TPath,
  ): TypedDatabaseReference<TRoot, TPath> {
    return ref(db, path) as TypedDatabaseReference<TRoot, TPath>;
  }
  return <TPath extends Paths<TRoot>>(
    db: Database,
    path: TPath,
  ): TypedDatabaseReference<TRoot, TPath> => {
    return refTyped<TRoot, TPath>(db, path);
  };
}

//#region writing
export const setTyped = <TRoot, TPath extends Paths<TRoot>>(
  ref: TypedDatabaseReference<TRoot, TPath>,
  value: PathValue<TRoot, TPath>,
) => {
  return set(ref, value);
};

type WithNulls<T> = {
  [K in keyof T]: T[K] | null;
};
type WithoutUndefined<T> = {
  [K in keyof T]: Exclude<T[K], undefined>;
};
type WithNullsWithoutUndefined<T> = WithNulls<WithoutUndefined<T>>;
export type PartialWithNullsWithoutUndefined<T> = Partial<
  WithNullsWithoutUndefined<T>
>;
interface RootUpdater<TRoot> {
  updateFn: <TPath extends Paths<TRoot>>(
    path: TPath,
    value: PathValue<TRoot, TPath>,
  ) => RootUpdater<TRoot>["updateFn"];
  updateListItem: <TPath extends Paths<TRoot>>(
    path: TPath,
    itemId: string,
    value: PartialWithNullsWithoutUndefined<
      RecordType<PathValue<TRoot, TPath>>
    >,
  ) => void;
  update(): Promise<void>;
}
export const createTypedValuesUpdater = <TRoot>(
  db: Database,
): RootUpdater<TRoot> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const values = {} as any;
  const updateFn = <TPath extends Paths<TRoot>>(
    path: TPath,
    value: PathValue<TRoot, TPath>,
  ) => {
    values[path] = value;
    return updateFn;
  };
  const updateListItem = <TPath extends Paths<TRoot>>(
    path: TPath,
    itemId: string,
    value: PartialWithNullsWithoutUndefined<
      RecordType<PathValue<TRoot, TPath>>
    >,
  ) => {
    Object.entries(value).forEach(([key, value]) => {
      values[`${path}/${itemId}/${key}`] = value;
    });

    return updateFn;
  };
  const update = () => {
    return updateDb(ref(db), values);
  };
  return {
    updateFn,
    updateListItem,
    update,
  };
};

//#endregion

//#region querying

// todo - need to consider object vs list
// export declare function get(query: Query): Promise<DataSnapshot>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface TypedQuery<T> extends Query {}

type ChildKeyOfList<T> = T extends Record<string, infer K> ? keyof K : never;
type RecordType<T> = T extends Record<string, infer K> ? K : never;
export const orderByChildQuery = <
  TRoot,
  TPath extends Paths<TRoot>,
  TKey extends ChildKeyOfList<PathValue<TRoot, TPath>>,
>(
  ref: TypedDatabaseReference<TRoot, TPath>,
  childKey: TKey,
  ...queryConstraints: QueryConstraint[]
): TypedQuery<PathValue<PathValue<TRoot, TPath>, TKey>> => {
  return query(ref, orderByChild(childKey as string), ...queryConstraints);
};

//todo there are more members of DataSnapshot that can be typed
type TypedDataSnapshot<T> = Omit<DataSnapshot, "val"> & {
  val(): T;
};

export const onListItemValueTyped = <TRoot, TPath extends Paths<TRoot>>(
  id: string,
  ref: TypedDatabaseReference<TRoot, TPath>,
  callback: (
    snapshot: TypedDataSnapshot<RecordType<PathValue<TRoot, TPath>>>,
  ) => void,
) => {
  const childRef = child(ref, id);
  return onValue(childRef, callback);
};

// overloads to do
export const onValueTyped = <T>(
  query: TypedQuery<T>,
  callback: (snapshot: TypedDataSnapshot<T>) => void,
) => {
  return onValue(query, callback);
};

// overloads to do
export const onChildAddedTyped = <T>(
  query: TypedQuery<T>,
  callback: (
    snapshot: TypedDataSnapshot<T>,
    previousChildName?: string | null,
  ) => void,
) => {
  return onChildAdded(query, callback);
};

export const onChildChangedTyped = <T>(
  query: TypedQuery<T>,
  callback: (
    snapshot: TypedDataSnapshot<T>,
    previousChildName?: string | null,
  ) => void,
) => {
  return onChildChanged(query, callback);
};
// todo other child methods

//#endregion

export const nameof = <T>(name: Extract<keyof T, string>): string => name;
export type ExtractKey<T, U extends keyof T> = Extract<keyof T, U>;
