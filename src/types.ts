export type ApplicationStatus = 'Interested' | 'Applied' | 'Interview' | 'Accepted' | 'Rejected' | 'Enrolled';

export interface Application {
    id: string;
    university: string;
    course: string;
    deadline: string;
    status: ApplicationStatus;
    uniAssist: boolean;
    vpdRequired: boolean;
    documents: Record<string, boolean>;
    notes: string;
}

export type Stats = {
    total: number;
    applied: number;
    accepted: number;
    pending: number;
};

export interface User {
    isAuthenticated: boolean;
    name: string;
    email: string;
}

export interface RegisteredUser {
    name: string;
    email: string;
    password: string;
}
