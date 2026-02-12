import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { ChangeEvent, FormEvent, useState } from "react";
import { User } from "@/src/redux/slices/userSlice";
import { useMutation } from "@tanstack/react-query";
import { updateUserApi } from "@/src/api/users";

export interface CreateUserData {
  firstName: string;
  lastName: string;
  age: number;
  address: string;
  phoneNumber: string;
  gender: string;
  email: string;
  role: string;
  password?: string | null;
}

export default function EditUserModal({ user, onClose }: { user: User | null; onClose: () => void; }) {
  const router = useRouter();
  const token = useSelector((state: any) => state.auth?.token || state.auth?.user?.token);

  const [formData, setFormData] = useState<CreateUserData>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    age: user?.age || 0,
    address: user?.address || "",
    phoneNumber: user?.phoneNumber || "",
    gender: user?.gender || "other",
    email: user?.email || "",
    role: user?.role || "",
    password: user?.firstName ?? null,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: CreateUserData) => {
      return updateUserApi(token!, user!.id, { ...data, password: data.password ?? "" });
    },
    onSuccess: () => {
      onClose();
      router.refresh();
    },
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (user?.id) {
      mutate(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit User Details</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600">First Name</label>
            <input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600">Last Name</label>
            <input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600">Phone Number</label>
            <input
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex flex-col md:col-span-2">
            <label className="text-sm font-semibold text-gray-600">Address</label>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600">Role</label>
            <input
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-blue-400"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}