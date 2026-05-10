import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  TextInput,
  FlatList,
  ScrollView,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { createClient } from '@supabase/supabase-js';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const supabaseUrl = 'https://tyoortifskmwxsbitocz.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5b29ydGlmc2ttd3hzYml0b2N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NTQxMzcsImV4cCI6MjA4MDUzMDEzN30.iZNUELdluaif0cLhWV1_jKJJBdr2xe4Ew64WLqQcDwU';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const Stack = createNativeStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const categorie = [
  { nome: 'Cibo', icon: '🍎' },
  { nome: 'Vestiti bimbo', icon: '🧦' },
  { nome: 'Giochi', icon: '🧸' },
  { nome: 'Libri', icon: '📚' },
  { nome: 'Coperte', icon: '🛏️' },
  { nome: 'Disegni', icon: '🎨' },
  { nome: 'Altro', icon: '🌈' },
];

const COLORS = {
  primary: '#4A90E2',
  primaryLight: '#7BB3F0',
  background: '#D9ECFF',
  authBackground: '#D9ECFF',
  cardBackground: '#FFFFFF',
  cardBorder: '#BBDEFB',
  textDark: '#1E3A8A',
  textMedium: '#5C7CBA',
  inputBorder: '#B3E5FC',
  secondaryBg: '#F0F8FF',
  buttonRitira: '#90CAF9',
  mapPin: '#4A90E2',
};

/* ==================== LOGIN ==================== */
function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailValid, setEmailValid] = useState(null);

  const passwordRef = useRef(null);

  const validateEmail = (text) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(text.trim());
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    if (text.trim() === '') {
      setEmailValid(null);
    } else {
      setEmailValid(validateEmail(text));
    }
  };

  const onLogin = async () => {
    if (!email.trim()) return Alert.alert('Email mancante', 'Inserisci la tua email');
    if (!emailValid) return Alert.alert('Email non valida', 'Controlla il formato (es. nome@esempio.com)');
    if (!password) return Alert.alert('Password mancante', 'Inserisci la tua password segreta');

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          Alert.alert('Accesso fallito', 'Email o password non corretti');
        } else {
          Alert.alert('Errore', error.message);
        }
      }
    } catch (e) {
      Alert.alert('Errore', 'Qualcosa è andato storto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.authBackground}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20 }}>
          <View style={styles.authWrapper}>
            <View style={{ height: 50 }} />
            <View style={styles.logoCloud}>
              <Text style={styles.logoText}>✨JOY✨</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Benvenuti</Text>
              <Text style={styles.cardSubtitle}>Accedi per donare o ricevere</Text>

              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    emailValid === true && { borderColor: '#4CAF50' },
                    emailValid === false && { borderColor: '#FF4444' },
                  ]}
                  placeholder="Email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  blurOnSubmit={false}
                  value={email}
                  onChangeText={handleEmailChange}
                />
                {emailValid !== null && (
                  <Text style={[styles.validationIcon, emailValid ? styles.validIcon : styles.invalidIcon]}>
                    {emailValid ? '✅' : '❌'}
                  </Text>
                )}
              </View>

              {emailValid === false && (
                <Text style={styles.errorText}>Email non valida. Esempio: nome@esempio.com</Text>
              )}

              <TextInput
                ref={passwordRef}
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={onLogin}
                value={password}
                onChangeText={setPassword}
              />

              <TouchableOpacity style={styles.primaryButton} onPress={onLogin} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>Entra nel mondo JOY</Text>}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.linkText}>
                  Prima volta? <Text style={styles.linkBold}>Crea un profilo</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ==================== REGISTRAZIONE - VERSIONE MAGICA ==================== */
function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailValid, setEmailValid] = useState(null);

  const validateEmail = (text) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(text.trim());

  const handleEmailChange = (text) => {
    setEmail(text);
    setEmailValid(text.trim() === '' ? null : validateEmail(text));
  };

  const onRegister = async () => {
    if (!email.trim() || !emailValid || !password || password.length < 6) {
      Alert.alert('Ops..', 'Controlla email e password (minimo 6 caratteri)');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({ email: email.trim(), password });

      if (error) {
        if (error.message.toLowerCase().includes('already registered')) {
          Alert.alert('Email già usata ✨', 'Vai al login!');
        } else {
          Alert.alert('Errore', error.message);
        }
        return;
      }

      // Registrazione riuscita → nessun alert
      // La logica principale mostrerà automaticamente la schermata profilo

    } catch (e) {
      Alert.alert('Errore', 'Riprova più tardi');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.auth.signOut();
      }

      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error("Errore durante il back da Register:", error);
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#E3F2FD' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        
        {/* FRECCIA INDIETRO */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 8,
        }}>
          <TouchableOpacity 
            onPress={handleBack}
            hitSlop={{ top: 20, bottom: 20, left: 40, right: 40 }}
          >
            <Ionicons name="arrow-back" size={28} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
          {/* Logo grande con magia */}
          <View style={{ alignItems: 'center', marginBottom: 30 }}>
            <View style={{ 
              backgroundColor: '#FFFFFF', 
              padding: 20, 
              borderRadius: 100, 
              elevation: 10,
              shadowColor: '#4A90E2',
              shadowOpacity: 0.4,
              shadowRadius: 20,
            }}>
              <Text style={{ fontSize: 80 }}>✨</Text>
            </View>
            <Text style={{ fontSize: 52, fontWeight: '900', color: COLORS.primary, marginTop: 16 }}>
              JOY
            </Text>
            <Text style={{ fontSize: 18, color: COLORS.textDark, marginTop: 8, fontWeight: '600' }}>
              Il mondo dove le cose belle non finiscono
            </Text>
          </View>

          {/* Card grande */}
          <View style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 32,
            padding: 28,
            elevation: 8,
            borderWidth: 3,
            borderColor: '#BBDEFB',
          }}>
            <Text style={{ fontSize: 26, fontWeight: '800', color: COLORS.primary, textAlign: 'center', marginBottom: 8 }}>
              Crea il tuo profilo
            </Text>

            {/* Email */}
            <View style={{ position: 'relative', marginBottom: 16 }}>
              <TextInput
                style={[
                  styles.input,
                  { paddingLeft: 48 },
                  emailValid === true && { borderColor: '#4CAF50' },
                  emailValid === false && { borderColor: '#FF4444' },
                ]}
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={handleEmailChange}
              />
              <Text style={{ position: 'absolute', left: 16, top: 16, fontSize: 18 }}>📧</Text>
              {emailValid !== null && (
                <Text style={{ position: 'absolute', right: 16, top: 16, fontSize: 20 }}>
                  {emailValid ? '✅' : '❌'}
                </Text>
              )}
            </View>

            {/* Password */}
            <View style={{ position: 'relative', marginBottom: 24 }}>
              <TextInput
                style={[styles.input, { paddingLeft: 48 }]}
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <Text style={{ position: 'absolute', left: 16, top: 16, fontSize: 18 }}>🔑</Text>
            </View>

            {/* Bottone crea account */}
            <TouchableOpacity 
              style={[styles.primaryButton, { paddingVertical: 18, borderRadius: 30 }]} 
              onPress={onRegister} 
              disabled={loading}
            >
              {loading ? 
                <ActivityIndicator color="#FFF" size="large" /> : 
                <Text style={{ color: '#FFF', fontSize: 20, fontWeight: '800' }}>
                  ✨Crea l’account✨
                </Text>
              }
            </TouchableOpacity>

            {/* Link login - VERSIONE RIGOROSA */}
            <TouchableOpacity 
              style={{ marginTop: 24 }} 
              onPress={() => {
                if (!email.trim() || !password.trim()) {
                  Alert.alert(
                    "Dati mancanti",
                    "Per passare al login inserisci email e password",
                    [{ text: "Ok", style: "cancel" }]
                  );
                  return;
                }

                navigation.navigate('Login');
              }}
            >
              <Text style={{ textAlign: 'center', fontSize: 16, color: COLORS.textDark }}>
                Hai già un account? <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Accedi</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ==================== PROFILO SETUP ==================== */
