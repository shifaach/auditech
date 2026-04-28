
import React from 'react';
import { UserProfile, UserRole } from '../types';
import { Users, UserPlus, Shield, Mail, MoreHorizontal } from 'lucide-react';
import { useEffect, useState} from 'react';
import { firebaseService } from "../services/firebaseService";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../services/firebaseClient";
import { doc, setDoc } from "firebase/firestore";
const UserManagement: React.FC<{ user: UserProfile }> = ({ user }) => {
  if (user.role !== UserRole.ADMIN) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-100 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
          <p className="text-slate-500">You must be an administrator to view this page.</p>
        </div>
      </div>
    );
  }
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
const [newUser, setNewUser] = useState({
  full_name: "",
  email: "",
  password: "",
  role: UserRole.STANDARD_USER,
});

  const [users, setUsers] = useState<UserProfile[]>([]);

useEffect(() => {
  const loadUsers = async () => {
    const data = await firebaseService.getUsers();
    setUsers(data);
  };

  loadUsers();

}, []);

useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement | null;
    if (!target?.closest("[data-user-actions-root='true']")) {
      setActiveMenu(null);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500">Control system access levels and user permissions.</p>
        </div>
        <button
  onClick={() => setShowModal(true)}
  className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-800 transition-all"
>
  <UserPlus className="w-5 h-5" /> Add New User
</button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-visible">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600">
                      {u.full_name.charAt(0)}
                    </div>
                    <span className="text-sm font-bold text-slate-900">{u.full_name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="w-4 h-4" /> {u.email}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                    u.role === UserRole.ADMIN ? 'bg-red-100 text-red-700' :
                    u.role === UserRole.COMPLIANCE_OFFICER ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {u.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                <div className="relative" data-user-actions-root="true">
  <button
    onClick={() =>
      setActiveMenu(activeMenu === u.id ? null : u.id)
    }
    className="p-2 hover:bg-slate-100 rounded-lg"
  >
    <MoreHorizontal className="w-5 h-5 text-slate-400" />
  </button>

  {activeMenu === u.id && (
    <div className="absolute right-0 mt-2 w-40 bg-white border rounded-xl shadow-lg z-50">

      {/* CHANGE ROLE */}
      <button
        onClick={async () => {
          const newRole = prompt("Enter role: ADMIN / COMPLIANCE_OFFICER / STANDARD_USER");

          if (!newRole) return;
          const normalizedRole = newRole.trim().toUpperCase() as UserRole;
          const isValidRole =
            normalizedRole === UserRole.ADMIN ||
            normalizedRole === UserRole.COMPLIANCE_OFFICER ||
            normalizedRole === UserRole.STANDARD_USER;

          if (!isValidRole) {
            alert("Invalid role. Use: ADMIN / COMPLIANCE_OFFICER / STANDARD_USER");
            return;
          }

          await firebaseService.updateUser(u.id, { role: normalizedRole });

          const data = await firebaseService.getUsers();
          setUsers(data);

          setActiveMenu(null);
        }}
        className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-100"
      >
        Change Role
      </button>

      {/* DELETE USER */}
      <button
        onClick={async () => {
          if (!window.confirm("Delete this user?")) return;

          await firebaseService.deleteUser(u.id);

          const data = await firebaseService.getUsers();
          setUsers(data);

          setActiveMenu(null);
        }}
        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
      >
        Delete User
      </button>

    </div>
  )}
</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl w-[400px] space-y-4">

      <h2 className="text-lg font-bold">Add New User</h2>

      <input
        placeholder="Full Name"
        className="w-full border p-2 rounded"
        onChange={(e) =>
          setNewUser({ ...newUser, full_name: e.target.value })
        }
      />

      <input
        placeholder="Email"
        className="w-full border p-2 rounded"
        onChange={(e) =>
          setNewUser({ ...newUser, email: e.target.value })
        }
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full border p-2 rounded"
        onChange={(e) =>
          setNewUser({ ...newUser, password: e.target.value })
        }
      />

      <select
        className="w-full border p-2 rounded"
        onChange={(e) =>
          setNewUser({ ...newUser, role: e.target.value as UserRole })
        }
      >
        <option value="STANDARD_USER">User</option>
        <option value="COMPLIANCE_OFFICER">Officer</option>
        <option value="ADMIN">Admin</option>
      </select>

      <div className="flex justify-end gap-2">
        <button onClick={() => setShowModal(false)}>Cancel</button>

        <button
          onClick={async () => {
            try {
              const cred = await createUserWithEmailAndPassword(
                auth,
                newUser.email,
                newUser.password
              );

              await setDoc(doc(db, "users", cred.user.uid), {
                email: newUser.email,
                full_name: newUser.full_name,
                role: newUser.role,
                created_at: new Date().toISOString(),
              });

              setShowModal(false);

              // 🔥 reload users
              const data = await firebaseService.getUsers();
              setUsers(data);

            } catch (err) {
              alert("Failed to create user");
            }
          }}
          className="bg-blue-600 text-white px-3 py-2 rounded"
        >
          Create
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default UserManagement;
