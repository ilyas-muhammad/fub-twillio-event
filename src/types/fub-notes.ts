export interface FubNote {
    id: number;
    created: Date;
    updated: Date;
    createdById: number;
    updatedById: number;
    createdBy: string;
    updatedBy: string;
    personId: number;
    showContent: boolean;
    subject: string;
    body: string;
    type: string;
    isHtml: number;
    actionPlanId?: number;
    isExternal: boolean;
    systemId: number;
    systemName: string;
}
