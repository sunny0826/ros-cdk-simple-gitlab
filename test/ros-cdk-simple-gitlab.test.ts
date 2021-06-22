import { expect as expectCDK, matchTemplate, MatchStyle } from '@alicloud/ros-cdk-assert';
import * as ros from '@alicloud/ros-cdk-core';
import * as RosCdkSimpleGitlab from '../lib/ros-cdk-simple-gitlab-stack';

test('Stack with version.', () => {
  const app = new ros.App();
  // WHEN
  const stack = new RosCdkSimpleGitlab.RosCdkSimpleGitlabStack(app, 'MyTestStack');
  // THEN
  expectCDK(stack).to(
    matchTemplate(
      {
        ROSTemplateFormatVersion: '2015-09-01',
        Description: "This is the simple ros cdk app example."
      },
      MatchStyle.EXACT,
    ),
  );
});
