interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
}
export declare class UploadController {
    uploadImage(file: MulterFile | undefined): Promise<{
        url: string;
        filename: string;
        size: number;
    }>;
}
export {};
