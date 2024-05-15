import R from 'ramda';

import { FUBResourceType } from '../constants';
import { dataSource, FubEvent } from '../repository';
import { FubNote, FubPeople } from '../types';
import { toSnakeCase } from './string';

type FindWhatChangeInput = {
    clientId: number;
    incomingResources: FubPeople[] | FubNote[];
    resourceType: FUBResourceType;
};

const diff = (original: Record<string, unknown>, incoming: Record<string, unknown>): Record<string, unknown> => {
    const differences = R.mergeWith(
        (left, right) =>
            R.equals(left, right)
                ? undefined
                : {
                      previous: left,
                      current: right,
                  },
        original,
        incoming,
    );

    return differences;
};

export const findWhatChanges = async (input: FindWhatChangeInput): Promise<Record<string, unknown>[]> => {
    const { clientId, incomingResources, resourceType } = input;
    if (!incomingResources.length) return [];

    const key = resourceType === FUBResourceType.PEOPLE ? 'personId' : 'noteId';
    const resourceIds = incomingResources.map((resource) => resource.id);
    const dbKey = toSnakeCase(key);
    const qb = dataSource.getRepository(FubEvent).createQueryBuilder('event');
    const previousResources = await qb
        .where(
            `event.id IN ${qb
                .subQuery()
                .select('MAX(id)')
                .from(FubEvent, 'eventMax')
                .where(`eventMax.${dbKey} IN (${resourceIds.join(',')})`)
                .groupBy(dbKey)
                .getQuery()}`,
        )
        .andWhere(`event.client_id = :clientId`, { clientId })
        .orderBy('event.id', 'DESC')
        .getMany();

    const changes = incomingResources.map((incomingResource) => {
        const previousResource = previousResources.find((resource) => resource[key] === incomingResource.id);

        const differences = diff(previousResource?.eventDetails ?? {}, incomingResource);
        return {
            resourceId: incomingResource.id,
            changes: differences,
        };
    });

    return changes;
};
