export type { Repo };

export {
    make,
    getList,
    addList,
    removeList,
    updateItem,
    getItem,
    addItem,
    removeItem,
    modifyItem,
    toggleItem,
    filterById,
};

import * as I from './item';
import * as L from './list';

type Repo = ReadonlyArray<L.List>;

const make = (lists: ReadonlyArray<L.List> = []): Repo => {
    return lists;
};

const getList = (repo: Repo, id: string): L.List | undefined => {
    return repo.find((list) => list.id === id);
};

const addList = (repo: Repo, list: L.List): Repo => {
    return [...repo, list];
};

const removeList = (repo: Repo, id: string): Repo => {
    return repo.filter((list) => list.id !== id);
};

const updateItem = (
    repo: Repo,
    listId: string,
    itemId: string,
    updater: (list: L.List, id: string) => L.List,
): Repo => {
    const list = repo.find((list) => list.id === listId);
    return !list ? repo : (
            [...repo.filter((list) => list.id !== listId), updater(list, itemId)]
        );
};

const getItem = (repo: Repo, listId: string, itemId: string): I.Item | undefined => {
    const list = getList(repo, listId);
    return !list ? undefined : L.get(list, itemId);
};

const addItem = (repo: Repo, id: string, item: I.Item): Repo => {
    return updateItem(repo, id, '', (list) => L.add(list, item));
};

const removeItem = (repo: Repo, listId: string, itemId: string): Repo => {
    return updateItem(repo, listId, itemId, (list, index) => L.remove(list, index));
};

const modifyItem = (repo: Repo, listId: string, itemId: string, item: I.Item): Repo => {
    return updateItem(repo, listId, itemId, (list, index) => L.modify(list, index, item));
};

const toggleItem = (repo: Repo, listId: string, itemId: string): Repo => {
    return updateItem(repo, listId, itemId, (list, index) => L.toggle(list, index));
};

const filterById = (repo: Repo, Ids: ReadonlyArray<string>): Repo => {
    return Ids.length === 0 ? repo : repo.filter((list) => Ids.includes(list.id));
};
