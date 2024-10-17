export type { List, FilterCompletion, FilterPriority, FilterDueDate };

export {
    make,
    get,
    add,
    remove,
    update,
    modify,
    toggle,
    filter,
    filterByCompletion,
    filterByPriority,
    filterByDueDate,
};

import * as I from './item';
import { uid } from './utils';

type List = Readonly<{
    id: string;
    name: string;
    items: ReadonlyArray<I.Item>;
}>;

const make = (name: string, items: ReadonlyArray<I.Item> = []): List => {
    return { id: uid(), name, items };
};

const get = (list: List, id: string): I.Item | undefined => {
    return list.items.find((item) => item.id === id);
};

const add = (list: List, item: I.Item): List => {
    return { ...list, items: [...list.items, I.make(item)] };
};

const remove = (list: List, id: string): List => {
    return { ...list, items: list.items.filter((item) => item.id !== id) };
};

const update = (list: List, id: string, updater: (item: I.Item) => I.Item): List => {
    const item = list.items.find((item) => item.id === id);
    return !item ? list : (
            {
                ...list,
                items: [...list.items.filter((item) => item.id !== id), updater(item)],
            }
        );
};

const modify = (list: List, id: string, props: Partial<I.Item>): List => {
    return update(list, id, (item) => I.modify(item, props));
};

const toggle = (list: List, id: string): List => {
    return update(list, id, (item) => I.toggle(item));
};

const filter = (list: List, predicate: (item: I.Item) => boolean): List => {
    return { ...list, items: list.items.filter(predicate) };
};

type FilterCompletion = Partial<{ completed: boolean; incomplete: boolean }>;

const filterByCompletion = (
    list: List,
    { completed, incomplete }: FilterCompletion,
): List => {
    return filter(list, (item) => {
        return (
            (completed && item.isCompleted) ||
            (incomplete && !item.isCompleted) ||
            (!completed && !incomplete)
        );
    });
};

type FilterPriority = Partial<Record<Lowercase<keyof typeof I.Priority>, boolean>>;

const filterByPriority = (
    list: List,
    { none, low, medium, high }: FilterPriority,
): List => {
    return filter(list, (item) => {
        return (
            (none && item.priority === I.Priority.None) ||
            (low && item.priority === I.Priority.Low) ||
            (medium && item.priority === I.Priority.Medium) ||
            (high && item.priority === I.Priority.High) ||
            (!none && !low && !medium && !high)
        );
    });
};

type FilterDueDate = Partial<{ start: string; end: string }>;

const filterByDueDate = (list: List, { start, end }: FilterDueDate): List => {
    return filter(list, (item) => {
        if (!start && !end) return true;
        if (!item.dueDate) return false;

        const dueDateTime = new Date(item.dueDate).getTime();
        const startTime = start ? new Date(start).getTime() : -Infinity;
        const endTime = end ? new Date(end).getTime() : Infinity;

        return dueDateTime > startTime && dueDateTime < endTime;
    });
};
