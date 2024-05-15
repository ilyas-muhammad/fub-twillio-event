export interface TwilioMessage {
    /** ex: SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
    MessageSid: string;
    /** ex: SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
    SmsSid: string;
    /** ex: ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
    AccountSid: string;
    /** ex: MGXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
    MessagingServiceSid: string;
    /** ex: +14017122661 */
    From: string;
    /** ex: +15558675310 */
    To: string;
    /** ex: body message */
    Body: string;
    /** number of media */
    NumMedia: number;
}
