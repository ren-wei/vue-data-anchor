interface PluginOptions {
    // Golbal lifecycle functions

    /** The callback function before update, does not affect the update function. */
    beforeUpdate?: (this: Vue, key: string, value: any) => void;

    /**
     * If it returns true, the execution continues.
     * If it returns false, the execution is interrupted and the original value is cleared.
     * If it returns null, the interrupt execution does not execution any operations.
     */
    updateCheck?: (this: Vue, key: string, value: any) => boolean | null;

    /** The callback function after update, does not affect the update function. */
    afterUpdate?: (this: Vue, key: string, value: any) => void;

    /** The callbach function before restore, does not affect the restore function. */
    beforeRestore?: (this: Vue, key: string, value: any) => void;

    /** Custom restore function, defaults to the set property of data. */
    restore?: (this: Vue, key: string, value: any) => void;

    /** The callbach function after restore, does not affect the restore function. */
    afterRestore?: (this: Vue, key: string, value: any) => void;
}

type AnchorOptions = Array<AnchorOption | string>;

interface AnchorOption {
    key: string;

    /** Converted to the name of the route, the default is the same as the key. */
    name?: string;

    /** Default value for the key. */
    defaults?: BasicType | ((this: Vue, key: string) => BasicType);

    /** The callback function before update, does not affect the update function. */
    beforeUpdate?: (this: Vue, key: string, value: any) => void;

    /**
     * If it returns true, the execution continues.
     * If it returns false, the execution is interrupted and the original value is cleared.
     * If it returns null, the interrupt execution does not execution any operations.
     */
    updateCheck?: (this: Vue, key: string, value: any) => boolean | null;

    /** The callback function after update, does not affect the update function. */
    afterUpdate?: (this: Vue, key: string, value: any) => void;

    /** The callbach function before restore, does not affect the restore function. */
    beforeRestore?: (this: Vue, key: string, value: any) => void;

    /** Custom restore function, defaults to the set property of data. */
    restore?: (this: Vue, key: string, value: any) => void;

    /** The callbach function after restore, does not affect the restore function. */
    afterRestore?: (this: Vue, key: string, value: any) => void;
}

type BasicType = string | number | boolean | null | undefined;
