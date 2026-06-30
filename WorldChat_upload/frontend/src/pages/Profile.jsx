import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Avatar from '../components/common/Avatar.jsx';
import Spinner from '../components/common/Spinner.jsx';
import { Icon } from '../components/common/Icon.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useLayout } from '../components/layout/layoutContext.js';
import { chatService } from '../services/chatService.js';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { openSidebar } = useLayout();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    status: user?.status || '',
    avatar: user?.avatar || '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const onChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      // Reuse the upload endpoint; avatar is a normal (non-expiring on the client) URL.
      const { imageUrl } = await chatService.uploadImage(file);
      setForm((f) => ({ ...f, avatar: imageUrl }));
      toast.success('Avatar uploaded — remember to save.');
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex items-center gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <button onClick={openSidebar} className="btn-ghost h-10 w-10 !px-0 md:hidden">
          <Icon name="menu" className="h-5 w-5" />
        </button>
        <button onClick={() => navigate('/chat')} className="btn-ghost h-10 w-10 !px-0">
          <Icon name="arrow-left" className="h-5 w-5" />
        </button>
        <h2 className="text-base font-bold">Edit Profile</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <form onSubmit={handleSave} className="mx-auto max-w-lg space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar name={form.name} src={form.avatar} size="xl" />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-white shadow-lg hover:bg-brand-700"
                aria-label="Change avatar"
              >
                {uploading ? <Spinner size={4} /> : <Icon name="camera" className="h-4 w-4" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatar} />
            </div>
            <p className="text-sm text-slate-400">{user?.email}</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Display name</label>
            <input className="input" value={form.name} onChange={onChange('name')} maxLength={60} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Status</label>
            <input
              className="input"
              value={form.status}
              onChange={onChange('status')}
              maxLength={120}
              placeholder="What's happening?"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Bio</label>
            <textarea
              className="input min-h-[96px] resize-none"
              value={form.bio}
              onChange={onChange('bio')}
              maxLength={200}
              placeholder="Tell people about yourself"
            />
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? <Spinner size={5} /> : <Icon name="check" className="h-5 w-5" />}
            Save changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
