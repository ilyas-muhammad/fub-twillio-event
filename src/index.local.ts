import 'dotenv/config';

/**
 * File to test lambda function locally
 */

import { Context, SQSEvent } from 'aws-lambda';
// import { handler } from './lambdas/people-created-event';
// import { handler } from './lambdas/people-updated-event';
import { handler } from './lambdas/notes-created-event';

/**
 *
 * @run npm run dev
 */
async function execute() {
    const context = { awsRequestId: 'xxx' } as Context;
    const event: SQSEvent = {
        Records: [
            {
                messageId: 'd90fd5a5-fd9e-4ab0-979b-97a1e70c9587',
                receiptHandle:
                    'AQEB3Z4KHgpG7c/PG+QzcQ8+lfkZTtoS902r67GNes0Oo4JvcaEzkpTYoUzWTtbkhwbrJcxX36YvNW73oJXiNRnZjKHMkv9348JwBfLc9ES32IrK7w2RTXJ+Odl1mMIJCnuYGaiM61HxymbBRn3MmDHiOHqPytTwYSUNsZWP+OZRWncmPTBjyqrdq1/bItRLAtIM02WR6r3S+YyjCYLO0kKlYs0g4JZAEJ7CD8VXvDJnuDTBFPGv+5a9HaJRsxwF1LdksC5YYdEQ7uScKHm0gZFGLHyifN6S2J3x6vzooSR72gmUx1Bu43U3yu2arbwbykaO+40NjfsxK/Z43cXStWIlV+V7ZX5kJ9YTpqkOKujZtmZ4fYZXcns/WYEiwuw9eoPFaSMdVJyFCPScNlsGvfcHc8IkjXC0TbhV68XJYb7eR6Y=',
                // peopleCreated
                // body: JSON.stringify({
                //     eventId: '152d60c0-79da-4018-a9af-28aec8a71c94',
                //     eventCreated: '2016-12-12T15:19:21+00:00',
                //     event: 'peopleCreated',
                //     resourceIds: [13, 2],
                //     uri: 'https://api.followupboss.com/v1/people?id=13,2',
                // }),
                // notesCreated
                body: JSON.stringify({
                    eventId: 'dfcc6cc5-b843-419c-b006-24c0ad5d1f69',
                    eventCreated: '2023-04-03T13:01:34+00:00',
                    event: 'notesCreated',
                    resourceIds: [19],
                    uri: 'https://api.followupboss.com/v1/notes/19',
                }),
                // peopleUpdated
                // body: JSON.stringify({
                //     eventId: 'ec1535b3-4f1b-4c00-b04d-365d53fd71dd',
                //     eventCreated: '2023-04-03T12:56:29+00:00',
                //     event: 'peopleUpdated',
                //     resourceIds: [13, 2],
                //     uri: 'https://api.followupboss.com/v1/people?id=13,2',
                // }),
                attributes: {
                    ApproximateReceiveCount: '1',
                    SentTimestamp: '1602074535529',
                    SenderId: '123456789012',
                    ApproximateFirstReceiveTimestamp: '1602074535540',
                },
                messageAttributes: {},
                md5OfBody: '033bd94b1168d7e4f0d644c3c95e35bf',
                eventSource: 'aws:sqs',
                eventSourceARN: 'arn:aws:sqs:us-east-1:123456789012:WriteQueue-KJAGRBTIIB1Y',
                awsRegion: 'us-east-1',
            },
        ],
    };

    return handler(event, context, (err, result) => console.log(err, result));
}

execute();
