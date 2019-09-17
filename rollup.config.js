import { uglify } from 'rollup-plugin-uglify'
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'

export default {
    input: './src/index.js',
    output: [{
        file: './dist/index.common.js',
        format: 'cjs',
        sourceMap: true
    },{
        file: './dist/index.browser.js',
        format: 'umd',
        sourceMap: true,
        name: 'FePerformance'
    }],
    watch: {
        include: 'src/**'
    },
    plugins: [
        (process.env.NODE_ENV === 'production' && uglify()),
        babel({
            exclude: 'node_modules/**',
        }),
        resolve({
            jsnext: true,
            main: true,
            browser: true
        }),
        commonjs()
    ]
}