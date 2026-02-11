'use client';

import { Badge } from '@/components/ui/badge';
import { updateUserRole, updateUserDepartment } from './actions';

export default function UserTableRow({ user, currentUser, departments, roles }) {
    return (
        <tr className="hover:bg-slate-50/50 transition-colors group">
            <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                        {user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                    </div>
                    <div>
                        <p className="font-bold text-slate-900">{user.full_name || 'Unnamed User'}</p>
                        <p className="text-xs text-slate-400 font-mono tracking-tighter">#{user.id.slice(0, 8)}</p>
                    </div>
                </div>
            </td>
            <td className="px-6 py-5">
                <form action={async (formData) => {
                    await updateUserRole(user.id, formData.get('role'));
                }}>
                    <select
                        name="role"
                        defaultValue={user.role}
                        onChange={(e) => e.target.form.requestSubmit()}
                        className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium focus:ring-2 focus:ring-blue-500 cursor-pointer hover:border-blue-400 transition-colors"
                    >
                        {roles.map(r => (
                            <option key={r} value={r}>{r.replace('_', ' ')}</option>
                        ))}
                    </select>
                </form>
            </td>
            <td className="px-6 py-5">
                <form action={async (formData) => {
                    await updateUserDepartment(user.id, formData.get('department_id'));
                }}>
                    <select
                        name="department_id"
                        defaultValue={user.department_id || ""}
                        onChange={(e) => e.target.form.requestSubmit()}
                        className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium focus:ring-2 focus:ring-blue-500 cursor-pointer hover:border-blue-400 transition-colors max-w-[150px]"
                    >
                        <option value="">No Department</option>
                        {departments?.map(dept => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                    </select>
                </form>
            </td>
            <td className="px-6 py-5">
                <Badge variant={user.id === currentUser.id ? "success" : "secondary"}>
                    {user.id === currentUser.id ? "You" : "Active"}
                </Badge>
            </td>
        </tr>
    );
}
