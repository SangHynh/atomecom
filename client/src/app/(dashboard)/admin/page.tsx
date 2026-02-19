'use client';

import AuthGuard from '@/components/providers/auth-guard';
import { USER_ROLE } from '@atomecom/shared';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDashboard() {
  const { logout, user } = useAuth();

  return (
    <AuthGuard allowedRoles={[USER_ROLE.ADMIN]}>
      <div className="min-h-screen bg-gray-100 p-8 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <Button variant="destructive" onClick={() => logout()}>
              Logout
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Welcome, {user?.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  You have full access to manage the system.
                </p>
                <div className="mt-4">
                  <p>
                    <strong>Role:</strong> {user?.role}
                  </p>
                  <p>
                    <strong>Email:</strong> {user?.email}
                  </p>
                  <p>
                    <strong>Status:</strong> {user?.status}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">1,234</p>
                <p className="text-gray-500">Total Users</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
