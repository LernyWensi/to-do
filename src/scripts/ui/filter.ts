import { assert, fuzzyMatch, toUpperFirstChar } from '../utils';
import { $, $$, dispatchRepoEvent } from './utils';
import * as Store from '../store';
import * as Storage from '../storage';
import { Repo, List, Item } from '../tada';

const Filter = {
    dialog: $('#filter-dialog', HTMLDialogElement),
    close: $('#filter-dialog-close', HTMLButtonElement),
    open: $('#filter-dialog-open', HTMLButtonElement),
    form: $('#filter-form', HTMLFormElement),
    search: $('#filter-search', HTMLInputElement),
    listFieldset: $('#filter-list', HTMLFieldSetElement),
    result: $('#filter-result-list', HTMLMenuElement),

    isCompleted: $('#filter-is-completed', HTMLInputElement),
    isIncomplete: $('#filter-is-incomplete', HTMLInputElement),

    priorityNone: $('#filter-priority-none', HTMLInputElement),
    priorityLow: $('#filter-priority-low', HTMLInputElement),
    priorityMedium: $('#filter-priority-medium', HTMLInputElement),
    priorityHigh: $('#filter-priority-high', HTMLInputElement),

    periodStart: $('#filter-period-start', HTMLInputElement),
    periodEnd: $('#filter-period-end', HTMLInputElement),

    modifyDialog: $('#filter-modify-dialog', HTMLDialogElement),
    modifyClose: $('#filter-modify-dialog-close', HTMLButtonElement),
    modifyForm: $('#filter-modify-form', HTMLFormElement),
    modifyTitle: $('#filter-modify-title', HTMLInputElement),
    modifyPriority: $('#filter-modify-priority', HTMLSelectElement),
    modifyDueDate: $('#filter-modify-due-date', HTMLInputElement),
    modifyDescription: $('#filter-modify-description', HTMLTextAreaElement),
} as const;

window.addEventListener('repo', (event: CustomEventInit<{ repo: Repo.Repo }>) => {
    assert(event.detail?.repo, 'Repository is undefined in the event details');

    Storage.save(Store.repo, event.detail.repo);

    updateFilterResult(Storage.get(Store.repo), filter);
});

window.addEventListener('DOMContentLoaded', () => {
    updateFilterListOptions(Storage.get(Store.repo));

    const { completion, priority, dueDate } = Storage.get(Store.filter);

    Filter.isCompleted.checked = completion.completed || false;
    Filter.isIncomplete.checked = completion.incomplete || false;

    Filter.priorityNone.checked = priority.none || false;
    Filter.priorityLow.checked = priority.low || false;
    Filter.priorityMedium.checked = priority.medium || false;
    Filter.priorityHigh.checked = priority.high || false;

    Filter.periodStart.valueAsDate = dueDate.start ? new Date(dueDate.start) : null;
    Filter.periodEnd.valueAsDate = dueDate.end ? new Date(dueDate.end) : null;

    updateFilterResult(Storage.get(Store.repo), filter);
});

const filter = (repo: Repo.Repo): Repo.Repo => {
    const filter: Store.Filter = {
        completion: {
            completed: Filter.isCompleted.checked,
            incomplete: Filter.isIncomplete.checked,
        },
        priority: {
            none: Filter.priorityNone.checked,
            low: Filter.priorityLow.checked,
            medium: Filter.priorityMedium.checked,
            high: Filter.priorityHigh.checked,
        },
        dueDate: {
            start: Filter.periodStart.valueAsDate?.toString(),
            end: Filter.periodEnd.valueAsDate?.toString(),
        },
        list: $$('input[name="list"]', HTMLInputElement)
            .filter((input) => input.checked)
            .map((input) => input.value),
    };

    Storage.save(Store.filter, filter);

    return Repo.filterById(repo, filter.list).map((list) => {
        return [
            (list: List.List) => List.filterByDueDate(list, filter.dueDate),
            (list: List.List) => List.filterByPriority(list, filter.priority),
            (list: List.List) => List.filterByCompletion(list, filter.completion),
        ].reduce((list, fn) => fn(list), list);
    });
};

const toggle = (listId: string, itemId: string): void => {
    dispatchRepoEvent(Repo.toggleItem(Storage.get(Store.repo), listId, itemId));
};

const modify = (listId: string, itemId: string): void => {
    const item = Repo.getItem(Storage.get(Store.repo), listId, itemId);

    assert(
        item,
        `Search for item by "id" provided to "modify" function returned undefined, searched for: listId: ${listId}, itemId: ${itemId}`,
    );

    Filter.modifyTitle.value = item.title;
    Filter.modifyPriority.value = item.priority;
    Filter.modifyDueDate.value = item.dueDate || '';
    Filter.modifyDescription.value = item.description || '';

    Filter.modifyForm.dataset.listId = listId;
    Filter.modifyForm.dataset.itemId = itemId;

    Filter.modifyDialog.showModal();
};

const remove = (listId: string, itemId: string): void => {
    dispatchRepoEvent(Repo.removeItem(Storage.get(Store.repo), listId, itemId));
};

const setupButtonListeners = (operation: 'toggle' | 'modify' | 'remove'): void => {
    const buttons = $$(
        `[data-filter-result-item-button="${operation}"]`,
        HTMLButtonElement,
    );

    buttons.forEach((button) => {
        const { listId, itemId } = button.dataset;

        assert(
            listId && itemId,
            `Button "${button}" has no data for "${operation}" operation`,
        );

        button.addEventListener('click', () => {
            if (operation === 'toggle') toggle(listId, itemId);
            else if (operation === 'modify') modify(listId, itemId);
            else if (operation === 'remove') remove(listId, itemId);
        });
    });
};

