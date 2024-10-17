import { $, dispathRepoEvent } from './utils';
import * as Store from '../store';
import * as Storage from '../storage';
import { Repo, List, Item } from '../tada';

const Creation = {
    dialog: $('#creation-dialog', HTMLDialogElement),
    close: $('#creation-dialog-close', HTMLButtonElement),
    open: $('#creation-dialog-open', HTMLButtonElement),
    form: $('#creation-form', HTMLFormElement),

    title: $('#creation-title', HTMLInputElement),
    priority: $('#creation-priority', HTMLSelectElement),
    dueDate: $('#creation-due-date', HTMLInputElement),
    description: $('#creation-description', HTMLTextAreaElement),

    list: $('#creation-list', HTMLSelectElement),
    listName: $('#creation-list-name', HTMLInputElement),
} as const;

const updateCreationListOptions = (repo: Repo.Repo): void => {
    Creation.list.innerHTML = '<option value="new" selected>New</option>';

    repo.forEach((list) => {
        Creation.list.insertAdjacentHTML(
            'beforeend',
            `<option value="${list.id}">${list.name}</option>`,
        );
    });
};

Creation.dialog.addEventListener('close', () => {
    updateCreationListOptions(Storage.get(Store.repo));
    Creation.listName.disabled = false;
    Creation.form.reset();
});

Creation.open.addEventListener('click', () => {
    updateCreationListOptions(Storage.get(Store.repo));
    Creation.dialog.showModal();
});

Creation.close.addEventListener('click', () => {
    Creation.dialog.close();
});

Creation.list.addEventListener('change', () => {
    Creation.listName.disabled = Creation.list.value !== 'new';
});

Creation.form.addEventListener('submit', () => {
    const repo = Storage.get(Store.repo);

    const item = Item.make({
        title: Creation.title.value,
        priority: Item.Priority[Creation.priority.value as Item.PriorityKeys],
        dueDate: Creation.dueDate.value || undefined,
        description: Creation.description.value || undefined,
    });

    Creation.list.value === 'new' ?
        dispathRepoEvent(Repo.addList(repo, List.make(Creation.listName.value, [item])))
    :   dispathRepoEvent(Repo.addItem(repo, Creation.list.value, item));
});
