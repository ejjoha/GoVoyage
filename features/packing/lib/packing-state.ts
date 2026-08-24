import type {
    PackingListItem,
} from "../types/packing.types";

export type ItemsByList = Record<string, PackingListItem[]>;

export function getItemFromList(
    itemsByList: ItemsByList,
    listId: string,
    itemId: string
): PackingListItem | undefined {
    return (itemsByList[listId] ?? []).find((item) => item.id === itemId);
}

export function appendItemToList(
    itemsByList: ItemsByList,
    listId: string,
    item: PackingListItem
): ItemsByList {
    return {
        ...itemsByList,
        [listId]: [...(itemsByList[listId] ?? []), item],
    };
}

export function appendItemsToList(
    itemsByList: ItemsByList,
    listId: string,
    items: PackingListItem[]
): ItemsByList {
    return {
        ...itemsByList,
        [listId]: [
            ...(itemsByList[listId] ?? []),
            ...items,
        ],
    };
}

export function updateItemInList(
    itemsByList: ItemsByList,
    listId: string,
    itemId: string,
    update: Partial<PackingListItem>
): ItemsByList {
    return {
        ...itemsByList,
        [listId]: (itemsByList[listId] ?? []).map((item) =>
            item.id === itemId
                ? {
                    ...item,
                    ...update,
                }
                : item
        ),
    };
}

export function removeItemFromList(
    itemsByList: ItemsByList,
    listId: string,
    itemId: string
): ItemsByList {
    return {
        ...itemsByList,
        [listId]: (itemsByList[listId] ?? []).filter(
            (item) => item.id !== itemId
        ),
    };
}

export function removeItemsFromList(
    itemsByList: ItemsByList,
    listId: string,
    itemIds: string[]
): ItemsByList {
    return {
        ...itemsByList,
        [listId]: (itemsByList[listId] ?? []).filter(
            (item) => !itemIds.includes(item.id)
        ),
    };
}

export function replaceListItems(
    itemsByList: ItemsByList,
    listId: string,
    items: PackingListItem[]
): ItemsByList {
    return {
        ...itemsByList,
        [listId]: items,
    };
}

export function removeListFromItemsByList(
    itemsByList: ItemsByList,
    listId: string
): ItemsByList {
    const next = { ...itemsByList };
    delete next[listId];
    return next;
}