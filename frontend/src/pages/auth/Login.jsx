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
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Icons } from '../../components/ui/icons';

const loginSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const userData = await login(data.email, data.password);
      const isAdmin = userData?.role === 'admin' || userData?.role === 'department_officer';
      navigate(isAdmin ? '/admin' : '/dashboard');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Dynamic Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/30 blur-[120px] animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[100px] animate-float" style={{ animationDelay: '2s', animationDuration: '8s' }} />
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full bg-purple-500/20 blur-[80px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass rounded-2xl shadow-2xl overflow-hidden border border-border/50 backdrop-blur-xl">
          <div className="p-8">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/30"
              >
                <span className="text-white font-bold text-xl">CT</span>
              </motion.div>
              <h1 className="text-3xl font-bold gradient-text-primary mb-2">Welcome back</h1>
              <p className="text-muted-foreground">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                    <Mail className="h-5 w-5 text-muted-foreground group-focus-within:text-primary" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className={cn(
                      'pl-10 h-11 transition-all duration-300',
                      errors.email && 'border-red-500 focus:ring-red-500'
                    )}
                    {...register('email')}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500 font-medium">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                    <Lock className="h-5 w-5 text-muted-foreground group-focus-within:text-primary" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className={cn(
                      'pl-10 h-11 transition-all duration-300',
                      errors.password && 'border-red-500 focus:ring-red-500'
                    )}
                    {...register('password')}
                    disabled={isLoading}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500 font-medium">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-border bg-background rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-muted-foreground">
                  Remember me
                </label>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full h-11 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 transform hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50"></div>
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
                  className="w-full transition-all duration-300"
                  disabled={isLoading}
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Google
                </Button>

                <Button
                  variant="outline"
                  type="button"
                  className="w-full transition-all duration-300"
                  disabled={isLoading}
                >
                  <Icons.github className="h-5 w-5 mr-2" />
                  GitHub
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-muted/30 px-6 py-4 text-center border-t border-border/50 backdrop-blur-md">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-primary hover:text-primary/80 transition-colors hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground/60">
            By continuing, you agree to our{' '}
            <a href="#" className="hover:text-primary transition-colors hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="hover:text-primary transition-colors hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </motion.div>
    </div>
  );
}
