interface PluginOptions {
}

type AnchorOptions = Array<AnchorOption | string>;

interface AnchorOption {
    key: string;

    /** Converted to the name of the route, the default is the same as the key. */
    name?: string;

    /** Default value for the key. */
    defaults?: BasicType | ((key: string) => BasicType);

    /** The callback function before update, does not affect the update function. */
    beforeUpdate?: (key: string, value: any) => void;

    /**
     * If it returns true, the execution continues.
     * If it returns false, the execution is interrupted and the original value is cleared.
     * If it returns null, the interrupt execution does not execution any operations.
     */
    updateCheck?: (key: string, value: any) => boolean | null;

    /** The callback function after update, does not affect the update function. */
    afterUpdate?: (key: string, value: any) => void;

    /** The callbach function before restore, does not affect the restore function. */
    beforeRestore?: (key: string, value: any) => void;

    /** Custom restore function, defaults to the set property of data. */
    restore?: (key: string, value: any) => void;


    /** The callbach function after restore, does not affect the restore function. */
    afterRestore?: (key: string, value: any) => void;
}

type BasicType = string | number | boolean | null | undefined;
