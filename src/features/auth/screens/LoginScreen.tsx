import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { useUserStore } from '../../../store/useUserStore';
import { Heart, Mail, ChevronLeft, Eye, EyeOff } from 'lucide-react-native';
import { Button } from '../../../shared/components/ui/Button';
import { LinearGradient } from 'expo-linear-gradient';
import { initializeGoogleSignIn, signInWithGoogle } from '../services/googleAuth';
import { authService } from '../../../services/api/auth';
import { useToastStore } from '../../../store/useToastStore';

type AuthStep = 'LANDING' | 'EMAIL_INPUT' | 'PASSWORD_LOGIN' | 'PASSWORD_SIGNUP';

// Simple Google G component for the icon
const GoogleIcon = () => (
  <View style={styles.googleIconContainer}>
    <View style={[styles.googleSegment, { backgroundColor: '#4285F4', top: 0, left: 10, width: 10, height: 4 }]} />
    <View style={[styles.googleSegment, { backgroundColor: '#34A853', bottom: 0, left: 4, width: 12, height: 4, transform: [{ rotate: '45deg' }] }]} />
    <View style={[styles.googleSegment, { backgroundColor: '#FBBC05', left: 0, top: 6, width: 4, height: 8 }]} />
    <View style={[styles.googleSegment, { backgroundColor: '#EA4335', top: 0, left: 4, width: 8, height: 4 }]} />
    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#4285F4', position: 'absolute', top: 1, left: 5 }}>G</Text>
  </View>
);

