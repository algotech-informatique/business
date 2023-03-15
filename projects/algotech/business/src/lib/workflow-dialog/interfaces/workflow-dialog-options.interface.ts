export interface WorkflowDialogOptions {
    position?: {
        top: number,
        right: number,
    };
    actions: {
        caption?: string,
        icon: string,
        color: string,
        disabled: boolean,
        onClick: () => void,
    }[];
}
