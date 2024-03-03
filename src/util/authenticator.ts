export function authenticator<T>(val: T): asserts val is NonNullable<T> {
    if (!val) {
        throw Error("'val' is undefined");
    }
}