import React, { useState, useRef, useEffect } from 'react';
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
  Alert,
  Keyboard,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import {
  useAgentHistoryQuery,
  useSendAgentChatMutation,
  useClearAgentHistoryMutation,
} from '../../src/services/agent';

import { COLORS } from '../../src/constants/theme';
import Header from '../../src/components/Header';
import { useTranslation } from '../../src/stores/language.store';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  imageUri?: string;
  model?: string;
  timestamp?: string;
};

type AttachedImage = {
  uri: string;
  base64?: string;
  mimeType?: string;
};

const SUGGESTIONS = [
  { icon: 'eco', label: 'Yellow leaves?', query: 'Why are my crop leaves turning yellow and how do I fix it?' },
  { icon: 'water-drop', label: 'Irrigation guide', query: 'What is the optimal irrigation schedule for my crops right now?' },
  { icon: 'science', label: 'Fertilizer advice', query: 'What NPK fertilizer ratio should I apply during current crop stages?' },
  { icon: 'bug-report', label: 'Pest prevention', query: 'What are the best organic treatments to control aphids and spider mites?' },
  { icon: 'agriculture', label: 'Tomato care tips', query: 'What are the best pruning and watering tips for high tomato yields?' },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'welcome-1',
    role: 'assistant',
    text: "Hello! I am your AgriSmart Assistant powered by DeepSeek AI. I analyze your crop telemetry, field soil status, and agricultural questions. Ask me anything or attach a photo of your crops to diagnose issues!",
    model: 'DeepSeek AI',
    timestamp: 'Just now',
  },
];

