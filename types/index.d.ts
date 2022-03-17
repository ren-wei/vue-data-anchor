interface PluginOptions {
}

type AnchorOptions = Array<AnchorOption | string>;

interface AnchorOption {
    key: string;
    defaults?: string; // Default value for the key.
    name?: string; // Converted to the name of the route, the default is the same as the key.
}
