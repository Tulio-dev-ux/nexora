"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  subscription?: { plan: string; status: string } | null;
  _count: { servers: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => setUsers(d.users ?? []))
      .catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Users</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {users.length === 0 ? (
            <p className="text-slate-500 text-sm">No users yet — run db:seed or register</p>
          ) : (
            users.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div>
                  <p className="font-medium">{u.name ?? "—"}</p>
                  <p className="text-xs text-slate-500">
                    {u.email} · {u._count.servers} servers
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{u.subscription?.plan ?? "STARTER"}</Badge>
                  <Badge variant={u.role === "ADMIN" ? "warning" : "outline"}>{u.role}</Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
