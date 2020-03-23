// import rollup from 'rollup';
import typescript from 'rollup-plugin-typescript2';
// import * as generatePackageJson from 'rollup-plugin-generate-package-json';
import autoExternal from 'rollup-plugin-auto-external';
// import multiInput from 'rollup-plugin-multi-input';
import glob from 'glob';
import { dirname, join } from 'path';

// const packages = glob.sync('./packages/*-cli/package.json');
const packages = glob.sync('./packages/{*,plugins/*/*,presets/*,utils/*}/package.json');
// const packages = glob.sync('./packages/plugins/other/*/package.json');
// const input = {};
// packages.forEach((pkgPath) => {
//   const pkg = require(pkgPath);
//   const pkgDir = dirname(pkgPath);
//   input[join(pkgDir, 'dist/index')] = join(pkgDir, 'src/index.ts');
//   // input[join(pkgDir, 'dist/index')] = join(pkgDir, 'src/index.ts');
// });
// const input = packages.map((pkgPath) => {
//   const pkg = require(pkgPath);
//   const pkgDir = dirname(pkgPath);
//   return join(pkgDir, 'src/index.ts');
//   // input[join(pkgDir, 'dist/index')] = join(pkgDir, 'src/index.ts');
// });

console.log('packages', packages);

const options = { input: '', bin: {} };
const output = 'dist2';

// const rollupOptions = {
//   input: input,
//   plugins: [
//     typescript({
//       check: false,
//       // objectHashIgnoreUnknownHack: true,
//       tsconfigOverride: {
//         compilerOptions: {
//           outDir: output,
//           rootDir: '.',
//           paths: [],
//         },
//       },
//       // useTsconfigDeclarationDir: true,
//     }),
//     autoExternal(),
//     // multiInput({
//     //   relative: 'src/',
//     //   transformOutputPath: (output, input) => {
//     //     console.log('transformOutputPath', input, output)
//     //     return output;
//     //   },
//     // }),
//     // generatePackageJson({
//     //   baseContents: rewritePackageJson({
//     //     pkg,
//     //     preserved: [],
//     //   }),
//     //   additionalDependencies: Object.keys(pkg.dependencies || {}),
//     // }),
//   ],
//   output: [
//     {
//       preferConst: true,
//       sourcemap: options.sourcemap,
//       // dir: join(cwd, output),
//       // file: join(cwd, pkg.main),
//       dir: output,
//       entryFileNames: '[name].cjs.js',
//       // entryFileNames: 'dist2/[name].cjs.js',
//       format: 'cjs',
//     },
//     {
//       preferConst: true,
//       sourcemap: options.sourcemap,
//       // dir: join(cwd, output),
//       // file: join(cwd, pkg.module),
//       dir: output,
//       entryFileNames: '[name].esm.js',
//       // entryFileNames: 'dist2/[name].cjs.js',
//       format: 'esm',
//     },
//   ],
// };

function rollupConfig(pkgPath) {
  const pkg = require(pkgPath);

  const cwd = dirname(pkgPath);
  // console.log('build', cwd, resolve(cwd));
  return {
    input: join(cwd, 'src/index.ts'),
    inlineDynamicImports: true,
    plugins: [
      typescript({
        // cwd: resolve(cwd),
        // verbosity: 3,

        check: false,
        // objectHashIgnoreUnknownHack: true,
        tsconfigOverride: {
          compilerOptions: {
            baseUrl: cwd,
            declarationDir: cwd,
          },
          files: [join(cwd, 'src/index.ts')],
          include: ['src'],
        },
        // useTsconfigDeclarationDir: true,
      }),
      autoExternal(),
      // generatePackageJson({
      //   baseContents: rewritePackageJson({
      //     pkg,
      //     preserved: [],
      //   }),
      //   additionalDependencies: Object.keys(pkg.dependencies || {}),
      // }),
    ],
    output: [
      {
        preferConst: true,
        sourcemap: options.sourcemap,
        // dir: join(cwd, output),
        file: join(cwd, pkg.main),
        // dir: 'dist2',
        // entryFileNames: '[name].cjs.js',
        // chunkFileNames: '[name].cjs.js',
        format: 'cjs',
      },
      {
        preferConst: true,
        sourcemap: options.sourcemap,
        // dir: join(cwd, output),
        file: join(cwd, pkg.module),
        // entryFileNames: '[name].esm.js',
        // dir: 'dist2',
        format: 'esm',
      },
    ],
  };
}
// const rollupOptions = rollupConfig(packages[0]);
const rollupOptions = packages.map((pkgPath) => {
  return rollupConfig(pkgPath);
});

export default rollupOptions;
