import { OutputOptions, rollup, RollupOptions } from 'rollup';
import typescript from 'rollup-plugin-typescript2';
// import * as generatePackageJson from 'rollup-plugin-generate-package-json';
import autoExternal from 'rollup-plugin-auto-external';
import { dirname, join, resolve } from 'path';
import { readFileSync } from 'fs';

const options = { sourcemap: false };

const r = (pkgPath: string) => JSON.parse(readFileSync(pkgPath, 'utf8'));

function rollupConfig(pkgPath: string): RollupOptions {
  const pkg = r(pkgPath);

  const cwd = dirname(pkgPath);
  // console.log('build', cwd, resolve(cwd));
  return {
    input: join(cwd, 'src/index.ts'),
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
        // file: join(cwd, pkg.main),
        // dir: 'dist2',
        entryFileNames: '[name].cjs.js',
        format: 'cjs',
      },
      {
        preferConst: true,
        sourcemap: options.sourcemap,
        // dir: join(cwd, output),
        file: join(cwd, pkg.module),
        entryFileNames: '[name].esm.js',
        // dir: 'dist2',
        format: 'esm',
      },
    ],
  };
}

//  const rollupOptions = packages.map(pkgPath => {
//   return rollupConfig(pkgPath)
// })

// rollup(rollupConfig('./packages/plugins/other/add/package.json'))
//   .then((res) => {
//     return res.write({
//       preferConst: true,
//       sourcemap: options.sourcemap,
//       // dir: join(cwd, output),
//       file: 'test.js',
//       // dir: 'dist2',
//       format: 'cjs',
//     });
//   })
//   .then((x) => {
//     console.log('res', x);
//   })
//   .catch((e) => {
//     console.log('wtf?');
//   });

async function build(pkgPath: string) {
  const pkg = r(pkgPath);
  const cwd = dirname(pkgPath);
  const config = rollupConfig(pkgPath);

  // console.log('config', config);

  // create a bundle
  const bundle = await rollup(config);

  const outputOptions: OutputOptions[] = [
    {
      preferConst: true,
      sourcemap: options.sourcemap,
      // dir: join(cwd, output),
      file: join(cwd, pkg.main),
      // dir: 'dist2',
      format: 'cjs',
    },
    {
      preferConst: true,
      sourcemap: options.sourcemap,
      // dir: join(cwd, output),
      file: join(cwd, pkg.module),
      // dir: 'dist2',
      format: 'esm',
    },
  ];

  // console.log(bundle.watchFiles); // an array of file names this bundle depends on

  // generate code
  const { output } = await bundle.generate(outputOptions[0]);

  for (const chunkOrAsset of output) {
    if (chunkOrAsset.type === 'asset') {
      // For assets, this contains
      // {
      //   fileName: string,              // the asset file name
      //   source: string | UInt8Array    // the asset source
      //   type: 'asset'                  // signifies that this is an asset
      // }
      console.log('Asset', chunkOrAsset.fileName);
    } else {
      // For chunks, this contains
      // {
      //   code: string,                  // the generated JS code
      //   dynamicImports: string[],      // external modules imported dynamically by the chunk
      //   exports: string[],             // exported variable names
      //   facadeModuleId: string | null, // the id of a module that this chunk corresponds to
      //   fileName: string,              // the chunk file name
      //   imports: string[],             // external modules imported statically by the chunk
      //   isDynamicEntry: boolean,       // is this chunk a dynamic entry point
      //   isEntry: boolean,              // is this chunk a static entry point
      //   map: string | null,            // sourcemaps if present
      //   modules: {                     // information about the modules in this chunk
      //     [id: string]: {
      //       renderedExports: string[]; // exported variable names that were included
      //       removedExports: string[];  // exported variable names that were removed
      //       renderedLength: number;    // the length of the remaining code in this module
      //       originalLength: number;    // the original length of the code in this module
      //     };
      //   },
      //   name: string                   // the name of this chunk as used in naming patterns
      //   type: 'chunk',                 // signifies that this is a chunk
      // }
      console.log('Chunk', chunkOrAsset.fileName);
    }
  }

  // or write the bundle to disk
  // await bundle.write(outputOptions);
}

build('./packages/plugins/other/add/package.json');
