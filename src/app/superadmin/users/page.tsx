// src/app/superadmin/users/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Add01Icon,
    UserGroupIcon,
    PencilEdit02Icon,
    Delete02Icon,
    Cancel01Icon,
    Loading03Icon,
    UserCheck01Icon,
    UserBlock01Icon,
    SecurityCheckIcon,
    ArrowLeft01Icon,
    Store01Icon,
    UserIcon,
    Search01Icon
} from 'hugeicons-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from '@/components/ui/pagination';
import { toast } from 'sonner';

interface User {
    id: string;
    username: string;
    name: string;
    role: 'ADMIN' | 'WAREHOUSE' | 'SUPER_ADMIN';
    isActive: boolean;
    createdAt: string;
    _count?: {
        createdSessions: number;
        scannedItems: number;
    };
}

const roleLabels = {
    ADMIN: { label: 'Admin', icon: UserIcon, color: 'bg-blue-100 text-blue-700' },
    WAREHOUSE: { label: 'Warehouse', icon: Store01Icon, color: 'bg-green-100 text-green-700' },
    SUPER_ADMIN: { label: 'Super Admin', icon: SecurityCheckIcon, color: 'bg-red-100 text-red-700' }
};

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: '',
        role: 'ADMIN' as 'ADMIN' | 'WAREHOUSE' | 'SUPER_ADMIN'
    });
    const [saving, setSaving] = useState(false);

    // Pagination & Search
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const itemsPerPage = 10;

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            if (res.ok) {
                setUsers(await res.json());
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error("Gagal memuat data user");
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingUser(null);
        setFormData({ username: '', password: '', name: '', role: 'ADMIN' });
        setShowModal(true);
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            password: '',
            name: user.name,
            role: user.role
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
            const method = editingUser ? 'PUT' : 'POST';

            const body: any = {
                name: formData.name,
                role: formData.role
            };

            if (!editingUser) {
                body.username = formData.username;
                body.password = formData.password;
            } else if (formData.password) {
                body.password = formData.password;
            }

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                setShowModal(false);
                fetchUsers();
                toast.success(editingUser ? 'User berhasil diperbarui' : 'User baru berhasil dibuat');
            } else {
                const err = await res.json();
                toast.error(err.error || 'Gagal menyimpan user');
            }
        } catch (error) {
            toast.error('Terjadi kesalahan pada server');
        } finally {
            setSaving(false);
        }
    };

    const toggleUserStatus = async (user: User) => {
        const action = user.isActive ? 'menonaktifkan' : 'mengaktifkan';
        if (!confirm(`Yakin ingin ${action} user "${user.name}"?`)) return;

        try {
            const res = await fetch(`/api/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !user.isActive })
            });

            if (res.ok) {
                fetchUsers();
                toast.success(`User "${user.name}" berhasil ${user.isActive ? 'dinonaktifkan' : 'diaktifkan'}`);
            } else {
                toast.error('Gagal mengubah status user');
            }
        } catch (error) {
            toast.error('Terjadi kesalahan pada server');
        }
    };

    // Filter & Pagination Logic
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh]">
                <Loading03Icon size={48} className="animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Memuat user...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/superadmin">
                        <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
                            <ArrowLeft01Icon size={18} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                        <p className="text-muted-foreground">Kelola akun pengguna sistem</p>
                    </div>
                </div>
                <Button onClick={openCreateModal}>
                    <Add01Icon size={18} className="mr-2" />
                    Tambah User
                </Button>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                            <UserGroupIcon size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{users.length}</div>
                            <div className="text-sm text-muted-foreground">Total User</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-full bg-green-100 text-green-600">
                            <UserCheck01Icon size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{users.filter(u => u.isActive).length}</div>
                            <div className="text-sm text-muted-foreground">User Aktif</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                            <UserBlock01Icon size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{users.filter(u => !u.isActive).length}</div>
                            <div className="text-sm text-muted-foreground">User Nonaktif</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="relative">
                <Search01Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Cari user..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="pl-10 max-w-sm"
                />
            </div>

            {/* Users Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Statistik</TableHead>
                                <TableHead>Dibuat</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                        Tidak ada user yang ditemukan
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedUsers.map((user) => {
                                    const roleInfo = roleLabels[user.role];
                                    const RoleIcon = roleInfo.icon;

                                    return (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-background border flex items-center justify-center text-primary font-bold shadow-sm">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold">{user.name}</div>
                                                        <div className="text-xs text-muted-foreground">@{user.username}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold", roleInfo.color)}>
                                                    <RoleIcon size={12} />
                                                    {roleInfo.label}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={cn(
                                                    "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                                                    user.isActive ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                                )}>
                                                    {user.isActive ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {user._count?.createdSessions || 0} sesi • {user._count?.scannedItems || 0} scan
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {new Date(user.createdAt).toLocaleDateString('id-ID')}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => openEditModal(user)}
                                                    >
                                                        <PencilEdit02Icon size={16} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                                        onClick={() => toggleUserStatus(user)}
                                                        title={user.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                                                    >
                                                        {user.isActive ? <UserBlock01Icon size={16} /> : <UserCheck01Icon size={16} />}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pagination Component */}
            {totalPages > 1 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)); }}
                                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>

                        <PaginationItem>
                            <PaginationLink href="#" isActive onClick={(e) => e.preventDefault()}>
                                {currentPage}
                            </PaginationLink>
                        </PaginationItem>

                        {totalPages > 1 && (
                            <PaginationItem>
                                <span className="text-muted-foreground text-sm mx-2">
                                    dari {totalPages}
                                </span>
                            </PaginationItem>
                        )}

                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)); }}
                                className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}

            {/* Dialog */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingUser ? 'Edit User' : 'Tambah User Baru'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!editingUser && (
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Username</label>
                                <Input
                                    placeholder="username_baru"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    required
                                />
                            </div>
                        )}

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Nama Lengkap</label>
                            <Input
                                placeholder="Nama lengkap"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Password {editingUser && '(kosongkan jika tidak diubah)'}</label>
                            <Input
                                type="password"
                                placeholder={editingUser ? '••••••••' : 'Password baru'}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required={!editingUser}
                            />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Role</label>
                            <select
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                            >
                                <option value="ADMIN">Admin (Back Office)</option>
                                <option value="WAREHOUSE">Warehouse Staff (Field Operator)</option>
                                <option value="SUPER_ADMIN">Super Admin (Full Access)</option>
                            </select>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={saving}>
                                {saving && <Loading03Icon size={16} className="animate-spin mr-2" />}
                                Simpan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
