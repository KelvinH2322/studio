// src/app/service/(routes)/users/page.tsx
"use client";

import type { useState, ChangeEvent } from 'react';
import { useMemo } from 'react';
import PageHeader from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit3, Trash2, Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/types';
import { UserRole, MOCK_USERS as INITIAL_USERS } from '@/types'; // Using static data
import UserForm from './components/user-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<User[]>(INITIAL_USERS);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const { toast } = useToast();

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const handleAddUser = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    // Prevent deleting the last service user for safety in this mock setup
    const serviceUsersCount = users.filter(u => u.role === UserRole.SERVICE).length;
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete?.role === UserRole.SERVICE && serviceUsersCount <= 1) {
      toast({
        title: "Deletion Blocked",
        description: "Cannot delete the last Service user.",
        variant: "destructive",
      });
      return;
    }

    setUsers(prev => prev.filter(u => u.id !== userId));
    toast({ title: "User Deleted", description: "The user account has been removed." });
  };

  const handleSaveUser = (userData: User) => {
    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...userData } : u));
      toast({ title: "User Updated", description: "User account has been updated successfully." });
    } else {
      // In a real app, generate a unique ID on the backend
      const newUser = { ...userData, id: `user-${Date.now()}`, createdAt: new Date() };
      setUsers(prev => [newUser, ...prev]);
      toast({ title: "User Created", description: "New user account has been added." });
    }
    setIsFormOpen(false);
    setEditingUser(null);
  };

  const pageActions = (
    <Button onClick={handleAddUser}>
      <PlusCircle className="mr-2 h-4 w-4" /> Add New User
    </Button>
  );

  return (
    <div>
      <PageHeader title="Manage Users" description="Create, edit, and manage user accounts." actions={pageActions} />

      <div className="mb-6">
        <Input
          placeholder="Search users by name, email, or role..."
          value={searchTerm}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="max-w-sm"
          icon={<Search className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? filteredUsers.map(user => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={
                    user.role === UserRole.SERVICE ? "destructive" :
                    user.role === UserRole.ADMIN ? "secondary" : "default"
                  }>{user.role}</Badge>
                </TableCell>
                <TableCell>{user.createdAt ? format(new Date(user.createdAt), 'PPp') : 'N/A'}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)} className="h-8 w-8">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the user account for {user.email}.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteUser(user.id)} className="bg-destructive hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  No users found. {searchTerm && "Try adjusting your search."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit' : 'Create'} User</DialogTitle>
            <DialogDescription>
              {editingUser ? 'Update the details for this user account.' : 'Fill in the form to add a new user.'}
            </DialogDescription>
          </DialogHeader>
          <UserForm
            user={editingUser}
            onSubmit={handleSaveUser}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    icon?: React.ReactNode;
  }
}
