import * as cdk from 'aws-cdk-lib';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export const createMessageIntegration = (queue: sqs.Queue, integrationRole: cdk.aws_iam.Role) => new apigateway.AwsIntegration({
      service: 'sqs',
      path: `${process.env.CDK_DEFAULT_ACCOUNT}/${queue.queueName}`,
      integrationHttpMethod: 'POST',
      options: {
        credentialsRole: integrationRole,
        requestParameters: {
          'integration.request.header.Content-Type': "'application/x-www-form-urlencoded'",
        },
        requestTemplates: {
          'application/json': `Action=SendMessage&MessageBody=$util.urlEncode($input.body)&MessageBody.fubAccount=$util.escapeJavaScript($input.params(fub_account))&MessageAttribute.1.Name=fubAccount&MessageAttribute.1.Value.StringValue=$util.escapeJavaScript($input.params(fub_account)))`,
        },
        integrationResponses: [
          {
            statusCode: '202',
          },
          {
            statusCode: '400',
          },
          {
            statusCode: '500',
          },
        ]
      },
    });