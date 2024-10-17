export type { Item, PriorityKeys, ItemProps };

export { Priority, make, modify, toggle };

import { uid } from './utils';

enum Priority {
    None = 'None',
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
}

type PriorityKeys = keyof typeof Priority;

type Item = Readonly<{
    id: string;
    title: string;
    isCompleted: boolean;
    priority: Priority;
    description?: string;
    dueDate?: string;
}>;

type ItemProps = Omit<Item, 'id'>;

const make = ({
    title,
    isCompleted = false,
    priority = Priority.None,
    description,
    dueDate,
}: Pick<ItemProps, 'title'> & Partial<ItemProps>): Item => {
    return {
        id: uid(),
        title,
        isCompleted,
        priority,
        description,
        dueDate,
    };
};

const modify = (item: Item, props: Partial<ItemProps>): Item => {
    return {
        ...item,
        ...Object.fromEntries(
            Object.entries(props).filter(([, value]) => value !== undefined),
        ),
    };
};

const toggle = (item: Item): Item => {
    return modify(item, { isCompleted: !item.isCompleted });
};
