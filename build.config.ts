import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    { input: 'src/index', name: 'index' },
    { input: 'src/cli/index', name: 'cli' },
  ],
  clean: true,
  declaration: true,
  externals: [
    'glob',
  ],
  rollup: {
    emitCJS: true,
  },
})