function ProfileScreen({ onProfileCompleted, navigation }) {
  const [nome, setNome] = useState('');
  const [telefono, setTelefono] = useState('');
  const [citta, setCitta] = useState('');
  const [fotoProfiloUri, setFotoProfiloUri] = useState(null);
  const [fotoUrl, setFotoUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profili')
        .select('nome, telefono, citta, foto_url')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setNome(data.nome || '');
        setTelefono(data.telefono || '');
        setCitta(data.citta || '');
        setFotoUrl(data.foto_url || null);
      }
    };
    loadProfile();
  }, []);

  const pickProfilePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFotoProfiloUri(result.assets[0].uri);
    }
  };

  const salvaProfilo = async () => {
    if (!nome.trim() || !citta.trim()) {
      return Alert.alert('Attenzione', 'Nome e città sono obbligatori');
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let finalFotoUrl = fotoUrl;

      if (fotoProfiloUri) {
        const fileExt = fotoProfiloUri.split('.').pop() || 'jpg';
        const fileName = `${user.id}/profile.${fileExt}`;

        const formData = new FormData();
        formData.append('file', {
          uri: fotoProfiloUri,
          name: `profile.${fileExt}`,
          type: `image/${fileExt}`,
        });

        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(fileName, formData, { upsert: true });

        if (uploadError) throw uploadError;

        finalFotoUrl = `${supabaseUrl}/storage/v1/object/public/profile-photos/${fileName}`;
        setFotoUrl(finalFotoUrl);
      }

      const { error } = await supabase.from('profili').upsert({
        user_id: user.id,
        nome,
        telefono,
        citta,
        foto_url: finalFotoUrl,
      });

      if (error) throw error;

      Alert.alert('Perfetto! ✨', 'Il tuo profilo è pronto.');
      onProfileCompleted();
    } catch (e) {
      console.error('Errore salvataggio profilo:', e);
      Alert.alert('Errore', 'Qualcosa è andato storto. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = async () => {
    try {
      await supabase.auth.signOut();
      // Non serve navigation.replace qui
      // La logica condizionale in InnerApp mostrerà automaticamente Login
    } catch (error) {
      console.error("Errore durante il logout:", error);
      // In caso di errore raro, possiamo mostrare un alert
      Alert.alert("Errore", "Problema durante l'uscita. Riprova.");
    }
  };

  return (
    <SafeAreaView style={styles.screenBackground}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        
        {/* FRECCIA INDIETRO - Logout immediato */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 8,
        }}>
          <TouchableOpacity 
            onPress={handleBack}
            hitSlop={{ top: 20, bottom: 20, left: 40, right: 40 }}
          >
            <Ionicons name="arrow-back" size={28} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
          <View style={styles.card}>
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <TouchableOpacity onPress={pickProfilePhoto}>
                <View style={{
                  width: 140,
                  height: 140,
                  borderRadius: 70,
                  backgroundColor: '#BBDEFB',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 4,
                  borderColor: COLORS.primary,
                  overflow: 'hidden',
                }}>
                  {fotoProfiloUri || fotoUrl ? (
                    <Image
                      source={{ uri: fotoProfiloUri || fotoUrl }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={{ fontSize: 60 }}>📸</Text>
                  )}
                </View>
                <Text style={{ marginTop: 8, color: COLORS.primary, fontWeight: '600' }}>
                  {fotoProfiloUri || fotoUrl ? 'Cambia foto' : 'Aggiungi foto profilo'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.cardTitle}>Completa il tuo profilo 💫</Text>
            <Text style={styles.cardSubtitle}>
              Metti il tuo nome, dove vivi e (se vuoi) una foto: così tutti si fidano di più!
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Nome e cognome (obbligatorio)"
              value={nome}
              onChangeText={setNome}
            />

            <TextInput
              style={styles.input}
              placeholder="Telefono (opzionale)"
              keyboardType="phone-pad"
              value={telefono}
              onChangeText={setTelefono}
            />

            <TextInput
              style={styles.input}
              placeholder="Città / Quartiere (obbligatorio)"
              value={citta}
              onChangeText={setCitta}
            />

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={salvaProfilo}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Salva e inizia la magia</Text>
              )}
            </TouchableOpacity>

            <Text style={{ textAlign: 'center', marginTop: 16, color: COLORS.textMedium, fontSize: 12 }}>
              La foto è opzionale, ma rende tutto più bello e sicuro! 📸
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ==================== ONBOARDING ==================== */
function OnboardingScreen({ onFinish, navigation }) {
  const [index, setIndex] = useState(0);
  const [nonMostrarePiu, setNonMostrarePiu] = useState(false);

  const pages = [
    {
      title: "Benvenuto nel mondo JOY 💙",
      subtitle: "Dona o ricevi cibo, giochi, libri, vestiti o qualsiasi altra cosa per chiunque abbia bisogno...\ntutto gratis e vicino a casa!",
      emoji: "✨🎁🧸",
    },
    {
      title: "Dona una gioia 🎁",
      subtitle: "Hai qualcosa che non usi più?\nFai una foto, descrivilo e indica dove si trova.\nUna altra famiglia lo ritirerà con un sorriso!",
      emoji: "📸🏡",
    },
    {
      title: "Trova gioie vicino a te 🗺️",
      subtitle: "Guarda la mappa, tocca un pin blu,\nscrivi al donatore nella chat e concordate il ritiro.\nÈ semplice e sicuro.",
      emoji: "🔍💬",
    },
    {
      title: "Pronto a diffondere sorrisi? 😊",
      subtitle: "Ricorda: il segreto della felicità è DONARE.\nIniziamo questa magia insieme!",
      emoji: "💙🌟",
      isLast: true,
    },
  ];

  const next = async () => {
    if (index < pages.length - 1) {
      setIndex(index + 1);
    } else {
      if (nonMostrarePiu) {
        await AsyncStorage.setItem('onboardingHidden', 'true');
      }
      if (onFinish) {
        onFinish();
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      }
    }
  };

  const page = pages[index];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 }}>
        <Text style={{ fontSize: 80, marginBottom: 30 }}>{page.emoji}</Text>

        <Text style={{ fontSize: 28, fontWeight: '900', color: COLORS.primary, textAlign: 'center', marginBottom: 20 }}>
          {page.title}
        </Text>

        <Text style={{ fontSize: 18, color: COLORS.textDark, textAlign: 'center', lineHeight: 28 }}>
          {page.subtitle}
        </Text>

        <View style={{ flexDirection: 'row', marginTop: 50 }}>
          {pages.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === index ? 30 : 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: i === index ? COLORS.primary : '#BBDEFB',
                marginHorizontal: 5,
              }}
            />
          ))}
        </View>

        {page.isLast && (
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', marginTop: 30, paddingHorizontal: 20 }}
            onPress={() => setNonMostrarePiu(!nonMostrarePiu)}
          >
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                borderWidth: 2,
                borderColor: COLORS.primary,
                backgroundColor: nonMostrarePiu ? COLORS.primary : '#FFF',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}
            >
              {nonMostrarePiu && <Text style={{ color: '#FFF', fontSize: 18 }}>✓</Text>}
            </View>
            <Text style={{ fontSize: 16, color: COLORS.textDark }}>
              Non visualizzare più
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.primaryButton, { marginTop: 40, width: '80%' }]} onPress={next}>
          <Text style={styles.primaryButtonText}>
            {page.isLast ? 'Inizia!' : 'Avanti'}
          </Text>
        </TouchableOpacity>

        {index > 0 && !page.isLast && (
          <TouchableOpacity onPress={() => setIndex(index - 1)} style={{ marginTop: 20 }}>
            <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Indietro</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

/* ==================== HOME ==================== */
function HomeScreen({ navigation }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const rivediOnboardingSubito = async () => {
    await AsyncStorage.removeItem('onboardingHidden');
    navigation.navigate('OnboardingForce');
  };

  return (
    <SafeAreaView style={styles.screenBackground}>
      <View style={[styles.container, { paddingTop: 30 }]}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Benvenuto nel Mondo</Text>
          <Text style={styles.joyTitle}>JOY</Text>

          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <Text style={styles.homeSubtitleLine1}>Risvegliamo il bene che è in</Text>
            <Text style={styles.homeSubtitleLine2}>NOI</Text>
            <Text style={styles.homeSubtitleLine3}>donando un</Text>
            <Text style={styles.homeSubtitleLine4}>SORRISO</Text>
          </View>
        </View>

        <View style={styles.homeButtonsRow}>
          <TouchableOpacity style={[styles.cardButton, { marginRight: 8 }]} onPress={() => navigation.navigate('Dona')}>
            <Text style={styles.cardEmoji}>🎁</Text>
            <Text style={styles.cardButtonTitle}>Dona</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.cardButton, { marginHorizontal: 4 }]} onPress={() => navigation.navigate('ChatList')}>
            <Text style={styles.cardEmoji}>💬</Text>
            <Text style={styles.cardButtonTitle}>Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.cardButton, { marginLeft: 8 }]} onPress={() => navigation.navigate('Mappa')}>
            <Text style={styles.cardEmoji}>🧺</Text>
            <Text style={styles.cardButtonTitle}>Ricevi</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.homeBottom}>
          <Text style={styles.homeHintTextSmall}>Il segreto di vivere felici, è DONARE.</Text>

          <TouchableOpacity onPress={rivediOnboardingSubito} style={{ marginTop: 20 }}>
            <Text style={{ color: COLORS.primary, fontSize: 16, fontWeight: '600' }}>
              Scopri lo scopo dell’app
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogout} style={{ marginTop: 20 }}>
            <Text style={styles.logoutText}>Esci</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

