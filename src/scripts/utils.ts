export { assert, toUpperFirstChar, fuzzyMatch };

const assert: (statement: unknown, msg: string) => asserts statement = (
    statement,
    message,
) => {
    if (!statement) throw new Error(message);
};

const toUpperFirstChar = (string: string): string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

const fuzzyMatch = (string: string, query: string): boolean => {
    const str = string.toLowerCase();

    let lastMatch = -1;

    return [...query].every((char) => {
        lastMatch = str.indexOf(char, lastMatch + 1);
        return lastMatch !== -1;
    });
};
