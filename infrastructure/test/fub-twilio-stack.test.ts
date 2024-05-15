import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as FubTwilio from '../lib/fub-twilio-tools-stack';

test('SQS Created', () => {
  const app = new cdk.App();
  const stack = new FubTwilio.FubTwilioToolsStack(app, 'MyTestStack');

  const template = Template.fromStack(stack);

  // SQS
  template.resourceCountIs('AWS::SQS::Queue', 4);

  // API Gateway REST API
  template.resourceCountIs('AWS::ApiGateway::Method', 4);
});
