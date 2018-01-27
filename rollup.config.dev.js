import path from 'path'
import fs from 'fs'

import alias from 'rollup-plugin-alias'
// this is the rollup plugin that adds babel as a compilation stage.
import babel from 'rollup-plugin-babel'

// when importing packages rollup does its best to figure out
// what is being exported from modules designed for commonjs. This process
// is imperfect and there are times that you need to manually specify what
// symbols should be imported.
import commonjs from 'rollup-plugin-commonjs'

// this is needed to allow rollup to find modules in the node_modules directory.
import nodeResolve from 'rollup-plugin-node-resolve'

// This is a simple utility plugin that allows you to make changes in the
// output code. Sometimes after all bundling is complete you need to make some
// final patches to make the code work.
import replace from 'rollup-plugin-replace'

import scss from 'rollup-plugin-scss'
import crass from 'crass'

import includePaths from 'rollup-plugin-includepaths'

export default {
  experimentalCodeSplitting: true,
  experimentalDynamicImport: true,
  input: ['./src/App.js', './src/ModuleA.js', './src/ModuleB.js'],
  output: {
    dir: './dev',
    format: 'system',
    sourcemap: true
  },
  treeshake: true,
  plugins: [
    scss({
      // Callback that will be called ongenerate with two arguments:
      // - styles: the contents of all style tags combined: 'body { color: green }'
      // - styleNodes: an array of style objects: { filename: 'body { ... }' }
      output: function (styles, styleNodes) {
        fs.writeFileSync('./dev/bundle.css', crass.parse(styles).pretty().toString())
      },
      // Determine if node process should be terminated on error (default: false)
      failOnError: true
    }),

    includePaths({
      paths: ['src']
    }),

    // If you don't patch this the "process" symbol required by react will
    // not be defined. All you need to do here is set that string to either
    // 'development' or 'production' depending on which kind of build you
    // are making.
    replace({
      'process.env.NODE_ENV': JSON.stringify('development'),
      'ENVIRONMENT': JSON.stringify('development')
    }),
    // replace before commonjs, because tree shaking may need to ifdef out imports before they come in

    alias({
      'react': path.resolve('./node_modules/preact-compat/src/index.js'),
      'react-dom': path.resolve('./node_modules/preact-compat/src/index.js'),
      'react-redux': path.resolve('./node_modules/preact-redux/dist/preact-redux.esm.js')
    }),

    nodeResolve({
      jsnext: true,
      main: true,
      browser: true,
      extensions: ['.js', '.jsx']
    }),

    commonjs({
      // where to search for modules when you import them. if the
      // module path is not given explicitly, rollup will search
      // for them here.
      include: ['node_modules/**'],
      exclude: ['node_modules/preact-portal/**'],

      // this is where you patch modules that don't export their symbols
      // cleanly.
      namedExports: {
        // https://github.com/rollup/rollup/issues/855#issuecomment-240482783
      }
    }),

    babel({
      babelrc: false,
      exclude: [
        // 'node_modules/firebase/**'
      ],
      plugins: [
        ['transform-class-properties'],
        ['transform-object-rest-spread'],
        ['syntax-dynamic-import'],
        ['external-helpers'],
        // presets: react
        ['syntax-jsx'],
        ['transform-react-jsx', {'pragma': 'ce'}],
        ['jsx-pragmatic', {
          module: 'preact-compat',
          import: 'ce',
          export: 'createElement'
        }],
        ['transform-react-display-name']
      ]
    })
  ]
}