export default function AssistantScreen() {
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { t, language } = useTranslation();

  // Responsive breakpoints
  const isTablet = windowWidth >= 768;
  const isSmallPhone = windowWidth < 375;
  const isLandscape = windowHeight < 520 && windowWidth > windowHeight;
  const maxContentWidth = Math.min(windowWidth, 860);

  const activeSuggestions = language === 'fr' ? [
    { icon: 'eco', label: 'Feuilles jaunes ?', query: 'Pourquoi les feuilles de mes cultures jaunissent-elles et comment y remédier ?' },
    { icon: 'water-drop', label: 'Guide irrigation', query: 'Quel est le calendrier d’irrigation optimal pour mes cultures en ce moment ?' },
    { icon: 'science', label: 'Conseil engrais', query: 'Quel ratio d’engrais NPK dois-je appliquer au stade actuel de mes cultures ?' },
    { icon: 'bug-report', label: 'Anti-ravageurs', query: 'Quels sont les meilleurs traitements biologiques contre les pucerons et acariens ?' },
    { icon: 'agriculture', label: 'Conseils tomates', query: 'Quels sont les meilleurs conseils de taille et d’arrosage pour un bon rendement de tomates ?' },
  ] : SUGGESTIONS;

  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachedImage, setAttachedImage] = useState<AttachedImage | null>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Keyboard show/hide listeners for dynamic padding
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => {
      setIsKeyboardVisible(true);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const { data: historyData } = useAgentHistoryQuery();
  const sendChatMutation = useSendAgentChatMutation();
  const clearHistoryMutation = useClearAgentHistoryMutation();

  // Load chat history from backend on screen load
  useEffect(() => {
    const convos = historyData?.conversations;
    if (Array.isArray(convos) && convos.length > 0) {
      const historyMessages: Message[] = [];
      convos.forEach((c: any) => {
        const dateStr = c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined;
        if (c.message) {
          historyMessages.push({
            id: `user-${c.id}`,
            role: 'user',
            text: c.message,
            timestamp: dateStr,
          });
        }
        if (c.response) {
          historyMessages.push({
            id: `ai-${c.id}`,
            role: 'assistant',
            text: c.response,
            model: 'DeepSeek AI',
            timestamp: dateStr,
          });
        }
      });
      if (historyMessages.length > 0) {
        setMessages(historyMessages);
      }
    }
  }, [historyData]);

  const handleClearHistory = () => {
    Alert.alert(
      t('assistant.clearTitle'),
      t('assistant.clearPrompt'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.clear'),
          style: 'destructive',
          onPress: async () => {
            try {
              await clearHistoryMutation.mutateAsync();
              setMessages(INITIAL_MESSAGES);
            } catch (err) {
              setMessages(INITIAL_MESSAGES);
            }
          },
        },
      ]
    );
  };

  const pickImage = async (useCamera: boolean) => {
    try {
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'Camera access is needed to capture plant photos.');
          return;
        }
        const res = await ImagePicker.launchCameraAsync({
          quality: 0.7,
          base64: true,
          allowsEditing: true,
          aspect: [4, 3],
        });
        if (!res.canceled && res.assets && res.assets[0]) {
          const asset = res.assets[0];
          setAttachedImage({
            uri: asset.uri,
            base64: asset.base64 || undefined,
            mimeType: asset.mimeType || 'image/jpeg',
          });
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'Gallery access is needed to select plant photos.');
          return;
        }
        const res = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.7,
          base64: true,
          allowsEditing: true,
          aspect: [4, 3],
        });
        if (!res.canceled && res.assets && res.assets[0]) {
          const asset = res.assets[0];
          setAttachedImage({
            uri: asset.uri,
            base64: asset.base64 || undefined,
            mimeType: asset.mimeType || 'image/jpeg',
          });
        }
      }
    } catch (err) {
      console.warn('Image picker error:', err);
    }
  };

  const promptImageSource = () => {
    Alert.alert(
      t('assistant.attachPhoto'),
      t('assistant.attachPhotoPrompt'),
      [
        { text: t('assistant.takePhoto'), onPress: () => pickImage(true) },
        { text: t('assistant.chooseGallery'), onPress: () => pickImage(false) },
        { text: t('common.cancel'), style: 'cancel' },
      ]
    );
  };

  const sendMessage = async (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : input).trim();
    const hasImage = Boolean(attachedImage);

    if (!text && !hasImage) return;

    const currentImage = attachedImage;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text || (language === 'fr' ? 'Veuillez examiner cette image et diagnostiquer tout symptôme.' : 'Please inspect this attached image and diagnose any symptoms.'),
      imageUri: currentImage?.uri,
      timestamp: nowTime,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAttachedImage(null);
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.text,
      }));

      const queryToSend = language === 'fr'
        ? `[Langue: Français - Réponds en français] ${text || 'Veuillez examiner cette image et fournir des conseils agronomiques.'}`
        : (text || 'Please inspect this plant image and provide agronomic advice.');

      const res = await sendChatMutation.mutateAsync({
        message: queryToSend,
        history,
        image: currentImage?.base64,
        mimeType: currentImage?.mimeType,
      });

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: res?.response || 'I have analyzed your request.',
        model: res?.model || 'DeepSeek AI',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: 'Sorry, I encountered an issue connecting to the DeepSeek API. Please verify your connection and try again.',
        model: 'DeepSeek AI',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  // Helper to render inline bold tokens inside text
  const renderInlineBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <Text key={pIdx} style={styles.boldText}>
            {part.slice(2, -2)}
          </Text>
        );
      }
      return <Text key={pIdx}>{part}</Text>;
    });
  };

  // Robust, fully responsive block-level formatted renderer (never truncates or cuts off)
  const renderFormattedText = (rawText: string) => {
    if (!rawText) return null;

    const lines = rawText.split('\n');

    return lines.map((line, lineIdx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <View key={lineIdx} style={{ height: 6 }} />;
      }

      // 1. Heading blocks: ### or ## or #
      if (/^#{1,4}\s+/.test(trimmed)) {
        const headerText = trimmed.replace(/^#{1,4}\s+/, '');
        return (
          <Text key={lineIdx} style={[styles.aiHeaderText, isSmallPhone && { fontSize: 14.5 }]}>
            {headerText}
          </Text>
        );
      }

      // 2. Bullet point items: * or - or •
      if (/^[*•-]\s+/.test(trimmed)) {
        const bulletContent = trimmed.replace(/^[*•-]\s+/, '');
        return (
          <View key={lineIdx} style={styles.bulletRow}>
            <Text style={styles.bulletIcon}>•</Text>
            <Text style={[styles.bulletText, isSmallPhone && { fontSize: 13.5, lineHeight: 20 }]}>
              {renderInlineBold(bulletContent)}
            </Text>
          </View>
        );
      }

      // 3. Numbered list items: 1. or 2.
      if (/^\d+\.\s+/.test(trimmed)) {
        const numberMatch = trimmed.match(/^(\d+\.)\s+(.*)/);
        if (numberMatch) {
          const numberLabel = numberMatch[1];
          const numberContent = numberMatch[2];
          return (
            <View key={lineIdx} style={styles.numberedRow}>
              <Text style={styles.numberBadge}>{numberLabel}</Text>
              <Text style={[styles.numberedText, isSmallPhone && { fontSize: 13.5, lineHeight: 20 }]}>
                {renderInlineBold(numberContent)}
              </Text>
            </View>
          );
        }
      }

      // 4. Standard paragraph (natural multiline text wrap - NEVER clipped)
      return (
        <Text key={lineIdx} style={[styles.aiParagraph, isSmallPhone && { fontSize: 13.5, lineHeight: 20 }]}>
          {renderInlineBold(trimmed)}
        </Text>
      );
    });
  };

  // Dynamic bottom padding for floating input container
  const bottomContainerPadding = isKeyboardVisible
    ? Math.max(insets.bottom, 8)
    : Math.max(insets.bottom, 8) + 65;

  // Responsive widths
  const aiBubbleMaxWidth = isTablet ? 720 : '98%';
  const userBubbleMaxWidth = isTablet ? 560 : isSmallPhone ? '88%' : '84%';

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {/* Top Header Bar */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: isLandscape ? 8 : Math.max(insets.top, 14),
          },
        ]}
      >
        <View style={[styles.headerCenterWrap, { maxWidth: maxContentWidth }]}>
          <Header title={t('assistant.title')} style={{ paddingTop: 0, paddingBottom: 4 }} />

          {/* Subheader Status Badges */}
          <View style={styles.subHeader}>
            <View style={styles.deepseekBadge}>
              <View style={styles.statusDot} />
              <MaterialIcons name="auto-awesome" size={13} color="#15803d" style={{ marginRight: 4 }} />
              <Text style={styles.deepseekBadgeText}>
                {isSmallPhone ? 'DeepSeek AI' : 'Powered by DeepSeek'}
              </Text>
            </View>

            {messages.length > 1 && (
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={handleClearHistory}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
              >
                <MaterialIcons name="delete-outline" size={17} color={COLORS.outline} />
                <Text style={styles.clearBtnText}>{t('common.clear')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Responsive Main Layout Container */}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.responsiveContentWrapper, { maxWidth: maxContentWidth }]}>
          {/* Messages ScrollView */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesList}
            contentContainerStyle={[
              styles.messagesContent,
              { paddingBottom: 16 },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {/* Telemetry Sync Banner */}
            {!isLandscape && (
              <View style={styles.contextBanner}>
                <MaterialIcons name="insights" size={15} color="#15803d" style={styles.contextIcon} />
                <Text style={[styles.contextText, isSmallPhone && { fontSize: 10 }]}>
                  DeepSeek AI is synced with your farm crops & soil telemetry.
                </Text>
              </View>
            )}

            {/* Chat Messages */}
            {messages.map(msg => {
              const isUser = msg.role === 'user';
              if (isUser) {
                return (
                  <View key={msg.id} style={styles.userBubbleWrap}>
                    <View style={[styles.userBubble, { maxWidth: userBubbleMaxWidth }]}>
                      {msg.imageUri && (
                        <Image
                          source={{ uri: msg.imageUri }}
                          style={[
                            styles.userBubbleImage,
                            {
                              width: isSmallPhone ? 180 : 220,
                              height: isSmallPhone ? 120 : 145,
                            },
                          ]}
                          resizeMode="cover"
                        />
                      )}
                      <Text style={[styles.userText, isSmallPhone && { fontSize: 13, lineHeight: 18 }]}>
                        {msg.text}
                      </Text>
                      {msg.timestamp && (
                        <Text style={styles.userTimestamp}>{msg.timestamp}</Text>
                      )}
                    </View>
                  </View>
                );
              } else {
                return (
                  <View key={msg.id} style={styles.aiBubbleWrap}>
                    <LinearGradient
                      colors={['#0c2a1e', '#133e2d']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.aiBubble, { maxWidth: aiBubbleMaxWidth }]}
                    >
                      {/* AI Card Header */}
                      <View style={styles.aiHeader}>
                        <View style={styles.aiHeaderTitleWrap}>
                          <MaterialIcons name="auto-awesome" size={14} color="#4ade80" />
                          <Text style={styles.aiHeaderTitle}>AgriSmart AI</Text>
                        </View>
                        <View style={styles.aiModelTag}>
                          <Text style={styles.aiModelTagText}>DeepSeek</Text>
                        </View>
                      </View>

                      {/* AI Response Full Body */}
                      <View style={styles.aiTextContainer}>
                        {renderFormattedText(msg.text)}
                      </View>

                      {/* AI Card Footer */}
                      <View style={styles.aiCardFooter}>
                        {msg.timestamp && (
                          <Text style={styles.aiTimestamp}>{msg.timestamp}</Text>
                        )}
                      </View>
                    </LinearGradient>
                  </View>
                );
              }
            })}

            {/* Thinking / Analyzing Indicator */}
            {loading && (
              <View style={styles.aiBubbleWrap}>
                <View style={styles.thinkingBubble}>
                  <ActivityIndicator size="small" color="#15803d" />
                  <Text style={styles.thinkingText}>DeepSeek is analyzing...</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Fixed Bottom Container: Suggested Prompts Above Input */}
          <View style={[styles.bottomBarContainer, { paddingBottom: bottomContainerPadding }]}>
            {/* Fixed Suggested Prompts Bar */}
            <View style={styles.fixedSuggestionsWrap}>
              <Text style={styles.suggestionTitle}>
                {language === 'fr' ? 'SUGGESTIONS' : 'SUGGESTED PROMPTS'}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsScroll}
                keyboardShouldPersistTaps="handled"
              >
                {activeSuggestions.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.suggestionChip}
                    onPress={() => sendMessage(item.query)}
                    activeOpacity={0.7}
                    disabled={loading}
                  >
                    <MaterialIcons name={item.icon as any} size={15} color="#15803d" style={{ marginRight: 6 }} />
                    <Text style={[styles.suggestionChipText, isSmallPhone && { fontSize: 11 }]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Attached Image Bar */}
            {attachedImage && (
              <View style={styles.imagePreviewBar}>
                <Image source={{ uri: attachedImage.uri }} style={styles.previewThumb} />
                <View style={styles.previewInfo}>
                  <Text style={styles.previewLabel} numberOfLines={1}>
                    {language === 'fr' ? 'Photo de plante jointe' : 'Attached Plant Photo'}
                  </Text>
                  <Text style={styles.previewSub}>
                    {language === 'fr' ? 'DeepSeek analysera cette image' : 'DeepSeek will analyze this photo'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => setAttachedImage(null)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <MaterialIcons name="close" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            {/* Text Input Row */}
            <View style={styles.inputInner}>
              <TouchableOpacity
                style={styles.attachBtn}
                onPress={promptImageSource}
                activeOpacity={0.7}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <MaterialIcons
                  name="add-photo-alternate"
                  size={isSmallPhone ? 22 : 24}
                  color={attachedImage ? '#15803d' : COLORS.outline}
                />
              </TouchableOpacity>

              <TextInput
                style={[
                  styles.textInput,
                  isSmallPhone && { fontSize: 13 },
                ]}
                placeholder={t('assistant.inputPlaceholder')}
                placeholderTextColor={COLORS.outline}
                value={input}
                onChangeText={setInput}
                multiline
                maxLength={400}
                textAlignVertical="center"
              />

              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  (!input.trim() && !attachedImage) && styles.sendBtnDisabled,
                  isSmallPhone && { width: 34, height: 34 },
                ]}
                onPress={() => sendMessage()}
                disabled={(!input.trim() && !attachedImage) || loading}
                activeOpacity={0.8}
              >
                <MaterialIcons
                  name="send"
                  size={isSmallPhone ? 16 : 18}
                  color={(input.trim() || attachedImage) ? '#ffffff' : COLORS.outline}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f6faf6',
  },
  topBar: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 10,
    alignItems: 'center',
    width: '100%',
  },
  headerCenterWrap: {
    width: '100%',
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  deepseekBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(21, 128, 61, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(21, 128, 61, 0.15)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
    marginRight: 6,
  },
  deepseekBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#15803d',
    letterSpacing: 0.2,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  clearBtnText: {
    fontSize: 12,
    color: COLORS.outline,
    marginLeft: 3,
    fontWeight: '500',
  },
  keyboardView: {
    flex: 1,
    width: '100%',
  },
  responsiveContentWrapper: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 14,
  },
  contextBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eaf4eb',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 4,
  },
  contextIcon: {
    marginRight: 6,
  },
  contextText: {
    fontSize: 11,
    color: '#2e7d32',
    fontWeight: '500',
  },
  userBubbleWrap: {
    alignItems: 'flex-end',
    width: '100%',
    marginVertical: 2,
  },
  userBubble: {
    backgroundColor: '#15803d',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubbleImage: {
    borderRadius: 12,
    marginBottom: 8,
  },
  userText: {
    fontSize: 14.5,
    color: '#ffffff',
    lineHeight: 20.5,
  },
  userTimestamp: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  aiBubbleWrap: {
    alignItems: 'flex-start',
    width: '100%',
    marginVertical: 4,
  },
  aiBubble: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  aiHeaderTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  aiHeaderTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#4ade80',
    letterSpacing: 0.4,
  },
  aiModelTag: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  aiModelTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#86efac',
  },
  aiTextContainer: {
    width: '100%',
    gap: 5,
  },
  aiParagraph: {
    fontSize: 14.5,
    color: '#e5e7eb',
    lineHeight: 22,
    width: '100%',
  },
  aiHeaderText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#86efac',
    marginTop: 6,
    marginBottom: 2,
    lineHeight: 22,
    width: '100%',
  },
  boldText: {
    fontWeight: '700',
    color: '#ffffff',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    paddingLeft: 4,
    marginVertical: 2,
  },
  bulletIcon: {
    fontSize: 14,
    color: '#4ade80',
    marginRight: 8,
    lineHeight: 22,
  },
  bulletText: {
    fontSize: 14.5,
    color: '#e2e8f0',
    lineHeight: 22,
    flex: 1,
    flexShrink: 1,
  },
  numberedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    paddingLeft: 2,
    marginVertical: 2,
  },
  numberBadge: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#4ade80',
    marginRight: 6,
    lineHeight: 22,
    minWidth: 18,
  },
  numberedText: {
    fontSize: 14.5,
    color: '#e2e8f0',
    lineHeight: 22,
    flex: 1,
    flexShrink: 1,
  },
  aiCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
    paddingTop: 4,
  },
  aiTimestamp: {
    fontSize: 10,
    color: 'rgba(229, 231, 235, 0.5)',
  },
  thinkingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#e7f5e9',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    alignSelf: 'flex-start',
  },
  thinkingText: {
    fontSize: 13,
    color: '#15803d',
    fontWeight: '500',
  },
  bottomBarContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 3,
  },
  fixedSuggestionsWrap: {
    paddingTop: 8,
    paddingBottom: 6,
  },
  suggestionTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#8a998e',
    marginBottom: 6,
    paddingHorizontal: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  chipsScroll: {
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 2,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(21, 128, 61, 0.22)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  suggestionChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1b4332',
  },
  imagePreviewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f8f2',
    padding: 6,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(21, 128, 61, 0.2)',
  },
  previewThumb: {
    width: 38,
    height: 38,
    borderRadius: 8,
  },
  previewInfo: {
    flex: 1,
    marginLeft: 10,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803d',
  },
  previewSub: {
    fontSize: 10,
    color: COLORS.outline,
  },
  removeImageBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6b7280',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  inputInner: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f4f6f4',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 16,
    marginBottom: 4,
  },
  attachBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    maxHeight: 110,
    minHeight: 36,
    paddingHorizontal: 8,
    paddingTop: Platform.OS === 'ios' ? 8 : 4,
    paddingBottom: Platform.OS === 'ios' ? 8 : 4,
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
    backgroundColor: '#e2e8f0',
  },
});
