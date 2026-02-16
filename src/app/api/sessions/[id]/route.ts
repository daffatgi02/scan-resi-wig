// src/app/api/sessions/[id]/route.ts
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
        const { name } = await req.json();

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const sessionData = await getSession();
        if (!sessionData) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (sessionData.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const session = await SessionService.updateSession(id, name);

        // Log activity
        const ipAddress = getClientIP(req.headers);
        await logActivity({
            userId: sessionData.userId,
            action: 'UPDATE_SESSION',
            details: { sessionId: id, newName: name },
            ipAddress
        });

        return NextResponse.json(session);
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

        // Get session name before deleting for logging
        const session = await SessionService.getSession(id);
        const sessionName = session?.name || id;

        await SessionService.deleteSession(id);

        // Log activity
        const ipAddress = getClientIP(req.headers);
        await logActivity({
            userId: sessionData.userId,
            action: 'DELETE_SESSION',
            details: { sessionId: id, sessionName },
            ipAddress
        });

        return NextResponse.json({ message: 'Session deleted successfully' });
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 }
        );
    }
}
