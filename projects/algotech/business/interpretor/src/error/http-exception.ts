export class ATHttpException extends Error {
    __proto__: Error;
    status: number;
    error: any;
    url: string;
    constructor(url: string, status: number, data: any, message: string) {
        const trueProto = new.target.prototype;

        let asObject;
        try {
            asObject = JSON.parse(data);
        } catch (e) {
        }

        const error = data ? (asObject ? JSON.stringify(asObject) : data) : message;
        super(`${error}`);
        this.url = url;
        this.status = status;
        this.error = asObject ? asObject : data;

        // Alternatively use Object.setPrototypeOf if you have an ES6 environment.
        this.__proto__ = trueProto;
    }
}