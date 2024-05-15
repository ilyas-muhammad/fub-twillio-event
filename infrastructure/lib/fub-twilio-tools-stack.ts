import * as path from 'path';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Duration } from 'aws-cdk-lib';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

import { createMessageIntegration } from './helpers';


export class FubTwilioToolsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    /**
     * Steps
     * 1. Create API Gateway endpoints
     *  a. People created endpoint
     *  b. people updated endpoint
     *  c. notes created endpoint
     *  d. incoming message endpoint
     * 2. Create SQS queues
     *  a. People created queue
     *  b. People updated queue
     *  c. notes created queue
     *  d. incoming message queue
     * 3. Create event bridge rules
     *  a. schedule an event every minutes to check for new messages (trigger note executor lambda)
     * 4. Create lambdas
     *    a. People created event
     *      - put necessary env vars
     *      - grant permission to write to existing RDS db
     *    b. People updated event 
     */

    // people created queue
    const peopleCreatedQueue = new sqs.Queue(this, 'PeopleCreatedQueue', {
      queueName: 'people-created-queue',
      visibilityTimeout: Duration.seconds(60),
      encryption: sqs.QueueEncryption.KMS_MANAGED,
    });

    // people updated queue
    const peopleUpdatedQueue = new sqs.Queue(this, 'PeopleUpdatedQueue', {
      queueName: 'people-updated-queue',
      visibilityTimeout: Duration.seconds(60),
      encryption: sqs.QueueEncryption.KMS_MANAGED,
    });

    // notes created queue
    const notesCreatedQueue = new sqs.Queue(this, 'NotesCreatedQueue', {
      queueName: 'notes-created-queue',
      visibilityTimeout: Duration.seconds(60),
      encryption: sqs.QueueEncryption.KMS_MANAGED,
    });

    // incoming message queue
    const incomingMessageQueue = new sqs.Queue(this, 'IncomingMessageQueue', {
      queueName: 'incoming-message-queue',
      visibilityTimeout: Duration.seconds(60),
      encryption: sqs.QueueEncryption.KMS_MANAGED,
    });

    // integration role
    const integrationRole = new iam.Role(this, 'IntegrationRole', {
      assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
    });

    // grant sqs:SendMessage to integration role
    peopleCreatedQueue.grantSendMessages(integrationRole);
    peopleUpdatedQueue.grantSendMessages(integrationRole);
    notesCreatedQueue.grantSendMessages(integrationRole);
    incomingMessageQueue.grantSendMessages(integrationRole);

    // REST API
    const restApi = new apigateway.RestApi(this, 'RestApi', {
      description: 'FUB Twilio Tools Webhook API',
      restApiName: 'FUB Twilio Tools',
      cloudWatchRole: true,
      deployOptions: { stageName: 'v1' }
    });

    const methodOptions = {
      methodResponses: [
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
    }

    const webhookResource = restApi.root.addResource('webhook');
    // people created endpoint
    const peopleCreatedResource = webhookResource.addResource('people-created');
    const peopleCreatedMessageIntegration = createMessageIntegration(peopleCreatedQueue, integrationRole);
    peopleCreatedResource.addMethod('POST', peopleCreatedMessageIntegration, methodOptions);

    // people updated endpoint
    const peopleUpdatedResource = webhookResource.addResource('people-updated');
    const peopleUpdatedMessageIntegration = createMessageIntegration(peopleUpdatedQueue, integrationRole);
    peopleUpdatedResource.addMethod('POST', peopleUpdatedMessageIntegration, methodOptions);

    // notes created endpoint
    const notesCreatedResource = webhookResource.addResource('notes-created');
    const notesCreatedMessageIntegration = createMessageIntegration(notesCreatedQueue, integrationRole);
    notesCreatedResource.addMethod('POST', notesCreatedMessageIntegration, methodOptions);

    // incoming message endpoint
    const incomingMessageResource = webhookResource.addResource('incoming-message');
    const incomingMessageIntegration = createMessageIntegration(incomingMessageQueue, integrationRole);
    incomingMessageResource.addMethod('POST', incomingMessageIntegration, methodOptions);

    // const peopleCreatedEventConsumer = new NodejsFunction(this, 'PeopleCreatedEventConsumer', {
    //   memorySize: 256,
    //   timeout: cdk.Duration.minutes(1),
    //   runtime: lambda.Runtime.NODEJS_16_X,
    //   handler: 'handler',
    //   environment: {
    //     APP_LOG_LEVEL: 'debug',
    //     FUB_API_ENDPOINT: 'https://api.followupboss.com/v1',
    //     PG_USER: 'postgres',
    //     PG_HOST: '127.0.0.1',
    //     PG_PASSWORD: '',
    //     PG_DATABASE: 'fttool',
    //     PG_PORT: '5432',
    //   },
    //   tracing: lambda.Tracing.ACTIVE,
    //   architecture: lambda.Architecture.ARM_64,
    //   depsLockFilePath: path.join(__dirname, '../../src', 'package-lock.json'),
    //   bundling: {
    //     externalModules: ['aws-sdk', 'axios', 'date-fns-tz', 'pg', 'winston', 'ramda', 'reflex-metadata', 'typeorm', 'twilio']
    //   },
    //   entry: path.join(__dirname, '../../src/lambdas/people-created-event/index.ts')
    // });

    // const peopleCreatedEventSource = new lambdaEventSources.SqsEventSource(peopleCreatedQueue, {
    //   batchSize: 10,
    //   reportBatchItemFailures: true,
    // });
    // peopleCreatedEventConsumer.addEventSource(peopleCreatedEventSource);

    // Grant Lambda Access to RDS
    // peopleCreatedEventConsumer.addToRolePolicy(new iam.PolicyStatement({
    //   effect: iam.Effect.ALLOW,
    //   actions: [
    //     'rds-data:ExecuteStatement',
    //     'rds-data:BatchExecuteStatement',
    //     'rds-data:BeginTransaction',
    //     'rds-data:CommitTransaction',
    //     'rds-data:RollbackTransaction',
    //   ],
    //   resources: ['*'],
    // }));
  }
}
