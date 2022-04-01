import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import packageJSON from './package.json';

const commonConfig = {
    input: 'src/index.ts',
    plugins: [commonjs(), typescript({ tsconfig: 'tsconfig.json' })],
};

const outputList = [
    {
        file: packageJSON.main,
        format: 'umd',
    },
    {
        file: packageJSON.main.slice(0, packageJSON.main.lastIndexOf('.js')) + '.min.js',
        format: 'umd',
        plugins: [terser()],
    },
    {
        file: packageJSON.module,
        format: 'esm',
    },
];

const buildConf = options => Object.assign({}, commonConfig, options);

export default outputList.map(output => buildConf({
    output: { name: packageJSON.name, ...output },
}));
