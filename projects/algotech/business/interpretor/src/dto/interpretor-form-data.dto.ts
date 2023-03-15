export class InterpretorFormData {
    type: 'formData' | 'JSON'
    data: InterpretorFormDataValue[] | any;
}

export class InterpretorFormDataValue {
    key: string;
    value: any;
    fileName?: string;
}
