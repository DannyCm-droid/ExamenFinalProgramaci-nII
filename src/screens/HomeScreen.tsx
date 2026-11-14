import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../services/supabase';

type HomeScreenProps = {
  email: string;
};

type Notice = {
  type: 'error' | 'success';
  text: string;
};

const topInset = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0;

export function HomeScreen({ email }: HomeScreenProps) {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busy, setBusy] = useState(false);

  async function openGallery() {
    setNotice(null);
    setBusy(true);

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setNotice({
          type: 'error',
          text: 'Permiso de galería denegado. No se puede seleccionar una fotografía.',
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });

      const asset = result.assets?.[0];

      if (result.canceled || !asset) {
        return;
      }

      savePhoto(asset.uri, false);
    } catch {
      setNotice({ type: 'error', text: 'No se pudo abrir la galería.' });
    } finally {
      setBusy(false);
    }
  }

  async function takePhoto() {
    setNotice(null);
    setBusy(true);

    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        setNotice({
          type: 'error',
          text: 'Permiso de cámara denegado. Actívalo para tomar una fotografía.',
        });
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });

      const asset = result.assets?.[0];

      if (result.canceled || !asset) {
        return;
      }

      savePhoto(asset.uri, true);
    } catch {
      setNotice({ type: 'error', text: 'No se pudo abrir la cámara.' });
    } finally {
      setBusy(false);
    }
  }

  function savePhoto(uri: string, fromCamera: boolean) {
    const updated = photoUri !== null;
    setPhotoUri(uri);

    if (updated) {
      setNotice({ type: 'success', text: 'La fotografía se actualizó.' });
      return;
    }

    setNotice({
      type: 'success',
      text: fromCamera
        ? 'Fotografía capturada.'
        : 'Fotografía seleccionada de la galería.',
    });
  }

  function removePhoto() {
    if (!photoUri) {
      setNotice({ type: 'error', text: 'No hay una fotografía para eliminar.' });
      return;
    }

    setPhotoUri(null);
    setNotice({ type: 'success', text: 'La fotografía se eliminó de la vista previa.' });
  }

  async function signOut() {
    if (!supabase) {
      return;
    }

    setBusy(true);
    setNotice(null);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        setNotice({ type: 'error', text: 'No se pudo cerrar la sesión. Inténtalo de nuevo.' });
      }
    } catch {
      setNotice({ type: 'error', text: 'No se pudo cerrar la sesión. Inténtalo de nuevo.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { paddingTop: topInset }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>PrograIIExamelFinal</Text>
        <Text style={styles.title}>Bienvenido</Text>
        <Text style={styles.subtitle}>Sesión iniciada como {email}</Text>

        <View style={styles.photoFrame}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
          ) : (
            <Text style={styles.placeholder}>Todavía no hay una fotografía</Text>
          )}
        </View>

        <Text style={styles.help}>
          Elige una fotografía de la galería o toma una nueva. Si ya hay una, se reemplaza.
        </Text>

        <NoticeBanner notice={notice} />

        {busy ? <ActivityIndicator color="#0F6E6B" style={styles.spinner} /> : null}

        <ActionButton label="Abrir galería" onPress={openGallery} disabled={busy} />
        <ActionButton label="Tomar fotografía" onPress={takePhoto} disabled={busy} />
        <ActionButton
          label="Eliminar fotografía"
          onPress={removePhoto}
          disabled={busy}
          variant="danger"
        />
        <ActionButton
          label="Cerrar sesión"
          onPress={signOut}
          disabled={busy}
          variant="ghost"
        />
      </ScrollView>
    </SafeAreaView>
  );
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

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'danger' | 'ghost';
};

function ActionButton({ label, onPress, disabled, variant = 'primary' }: ActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        variant === 'danger' && styles.dangerButton,
        variant === 'ghost' && styles.ghostButton,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          variant === 'danger' && styles.dangerText,
          variant === 'ghost' && styles.ghostText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F4F7F8',
  },
  content: {
    padding: 24,
    paddingBottom: 40,
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
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 6,
    color: '#5E6E7A',
    fontSize: 16,
  },
  photoFrame: {
    marginTop: 24,
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E7EEEF',
    borderWidth: 1,
    borderColor: '#D5DEE2',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    color: '#5E6E7A',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  help: {
    marginTop: 12,
    marginBottom: 16,
    color: '#5E6E7A',
    fontSize: 14,
    lineHeight: 20,
  },
  spinner: {
    marginBottom: 12,
  },
  button: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F6E6B',
    marginBottom: 12,
  },
  dangerButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7B4B4',
  },
  ghostButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D5DEE2',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dangerText: {
    color: '#9B2C2C',
  },
  ghostText: {
    color: '#14202B',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.6,
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
