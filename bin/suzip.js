#!/usr/bin/env node
'use strict'
if (typeof __dirname !== 'undefined')
  require('../dist/cli.cjs')
else import('../dist/cli.mjs')
