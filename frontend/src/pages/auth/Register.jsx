import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Icons } from '../../components/ui/icons';
import { cn } from '../../lib/utils';
import { ArrowRight } from 'lucide-react';

const registerSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
  city: yup.string().nullable(),
  address: yup.string().nullable(),
  department: yup
    .string()
    .oneOf(
      ['', 'roads', 'water', 'electricity', 'sanitation', 'public_safety'],
      'Please select a valid department'
    )
    .nullable(),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Must contain uppercase, lowercase, number and special character'
    ),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),
});

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);

      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: 'citizen', // Default role for new users
        address: data.address || '',
        city: data.city || '',
      };

      if (data.department) {
        payload.department = data.department;
      }

      await registerUser(payload);
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Dynamic Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/30 blur-[120px] animate-float" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[100px] animate-float" style={{ animationDelay: '2s', animationDuration: '8s' }} />
        <div className="absolute top-[30%] right-[30%] w-[300px] h-[300px] rounded-full bg-purple-500/20 blur-[80px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="glass rounded-2xl shadow-2xl overflow-hidden border border-white/10 backdrop-blur-xl">
          <div className="p-8">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/30"
              >
                <Icons.logo className="h-8 w-8 text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold gradient-text-primary mb-2">Create an account</h1>
              <p className="text-muted-foreground">Fill in your details to get started</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">Full Name</Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                      <Icons.user className="h-5 w-5 text-muted-foreground group-focus-within:text-primary" />
                    </div>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      className={cn('pl-10 bg-black/40 border-white/10 text-white placeholder:text-muted-foreground focus:bg-black/60 transition-all duration-300', errors.name && 'border-red-500')}
                      {...register('name')}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="9876543210"
                    className={cn('bg-black/40 border-white/10 text-white placeholder:text-muted-foreground focus:bg-black/60 transition-all duration-300', errors.phone && 'border-red-500')}
                    {...register('phone')}
                    disabled={isLoading}
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>}
                </div>
              </div>

              {/* Email & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                      <Icons.mail className="h-5 w-5 text-muted-foreground group-focus-within:text-primary" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className={cn('pl-10 bg-black/40 border-white/10 text-white placeholder:text-muted-foreground focus:bg-black/60 transition-all duration-300', errors.email && 'border-red-500')}
                      {...register('email')}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-foreground">City</Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="Your city"
                    className={cn('bg-black/40 border-white/10 text-white placeholder:text-muted-foreground focus:bg-black/60 transition-all duration-300', errors.city && 'border-red-500')}
                    {...register('city')}
                    disabled={isLoading}
                  />
                  {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city.message}</p>}
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-foreground">Address (optional)</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="Street, area, landmark"
                  className={cn('bg-black/40 border-white/10 text-white placeholder:text-muted-foreground focus:bg-black/60 transition-all duration-300', errors.address && 'border-red-500')}
                  {...register('address')}
                  disabled={isLoading}
                />
                {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>}
              </div>

              {/* Department (optional) */}
              <div className="space-y-2">
                <Label htmlFor="department" className="text-foreground">Department (optional)</Label>
                <select
                  id="department"
                  className={cn(
                    'block w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 text-white transition-all duration-300',
                    errors.department && 'border-red-500 focus:ring-red-500'
                  )}
                  {...register('department')}
                  disabled={isLoading}
                  defaultValue=""
                >
                  <option value="" className="bg-gray-900 text-foreground">Select department</option>
                  <option value="roads" className="bg-gray-900 text-foreground">Roads</option>
                  <option value="water" className="bg-gray-900 text-foreground">Water</option>
                  <option value="electricity" className="bg-gray-900 text-foreground">Electricity</option>
                  <option value="sanitation" className="bg-gray-900 text-foreground">Sanitation</option>
                  <option value="public_safety" className="bg-gray-900 text-foreground">Public Safety</option>
                </select>
                {errors.department && <p className="mt-1 text-sm text-red-500">{errors.department.message}</p>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                    <Icons.lock className="h-5 w-5 text-muted-foreground group-focus-within:text-primary" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className={cn('pl-10 bg-black/40 border-white/10 text-white placeholder:text-muted-foreground focus:bg-black/60 transition-all duration-300', errors.password && 'border-red-500')}
                    {...register('password')}
                    disabled={isLoading}
                  />
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
                <p className="mt-1 text-xs text-muted-foreground">
                  Must be at least 8 characters with uppercase, lowercase, number and special character
                </p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                    <Icons.lock className="h-5 w-5 text-muted-foreground group-focus-within:text-primary" />
                  </div>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className={cn('pl-10 bg-black/40 border-white/10 text-white placeholder:text-muted-foreground focus:bg-black/60 transition-all duration-300', errors.confirmPassword && 'border-red-500')}
                    {...register('confirmPassword')}
                    disabled={isLoading}
                  />
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>}
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-white/20 bg-black/40 rounded"
                    required
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="font-medium text-muted-foreground">
                    I agree to the{' '}
                    <a href="#" className="text-primary hover:text-primary/80">
                      Terms and Conditions
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-primary hover:text-primary/80">
                      Privacy Policy
                    </a>
                  </label>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  type="submit"
                  className="w-full h-11 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 transform hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-transparent text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  type="button"
                  className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-300"
                  disabled={isLoading}
                >
                  <Icons.google className="h-5 w-5 mr-2" />
                  Google
                </Button>

                <Button
                  variant="outline"
                  type="button"
                  className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-300"
                  disabled={isLoading}
                >
                  <Icons.github className="h-5 w-5 mr-2" />
                  GitHub
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white/5 px-6 py-4 text-center border-t border-white/10 backdrop-blur-md">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary hover:text-primary/80 transition-colors hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
