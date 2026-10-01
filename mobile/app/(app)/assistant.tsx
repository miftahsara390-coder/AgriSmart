import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { agentAPI } from '../../src/services/api';

import { COLORS } from '../../src/constants/theme';
import Header from '../../src/components/Header';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'assistant',
    text: 'Hello Sara! I am your AgriSmart AI. I’ve reviewed the latest telemetry from Field A. Everything looks stable, but evapotranspiration is slightly high today. How can I assist you?',
  },
];

export default function AssistantScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  React.useEffect(() => {
    // Optionally load history
    agentAPI.getHistory().then(res => {
      if (res.data && res.data.length > 0) {
        // format and set if needed
      }
    }).catch(console.error);
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input.trim() };
    const currentInput = input.trim();
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.text }));
      const res = await agentAPI.chat(currentInput, history);
      
      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        text: res.data.response || 'I am sorry, I am having trouble understanding right now.'
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        text: 'Sorry, there was an error communicating with the server.' 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="AI Assistant" style={{ backgroundColor: 'transparent' }} />
      </SafeAreaView>

      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesList} 
          contentContainerStyle={[styles.messagesContent, { paddingBottom: 100 }]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {/* AI Banner Context */}
          <View style={styles.contextBanner}>
            <MaterialIcons name="info-outline" size={16} color={COLORS.secondary} style={styles.contextIcon} />
            <Text style={styles.contextText}>AI analyzes real-time field telemetry and satellite data.</Text>
          </View>

          {messages.map(msg => {
            const isUser = msg.role === 'user';
            if (isUser) {
              return (
                <View key={msg.id} style={styles.userBubbleWrap}>
                  <View style={styles.userBubble}>
                    <Text style={styles.userText}>{msg.text}</Text>
                  </View>
                </View>
              );
            } else {
              return (
                <View key={msg.id} style={styles.aiBubbleWrap}>
                  <LinearGradient
                    colors={['#0f281e', '#164230']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.aiBubble}
                  >
                    <View style={styles.aiHeader}>
                      <MaterialIcons name="auto-awesome" size={14} color="#4ade80" />
                      <Text style={styles.aiHeaderTitle}>AgriSmart AI</Text>
                    </View>
                    <Text style={styles.aiText}>{msg.text}</Text>
                  </LinearGradient>
                </View>
              );
            }
          })}

          {loading && (
            <View style={styles.aiBubbleWrap}>
              <View style={[styles.aiBubble, { backgroundColor: '#e5f1e7', borderWidth: 0, padding: 12, width: 60 }]}>
                <ActivityIndicator size="small" color={COLORS.primaryContainer} />
              </View>
            </View>
          )}
        </ScrollView>

        <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 16) + 70 }]}>
          <View style={styles.inputInner}>
            <TouchableOpacity style={styles.attachBtn}>
              <MaterialIcons name="add-photo-alternate" size={24} color={COLORS.outline} />
            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              placeholder="Ask about crops, soil, or tasks..."
              placeholderTextColor={COLORS.outline}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={200}
            />
            <TouchableOpacity 
              style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]} 
              onPress={sendMessage}
              disabled={!input.trim()}
            >
              <MaterialIcons name="send" size={20} color={input.trim() ? '#fff' : COLORS.outline} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  safe: {
    backgroundColor: 'rgba(241, 252, 242, 0.8)',
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 12,
  },
  appName: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondary,
    letterSpacing: 1.5,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.onSurface,
    lineHeight: 26,
    letterSpacing: -0.5,
  },
  profileBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImg: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  keyboardView: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 16,
  },
  contextBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceContainer,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'center',
    marginBottom: 8,
  },
  contextIcon: {
    marginRight: 6,
  },
  contextText: {
    fontSize: 11,
    color: COLORS.secondary,
    fontWeight: '500',
  },
  userBubbleWrap: {
    alignItems: 'flex-end',
    width: '100%',
  },
  userBubble: {
    backgroundColor: COLORS.surfaceContainerLowest,
    padding: 14,
    borderRadius: 20,
    borderBottomRightRadius: 4,
    maxWidth: '85%',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userText: {
    fontSize: 14,
    color: COLORS.onSurface,
    lineHeight: 20,
  },
  aiBubbleWrap: {
    alignItems: 'flex-start',
    width: '100%',
  },
  aiBubble: {
    padding: 14,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    maxWidth: '85%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 4,
  },
  aiHeaderTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4ade80',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  aiText: {
    fontSize: 14,
    color: '#e5e7eb',
    lineHeight: 20,
  },
  inputContainer: {
    backgroundColor: 'rgba(241, 252, 242, 0.95)',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(112, 121, 114, 0.15)',
  },
  inputInner: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(112, 121, 114, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  attachBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    minHeight: 36,
    paddingHorizontal: 8,
    paddingTop: Platform.OS === 'ios' ? 8 : 4,
    fontSize: 14,
    color: COLORS.onSurface,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#15803d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.surfaceContainer,
  },
});
