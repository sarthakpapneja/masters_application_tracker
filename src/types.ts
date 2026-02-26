export type ApplicationStatus = 'Interested' | 'Applied' | 'Interview' | 'Accepted' | 'Rejected' | 'Enrolled';

export interface Application {
    id: string;
    university: string;
    course: string;
    deadline: string;
    status: ApplicationStatus;
    uniAssist: boolean;
    vpdRequired: boolean;
    documents: {
        sop: boolean;
        lor1: boolean;
        lor2: boolean;
        transcript: boolean;
        cv: boolean;
        languageCert: boolean;
    };
    notes: string;
}

export type Stats = {
    total: number;
    applied: number;
    accepted: number;
    pending: number;
};
