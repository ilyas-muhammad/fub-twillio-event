import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('clients', { schema: 'fttool' })
export class FubClient {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true, name: 'fub_api_key' })
    fubApiKey: string;

    @Column({ nullable: true, name: 'twilio_sid' })
    twilioSid: string;

    @Column({ nullable: true, name: 'twilio_auth_token' })
    twilioAuthToken: string;

    @Column({ nullable: true, name: 'twilio_sms_from' })
    twilioSmsFrom: string;

    @Column({ nullable: true, name: 'created_at' })
    createdAt: Date;

    @Column({ nullable: true, name: 'updated_at' })
    updatedAt: Date;
}
