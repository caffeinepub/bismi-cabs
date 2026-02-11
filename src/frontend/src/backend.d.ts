import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
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
export type Time = bigint;
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createBookingLead(customerName: string, customerPhone: string, pickupLocation: string, dropLocation: string, pickupDateTime: string, notes: string | null): Promise<BookingLead>;
    getBookingLeads(): Promise<Array<BookingLead>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
