export type { Filter };

export { repo, filter };

import { Repo, List, Item } from './tada';
import * as Storage from './storage';
import { Priority } from './tada/item';

const repo = Storage.make(
    'repo',
    Repo.make([
        List.make('Weekly Workouts', [
            Item.make({
                title: 'Hit the gym for a full-body workout',
                description: 'let’s get those gains!',
                priority: Priority.High,
                dueDate: '2024-10-24',
            }),
            Item.make({
                title: 'Go for a run in the park',
                description: 'because cardio is life',
                priority: Priority.Low,
                dueDate: '2024-10-24',
            }),
            Item.make({ title: 'Join a yoga class', description: 'time to find my zen' }),
        ]),
        List.make('Weekend Projects', [
            Item.make({
                title: 'Clean out the garage',
                priority: Priority.Low,
                dueDate: '2024-10-18',
            }),
            Item.make({
                title: 'Organize the closet',
                description: 'find those lost clothes!',
                priority: Priority.Medium,
            }),
            Item.make({ title: 'Do laundry' }),
        ]),
    ]),
);

type Filter = {
    completion: List.FilterCompletion;
    priority: List.FilterPriority;
    dueDate: List.FilterDueDate;
    list: string[];
};

const filter = Storage.make<Filter>('filter', {
    completion: {},
    priority: {},
    dueDate: {},
    list: [],
});
