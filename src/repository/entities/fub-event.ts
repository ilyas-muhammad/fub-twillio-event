import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('fub_events', { schema: 'fttool' })
export class FubEvent {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'fub_event_id' })
    fubEventId: string;

    @Column({ name: 'client_id' })
    clientId: number;

    @Column({ name: 'person_id', nullable: true })
    personId: number;

    @Column({ name: 'note_id', nullable: true })
    noteId: number;

    @Column('json', { name: 'event_details' })
    eventDetails: Record<string, unknown>;

    @Column('json', { name: 'changes', nullable: true })
    changes: Record<string, unknown>;

    @Column({ name: 'event-type' })
    eventType: string;

    @Column({ name: 'created_at' })
    createdAt: Date;

    @Column({ nullable: true, name: 'updated_at' })
    updatedAt: Date;
}
