import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import Button from '../../components/common/ui/Button';
import { supabase } from '../../lib/supabase';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      // Supabase automatically handles email verification through the callback URL
      // The hash contains the access token and refresh token
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');
      const error = hashParams.get('error');
      const errorDescription = hashParams.get('error_description');

      // Check for error in URL
      if (error) {
        setVerificationStatus('error');
        setMessage(errorDescription || 'Verification failed. The link may have expired.');
        return;
      }

      // Check if this is an email verification
      if (type === 'signup' || type === 'email') {
        if (accessToken) {
          try {
            // Set the session with the tokens from the URL
            const { data, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) throw sessionError;

            setVerificationStatus('success');
            setMessage('Your email has been verified successfully!');

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
              navigate('/');
            }, 2000);
          } catch (err) {
            setVerificationStatus('error');
            setMessage(err.message || 'Failed to verify email. Please try again.');
          }
        } else {
          setVerificationStatus('error');
          setMessage('Invalid verification link. Please check your email and try again.');
        }
      } else {
        // Not a verification link, just show success message if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setVerificationStatus('success');
          setMessage('Your email is already verified!');
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          setVerificationStatus('error');
          setMessage('Please click the verification link in your email.');
        }
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  if (verificationStatus === 'verifying') {
    return (
      <AuthLayout>
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-heading font-bold">Verifying your email</h2>
            <p className="text-muted-foreground">
              Please wait while we verify your email address...
            </p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (verificationStatus === 'success') {
    return (
      <AuthLayout>
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-heading font-bold">Email Verified!</h2>
            <p className="text-muted-foreground">{message}</p>
            <p className="text-sm text-muted-foreground">
              Redirecting to dashboard...
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="w-full sm:w-auto"
          >
            Go to Dashboard
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
          <XCircle className="w-8 h-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-heading font-bold">Verification Failed</h2>
          <p className="text-muted-foreground">{message}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate('/auth/login')}
          >
            Go to Login
          </Button>
          <Button
            onClick={() => navigate('/auth/signup')}
            className="gradient-primary"
          >
            <Mail className="w-4 h-4 mr-2" />
            Sign Up Again
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default VerifyEmail;
