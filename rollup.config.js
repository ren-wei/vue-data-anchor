import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
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
        file: packageJSON.module,
        format: 'esm',
    },
];

const buildConf = options => Object.assign({}, commonConfig, options);

export default outputList.map(output => buildConf({
    output: { name: packageJSON.name, ...output },
}));
