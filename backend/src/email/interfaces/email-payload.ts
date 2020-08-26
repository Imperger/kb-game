export interface EmailPayload {
    from: string;
    to: string;
    subject: string;
    html: string;
}