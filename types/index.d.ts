interface PluginOptions {
    /**
     * Mapping from key to name. Defaults is `key => key.slice(key.lastIndexOf('.') + 1)`
     * @returns The mapped name.
     * If it is empty string and the value of key is Object, cancel anchor.
     * If it is empty string and the value of key is not Object, ignore.
     */
    rename?: (this: Vue, key: string) => string;

    /**
     * If it returns true, the execution continues.
     * If it returns false, the execution is interrupted and the original value is cleared.
     * If it returns null, the interrupt execution does not execution any operations.
     */
    updateCheck?: (this: Vue, key: string, value: any) => boolean | null;

    /** Custom restore function, defaults to the set property of data. */
    restore?: (this: Vue, key: string, value: any) => void;
}

type AnchorOptions = Array<AnchorOption | string>;

interface AnchorOption {
    key: string;

    /**
     * Converted to the name of the route, the default is the same as the key.
     * When the value of key is Object:
     * mapping from key to name. Defaults is `key => key.slice(key.lastIndexOf('.') + 1)`
     * @returns The mapped name. If empty string, cancel anchor.
     */
    name?: string | ((this: Vue, key: string) => string);

    /** Default value for the key. */
    defaults?: BasicType | ((this: Vue, key: string) => BasicType);

    /**
     * If it returns true, the execution continues.
     * If it returns false, the execution is interrupted and the original value is cleared.
     * If it returns null, the interrupt execution does not execution any operations.
     */
    updateCheck?: (this: Vue, key: string, value: any) => boolean | null;

    /** Custom restore function, defaults to the set property of data. */
    restore?: (this: Vue, key: string, value: any) => void;
}

interface RegisteredOption {
    key: string;
    name: string;
    defaults?: BasicType | ((this: Vue, key: string) => BasicType);
    updateCheck: (this: Vue, key: string, value: any) => boolean | null;
    restore: (this: Vue, key: string, value: any) => void;
}

type BasicType = string | number | boolean | null | undefined;
