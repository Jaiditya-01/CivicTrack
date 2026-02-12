import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Icons } from '../components/ui/icons';
import { toast } from 'react-hot-toast';
import api from '../lib/api';

const CONFIRM_DELETE_PHRASE = 'DELETE';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [profileImageLoading, setProfileImageLoading] = useState(false);
  const profileImageInputRef = useRef(null);

  const MAX_IMAGE_SIZE = 300;
  const MAX_BYTES = 150 * 1024;

  const resizeAndCompress = (file) => {
    return new Promise((resolve) => {
      const img = document.createElement('img');
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > height && width > MAX_IMAGE_SIZE) {
          height = (height * MAX_IMAGE_SIZE) / width;
          width = MAX_IMAGE_SIZE;
        } else if (height > MAX_IMAGE_SIZE) {
          width = (width * MAX_IMAGE_SIZE) / height;
          height = MAX_IMAGE_SIZE;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        let quality = 0.85;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        while (dataUrl.length > MAX_BYTES && quality > 0.2) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        resolve(dataUrl);
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    try {
      setProfileImageLoading(true);
      const dataUrl = await resizeAndCompress(file);
      if (!dataUrl) {
        toast.error('Could not process image');
        return;
      }
      const { data } = await api.put('/auth/profile', { profileImage: dataUrl });
      updateUser(data.user);
      toast.success('Profile picture updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update picture');
    } finally {
      setProfileImageLoading(false);
      e.target.value = '';
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const { data: res } = await api.put('/auth/profile', {
        name: data.name,
        phone: data.phone,
        address: data.address,
        city: data.city,
      });
      updateUser(res.user);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      setExportLoading(true);
      const profileData = {
        name: user?.name,
        email: user?.email,
        phone: user?.phone,
        address: user?.address,
        city: user?.city,
        role: user?.role,
      };
      const { data: complaintsData } = await api.get('/complaints?limit=500');
      const complaints = complaintsData.complaints || [];
      const exportPayload = {
        exportedAt: new Date().toISOString(),
        profile: profileData,
        complaints: complaints.map((c) => ({
          complaintId: c.complaintId,
          issueType: c.issueType,
          description: c.description,
          status: c.status,
          priority: c.priority,
          location: c.location,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        })),
      };
      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `civictrack-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to export data');
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== CONFIRM_DELETE_PHRASE) return;
    try {
      setDeleteInProgress(true);
      await api.delete('/auth/account');
      toast.success('Account deleted');
      logout();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
    } finally {
      setDeleteInProgress(false);
      setDeleteModalOpen(false);
      setDeleteConfirmText('');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const form = e.target;
    const currentPassword = form.currentPassword?.value;
    const newPassword = form.newPassword?.value;
    const confirmPassword = form.confirmPassword?.value;
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill all password fields');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      setPasswordLoading(true);
      await api.put('/auth/password', {
        currentPassword,
        newPassword,
      });
      toast.success('Password updated successfully');
      setShowPasswordForm(false);
      form.reset();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icons.loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal information and contact details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        {...register('name', { required: 'Name is required' })}
                        disabled={isLoading}
                      />
                    ) : (
                      <p className="text-sm py-2 px-3 border rounded-md bg-muted/50">
                        {user.name}
                      </p>
                    )}
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <p className="text-sm py-2 px-3 border rounded-md bg-muted/50">
                      {user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        {...register('phone')}
                        disabled={isLoading}
                      />
                    ) : (
                      <p className="text-sm py-2 px-3 border rounded-md bg-muted/50">
                        {user.phone || 'Not provided'}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    {isEditing ? (
                      <Input
                        id="address"
                        {...register('address')}
                        disabled={isLoading}
                      />
                    ) : (
                      <p className="text-sm py-2 px-3 border rounded-md bg-muted/50">
                        {user.address || 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    {isEditing ? (
                      <Input
                        id="city"
                        {...register('city')}
                        disabled={isLoading}
                      />
                    ) : (
                      <p className="text-sm py-2 px-3 border rounded-md bg-muted/50">
                        {user.city || 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        reset({
                          name: user.name || '',
                          phone: user.phone || '',
                          address: user.address || '',
                          city: user.city || '',
                        });
                        setIsEditing(false);
                      }}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading && (
                        <Icons.loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password. For security, we recommend a strong password.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showPasswordForm ? (
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordForm(true)}
                >
                  Change Password
                </Button>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      placeholder="Enter current password"
                      required
                      disabled={passwordLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      placeholder="At least 6 characters"
                      minLength={6}
                      required
                      disabled={passwordLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      required
                      disabled={passwordLoading}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={passwordLoading}>
                      {passwordLoading && (
                        <Icons.loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Update Password
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPasswordForm(false)}
                      disabled={passwordLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
              <p className="text-xs text-muted-foreground border-t pt-4 mt-4">
                <strong>Forgot password?</strong> Email-based password reset is possible: it
                requires an email service (e.g. Nodemailer, SendGrid) to send a secure reset
                link to your email. You can add this later with a &quot;Forgot password?&quot;
                flow on the login page.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>
                Shown on dashboard, profile, and wherever your account appears.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative w-32 h-32 rounded-full bg-muted flex items-center justify-center mb-4 overflow-hidden">
                {user.profileImage || user.avatar ? (
                  <img
                    src={user.profileImage || user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl text-muted-foreground">
                    {(user.name || 'U')
                      .split(' ')
                      .map((n) => n[0])
                      .filter(Boolean)
                      .join('')
                      .toUpperCase()
                      .slice(0, 2) || 'U'}
                  </span>
                )}
                {profileImageLoading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Icons.loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}
              </div>
              <input
                ref={profileImageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfileImageChange}
                disabled={profileImageLoading}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => profileImageInputRef.current?.click()}
                disabled={profileImageLoading}
              >
                <Icons.camera className="mr-2 h-4 w-4" />
                {profileImageLoading ? 'Uploading…' : 'Change photo'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant={isEditing ? 'outline' : 'default'}
                className="w-full"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel Editing' : 'Edit Profile'}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleExportData}
                disabled={exportLoading}
              >
                {exportLoading ? (
                  <Icons.loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Icons.download className="mr-2 h-4 w-4" />
                )}
                Export Data
              </Button>
              <Button
                variant="outline"
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                onClick={() => setDeleteModalOpen(true)}
              >
                <Icons.trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete account confirmation modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-destructive">Delete Account</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeleteConfirmText('');
                }}
              >
                <Icons.x className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This action cannot be undone. All your data will be permanently removed.
              </p>
              <p className="text-sm">
                To confirm, type <strong className="font-mono">{CONFIRM_DELETE_PHRASE}</strong> below:
              </p>
              <Input
                placeholder={`Type ${CONFIRM_DELETE_PHRASE} to confirm`}
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="font-mono"
                autoComplete="off"
                disabled={deleteInProgress}
              />
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setDeleteConfirmText('');
                  }}
                  disabled={deleteInProgress}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== CONFIRM_DELETE_PHRASE || deleteInProgress}
                >
                  {deleteInProgress ? (
                    <Icons.loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Delete my account'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
