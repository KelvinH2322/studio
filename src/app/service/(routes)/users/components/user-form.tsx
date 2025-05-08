// src/app/service/(routes)/users/components/user-form.tsx
"use client";

import type { User } from '@/types';
import { UserRole } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address"),
  role: z.nativeEnum(UserRole),
});

type UserFormValues = z.infer<typeof formSchema>;

interface UserFormProps {
  user: User | null;
  onSubmit: (data: UserFormValues) => void;
  onCancel: () => void;
}

export default function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: user ? {
      name: user.name || '',
      email: user.email,
      role: user.role,
    } : {
      name: '',
      email: '',
      role: UserRole.NORMAL,
    },
  });

  const handleSubmit = (values: UserFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name (Optional)</FormLabel>
              <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl><Input type="email" placeholder="user@example.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select user role" /></SelectTrigger></FormControl>
                <SelectContent>
                  {Object.values(UserRole).map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">{user ? 'Save Changes' : 'Create User'}</Button>
        </div>
      </form>
    </Form>
  );
}