/* ==================== LISTA CHAT ==================== */
function ChatListScreen({ navigation }) {
  const [conversazioni, setConversazioni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState(null);

  const caricaDati = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setMyId(user.id);

    const { data: convs } = await supabase
      .from('conversazioni')
      .select('id, utente1, utente2, ultimo_messaggio')
      .or(`utente1.eq.${user.id},utente2.eq.${user.id}`)
      .order('ultimo_messaggio', { ascending: false });

    if (!convs || convs.length === 0) {
      setConversazioni([]);
      setLoading(false);
      return;
    }

    const convConUltimoMsg = await Promise.all(
      convs.map(async (conv) => {
        const altroUtenteId = conv.utente1 === user.id ? conv.utente2 : conv.utente1;

        const { data: profiloAltro } = await supabase
          .from('profili')
          .select('nome, citta')
          .eq('user_id', altroUtenteId)
          .maybeSingle();

        const { data: msg } = await supabase
          .from('messaggi_privati')
          .select('testo, created_at')
          .eq('conversazione_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        return {
          id: conv.id,
          altroUtenteId,
          nome: profiloAltro?.nome || 'Utente magico',
          citta: profiloAltro?.citta || '',
          ultimoMessaggio: msg?.testo || 'Nessun messaggio ancora',
          dataUltimo: msg?.created_at || conv.ultimo_messaggio,
        };
      })
    );

    setConversazioni(convConUltimoMsg);
    setLoading(false);
  };

  useEffect(() => {
    caricaDati();

    const subscription = supabase
      .channel('messaggi_privati')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messaggi_privati' },
        () => caricaDati()
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10, color: COLORS.textDark }}>Caricamento chat...</Text>
      </SafeAreaView>
    );
  }

  if (conversazioni.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
          <Text style={{ fontSize: 60 }}>💬</Text>
          <Text style={{ fontSize: 22, fontWeight: '800', color: COLORS.textDark, textAlign: 'center', marginTop: 20 }}>
            Le tue chat sono vuote
          </Text>
          <Text style={{ fontSize: 16, color: COLORS.textMedium, textAlign: 'center', marginTop: 10 }}>
            Inizia una conversazione toccando il profilo di qualcuno o dalla mappa!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const formattaData = (dataIso) => {
    if (!dataIso) return '';
    const ora = new Date(dataIso);
    const oggi = new Date();
    if (ora.toDateString() === oggi.toDateString()) {
      return ora.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    }
    return ora.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
        <Text style={{ fontSize: 28, fontWeight: '900', color: COLORS.primary }}>Chat</Text>
      </View>

      <FlatList
        data={conversazioni}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#BBDEFB', marginHorizontal: 20 }} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', alignItems: 'center' }}
            onPress={() => navigation.navigate('ChatPrivata', {
              conversazioneId: item.id,
              altroUtenteNome: item.nome,
            })}
          >
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>🙂</Text>
            </View>

            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.textDark }}>{item.nome}</Text>
              <Text style={{ fontSize: 14, color: COLORS.textMedium, marginTop: 2 }} numberOfLines={1}>
                {item.ultimoMessaggio}
              </Text>
            </View>

            <Text style={{ fontSize: 12, color: COLORS.textMedium }}>
              {formattaData(item.dataUltimo)}
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

