"use client";

/* src/app/superadmin/layout.tsx */
import React from 'react';
import { DashboardSquare02Icon, UserGroupIcon, DocumentValidationIcon, FolderOpenIcon, ScanIcon } from 'hugeicons-react';
import DashboardShell from '@/components/Dashboard/DashboardShell';

const navItems = [
    { href: '/superadmin', icon: DashboardSquare02Icon, label: 'Dashboard', exact: true },
    { href: '/superadmin/users', icon: UserGroupIcon, label: 'User Management', exact: false },
    { href: '/superadmin/logs', icon: DocumentValidationIcon, label: 'Activity Logs', exact: false },
    { href: '/admin/sessions', icon: FolderOpenIcon, label: 'Kelola Sesi', exact: false },
    { href: '/warehouse', icon: ScanIcon, label: 'Mode Scanning', exact: false },
];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <DashboardShell
            navItems={navItems}
            roleLabel="Super Administrator"
            requiredRoles={['SUPER_ADMIN']}
        >
            {children}
        </DashboardShell>
    );
}
