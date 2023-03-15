export interface WorkflowDialogAnswer {
    icon?: string;
    className: string;
    title: string;
    message: string;
    onSet: () => void;
    onCancel: () => void;
}
