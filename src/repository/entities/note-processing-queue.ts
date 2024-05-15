import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('note_processing_queue', { schema: 'fttool' })
export class NoteProcessingQueue {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'fub_event_id' })
    fubEventId: string;

    @Column({ name: 'client_id' })
    clientId: number;

    @Column({ name: 'fub_note_id' })
    fubNoteId: number;

    @Column({ name: 'fub_person_id' })
    fubPersonId: number;

    @Column({ name: 'message_body' })
    messageBody: string;

    @Column('json', { name: 'request_body', nullable: true })
    requestBody: Record<string, unknown>;

    @Column('json', { name: 'response_body', nullable: true })
    responseBody: Record<string, unknown>;

    @Index()
    @Column({ name: 'status' })
    status: number;

    @Column({ name: 'send_to_number' })
    sendToNumber: string;

    @Index()
    @Column({ name: 'timestamp' })
    timestamp: Date;

    @Column({ name: 'created_at' })
    createdAt: Date;

    @Column({ nullable: true, name: 'updated_at' })
    updatedAt: Date;
}
