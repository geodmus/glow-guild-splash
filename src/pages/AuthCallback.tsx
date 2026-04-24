import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        if (!session) {
          navigate('/auth');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profile?.role === 'creator') {
          const { data: creator } = await supabase
            .from('creators')
            .select('id')
            .eq('id', session.user.id)
            .single();
          
          navigate(creator ? '/creator/dashboard' : '/creator/onboarding');
        } else if (profile?.role === 'sponsor') {
          const { data: sponsor } = await supabase
            .from('sponsors')
            .select('id')
            .eq('id', session.user.id)
            .single();
          
          navigate(sponsor ? '/sponsor/dashboard' : '/sponsor/onboarding');
        } else {
          navigate('/auth');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/auth');
      }
    };

    handleCallback();
  }, [navigate]);

  return <div className="flex items-center justify-center min-h-screen">Processing authentication...</div>;
}
