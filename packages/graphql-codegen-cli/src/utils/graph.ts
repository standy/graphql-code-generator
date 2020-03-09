import { Types, normalizeInstanceOrArray } from '@graphql-codegen/plugin-helpers';
import { DepGraph } from 'dependency-graph';
import { resolve } from 'path';
import minimatch from 'minimatch';
import { isString, isUrl, isGlob } from './helpers';

// 1. Generate DepGraph
// 2. Sort `generates` so they won't stuck waiting for each other (on max concurrency limit hit)
// 3. Shared Promise per each output (so we know when output is generated)

type Graph = {
  config: Types.ConfiguredOutput;
  markAsReady: () => void;
  markAsFailed: (error: any) => void;
  isCompleted: Promise<void>;
};

// Generate graph of dependencies

export function createGraph({ generates, cwd }: { generates: { [filename: string]: Types.ConfiguredOutput }; cwd: string }) {
  const graph = new DepGraph<Graph>({
    circular: false,
  });

  for (const output in generates) {
    if (generates.hasOwnProperty(output)) {
      const config = generates[output];
      let markAsReady: () => void;
      let markAsFailed: (error: any) => void;
      const isCompleted = new Promise<void>((r, e) => {
        markAsReady = r;
        markAsFailed = e;
      });

      graph.addNode(output, {
        config,
        markAsReady,
        markAsFailed,
        isCompleted,
      });
    }
  }

  const isStringOrGlob = (val: any): val is string => isString(val) && !isUrl(val);
  const matchFile = (src: string, pointer: string): boolean => {
    if (isGlob(pointer)) {
      return minimatch(src, pointer);
    }

    return resolve(cwd, pointer) === resolve(cwd, src);
  };

  function findDependencies(src: string) {
    Object.keys(generates)
      .filter(key => key !== src)
      .forEach(output => {
        const { config } = graph.getNodeData(output);
        const outputSpecificSchemas: string[] = normalizeInstanceOrArray<Types.Schema>(config.schema).filter(isStringOrGlob);
        const outputSpecificDocuments = normalizeInstanceOrArray<Types.OperationDocument>(config.documents).filter(isStringOrGlob);

        outputSpecificSchemas.forEach(pointer => {
          if (matchFile(src, pointer)) {
            graph.addDependency(output, src);
          }
        });

        outputSpecificDocuments.forEach(pointer => {
          if (matchFile(src, pointer)) {
            graph.addDependency(output, src);
          }
        });
      });
  }

  // Look for dependencies
  for (const output in generates) {
    if (generates.hasOwnProperty(output)) {
      findDependencies(output);
    }
  }

  return graph;
}

export async function waitForDependencies({ graph, output }: { graph: DepGraph<Graph>; output: string }): Promise<void> {
  await Promise.all(
    graph
      .dependenciesOf(output)
      .filter(Boolean)
      .map(dep => graph.getNodeData(dep).isCompleted)
  );
}
