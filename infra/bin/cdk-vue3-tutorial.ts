#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkVue3TutorialStack } from '../lib/cdk-vue3-tutorial-stack';

const app = new cdk.App();
new CdkVue3TutorialStack(app, 'CdkVue3TutorialStack');