const updateFilterResult = (
    repo: Repo.Repo,
    filter: (repo: Repo.Repo) => Repo.Repo,
): void => {
    Filter.result.innerHTML = '';

    filter(repo)
        .flatMap((list) => list.items.map((item) => ({ list, item })))
        .sort((a, b) => (a.item.title > b.item.title ? 1 : -1))
        .forEach(({ list, item }) => {
            Filter.result.insertAdjacentHTML(
                `beforeend`,
                `
                    <li class="item ${item.isCompleted ? 'completed' : 'incomplete'}">
                        <div class="block">
                            <span class="title">${item.title}</span>
                            <span>${list.name}</span>
                        </div>

                        <div class="block">
                            <span class="title">Priority</span>
                            <span class="priority priority-${item.priority.toLowerCase()}">${item.priority}</span>
                        </div>

                        ${
                            item.dueDate ?
                                `
                                    <div class="block">
                                        <span class="title">Due Date</span>
                                        <span>${item.dueDate}</span>
                                    </div>
                                `
                            :   ''
                        }

                        ${
                            item.description ?
                                `
                                     <div class="block description-block">
                                        <p class="title">Description</p>
                                        <p>${item.description}</p>
                                    </div>
                                `
                            :   ''
                        }
                        
                        <menu class="menu">
                            <li>
                                <button 
                                    class="toggle"
                                    data-list-id="${list.id}"
                                    data-item-id="${item.id}"
                                    data-filter-result-item-button="toggle"
                                    type="button"
                                >
                                    ${item.isCompleted ? 'Uncheck' : 'Check'}
                                </button>
                            </li>
                            <li>
                                <button 
                                    class="modify"
                                    data-list-id="${list.id}"
                                    data-item-id="${item.id}"
                                    data-filter-result-item-button="modify"
                                    type="button"
                                >
                                    Modify
                                </button>
                            </li>
                            <li>
                                <button 
                                    class="remove"
                                    data-list-id="${list.id}"
                                    data-item-id="${item.id}"
                                    data-filter-result-item-button="remove"
                                    type="button"
                                >
                                    Remove
                                </button>
                            </li>
                        </menu>
                    </li>
                `,
            );
        });

    const items = $$('li', HTMLLIElement, Filter.result);

    items.forEach((li) => {
        li.addEventListener('click', () => {
            items.forEach((item) => void item.classList.remove('selected'));
            li.classList.add('selected');
        });
    });

    setupButtonListeners('toggle');
    setupButtonListeners('modify');
    setupButtonListeners('remove');
};

const updateFilterListOptions = (repo: Repo.Repo): void => {
    Filter.listFieldset.innerHTML = '<legend>List</legend>';

    const filter = Storage.get(Store.filter);

    repo.forEach((list) => {
        const label = document.createElement('label');
        label.setAttribute('for', `filter-list-${list.id}`);
        label.textContent = toUpperFirstChar(list.name);

        const input = document.createElement('input');
        input.setAttribute('id', `filter-list-${list.id}`);
        input.setAttribute('name', 'list');
        input.setAttribute('value', list.id);
        input.setAttribute('type', 'checkbox');
        input.checked = filter.list.includes(list.id);

        label.appendChild(input);

        Filter.listFieldset.appendChild(label);
    });
};

Filter.dialog.addEventListener('close', () => {
    updateFilterListOptions(Storage.get(Store.repo));
});

Filter.open.addEventListener('click', () => {
    updateFilterListOptions(Storage.get(Store.repo));
    Filter.dialog.showModal();
});

Filter.close.addEventListener('click', () => {
    Filter.dialog.close();
});

Filter.form.addEventListener('submit', () => {
    updateFilterResult(Storage.get(Store.repo), filter);
    Filter.dialog.close();
});

Filter.search.addEventListener('input', () => {
    const items = $$('& > li', HTMLLIElement, Filter.result);

    const query = Filter.search.value.toLowerCase();

    items.forEach((item) => {
        const title = $('.title', HTMLSpanElement, item).textContent!.toLowerCase();
        item.style.display = fuzzyMatch(title, query) ? 'flex' : 'none';
    });
});

Filter.modifyDialog.addEventListener('close', () => {
    Filter.modifyForm.reset();
});

Filter.modifyClose.addEventListener('click', () => {
    Filter.modifyDialog.close();
});

Filter.modifyForm.addEventListener('submit', () => {
    const { listId, itemId } = Filter.modifyForm.dataset;

    assert(
        listId && itemId,
        `Dataset of "filter-modify-form" not fulfilled, got: listId: ${listId}, itemId: ${itemId}`,
    );

    dispatchRepoEvent(
        Repo.modifyItem(
            Storage.get(Store.repo),
            listId,
            itemId,
            Item.make({
                title: Filter.modifyTitle.value,
                priority: Item.Priority[Filter.modifyPriority.value as Item.PriorityKeys],
                dueDate: Filter.modifyDueDate.value || undefined,
                description: Filter.modifyDescription.value || undefined,
            }),
        ),
    );

    Filter.modifyForm.dataset.listId = undefined;
    Filter.modifyForm.dataset.itemId = undefined;
});