/* ==================== FUNZIONE CONVERSAZIONE ==================== */
async function ottieniOCreaConversazione(myId, altroUtenteId) {
  const utenteA = myId < altroUtenteId ? myId : altroUtenteId;
  const utenteB = myId < altroUtenteId ? altroUtenteId : myId;

  let { data: conv } = await supabase
    .from('conversazioni')
    .select('id')
    .eq('utente1', utenteA)
    .eq('utente2', utenteB)
    .maybeSingle();

  if (conv) return conv.id;

  const { data: newConv, error } = await supabase
    .from('conversazioni')
    .insert({
      utente1: utenteA,
      utente2: utenteB,
      ultimo_messaggio: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.log('Errore creazione conversazione:', error);
    return null;
  }

  return newConv.id;
}

/* ==================== CHAT PRIVATA ==================== */
function ChatPrivataScreen({ route, navigation }) {
  const { conversazioneId: initialId, altroUtenteNome } = route.params || {};
  const [conversazioneId, setConversazioneId] = useState(initialId);
  const [messaggi, setMessaggi] = useState([]);
  const [testo, setTesto] = useState('');
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState(null);
  const [myName, setMyName] = useState('');
  const scrollRef = useRef(null);

  const insets = useSafeAreaInsets();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigation.navigate('Home');

      setMyId(user.id);

      const { data: profilo } = await supabase
        .from('profili')
        .select('nome')
        .eq('user_id', user.id)
        .maybeSingle();

      setMyName(profilo?.nome || user.email.split('@')[0]);

      if (conversazioneId) {
        const { data } = await supabase
          .from('messaggi_privati')
          .select('*')
          .eq('conversazione_id', conversazioneId)
          .order('created_at', { ascending: true });

        setMessaggi(data || []);
      }

      setLoading(false);

      // Scroll iniziale
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 300);
    };

    init();

    const subscription = supabase
      .channel(`messaggi_privati:${conversazioneId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messaggi_privati',
          filter: `conversazione_id=eq.${conversazioneId}`,
        },
        (payload) => {
          setMessaggi((prev) => [...prev, payload.new]);
          setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [conversazioneId]);

  const inviaMessaggio = async () => {
    if (!testo.trim() || !conversazioneId || !myId) return;

    const tempMsg = {
      id: Date.now().toString(),
      conversazione_id: conversazioneId,
      mittente_id: myId,
      testo: testo.trim(),
      created_at: new Date().toISOString(),
    };

    setMessaggi(prev => [...prev, tempMsg]);
    setTesto('');

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    const { error } = await supabase
      .from('messaggi_privati')
      .insert({
        conversazione_id: conversazioneId,
        mittente_id: myId,
        testo: testo.trim(),
      });

    if (error) {
      Alert.alert('Errore', 'Impossibile inviare il messaggio');
      setMessaggi(prev => prev.filter(m => m.id !== tempMsg.id));
      return;
    }

    // Aggiornamento timestamp conversazione
    await supabase
      .from('conversazioni')
      .update({ ultimo_messaggio: new Date().toISOString() })
      .eq('id', conversazioneId);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={
          Platform.OS === 'ios'
            ? insets.top + 0 + 16 + 8 // status bar/notch + header approx + padding extra
            : 0
        }
      >
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: '#FFFFFF',
            borderBottomWidth: 1,
            borderBottomColor: '#BBDEFB',
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: '700',
              color: COLORS.textDark,
            }}>
              {altroUtenteNome || 'Chat'}
            </Text>
          </View>

          {/* Area messaggi */}
          <ScrollView
            ref={scrollRef}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              flexGrow: 1,
              padding: 16,
              paddingBottom: 20 + insets.bottom + 10,
            }}
            onContentSizeChange={() => {
              scrollRef.current?.scrollToEnd({ animated: true });
            }}
          >
            {messaggi.map((m) => {
              const isMine = m.mittente_id === myId;
              return (
                <View
                  key={m.id}
                  style={[
                    isMine ? styles.mioMsg : styles.loroMsg,
                    { marginVertical: 6 }
                  ]}
                >
                  <Text style={styles.msgText}>{m.testo}</Text>
                </View>
              );
            })}
          </ScrollView>

          {/* Input bar */}
          <View style={[
            styles.inputBarContainer,
            {
              paddingBottom: insets.bottom,
              backgroundColor: COLORS.background,
            }
          ]}>
            <View style={styles.inputBar}>
              <TextInput
                style={styles.chatInput}
                placeholder="Scrivi un messaggio..."
                value={testo}
                onChangeText={setTesto}
                multiline
                maxHeight={120}
                blurOnSubmit={false}
                returnKeyType="send"
                onSubmitEditing={inviaMessaggio}
              />
              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  { opacity: testo.trim() ? 1 : 0.6 }
                ]}
                onPress={inviaMessaggio}
                disabled={!testo.trim()}
              >
                <Text style={styles.sendBtnText}>Invia</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ==================== PROFILO UTENTE ==================== */
function ProfiloUtenteScreen({ route, navigation }) {
  const { userId, nomeUtente } = route.params || {};
  const [profilo, setProfilo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState(null);

  useEffect(() => {
    const carica = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setMyId(user?.id || null);

      if (!userId) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('profili')
        .select('nome, citta, telefono')
        .eq('user_id', userId)
        .maybeSingle();

      setProfilo(data);
      setLoading(false);
    };

    carica();
  }, [userId]);

  const avviaChatPrivata = async () => {
    if (!myId || !userId || myId === userId) {
      Alert.alert('Impossibile', 'Non puoi chattare con te stesso!');
      return;
    }

    const convId = await ottieniOCreaConversazione(myId, userId);
    if (convId) {
      navigation.navigate('ChatPrivata', {
        conversazioneId: convId,
        altroUtenteNome: profilo?.nome || nomeUtente || 'Utente',
      });
    } else {
      Alert.alert('Errore', 'Impossibile avviare la chat');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  const nome = profilo?.nome || nomeUtente || 'Utente JOY';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <View style={styles.card}>
            <View style={{ alignItems: 'center', marginBottom: 30 }}>
              <View style={[styles.profileAvatar, { width: 120, height: 120 }]}>
                <Text style={[styles.profileAvatarText, { fontSize: 60 }]}>🙂</Text>
              </View>
              <Text style={{ fontSize: 28, fontWeight: '900', color: COLORS.textDark, marginTop: 16 }}>
                {nome}
              </Text>
              {profilo?.citta && (
                <Text style={{ fontSize: 18, color: COLORS.textMedium, marginTop: 6 }}>
                  📍 {profilo.citta}
                </Text>
              )}
            </View>

            {profilo?.telefono && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 16, color: COLORS.textDark }}>📞 Telefono</Text>
                <Text style={{ fontSize: 18, fontWeight: '600', color: COLORS.primary, marginTop: 4 }}>
                  {profilo.telefono}
                </Text>
              </View>
            )}

            {myId && myId !== userId && (
              <TouchableOpacity style={styles.primaryButton} onPress={avviaChatPrivata}>
                <Text style={styles.primaryButtonText}>💬 Scrivi messaggio</Text>
              </TouchableOpacity>
            )}

            {myId === userId && (
              <View style={{ alignItems: 'center', marginTop: 20 }}>
                <Text style={{ fontSize: 16, color: COLORS.textMedium }}>Questo è il tuo profilo! ✨</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ==================== CERCA CITTÀ ==================== */
function CercaCittaScreen({ navigation, route }) {
  const [query, setQuery] = useState('');
  const [risultati, setRisultati] = useState([]);

  const cerca = async (text) => {
    setQuery(text);
    if (text.length < 3) return setRisultati([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&countrycodes=it&limit=5`
      );
      const data = await res.json();
      setRisultati(data);
    } catch (e) {
      console.log('Errore ricerca città', e);
    }
  };

  const scegli = (item) => {
    const onSelect = route?.params?.onSelect;
    if (onSelect && typeof onSelect === 'function') {
      onSelect({
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
      });
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.screenBackground}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Dove sei nel mondo? 🗺️</Text>
            <Text style={styles.cardSubtitle}>
              Scrivi il nome della città per far sapere alle altre famiglie dove si trova la tua gioia.
            </Text>

            <TextInput style={styles.input} placeholder="Es. Barletta..." value={query} onChangeText={cerca} autoFocus={false} />

            <FlatList
              data={risultati}
              keyExtractor={(i) => i.place_id.toString()}
              ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.risultatoItem} onPress={() => scegli(item)}>
                  <Text style={styles.risultatoTitolo}>{item.display_name.split(',')[0]}</Text>
                  <Text style={styles.risultatoDescrizione} numberOfLines={1}>
                    {item.display_name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ==================== DONA ==================== */
function DonaScreen({ navigation, route }) {
  const [fotoUris, setFotoUris] = useState([]);
  const [posizione, setPosizione] = useState(route?.params?.posizioneScelta || null);
  const [titolo, setTitolo] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [categoria, setCategoria] = useState('');
  const [modalCatVisible, setModalCatVisible] = useState(false);

  const prendiFoto = async () => {
    const remaining = 3 - fotoUris.length;
    if (remaining <= 0) return Alert.alert('Max 3 foto', 'Hai già aggiunto 3 foto per questa gioia.');

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.8,
      allowsMultipleSelection: true,
    });

    if (result.canceled) return;

    const newUris = (result.assets || []).slice(0, remaining).map((asset) => asset.uri);
    if (newUris.length === 0) return;

    setFotoUris((prev) => [...prev, ...newUris]);
  };

  const rimuoviFoto = (i) => setFotoUris(fotoUris.filter((_, index) => index !== i));

  const usaGPS = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permesso negato');

    const loc = await Location.getCurrentPositionAsync({});
    setPosizione(loc.coords);
    Alert.alert('Posizione magica trovata 🧭');
  };

  const apriCercaCitta = () => navigation.navigate('CercaCitta', { onSelect: (coords) => setPosizione(coords) });

  const pubblica = async () => {
    if (!titolo.trim()) return Alert.alert('Dai un nome alla tua gioia');
    if (!categoria) return Alert.alert('Scegli una categoria magica');
    if (!posizione) return Alert.alert('Scegli dove si trova la gioia');
    if (fotoUris.length === 0) return Alert.alert('Aggiungi almeno una foto colorata');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utente non trovato');

      const uploadedUrls = [];

      for (let i = 0; i < fotoUris.length; i++) {
        const uri = fotoUris[i];
        const fileExt = uri.split('.').pop()?.split('?')[0] || 'jpg';
        const fileName = `${user.id}/${Date.now()}_${i}.${fileExt}`;

        const formData = new FormData();
        formData.append('file', {
          uri: uri,
          name: `photo_${i}.${fileExt}`,
          type: `image/${fileExt}`,
        });

        const { error: uploadError } = await supabase.storage
          .from('doni-foto')
          .upload(fileName, formData, {
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const publicURL = `${supabaseUrl}/storage/v1/object/public/doni-foto/${fileName}`;
        uploadedUrls.push(publicURL);
      }

      const { error } = await supabase.from('doni').insert({
        user_id: user.id,
        lat: posizione.latitude,
        lng: posizione.longitude,
        titolo,
        descrizione,
        categoria,
        foto_urls: uploadedUrls,
        ritirato: false,
      });

      if (error) throw error;

      Alert.alert('Grazie! 🌟', 'Una nuova gioia è pronta a volare verso qualcuno.');

      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (err) {
      console.log(err);
      Alert.alert('Errore', 'Non sono riuscito a caricare le foto. Riprova!');
    }
  };

  return (
    <SafeAreaView style={styles.screenBackground}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 60 }}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Dona una gioia 🎁</Text>
            <Text style={styles.cardSubtitle}>Scegli cosa regalare, fai una foto e indica dove si trova.</Text>

            <TextInput style={styles.input} placeholder="Nome della gioia (es. Libro di favole)" value={titolo} onChangeText={setTitolo} />

            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              placeholder="Descrivi la gioia (colori, personaggi, età consigliata...)"
              multiline
              value={descrizione}
              onChangeText={setDescrizione}
            />

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Foto colorate 📸</Text>
              <Text style={styles.sectionHint}>Max 3 immagini</Text>
            </View>

            <TouchableOpacity style={styles.secondaryButton} onPress={prendiFoto}>
              <Text style={styles.secondaryButtonText}>Aggiungi foto ({fotoUris.length}/3)</Text>
            </TouchableOpacity>

            <View style={styles.fotoRow}>
              {fotoUris.map((uri, i) => (
                <View key={i} style={styles.fotoWrapper}>
                  <Image source={{ uri }} style={styles.fotoThumb} />
                  <TouchableOpacity onPress={() => rimuoviFoto(i)} style={styles.fotoRemove}>
                    <Text style={styles.fotoRemoveText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Dove si trova? 🏡</Text>
            </View>

            <View style={styles.rowButtons}>
              <TouchableOpacity style={styles.secondaryButtonHalf} onPress={usaGPS}>
                <Text style={styles.secondaryButtonText}>Posizione Attuale</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButtonHalf} onPress={apriCercaCitta}>
                <Text style={styles.secondaryButtonText}>Scegli città</Text>
              </TouchableOpacity>
            </View>

            {posizione && <Text style={styles.positionText}>Posizione impostata ✅</Text>}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Categoria magica 🌟</Text>
            </View>

            <TouchableOpacity style={styles.secondaryButton} onPress={() => setModalCatVisible(true)}>
              <Text style={styles.secondaryButtonText}>
                {categoria ? `Categoria: ${categoria}` : 'Scegli categoria'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryButton} onPress={pubblica}>
              <Text style={styles.primaryButtonText}>Pubblica la gioia</Text>
            </TouchableOpacity>

            <View style={{ height: 60 }} />
          </View>

          <Modal visible={modalCatVisible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalBox}>
                <Text style={styles.modalTitle}>Scegli la categoria</Text>
                <ScrollView>
                  {categorie.map((c) => (
                    <TouchableOpacity
                      key={c.nome}
                      style={styles.modalItem}
                      onPress={() => {
                        setCategoria(c.nome);
                        setModalCatVisible(false);
                      }}
                    >
                      <Text style={styles.modalEmoji}>{c.icon}</Text>
                      <Text style={{ fontSize: 18, color: COLORS.textDark }}>{c.nome}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity onPress={() => setModalCatVisible(false)}>
                  <Text style={styles.modalClose}>Chiudi</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ==================== DETTAGLIO MIO DONO ==================== */
function DettaglioMioDonoScreen({ route, navigation }) {
  const { dono } = route.params;
  const [loading, setLoading] = useState(false);

  const eliminaDono = async () => {
    Alert.alert(
      'Elimina gioia',
      'Sei sicuro di voler eliminare questa gioia? Non potrà più essere recuperata.',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // Opzionale: elimina le foto dallo storage
              if (dono.foto_urls && dono.foto_urls.length > 0) {
                const paths = dono.foto_urls.map(url => {
                  const parts = url.split('/doni-foto/')[1];
                  return parts ? decodeURIComponent(parts) : null;
                }).filter(Boolean);

                if (paths.length > 0) {
                  await supabase.storage.from('doni-foto').remove(paths);
                }
              }

              // IMPORTANTE: UPDATE invece di DELETE
              const { error } = await supabase
                .from('doni')
                .update({ ritirato: true })   // ← Questo è il modo per “nascondere” la gioia senza eliminarla dal database
                .eq('id', dono.id);

              if (error) throw error;

              Alert.alert('Eliminata ✨', 'La gioia è stata rimossa dalla mappa.');
              navigation.goBack();
            } catch (err) {
              console.error('Errore durante l’eliminazione:', err);
              Alert.alert('Errore', 'Impossibile eliminare la gioia.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.screenBackground}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{dono.titolo}</Text>
            <Text style={{ fontSize: 14, color: COLORS.textMedium, marginBottom: 12 }}>
              Categoria: {dono.categoria}
            </Text>

            {dono.foto_urls && dono.foto_urls.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                {dono.foto_urls.map((url, i) => (
                  <Image
                    key={i}
                    source={{ uri: url }}
                    style={{ width: 220, height: 220, borderRadius: 20, marginRight: 12 }}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            )}

            {dono.descrizione ? (
              <Text style={{ fontSize: 16, color: COLORS.textDark, lineHeight: 24, marginBottom: 20 }}>
                {dono.descrizione}
              </Text>
            ) : (
              <Text style={{ fontSize: 14, color: COLORS.textMedium, fontStyle: 'italic', marginBottom: 20 }}>
                Nessuna descrizione
              </Text>
            )}

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: '#FF4444' }]}
              onPress={eliminaDono}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.primaryButtonText}>🗑️ Elimina questa gioia</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ==================== MAPPA ==================== */
function MappaScreen({ navigation }) {
  const [doni, setDoni] = useState([]);
  const [posizioneUtente, setPosizioneUtente] = useState(null);
  const [myId, setMyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const caricaDoni = async () => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase
        .from('doni')
        .select('*')
        .eq('ritirato', false)           // ← Filtro fondamentale!
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Errore caricamento doni da Supabase:', error);
        Alert.alert('Errore', 'Impossibile caricare le gioie. Riprova.');
        setDoni([]);
      } else {
        const doniValidi = (data || []).filter(d => d.lat && d.lng);
        console.log(`Caricati ${doniValidi.length} doni validi`);
        setDoni(doniValidi);
      }
    } catch (err) {
      console.error('Eccezione durante caricamento doni:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);

      // Posizione utente
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          setPosizioneUtente(loc.coords);
        }
      } catch (err) {
        console.warn('Permesso posizione negato o errore:', err);
      }

      // Utente corrente
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setMyId(user.id);
      }

      // Caricamento iniziale
      await caricaDoni();
      setLoading(false);
    };

    init();

    // Realtime subscription
    const channel = supabase.channel('doni_map_realtime');
    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'doni' }, (payload) => {
        console.log('Evento realtime ricevuto:', {
          type: payload.eventType,
          id: payload.new?.id || payload.old?.id,
          ritirato: payload.new?.ritirato,
          timestamp: new Date().toLocaleTimeString()
        });

        if (payload.eventType === 'INSERT') {
          if (!payload.new.ritirato && payload.new.lat && payload.new.lng) {
            setDoni(prev => [...prev, payload.new]);
          }
        } 
        else if (payload.eventType === 'UPDATE') {
          if (payload.new.ritirato === true) {
            console.log(`Dono ${payload.new.id} marcato come ritirato → rimuovo dalla lista`);
            setDoni(prev => prev.filter(d => d.id !== payload.new.id));
          } else {
            setDoni(prev => prev.map(d => d.id === payload.new.id ? payload.new : d));
          }
        } 
        else if (payload.eventType === 'DELETE') {
          console.log(`DELETE ricevuto per dono ${payload.old?.id}`);
          setDoni(prev => prev.filter(d => d.id !== payload.old?.id));
        }
      })
      .subscribe((status) => {
        console.log('Stato subscription realtime:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const distanzaKm = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 20, fontSize: 18, color: COLORS.textDark }}>Caricamento mappa...</Text>
      </SafeAreaView>
    );
  }

  const doniAltrui = doni.filter(d => d.user_id !== myId).length;
  const mieiDoni = doni.filter(d => d.user_id === myId).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 12,
          backgroundColor: COLORS.background,
          borderBottomWidth: 1,
          borderBottomColor: '#BBDEFB',
        }}
      >
        <View style={{ flexShrink: 1 }}>
          <Text style={styles.cardTitle}>Cerca le gioie vicino a te 🔍</Text>
          <Text style={styles.cardSubtitle}>
            {doniAltrui > 0 
              ? `Trovate ${doniAltrui} gioie disponibili!` 
              : 'Nessuna gioia disponibile al momento'}
            {mieiDoni > 0 ? ` (e ${mieiDoni} tue gioie)` : ''}
          </Text>
        </View>

        <TouchableOpacity
          onPress={caricaDoni}
          disabled={refreshing}
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: refreshing ? '#E3F2FD' : COLORS.primary,
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
          }}
        >
          <Text style={{
            fontSize: 28,
            color: refreshing ? COLORS.primary : '#FFFFFF',
            fontWeight: 'bold',
          }}>
            ↻
          </Text>
        </TouchableOpacity>
      </View>

      {/* Mappa */}
      <View style={{ flex: 1 }}>
        <MapView
          style={{ flex: 1 }}
          showsUserLocation={true}
          initialRegion={{
            latitude: posizioneUtente?.latitude || 41.8719,
            longitude: posizioneUtente?.longitude || 12.5674,
            latitudeDelta: 10,
            longitudeDelta: 10,
          }}
        >
          {doni.map((dono) => {
            const dist = posizioneUtente
              ? distanzaKm(posizioneUtente.latitude, posizioneUtente.longitude, dono.lat, dono.lng)
              : null;

            const pinColor = dono.user_id === myId ? 'red' : COLORS.mapPin;

            return (
              <Marker
                key={dono.id}
                coordinate={{ latitude: dono.lat, longitude: dono.lng }}
                title={dono.titolo}
                description={
                  dist 
                    ? `A ${dist} km • ${dono.categoria}`
                    : (dono.descrizione?.substring(0, 60) + '...' || 'Dono speciale')
                }
                pinColor={pinColor}
                onPress={() => {
                  if (dono.user_id === myId) {
                    navigation.navigate('DettaglioMioDono', { dono });
                  } else {
                    navigation.navigate('DettaglioDonoEsterno', { dono });
                  }
                }}
              />
            );
          })}
        </MapView>
      </View>
    </SafeAreaView>
  );
}

