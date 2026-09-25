import { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { agentAPI } from '../../src/services/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AssistantScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: "Hello! I'm AgriSmart AI 🌿 Your intelligent agricultural assistant. How can I help you today?\n\nYou can ask me about:\n• Your crops and tasks\n• Plant diseases\n• Agricultural advice\n• Irrigation and fertilization",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await agentAPI.chat(text, conversationId || undefined);
      const { response, conversationId: cId } = res.data;

      if (!conversationId) setConversationId(cId);

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '❌ Failed to get a response. Please check your connection.',
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.aiBubble]}>
      {item.role === 'assistant' && <Text style={styles.aiLabel}>🤖 AgriSmart AI</Text>}
      <Text style={styles.bubbleText}>{item.content}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <Text style={styles.title}>🤖 AI Agricultural Assistant</Text>
        <Text style={styles.subtitle}>Powered by AgriSmart Agent</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {loading && (
        <View style={styles.typingIndicator}>
          <ActivityIndicator size="small" color="#4CAF50" />
          <Text style={styles.typingText}>AgriSmart AI is thinking...</Text>
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about your crops..."
          placeholderTextColor="#666"
          multiline
          maxLength={500}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={loading || !input.trim()}>
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a2818' },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12, backgroundColor: '#0f3d2e' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  subtitle: { color: '#9DC08B', fontSize: 12 },
  messageList: { padding: 16, paddingBottom: 8 },
  bubble: { maxWidth: '85%', borderRadius: 16, padding: 14, marginBottom: 10 },
  userBubble: { backgroundColor: '#4CAF50', alignSelf: 'flex-end' },
  aiBubble: { backgroundColor: '#1a5c3e', alignSelf: 'flex-start' },
  aiLabel: { color: '#9DC08B', fontSize: 11, fontWeight: '600', marginBottom: 4 },
  bubbleText: { color: '#fff', fontSize: 15, lineHeight: 22 },
  typingIndicator: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 20, paddingBottom: 8,
  },
  typingText: { color: '#9DC08B', fontSize: 13 },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    padding: 16, borderTopWidth: 1, borderTopColor: '#1a5c3e',
    backgroundColor: '#0f3d2e',
  },
  input: {
    flex: 1, backgroundColor: '#1a5c3e', borderRadius: 24,
    paddingHorizontal: 16, paddingVertical: 10, color: '#fff', maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: '#4CAF50', width: 44, height: 44,
    borderRadius: 22, justifyContent: 'center', alignItems: 'center',
  },
  sendIcon: { color: '#fff', fontSize: 18 },
});


