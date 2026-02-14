import { useState, useRef } from "react";
import { X, Camera, User } from "lucide-react";
import { useData } from "../context/DataContext";

export default function ProfileEditor({ onClose }) {
  const { state, dispatch } = useData();
  const profile = state.preferences?.profile ?? { name: "", tagline: "", photo: null };
  const [form, setForm] = useState({ ...profile });
  const fileRef = useRef(null);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Compress to small size for localStorage
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      const size = 200; // 200x200 avatar
      canvas.width = size;
      canvas.height = size;

      // Center crop
      const min = Math.min(img.width, img.height);
      const sx = (img.width - min) / 2;
      const sy = (img.height - min) / 2;
      ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
      setForm({ ...form, photo: dataUrl });
    };
    img.src = URL.createObjectURL(file);
    e.target.value = "";
  };

  const handleSave = () => {
    dispatch({ type: "UPDATE_PREFERENCES", payload: { profile: form } });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-6">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">Edit Profile</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={18} /></button>
        </div>

        {/* Avatar */}
        <div className="flex justify-center mb-5">
          <button
            onClick={() => fileRef.current?.click()}
            className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-800 border-2 border-gray-700 hover:border-indigo-500 transition-colors group"
          >
            {form.photo ? (
              <img src={form.photo} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={32} className="text-gray-600" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={20} className="text-white" />
            </div>
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1.5 block">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Joe"
            maxLength={30}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Tagline */}
        <div className="mb-6">
          <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1.5 block">Tagline</label>
          <input
            type="text"
            value={form.tagline}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            placeholder="Ultra runner since 2021"
            maxLength={60}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Remove photo */}
        {form.photo && (
          <button
            onClick={() => setForm({ ...form, photo: null })}
            className="w-full mb-3 text-sm text-gray-500 hover:text-red-400 transition-colors"
          >
            Remove photo
          </button>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500 transition-colors"
        >
          Save Profile
        </button>
      </div>
    </div>
  );
}
