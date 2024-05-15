interface FubPeopleCollaborator {
    id: number;
    name: string;
    assigned: boolean;
    role: string;
}

interface FubPeopleEmail {
    value: string;
    type: string;
    isPrimary: number;
    status: string;
}

interface FubPeoplePhone {
    type: string;
    value: string;
    status: string;
    isPrimary: number;
    normalized: string;
    isLandline: boolean;
}

interface FubPeopleAddress {
    type: string;
    street: string;
    city: string;
    state: string;
    code: string;
    country: string;
}

export interface FubPeople {
    id: number;
    created: string;
    updated: string;
    createdVia: string;
    lastActivity: string;
    name: string;
    firstName: string;
    lastName: string;
    stage: string;
    source: string;
    sourceUrl: string;
    contacted: number;
    price: number;
    assignedLenderId?: number;
    assignedLenderName?: string;
    assignedUserId: number;
    assignedTo: string;
    tags: Array<string>;
    collaborators: Array<FubPeopleCollaborator>;
    emails: Array<FubPeopleEmail>;
    phones: Array<FubPeoplePhone>;
    addresses: Array<FubPeopleAddress>;
    picture: {
        small: string;
    };
}
