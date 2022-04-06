# vue-data-anchor

[![vue-data-anchor](https://img.shields.io/badge/VueDataAnchor-1.1-brightgreen.svg)](https://github.com/ren-wei/vue-data-anchor) [![Vue2](https://img.shields.io/badge/Vue-2.x-brightgreen.svg)](https://vuejs.org/) [![VueRouter](https://img.shields.io/badge/VueRouter-3.x-brightgreen.svg)](https://router.vuejs.org/) [![size](https://img.shields.io/badge/size-3.7k-brightgreen.svg)](https://github.com/ren-wei/vue-data-anchor)

Record the state of vue's data to the route. State is restored when refreshing or reloading elsewhere.

## Installation

```bash
npm install vue-data-anchor
# or
yarn add vue-data-anchor
```

## Usage

### import and install

```js
// main.js
import Vue from 'vue'
import VueRouter from 'vue-router'
import VueDataAnchor from 'vue-data-anchor'

Vue.use(VueRouter)
Vue.use(VueDataAnchor)
```

### Quickstart

We added an `anchor` option to vue to mark which data needs to be anchored.

Its value is an array, array items are allowed to be strings or objects.

For example:

```html
<template>
    <div>content</div>
</template>
<script>
export default {
    data() {
        return {
            name: 'anchor',
            count: 1,
            params: {
                pageNum: 1
            }
        };
    },
    anchor: ['name', 'count', { key: 'params.pageNum', name: 'pageNum' }]
};
</script>
```

> *Note:* The key is the value of data, and the name will be used as the name of this.$route.query[name]. Reference to [AnchorOptions](https://github.com/ren-wei/vue-data-anchor/blob/master/types/index.d.ts)

### Defaults

When state is default, value is not added to $route.query.

The default value is usually equal to the value at registration.

It can be configured using `defaults`.

For example:

```html
<template>
    <div>content</div>
</template>
<script>
export default {
    data() {
        return {
            name: 'anchor',
            count: 1,
            params: {
                pageNum: 1
            }
        };
    },
    anchor: [{ key: 'count', defaults: 2 }]
};
</script>
```

> *Note:* When refreshing, if the specified key does not exist in $route.query, even if the current value is not equal to the default value, it will not be restored to the default value.

## API

* `this.$anchor.register(anchorOptions: AnchorOptions = []): void;`

* `this.$anchor.unregister(key: string, clearRoute = true): boolean;`

* `this.$anchor.update(key: string): void;`

* `this.$anchor.restore(key: string): void;`

## Development

### Watch

```bash
yarn watch
```

### Tests

```bash
yarn test
```

### Tests with coverage

```bash
yarn test-c
```

### Build

Bundle the js to the `dist` folder:

```bash
yarn build
```


