import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../../../store/useUserStore';
import { Mail, ChevronLeft, Eye, EyeOff, Heart } from 'lucide-react-native';
import { Button } from '../../../shared/components/ui/Button';
import { mapUserResponseToData } from '../../../utils/userMapper';
import { LinearGradient } from 'expo-linear-gradient';
import { initializeGoogleSignIn, signInWithGoogle } from '../services/googleAuth';
import { authService } from '../../../services/api/auth';
import { useToastStore } from '../../../store/useToastStore';
import { ScreenLayout } from '../../../shared/components/layout/ScreenLayout';
import { ScreenWithHeader } from '../../../shared/components/layout/ScreenWithHeader';
import { useTheme } from '../../../shared/hooks/useTheme';

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
  const { colors, isDark } = useTheme();
  const { setIsLoggedIn, setIsRegistering, setUserData, setTokens, setUserStatus } = useUserStore();
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
      await setTokens(response.token, response.refresh_token);
      
      const mappedUser = mapUserResponseToData(response.user);
      setUserData({
        ...mappedUser,
        authMethod: 'email',
        email, 
      });
      setUserStatus(response.user.status);
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
      // Registration complete only at the end of onboarding now
      setUserData({ email, password, authMethod: 'email' });
      setIsRegistering(true);
    } catch (error: any) {
      showToast(error.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const user = await signInWithGoogle();

      if (user) {
        // First check if email exists
        const exists = await checkUserExists(user.email);

        if (exists === undefined) return; // Error case

        if (exists) {
          // User exists, log them in
          const response = await authService.googleLogin({
            email: user.email,
            google_id: user.id,
            full_name: user.name || 'Google User',
            profile_picture: user.photo || undefined,
          });

          await setTokens(response.token, response.refresh_token);
          
          const mappedUser = mapUserResponseToData(response.user);
          setUserData({
            ...mappedUser,
            authMethod: 'google',
            googleId: user.id,
          });
          setUserStatus(response.user.status);
          setIsLoggedIn(true);
        } else {
          // New User - go to onboarding mode
          setUserData({
            authMethod: 'google',
            fullName: user.name || 'Google User',
            email: user.email,
            googleId: user.id,
            dateOfBirth: undefined, // Force identity screen to show
          });
          setIsRegistering(true);
        }
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

  const getHeaderTitle = () => {
    switch (step) {
      case 'EMAIL_INPUT': return 'Sign Up';
      case 'PASSWORD_LOGIN': return 'Sign In';
      case 'PASSWORD_SIGNUP': return 'Create Account';
      default: return '';
    }
  };

  const handleBack = () => {
    if (step === 'EMAIL_INPUT') setStep('LANDING');
    else if (step === 'PASSWORD_LOGIN' || step === 'PASSWORD_SIGNUP') setStep('EMAIL_INPUT');
  };

  const renderContent = () => {
    switch (step) {
      case 'LANDING':
        return (
          <View style={styles.innerContent}>
            <Text style={[styles.title, { color: colors.text }]}>Hi Swipeer</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Sign in to continue your journey</Text>

            <TouchableOpacity
              style={[styles.googleButton, { borderColor: colors.border, backgroundColor: isDark ? colors.surface : colors.background }]}
              onPress={handleGoogleLogin}
              disabled={loading}
            >
              <GoogleIcon />
              <Text style={[styles.googleButtonText, { color: colors.text }]}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textSecondary }]}>or</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            <Button
              title="Sign Up with Email"
              onPress={() => setStep('EMAIL_INPUT')}
              style={styles.redButton}
              icon={<Mail size={20} color="white" style={{ marginRight: 10 }} />}
            />

            <Text style={[styles.terms, { color: colors.textSecondary }]}>
              By continuing, you agree to our{' '}
              <Text style={styles.link}>Terms of Service</Text> and{' '}
              <Text style={styles.link}>Privacy Policy</Text>
            </Text>
          </View>
        );

      case 'EMAIL_INPUT':
        return (
          <View style={styles.innerContent}>
            <ScreenWithHeader withBorder={false} style={{ minHeight: 0, backgroundColor: 'transparent' }}>
              <View style={styles.customHeader}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                  <ChevronLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{getHeaderTitle()}</Text>
              </View>
            </ScreenWithHeader>
            <View style={styles.iconCircle}>
              <Mail size={32} color="#ef4444" />
            </View>
            <Text style={[styles.stepTitle, { color: colors.text }]}>What's your email?</Text>
            <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>We'll check if you have an account</Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Email Address</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="your@email.com"
                placeholderTextColor={colors.textSecondary}
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
            <ScreenWithHeader withBorder={false} style={{ minHeight: 0, backgroundColor: 'transparent' }}>
              <View style={styles.customHeader}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                  <ChevronLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{getHeaderTitle()}</Text>
              </View>
            </ScreenWithHeader>
            <View style={styles.iconCircle}>
              <View style={styles.lockIcon} />
            </View>
            <Text style={[styles.stepTitle, { color: colors.text }]}>Enter your password</Text>
            <Text style={[styles.emailDisplay, { color: colors.textSecondary }]}>{email}</Text>

            <TouchableOpacity onPress={() => { }}>
              <Text style={styles.forgotPassword}>Forgot password?</Text>
            </TouchableOpacity>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Password</Text>
              <View style={[styles.passwordContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.passwordInput, { color: colors.text }]}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!showPassword}
                  autoFocus
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} color={colors.textSecondary} /> : <Eye size={20} color={colors.textSecondary} />}
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
            <ScreenWithHeader withBorder={false} style={{ minHeight: 0, backgroundColor: 'transparent' }}>
              <View style={styles.customHeader}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                  <ChevronLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{getHeaderTitle()}</Text>
              </View>
            </ScreenWithHeader>
            <View style={styles.iconCircle}>
              <View style={styles.lockIcon} />
            </View>
            <Text style={[styles.stepTitle, { color: colors.text }]}>Create a password</Text>
            <Text style={[styles.emailDisplay, { color: colors.textSecondary }]}>{email}</Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Password</Text>
              <View style={[styles.passwordContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.passwordInput, { color: colors.text }]}
                  placeholder="Create a strong password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!showPassword}
                  autoFocus
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} color={colors.textSecondary} /> : <Eye size={20} color={colors.textSecondary} />}
                </TouchableOpacity>
              </View>
              <Text style={[styles.inputHint, { color: colors.textSecondary }]}>Must be at least 6 characters</Text>
            </View>

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
              disabled={password.length < 6}
              style={styles.redButton}
            />

            <View style={[styles.nextStepsCard, { backgroundColor: isDark ? colors.surface : '#f3f4f6' }]}>
              <Text style={[styles.nextStepsTitle, { color: colors.text }]}>Next Steps:</Text>
              <Text style={[styles.nextStepItem, { color: colors.textSecondary }]}>• Complete your profile</Text>
              <Text style={[styles.nextStepItem, { color: colors.textSecondary }]}>• Add photos</Text>
              <Text style={[styles.nextStepItem, { color: colors.textSecondary }]}>• Start swiping!</Text>
            </View>
          </View>
        );
    }
  };

  return (
    <ScreenLayout style={styles.container}>
      {step === 'LANDING' && (
        <LinearGradient
          colors={['#ef4444', '#db2777']}
          style={styles.hero}
        >
          <Heart size={80} color="white" fill="white" />
          <Text style={styles.heroTitle}>Swipee</Text>
          <Text style={styles.heroSubtitle}>Find Your Perfect Match</Text>
        </LinearGradient>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[
          styles.formContainer,
          { backgroundColor: isDark ? colors.background : 'white' },
          step !== 'LANDING' && styles.formContainerFull
        ]}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {renderContent()}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    paddingTop: 10,
    overflow: 'hidden',
  },
  formContainerFull: {
    marginTop: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 30,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  backButton: {
    padding: 5,
  },
  innerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
  terms: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 30,
    lineHeight: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  emailDisplay: {
    fontSize: 16,
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
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  lockIcon: {
    width: 20,
    height: 24,
    borderWidth: 2,
    borderRadius: 4,
    marginTop: 6,
  },
  googleButton: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
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
  },
  dividerText: {
    marginHorizontal: 15,
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
  },
  inputHint: {
    fontSize: 13,
    marginTop: 6,
  },
  link: {
    color: '#ef4444',
    fontWeight: '600',
  },
  nextStepsCard: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    marginTop: 20,
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  nextStepItem: {
    fontSize: 15,
    marginBottom: 6,
  },
});
