export { type Storage };

export { make, get, save, remove, clear };

type Storage<T> = Readonly<{
    key: string;
    fallback: Readonly<T>;
}>;

const make = <T,>(key: string, fallback: Readonly<T>): Storage<T> => {
    return { key, fallback };
};

const get = <T,>(storage: Storage<T>): Readonly<T> => {
    const value = localStorage.getItem(storage.key);
    return value === null ? storage.fallback : JSON.parse(value);
};

const save = <T,>(storage: Storage<T>, value: Readonly<T>): void => {
    localStorage.setItem(storage.key, JSON.stringify(value));
};

const remove = <T,>(storage: Storage<T>): void => {
    localStorage.removeItem(storage.key);
};

const clear = (): void => {
    localStorage.clear();
};
