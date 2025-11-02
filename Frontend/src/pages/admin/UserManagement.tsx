import {useState} from "react";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {Formik, Form, Field} from "formik";
import * as Yup from "yup";
import {UserPlus, Trash2, UserX, UserCheck, Edit} from "lucide-react";
import {toast} from "react-toastify";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import Table from "@/components/common/Table";
import Loading from "@/components/common/Loading";
import * as adminService from "@/services/admin.service";
import type {AdminUser} from "@/types/user.types";
import {useDebounce} from "@/hooks/useDebounce";
import {formatDate} from "@/utils/formatters";

const createUserSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email address").required("Email is required"),
  firstName: Yup.string().required("First name is required").min(2, "First name must be at least 2 characters"),
  lastName: Yup.string().required("Last name is required").min(2, "Last name must be at least 2 characters"),
  role: Yup.string().oneOf(["admin", "user"], "Role must be admin or user").required("Role is required"),
  isActive: Yup.boolean().required(),
  emailVerified: Yup.boolean(),
  password: Yup.string().required("Password is required").min(8, "Password must be at least 8 characters"),
});

const updateUserSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email address").required("Email is required"),
  firstName: Yup.string().required("First name is required").min(2, "First name must be at least 2 characters"),
  lastName: Yup.string().required("Last name is required").min(2, "Last name must be at least 2 characters"),
  role: Yup.string().oneOf(["admin", "user"], "Role must be admin or user").required("Role is required"),
  isActive: Yup.boolean().required(),
  emailVerified: Yup.boolean(),
  password: Yup.string().min(8, "Password must be at least 8 characters"),
});

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 500);
  const queryClient = useQueryClient();

  const {data, isLoading} = useQuery({
    queryKey: ["users", page, debouncedSearch],
    queryFn: () => adminService.getUsers({page, limit: 10, search: debouncedSearch}),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["users"]});
      toast.success("User deleted successfully");
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete user");
    },
  });

  const createUserMutation = useMutation({
    mutationFn: (data: Parameters<typeof adminService.createUser>[0]) => adminService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["users"]});
      toast.success("User created successfully");
      setIsUserFormOpen(false);
      setSelectedUser(null);
      setIsEditMode(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create user");
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({id, data}: {id: string; data: Parameters<typeof adminService.updateUser>[1]}) => adminService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["users"]});
      toast.success("User updated successfully");
      setIsUserFormOpen(false);
      setSelectedUser(null);
      setIsEditMode(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update user");
    },
  });

  const activateMutation = useMutation({
    mutationFn: ({id, isActive}: {id: string; isActive: boolean}) => adminService.activateUser(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["users"]});
      toast.success("User status updated");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update user status");
    },
  });

  const handleDelete = (user: AdminUser) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      deleteMutation.mutate(selectedUser.id);
    }
  };

  const handleActivate = (user: AdminUser) => {
    activateMutation.mutate({id: user.id, isActive: !user.isActive});
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsEditMode(false);
    setIsUserFormOpen(true);
  };

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setIsEditMode(true);
    setIsUserFormOpen(true);
  };

  const handleUserFormSubmit = async (values: any) => {
    if (isEditMode && selectedUser) {
      // Only send changed fields for update
      const updateData: any = {};
      if (values.email !== selectedUser.email) updateData.email = values.email;
      if (values.firstName !== selectedUser.firstName) updateData.firstName = values.firstName;
      if (values.lastName !== selectedUser.lastName) updateData.lastName = values.lastName;
      if (values.role !== selectedUser.role) updateData.role = values.role;
      if (values.isActive !== selectedUser.isActive) updateData.isActive = values.isActive;
      if (values.emailVerified !== selectedUser.emailVerified) updateData.emailVerified = values.emailVerified;
      if (values.password && values.password.trim()) updateData.password = values.password;

      updateUserMutation.mutate({id: selectedUser.id, data: updateData});
    } else {
      createUserMutation.mutate({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        role: values.role,
        isActive: values.isActive,
        emailVerified: values.emailVerified || false,
      });
    }
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  const users = data?.data.data.data || [];
  const paginationData = data?.data.data;
  const columns = [
    {
      key: "email",
      header: "Email",
      sortable: true,
    },
    {
      key: "firstName",
      header: "Name",
      render: (user: AdminUser) => `${user.firstName} ${user.lastName}`,
    },
    {
      key: "role",
      header: "Role",
      render: (user: AdminUser) => <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"}`}>{user.role}</span>,
    },
    {
      key: "isActive",
      header: "Status",
      render: (user: AdminUser) => <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{user.isActive ? "Active" : "Inactive"}</span>,
    },
    {
      key: "createdAt",
      header: "Created",
      render: (user: AdminUser) => formatDate(user.createdAt),
    },
    {
      key: "actions",
      header: "Actions",
      render: (user: AdminUser) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleEditUser(user)} className="p-1 text-blue-600 hover:text-blue-700" title="Edit">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={() => handleActivate(user)} className="p-1 text-gray-600 hover:text-primary-600" title={user.isActive ? "Deactivate" : "Activate"}>
            {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
          </button>
          <button onClick={() => handleDelete(user)} className="p-1 text-red-600 hover:text-red-700" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <Button variant="primary" onClick={handleAddUser}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full" />
            </div>
          </div>
        </div>

        <Table data={users} columns={columns} emptyMessage="No users found" />

        {/* Pagination */}
        {paginationData && paginationData.totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, paginationData.total)} of {paginationData.total} users
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= paginationData.totalPages}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        title="Confirm Delete"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedUser(null);
              }}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} loading={deleteMutation.isPending}>
              Delete
            </Button>
          </>
        }>
        <p className="text-gray-600">
          Are you sure you want to delete user <strong>{selectedUser?.email}</strong>? This action cannot be undone.
        </p>
      </Modal>

      {/* Add/Edit User Modal */}
      <Modal
        isOpen={isUserFormOpen}
        onClose={() => {
          setIsUserFormOpen(false);
          setSelectedUser(null);
          setIsEditMode(false);
        }}
        title={isEditMode ? "Edit User" : "Add User"}
        footer={null}>
        <Formik
          initialValues={{
            email: selectedUser?.email || "",
            firstName: selectedUser?.firstName || "",
            lastName: selectedUser?.lastName || "",
            role: selectedUser?.role || "user",
            isActive: selectedUser?.isActive ?? true,
            emailVerified: selectedUser?.emailVerified ?? false,
            password: "",
          }}
          validationSchema={isEditMode ? updateUserSchema : createUserSchema}
          onSubmit={handleUserFormSubmit}
          enableReinitialize>
          {({values, errors, touched, isSubmitting, setFieldValue}) => (
            <Form className="space-y-4">
              <div>
                <Field as={Input} name="email" type="email" label="Email" required error={touched.email && errors.email ? errors.email : undefined} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Field as={Input} name="firstName" type="text" label="First Name" required error={touched.firstName && errors.firstName ? errors.firstName : undefined} />
                </div>
                <div>
                  <Field as={Input} name="lastName" type="text" label="Last Name" required error={touched.lastName && errors.lastName ? errors.lastName : undefined} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select name="role" value={values.role} onChange={(e) => setFieldValue("role", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                {touched.role && errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
              </div>

              {isEditMode && (
                <div>
                  <Field as={Input} name="password" type="password" label="New Password (leave blank to keep current)" error={touched.password && errors.password ? errors.password : undefined} />
                  <p className="mt-1 text-xs text-gray-500">Leave blank to keep the current password</p>
                </div>
              )}

              {!isEditMode && (
                <div>
                  <Field as={Input} name="password" type="password" label="Password" required error={touched.password && errors.password ? errors.password : undefined} />
                </div>
              )}

              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <Field type="checkbox" name="isActive" className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
                <label className="flex items-center">
                  <Field type="checkbox" name="emailVerified" className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                  <span className="text-sm text-gray-700">Email Verified</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsUserFormOpen(false);
                    setSelectedUser(null);
                    setIsEditMode(false);
                  }}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={isSubmitting || createUserMutation.isPending || updateUserMutation.isPending}>
                  {isEditMode ? "Update User" : "Create User"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  );
}