/* ==================== CHAT DONO (PUBBLICA) ==================== */
function ChatScreen({ route, navigation }) {
  const { donoId, dono } = route.params || {};
  const [messaggi, setMessaggi] = useState([]);
  const [testo, setTesto] = useState('');
  const [myName, setMyName] = useState('');
  const [fotoGrande, setFotoGrande] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const loadMyName = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase.from('profili').select('nome').eq('user_id', user.id).maybeSingle();
      setMyName(data?.nome || user.email.split('@')[0] || 'Io');
    };
    loadMyName();
  }, []);

  useEffect(() => {
    const loadMsgs = async () => {
      if (donoId) {
        const { data } = await supabase.from('messaggi').select('*').eq('dono_id', donoId).order('created_at');
        setMessaggi(data || []);
      }
    };
    loadMsgs();

    let sub;
    if (donoId) {
      sub = supabase
        .channel('chat_dono')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messaggi',
            filter: `dono_id=eq.${donoId}`,
          },
          (payload) => {
            setMessaggi((prev) => [...prev, payload.new]);
            setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
          }
        )
        .subscribe();
    }

    return () => {
      if (sub) sub.unsubscribe();
    };
  }, [donoId]);

  const invia = async () => {
    if (!testo.trim()) return;

    const senderName = myName || 'Anonimo';

    const tempMsg = {
      id: Date.now(),
      dono_id: donoId,
      testo: testo.trim(),
      mittente: senderName,
      created_at: new Date().toISOString(),
    };

    setMessaggi(prev => [...prev, tempMsg]);
    setTesto('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    const { error } = await supabase.from('messaggi').insert({
      dono_id: donoId,
      testo: testo.trim(),
      mittente: senderName,
    });

    if (error) {
      Alert.alert('Errore', 'Messaggio non inviato');
      setMessaggi(prev => prev.filter(m => m.id !== tempMsg.id));
    }
  };

  const ritira = async () => {
    await supabase.from('doni').update({ ritirato: true }).eq('id', donoId);
    Alert.alert('Evviva! 🎉', 'Hai ritirato questa gioia.');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 110 : 0}
      >
        <View style={{ flex: 1 }}>
          <ScrollView
            ref={scrollRef}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <View style={styles.chatHeaderCard}>
              <Text style={styles.cardTitle}>{dono?.titolo || 'Chat'}</Text>
              {!!dono?.categoria && <Text style={styles.chatCategory}>Categoria: {dono.categoria}</Text>}

              {dono?.foto_urls && dono.foto_urls.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12, marginBottom: 8 }}>
                  {dono.foto_urls.map((url, index) => (
                    <TouchableOpacity key={index} activeOpacity={0.8} onPress={() => setFotoGrande(url)}>
                      <Image
                        source={{ uri: url }}
                        style={{ width: 140, height: 140, borderRadius: 18, marginRight: 10, backgroundColor: '#E3F2FD' }}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : null}
            </View>

            <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
              {messaggi.map((m) => {
                const isMine = m.mittente === myName;
                return (
                  <View key={m.id} style={isMine ? styles.mioMsg : styles.loroMsg}>
                    {!isMine && <Text style={styles.msgSender}>{m.mittente || 'Altro utente'}</Text>}
                    <Text style={styles.msgText}>{m.testo}</Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {donoId && !dono?.ritirato && (
            <TouchableOpacity style={styles.buttonRitira} onPress={ritira}>
              <Text style={styles.buttonRitiraText}>Ho ritirato questa gioia 💖</Text>
            </TouchableOpacity>
          )}

          <View style={styles.inputBarContainer}>
            <View style={styles.inputBar}>
              <TextInput
                style={styles.chatInput}
                placeholder="Scrivi un messaggio gentile..."
                value={testo}
                onChangeText={setTesto}
                multiline
                blurOnSubmit={false}
                returnKeyType="send"
                onSubmitEditing={invia}
              />
              <TouchableOpacity style={styles.sendBtn} onPress={invia}>
                <Text style={styles.sendBtnText}>Invia</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Modal visible={!!fotoGrande} transparent animationType="fade" onRequestClose={() => setFotoGrande(null)}>
          <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity style={{ position: 'absolute', top: 50, right: 30, zIndex: 1 }} onPress={() => setFotoGrande(null)}>
              <Text style={{ fontSize: 32, color: '#FFF' }}>✕</Text>
            </TouchableOpacity>
            <Image source={{ uri: fotoGrande }} style={{ width: '95%', height: '80%', borderRadius: 20 }} resizeMode="contain" />
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ==================== APP PRINCIPALE ==================== */
function InnerApp() {
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(false);
  const [onboardingSeen, setOnboardingSeen] = useState(null);

  useEffect(() => {
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoadingSession(false);
    };
    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const checkProfile = async () => {
      if (!session) {
        setProfileCompleted(false);
        setCheckingProfile(false);
        return;
      }
      setCheckingProfile(true);
      const { data, error } = await supabase.from('profili').select('*').eq('user_id', session.user.id).maybeSingle();
      setProfileCompleted(!error && !!data);
      setCheckingProfile(false);
    };
    checkProfile();
  }, [session]);

  useEffect(() => {
    if (profileCompleted) {
      AsyncStorage.getItem('onboardingHidden').then((value) => {
        setOnboardingSeen(value !== 'true');
      });
    }
  }, [profileCompleted]);

  if (loadingSession || (session && checkingProfile)) {
    return (
      <SafeAreaView style={styles.screenBackground}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 10, color: '#555' }}>Caricamento del mondo JOY...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (onboardingSeen === null && profileCompleted) {
    return (
      <SafeAreaView style={styles.screenBackground}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer>
      {!session ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      ) : !profileCompleted ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="ProfiloSetup">
            {(props) => <ProfileScreen {...props} onProfileCompleted={() => setProfileCompleted(true)} />}
          </Stack.Screen>
        </Stack.Navigator>
      ) : !onboardingSeen ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Onboarding">
            {({ navigation }) => (
              <OnboardingScreen
                navigation={navigation}
                onFinish={() => setOnboardingSeen(true)}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      ) : (
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Dona" component={DonaScreen} options={{ title: 'Dona', headerTitleAlign: 'center' }} />
          <Stack.Screen name="CercaCitta" component={CercaCittaScreen} options={{ title: 'Cerca città', headerTitleAlign: 'center' }} />
          <Stack.Screen name="Mappa" component={MappaScreen} options={{ title: 'Ricevi', headerTitleAlign: 'center' }} />
          <Stack.Screen name="DettaglioDonoEsterno" component={DettaglioDonoEsternoScreen} options={{ title: 'Dettaglio dono' }} />
          <Stack.Screen name="ChatList" component={ChatListScreen} options={{ title: 'Chat', headerTitleAlign: 'center' }} />
          <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat', headerTitleAlign: 'center' }} />
          <Stack.Screen name="ChatPrivata" component={ChatPrivataScreen} options={{ title: 'Chat', headerTitleAlign: 'center' }} />
          <Stack.Screen name="ProfiloUtente" component={ProfiloUtenteScreen} options={{ title: 'Profilo', headerTitleAlign: 'center' }} />
          <Stack.Screen name="DettaglioMioDono" component={DettaglioMioDonoScreen} options={{ title: 'La mia gioia', headerTitleAlign: 'center' }} />
          <Stack.Screen
            name="OnboardingForce"
            options={{ headerShown: false }}
          >
            {({ navigation }) => (
              <OnboardingScreen
                navigation={navigation}
                onFinish={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

/* ==================== STILI ==================== */
const styles = StyleSheet.create({
  screenBackground: { flex: 1, backgroundColor: COLORS.background },
  authBackground: { flex: 1, backgroundColor: COLORS.authBackground },
  authWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { paddingHorizontal: 20, paddingBottom: 30 },
  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  logoCloud: {
    paddingHorizontal: 30,
    paddingVertical: 18,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
  },
  logoText: { fontSize: 38, fontWeight: '900', color: COLORS.primary, letterSpacing: 3 },
  logoEmoji: { fontSize: 32, marginLeft: 8 },

  card: {
    width: '100%',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 26,
    padding: 20,
    marginTop: 8,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    elevation: 2,
  },
  cardTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textDark, marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: COLORS.textMedium, marginBottom: 16 },

  inputContainer: { position: 'relative' },
  input: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    borderRadius: 18,
    padding: 12,
    paddingRight: 45,
    marginVertical: 6,
    backgroundColor: '#FFFFFF',
    fontSize: 14,
  },
  validationIcon: { position: 'absolute', right: 14, top: 18, fontSize: 22 },
  validIcon: { color: '#4CAF50' },
  invalidIcon: { color: '#FF4444' },
  errorText: { color: '#FF4444', fontSize: 13, marginLeft: 4, marginTop: 4, marginBottom: 8 },

  primaryButton: { backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 20, alignItems: 'center', marginTop: 10 },
  primaryButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  secondaryButton: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 6,
    backgroundColor: COLORS.secondaryBg,
  },
  secondaryButtonHalf: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 6,
    marginHorizontal: 4,
    backgroundColor: COLORS.secondaryBg,
  },
  secondaryButtonText: { color: COLORS.primary, fontWeight: '600' },

  buttonRitira: { backgroundColor: COLORS.buttonRitira, marginHorizontal: 16, marginBottom: 8, paddingVertical: 12, borderRadius: 20, alignItems: 'center' },
  buttonRitiraText: { color: COLORS.textDark, fontWeight: '700' },

  linkText: { marginTop: 16, fontSize: 14, color: COLORS.textDark, textAlign: 'center' },
  linkBold: { color: COLORS.primary, fontWeight: '700' },

  sectionHeader: { marginTop: 14, marginBottom: 4, flexDirection: 'row', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textDark },
  sectionHint: { fontSize: 12, color: COLORS.textMedium },

  fotoRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  fotoWrapper: { marginRight: 8, marginBottom: 8, position: 'relative' },
  fotoThumb: { width: 90, height: 90, borderRadius: 16 },
  fotoRemove: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2 },
  fotoRemoveText: { color: '#FFF', fontSize: 11 },

  rowButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  positionText: { fontSize: 13, color: '#3C8D5A', marginTop: 4 },

  risultatoItem: { paddingVertical: 10 },
  risultatoTitolo: { fontSize: 16, fontWeight: '600', color: COLORS.textDark },
  risultatoDescrizione: { fontSize: 12, color: COLORS.textMedium, marginTop: 2 },
  itemSeparator: { height: 1, backgroundColor: '#BBDEFB', marginVertical: 4 },

  mapCard: { backgroundColor: '#FFF', borderRadius: 28, overflow: 'hidden', elevation: 2, marginTop: 16 },
  map: { width: '100%', height: 420 },

  chatHeaderCard: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  chatCategory: { fontSize: 13, color: COLORS.textMedium, marginTop: 2 },

  mioMsg: {
    alignSelf: 'flex-end',
    backgroundColor: '#BBDEFB',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginVertical: 6,
    maxWidth: '80%',
  },
  loroMsg: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginVertical: 6,
    maxWidth: '80%',
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  msgSender: { fontSize: 11, color: COLORS.textMedium, marginBottom: 4 },
  msgText: { color: COLORS.textDark, fontSize: 15 },

  inputBarContainer: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#BBDEFB',
  },
  inputBar: { flexDirection: 'row', alignItems: 'center' },
  chatInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginLeft: 10,
  },
  sendBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', paddingHorizontal: 20 },
  modalBox: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, maxHeight: '80%', borderWidth: 2, borderColor: COLORS.cardBorder },
  modalTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 10, color: COLORS.textDark },
  modalItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  modalEmoji: { fontSize: 30, marginRight: 12 },
  modalClose: { textAlign: 'center', marginTop: 14, color: COLORS.textMedium },

  profileAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#BBDEFB', alignItems: 'center', justifyContent: 'center' },
  profileAvatarText: { fontSize: 40 },

  welcomeContainer: { alignItems: 'center', marginBottom: 40, marginTop: 40 },
  welcomeText: { fontSize: 24, color: COLORS.textDark, fontWeight: '600', textAlign: 'center' },
  joyTitle: { fontSize: 62, fontWeight: '900', color: COLORS.primary, letterSpacing: 4, textAlign: 'center', marginTop: 8, marginBottom: 20, textAlign: 'center' },

  homeSubtitleLine1: { fontSize: 18, color: COLORS.textMedium, textAlign: 'center', lineHeight: 26 },
  homeSubtitleLine2: { fontSize: 32, fontWeight: '900', color: COLORS.primary, textAlign: 'center', lineHeight: 40, marginVertical: 4 },
  homeSubtitleLine3: { fontSize: 18, color: COLORS.textMedium, textAlign: 'center', lineHeight: 26 },
  homeSubtitleLine4: { fontSize: 28, fontWeight: '900', color: COLORS.primary, textAlign: 'center', lineHeight: 36, marginTop: 4 },

  homeButtonsRow: { flexDirection: 'row', marginTop: 4 },
  cardButton: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 16, elevation: 2, borderWidth: 2, borderColor: COLORS.cardBorder },
  cardEmoji: { fontSize: 32, marginBottom: 6 },
  cardButtonTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textDark },
  cardButtonText: { fontSize: 13, color: COLORS.textMedium, marginTop: 4 },

  homeBottom: { marginTop: 28, alignItems: 'center' },
  homeHintText: { fontSize: 14, color: COLORS.textDark, fontWeight: '600' },
  homeHintTextSmall: { fontSize: 12, color: COLORS.textMedium, textAlign: 'center', marginTop: 4, paddingHorizontal: 10 },
  logoutText: { color: COLORS.textMedium, fontSize: 13 },
});

/* ==================== DETTAGLIO DONO DI UN ALTRO UTENTE ==================== */
function DettaglioDonoEsternoScreen({ route, navigation }) {
  const { dono } = route.params;
  const [profiloDonatore, setProfiloDonatore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const caricaDonatore = async () => {
      try {
        const { data, error } = await supabase
          .from('profili')
          .select('nome, citta, telefono')
          .eq('user_id', dono.user_id)
          .maybeSingle();

        if (error) throw error;
        setProfiloDonatore(data);
      } catch (err) {
        console.error('Errore caricamento profilo donatore:', err);
      } finally {
        setLoading(false);
      }
    };

    caricaDonatore();
  }, [dono.user_id]);

  const avviaChat = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Alert.alert('Errore', 'Devi essere loggato');

    const convId = await ottieniOCreaConversazione(user.id, dono.user_id);
    if (convId) {
      navigation.navigate('ChatPrivata', {
        conversazioneId: convId,
        altroUtenteNome: profiloDonatore?.nome || 'Donatore',
      });
    } else {
      Alert.alert('Errore', 'Impossibile avviare la chat');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screenBackground}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.card}>
          {/* Titolo e categoria */}
          <Text style={styles.cardTitle}>{dono.titolo}</Text>
          <Text style={{ fontSize: 14, color: COLORS.textMedium, marginBottom: 16 }}>
            Categoria: {dono.categoria}
          </Text>

          {/* Foto */}
          {dono.foto_urls && dono.foto_urls.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {dono.foto_urls.map((url, i) => (
                <Image
                  key={i}
                  source={{ uri: url }}
                  style={{ width: 220, height: 220, borderRadius: 20, marginRight: 12 }}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          )}

          {/* Descrizione */}
          <Text style={{ fontSize: 16, color: COLORS.textDark, lineHeight: 24, marginBottom: 24 }}>
            {dono.descrizione || 'Nessuna descrizione fornita'}
          </Text>

          {/* Info donatore */}
          <View style={{ backgroundColor: '#f0f8ff', padding: 16, borderRadius: 16, marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.primary }}>Donatore</Text>
            <Text style={{ fontSize: 16, marginTop: 8 }}>
              {profiloDonatore?.nome || 'Utente JOY'}
            </Text>
            {profiloDonatore?.citta && (
              <Text style={{ marginTop: 4 }}>📍 {profiloDonatore.citta}</Text>
            )}
            {profiloDonatore?.telefono && (
              <Text style={{ marginTop: 4 }}>📞 {profiloDonatore.telefono}</Text>
            )}
          </View>

          {/* Bottone per chattare */}
          <TouchableOpacity style={styles.primaryButton} onPress={avviaChat}>
            <Text style={styles.primaryButtonText}>💬 Contatta il donatore</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default InnerApp;