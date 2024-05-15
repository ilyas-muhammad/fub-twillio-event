import { dataSource, FubClient } from '../../repository';

type Keys = { fubApiKey: string };
export const getKeysFromClientId = async (clientId: number): Promise<Keys> => {
    const { fubApiKey } = await dataSource.manager.findOneByOrFail(FubClient, { id: clientId });
    if (!fubApiKey) {
        throw new Error(`No FUB API Key in Client with id ${clientId} not found`);
    }

    return { fubApiKey };
};

export const getKeysFromClientTwilioNumber = async (twilioNumber: string): Promise<Keys> => {
    const { fubApiKey } = await dataSource.manager.findOneByOrFail(FubClient, { twilioSmsFrom: twilioNumber });
    if (!fubApiKey) {
        throw new Error(`No FUB API Key in Client with twilioNumber ${twilioNumber} not found`);
    }

    return { fubApiKey };
};
