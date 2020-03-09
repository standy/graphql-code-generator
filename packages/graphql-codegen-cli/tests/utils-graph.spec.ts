import { createGraph } from '../src/utils/graph';

describe('Graph', () => {
  it('should put outputs in a proper order (static files)', () => {
    const fooFile = './foo.ts';
    const schemaFile = 'schema.graphql';

    const graph = createGraph({
      generates: {
        [fooFile]: {
          schema: './schema.graphql',
          plugins: {},
        },
        [schemaFile]: {
          plugins: {},
        },
      },
      cwd: process.cwd(),
    });

    expect(graph.overallOrder()).toEqual([schemaFile, fooFile]);
  });

  it('should put outputs in a proper order (glob)', () => {
    const fooFile = './foo.ts';
    const schemaFile = 'schema.graphql';

    const graph = createGraph({
      generates: {
        [fooFile]: {
          schema: ['*.graphql'],
          plugins: {},
        },
        [schemaFile]: {
          plugins: {},
        },
      },
      cwd: process.cwd(),
    });

    expect(graph.overallOrder()).toEqual([schemaFile, fooFile]);
  });

  it('should put outputs in a proper order (url)', () => {
    const fooFile = './foo.ts';
    const schemaFile = 'schema.graphql';

    const graph = createGraph({
      generates: {
        [fooFile]: {
          schema: 'http://api.com',
          plugins: {},
        },
        [schemaFile]: {
          plugins: {},
        },
      },
      cwd: process.cwd(),
    });

    expect(graph.overallOrder()).toEqual([fooFile, schemaFile]);
  });
});
