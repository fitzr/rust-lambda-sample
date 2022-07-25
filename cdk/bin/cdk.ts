#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { buildStack } from '../lib/stack'

const build = async () => {
  const app = new cdk.App()
  await buildStack(app, 'RustLambdaSample', {})
}

build()
