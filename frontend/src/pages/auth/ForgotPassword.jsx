import { useState } from 'react';
import { Link } from 'react-router-dom';
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

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
});

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const { forgotPassword } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      await forgotPassword(data.email);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
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
        <div className="glass rounded-2xl shadow-2xl overflow-hidden border border-white/10 backdrop-blur-xl">
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
              <h1 className="text-3xl font-bold gradient-text-primary mb-2">Forgot password</h1>
              <p className="text-muted-foreground">We’ll email you a reset link</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                    <Icons.mail className="h-5 w-5 text-muted-foreground group-focus-within:text-primary" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className={cn(
                      'pl-10 bg-black/40 border-white/10 text-white placeholder:text-muted-foreground focus:bg-black/60 transition-all duration-300',
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

              <Button
                type="submit"
                className="w-full h-11 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 transform hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send reset link'
                )}
              </Button>
            </form>
          </div>

          <div className="bg-white/5 px-6 py-4 text-center border-t border-white/10 backdrop-blur-md">
            <p className="text-sm text-muted-foreground">
              Remembered your password?{' '}
              <Link to="/login" className="font-medium text-primary hover:text-primary/80 transition-colors hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
