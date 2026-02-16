import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getClientIP(reqOrHeaders: Request | Headers): string {
    const headers = reqOrHeaders instanceof Request ? reqOrHeaders.headers : reqOrHeaders;
    const forwarded = headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return 'unknown';
}

export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return String(error);
}

export function getProgress(scanned: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((scanned / total) * 100);
}
