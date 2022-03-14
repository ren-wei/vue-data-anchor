interface PluginOptions {
    anchor: 'anchor'; // Properties used as component configuration items.
}

interface AnchorOptions {
    [name: string]: AnchorConfig | String; // If the type of the value is String, the value will be used as key of url.
}

interface AnchorConfig {
    key: string; // The value will be used as key of url.
}