export default function LoginScreen() {
  const { setIsLoggedIn, setUserData, setToken } = useUserStore();
  const [step, setStep] = useState<AuthStep>('LANDING');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializeGoogleSignIn();
  }, []);

  const { showToast } = useToastStore();

  // Function to check if user exists
  const checkUserExists = async (emailAddr: string): Promise<boolean | undefined> => {
    try {
      setLoading(true);
      const { exists } = await authService.checkEmail(emailAddr);
      return exists;
    } catch (error: any) {
      console.log(error);
      showToast(error.response?.data?.message || 'Failed to check email', 'error');
      return undefined; // Indicate error
    } finally {
      setLoading(false);
    }
  };

  const handleContinueEmail = async () => {
    if (!email) return;
    const exists = await checkUserExists(email);

    if (exists === undefined) return; // Stay on same step if error

    if (exists) {
      setStep('PASSWORD_LOGIN');
    } else {
      setStep('PASSWORD_SIGNUP');
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      const response = await authService.login({ email, password });
      await setToken(response.token);
      setUserData({ email, authMethod: 'email' });
      setIsLoggedIn(true);
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      // Registration requires FullName and DOB in backend, but our LoginScreen doesn't have it yet.
      // Usually, we'd collect this in onboarding or have it here. 
      // For now, I'll use placeholders and let onboarding update it later, 
      // OR I should add these fields to the signup step.
      // Given the backend requirements, I'll use a placeholder for name/dob and they can fix it in onboarding.
      const response = await authService.register({
        email,
        password,
        full_name: 'New User',
        date_of_birth: '1995-01-01'
      });
      await setToken(response.token);
      setUserData({ email, authMethod: 'email', name: 'New User', birthDate: '1995-01-01' });
      setIsLoggedIn(true);
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const user = await signInWithGoogle();

      if (user) {
        const response = await authService.googleLogin({
          email: user.email,
          google_id: user.id,
          full_name: user.name || undefined,
          profile_picture: user.photo || undefined,
        });

        await setToken(response.token);
        setUserData({
          authMethod: 'google',
          name: user.name || 'Google User',
          email: user.email,
          profileImage: user.photo || undefined,
          birthDate: '1995-01-01',
        });
        setIsLoggedIn(true);
      }
    } catch (error: any) {
      if (error.message !== 'cancelled') {
        showToast(error.message || 'Something went wrong with Google Sign-In', 'error');
        console.error('Google Sign-In Error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderBackHeader = () => (
    <View style={styles.cardHeader}>
      <TouchableOpacity onPress={() => {
        if (step === 'EMAIL_INPUT') setStep('LANDING');
        else if (step === 'PASSWORD_LOGIN' || step === 'PASSWORD_SIGNUP') setStep('EMAIL_INPUT');
      }}>
        <View style={styles.backButton}>
          <ChevronLeft size={20} color="#374151" />
          <Text style={styles.backText}>Back</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    switch (step) {
      case 'LANDING':
        return (
          <View style={styles.innerContent}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue your journey</Text>

            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleLogin}
              disabled={loading}
            >
              <GoogleIcon />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button
              title="Sign Up with Email"
              onPress={() => setStep('EMAIL_INPUT')}
              style={styles.redButton}
              icon={<Mail size={20} color="white" style={{ marginRight: 10 }} />}
            />

            <Text style={styles.terms}>
              By continuing, you agree to our{' '}
              <Text style={styles.link}>Terms of Service</Text> and{' '}
              <Text style={styles.link}>Privacy Policy</Text>
            </Text>
          </View>
        );

      case 'EMAIL_INPUT':
        return (
          <View style={styles.innerContent}>
            {renderBackHeader()}
            <View style={styles.iconCircle}>
              <Mail size={32} color="#ef4444" />
            </View>
            <Text style={styles.stepTitle}>What's your email?</Text>
            <Text style={styles.stepSubtitle}>We'll check if you have an account</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoFocus
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <Button
              title="Continue"
              onPress={handleContinueEmail}
              loading={loading}
              disabled={!email || !email.includes('@')}
              style={styles.redButton}
            />
          </View>
        );

      case 'PASSWORD_LOGIN':
        return (
          <View style={styles.innerContent}>
            {renderBackHeader()}
            <View style={styles.iconCircle}>
              <View style={styles.lockIcon} />
            </View>
            <Text style={styles.stepTitle}>Enter your password</Text>
            <Text style={styles.emailDisplay}>{email}</Text>

            <TouchableOpacity onPress={() => { }}>
              <Text style={styles.forgotPassword}>Forgot password?</Text>
            </TouchableOpacity>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  autoFocus
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} color="#9ca3af" /> : <Eye size={20} color="#9ca3af" />}
                </TouchableOpacity>
              </View>
            </View>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              disabled={!password}
              style={styles.redButton}
            />
          </View>
        );

      case 'PASSWORD_SIGNUP':
        return (
          <View style={styles.innerContent}>
            {renderBackHeader()}
            <View style={styles.iconCircle}>
              <View style={styles.lockIcon} />
            </View>
            <Text style={styles.stepTitle}>Create a password</Text>
            <Text style={styles.emailDisplay}>{email}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Create a strong password"
                  secureTextEntry={!showPassword}
                  autoFocus
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} color="#9ca3af" /> : <Eye size={20} color="#9ca3af" />}
                </TouchableOpacity>
              </View>
              <Text style={styles.inputHint}>Must be at least 6 characters</Text>
            </View>

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
              disabled={password.length < 6}
              style={styles.redButton}
            />

            <View style={styles.nextStepsCard}>
              <Text style={styles.nextStepsTitle}>Next Steps:</Text>
              <Text style={styles.nextStepItem}>• Complete your profile</Text>
              <Text style={styles.nextStepItem}>• Add photos</Text>
              <Text style={styles.nextStepItem}>• Start swiping!</Text>
            </View>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#ef4444', '#db2777']}
        style={styles.hero}
      >
        <Heart size={80} color="white" fill="white" />
        <Text style={styles.heroTitle}>Swipee</Text>
        <Text style={styles.heroSubtitle}>Find Your Perfect Match</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {renderContent()}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  hero: {
    height: '40%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
  },
  formContainer: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    backgroundColor: 'white',
    paddingTop: 10,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 30,
  },
  innerContent: {
    flex: 1,
  },
  cardHeader: {
    marginBottom: 20,
    marginTop: -10,
    width: '100%',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -10,
  },
  backText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 40,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 30,
  },
  emailDisplay: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 10,
  },
  forgotPassword: {
    color: '#ef4444',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  lockIcon: {
    width: 20,
    height: 24,
    borderWidth: 2,
    borderColor: '#ef4444',
    borderRadius: 4,
    marginTop: 6,
  },
  googleButton: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    marginRight: 12,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleSegment: {
    position: 'absolute',
    borderRadius: 1,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  redButton: {
    backgroundColor: '#ef4444',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#9ca3af',
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#f9fafb',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  inputHint: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 6,
  },
  terms: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 30,
    lineHeight: 20,
  },
  link: {
    color: '#ef4444',
    fontWeight: '600',
  },
  nextStepsCard: {
    width: '100%',
    padding: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    marginTop: 20,
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
  },
  nextStepItem: {
    fontSize: 15,
    color: '#4b5563',
    marginBottom: 6,
  },
});
