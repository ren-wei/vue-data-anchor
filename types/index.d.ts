interface PluginOptions {
}

type AnchorOptions = Array<AnchorOption | string>;

interface AnchorOption {
    key: string;
    name?: string; // Converted to the name of the route, the default is the same as the key.
    defaults?: BasicType | ((key: string) => BasicType); // Default value for the key.
}

type BasicType = string | number | boolean | null | undefined;
