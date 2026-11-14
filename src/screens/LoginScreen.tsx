import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { supabase, supabaseConfigError } from '../services/supabase';

type Notice = {
  type: 'error' | 'success';
  text: string;
};

const topInset = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0;

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState<Notice | null>(
    supabaseConfigError ? { type: 'error', text: supabaseConfigError } : null,
  );
  const [loading, setLoading] = useState(false);

  async function signIn() {
    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setNotice({ type: 'error', text: 'Escribe el correo y la contraseña.' });
      return;
    }

    if (!cleanEmail.includes('@')) {
      setNotice({ type: 'error', text: 'Escribe un correo electrónico válido.' });
      return;
    }

    if (!supabase) {
      setNotice({
        type: 'error',
        text: supabaseConfigError ?? 'Supabase no está configurado.',
      });
      return;
    }

    setLoading(true);
    setNotice(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        setNotice({ type: 'error', text: loginErrorMessage(error.message) });
      }
    } catch {
      setNotice({
        type: 'error',
        text: 'No se pudo iniciar sesión. Revisa tu conexión e inténtalo de nuevo.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { paddingTop: topInset }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.kicker}>Programación II</Text>
            <Text style={styles.title}>PrograIIExamelFinal</Text>
            <Text style={styles.subtitle}>
              Inicia sesión con tu correo y contraseña.
            </Text>

            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              placeholder="correo@ejemplo.com"
              placeholderTextColor="#8A97A3"
              editable={!loading}
              style={styles.input}
            />

            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="current-password"
              textContentType="password"
              placeholder="Tu contraseña"
              placeholderTextColor="#8A97A3"
              editable={!loading}
              style={styles.input}
            />

            <NoticeBanner notice={notice} />

            <Pressable
              accessibilityRole="button"
              onPress={signIn}
              disabled={loading}
              style={({ pressed }) => [
                styles.button,
                pressed && !loading && styles.pressed,
                loading && styles.disabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Iniciar sesión</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function loginErrorMessage(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes('invalid login credentials')) {
    return 'Correo o contraseña incorrectos.';
  }

  if (normalized.includes('email not confirmed')) {
    return 'Debes confirmar el correo antes de iniciar sesión.';
  }

  return 'No se pudo iniciar sesión. Revisa tus datos e inténtalo de nuevo.';
}

function NoticeBanner({ notice }: { notice: Notice | null }) {
  if (!notice) {
    return null;
  }

  const isError = notice.type === 'error';

  return (
    <View style={[styles.notice, isError ? styles.noticeError : styles.noticeSuccess]}>
      <Text style={[styles.noticeText, isError ? styles.noticeErrorText : styles.noticeSuccessText]}>
        {notice.text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F4F7F8',
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E3EAEB',
  },
  kicker: {
    color: '#0F6E6B',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 8,
    color: '#14202B',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 20,
    color: '#5E6E7A',
    fontSize: 16,
    lineHeight: 22,
  },
  label: {
    marginBottom: 8,
    color: '#14202B',
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#D5DEE2',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    backgroundColor: '#F8FAFB',
    color: '#14202B',
    fontSize: 16,
  },
  button: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F6E6B',
    marginTop: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.7,
  },
  notice: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  noticeError: {
    backgroundColor: '#FDECEC',
  },
  noticeSuccess: {
    backgroundColor: '#E7F6EF',
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 20,
  },
  noticeErrorText: {
    color: '#9B2C2C',
  },
  noticeSuccessText: {
    color: '#1E7A46',
  },
});
