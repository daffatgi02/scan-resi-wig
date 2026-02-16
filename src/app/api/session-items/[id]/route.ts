// src/app/api/session-items/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SessionService } from '@/services/sessionService';
import { getErrorMessage, getClientIP } from '@/lib/utils';
import { getSession, logActivity } from '@/lib/auth';

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const data = await req.json();

        const sessionData = await getSession();
        if (!sessionData) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (sessionData.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // If status is being updated to SCANNED, ensure scannedAt and scannedById are set
        if (data.status === 'SCANNED' && !data.scannedAt) {
            data.scannedAt = new Date();
            data.scannedById = sessionData.userId;
        } else if (data.status === 'UNSCANNED') {
            data.scannedAt = null;
            data.scannedById = null;
        }

        const updatedItem = await SessionService.updateSessionItem(id, data);

        // Log activity
        const ipAddress = getClientIP(req.headers);
        await logActivity({
            userId: sessionData.userId,
            action: 'UPDATE_ITEM',
            details: { itemId: id, trackingId: updatedItem.trackingId, ...data },
            ipAddress
        });

        return NextResponse.json(updatedItem);
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const sessionData = await getSession();
        if (!sessionData) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (sessionData.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await SessionService.deleteSessionItem(id);

        // Log activity
        const ipAddress = getClientIP(req.headers);
        await logActivity({
            userId: sessionData.userId,
            action: 'DELETE_ITEM',
            details: { itemId: id },
            ipAddress
        });

        return NextResponse.json({ message: 'Item deleted successfully' });
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 }
        );
    }
}
