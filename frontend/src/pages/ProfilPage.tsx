import { User, Users } from "lucide-react";

const ProfilePage = () => {
  // Contoh data akun user & daftar organizernya
  const user = {
    name: "Adam Yanuar Zulmi",
    email: "withdaamleon@gmail.com",
    avatar: "/profilpic.jpg",
    status: "Aktif",
    joined: "12 Januari 2024",
    organizers: [
      { id: 1, name: "Agentakota", role: "Owner" },
      { id: 2, name: "Eventnesia", role: "Admin" },
    ],
  };

  return (
    <div className="max-w-2xl mx-auto p-6 pb-12  bg-white shadow-md rounded-lg h-screen fixed w-full">
      {/* Header */}
      <div className="flex items-center gap-4">
        <User size={20} className="text-blue-500" />
        <h2 className="text-2xl font-semibold">Profil</h2>
      </div>

      {/* Avatar & Informasi User */}
      <div className="flex flex-col items-center mt-6">
        <img
          src={user.avatar}
          alt="User Avatar"
          className="w-24 h-24 rounded-full border-4 border-gray-200"
        />
        <h3 className="mt-3 text-xl font-semibold">{user.name}</h3>
        <p className="text-gray-500">{user.email}</p>
        <span className="mt-1 px-3 py-1 bg-green-100 text-green-600 text-sm rounded-full">
          {user.status}
        </span>
      </div>

      {/* Daftar Organizer */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Organizer Anda</h3>
        <div className="space-y-3">
          {user.organizers.map((org) => (
            <div
              key={org.id}
              className="flex justify-between items-center p-3 bg-gray-100 rounded-lg shadow-sm"
            >
              <div>
                <h4 className="text-md font-medium">{org.name}</h4>
                <p className="text-sm text-gray-500">{org.role}</p>
              </div>
              <Users size={24} className="text-blue-500" />
            </div>
          ))}
        </div>
      </div>

     
    </div>
  );
};

export default ProfilePage;
