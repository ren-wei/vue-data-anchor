interface PluginOptions {
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

    /** Converted to the name of the route, the default is the same as the key. */
    name?: string;

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

type BasicType = string | number | boolean | null | undefined;
