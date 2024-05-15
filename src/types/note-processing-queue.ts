export interface FuBNoteProcessingQueue {
    id: number;
    clientId: number;
    fubNoteId: number;
    fubPersonId: number;
    fubEventId: string;
    sendToNumber: string;
    status: number;
    responseBody?: Record<string, unknown>;
    timestamp: Date;
    createdAt: Date;
    updatedAt?: Date;
}
