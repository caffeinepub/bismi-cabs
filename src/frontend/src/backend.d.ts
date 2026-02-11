import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface BookingLead {
    customerName: string;
    customerPhone: string;
    createdAt: Time;
    createdBy: Principal;
    dropLocation: string;
    leadId: bigint;
    notes?: string;
    pickupDateTime: string;
    pickupLocation: string;
}
export interface RateCard {
    originalFileName: string;
    contentType: string;
    file: ExternalBlob;
    uploadedAt: Time;
    uploadedBy: Principal;
}
export interface UserProfile {
    dp?: ExternalBlob;
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAuthorizedStaff(staff: Principal): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createBookingLead(customerName: string, customerPhone: string, pickupLocation: string, dropLocation: string, pickupDateTime: string, notes: string | null): Promise<BookingLead>;
    getBookingLeads(): Promise<Array<BookingLead>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCurrentUserType(): Promise<string>;
    getLatestRateCard(): Promise<RateCard | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    removeAuthorizedStaff(staff: Principal): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    uploadDp(blob: ExternalBlob): Promise<void>;
    uploadRateCard(file: ExternalBlob, originalFileName: string, contentType: string): Promise<void>;
}
