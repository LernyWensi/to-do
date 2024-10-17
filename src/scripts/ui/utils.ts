export { $, $$, dispathRepoEvent };

import { assert } from '../utils';
import { Repo } from '../tada';

const dispathRepoEvent = (repo: Repo.Repo): void => {
    window.dispatchEvent(new CustomEvent('repo', { detail: { repo } }));
};

const $ = <T extends typeof Element>(
    selector: string,
    type: T,
    scope: Element | Document = document,
): InstanceType<T> => {
    const element = scope.querySelector(selector);

    assert(element instanceof type, `Selector "${selector}" didn't match any elements`);

    return element as InstanceType<T>;
};

const $$ = <T extends typeof Element>(
    selector: string,
    type: T,
    scope: Element | Document = document,
): ReadonlyArray<InstanceType<T>> => {
    const element = scope.querySelectorAll(selector);

    return [...element].filter((element) => element instanceof type) as InstanceType<T>[];
};
