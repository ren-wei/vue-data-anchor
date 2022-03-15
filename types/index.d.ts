interface PluginOptions {
}

type AnchorOptions = Array<AnchorOption | string>;

interface AnchorOption {
    key: string;
    defaults?: string; // Default value for the key.
}
