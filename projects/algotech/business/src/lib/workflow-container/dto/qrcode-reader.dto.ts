export class QRCodeReaderDto {
    readerCode: string;
    success: boolean;
    denied: boolean;
    readTimeout: boolean;
    error?: Error;
}
