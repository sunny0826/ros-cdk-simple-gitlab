#!/usr/bin/env node
import * as ros from '@alicloud/ros-cdk-core';
import { RosCdkSimpleGitlabStack } from '../lib/ros-cdk-simple-gitlab-stack';

const app = new ros.App({outdir: './cdk.out'});
new RosCdkSimpleGitlabStack(app, 'RosCdkSimpleGitlabStack');
app.synth();