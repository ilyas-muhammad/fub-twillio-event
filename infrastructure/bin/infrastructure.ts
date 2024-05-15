#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { FubTwilioToolsStack } from '../lib/fub-twilio-tools-stack';

const app = new cdk.App();
new FubTwilioToolsStack(app, 'FubTwilioToolsStack', {
    env: {
        region: process.env.CDK_DEFAULT_REGION,
        account: process.env.CDK_DEFAULT_ACCOUNT,
    },
});
