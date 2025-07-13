import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  Platform,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import InfoPopup from '../Components/Popup';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://www.linkedin.com/search/results/content/?keywords=';
const DEFAULT_HASHTAG = '#hiring';

const INJECTED_JAVASCRIPT = `
  (function() {
    let lastPostCount = 0;

    function extractPosts() {
      const posts = [];
      const containers = document.querySelectorAll('[data-urn^="urn:li:activity"]');
      containers.forEach(container => {
        const text = container.innerText || '';
        const authorSpan = container.querySelectorAll('span[dir="ltr"]');
        const author = authorSpan.length ? authorSpan[0].innerText : '';
        const links = Array.from(container.querySelectorAll('a')).map(a => ({
          href: a.href,
          text: a.innerText
        }));
        posts.push({ author, text, links });
      });

      const currentPostCount = posts.length;
      if (currentPostCount > lastPostCount) {
        lastPostCount = currentPostCount;
        const data = {
          title: document.title,
          url: window.location.href,
          timestamp: new Date().toISOString(),
          postCount: currentPostCount,
          posts
        };
        window.ReactNativeWebView.postMessage(JSON.stringify(data));
      }
    }

    extractPosts();
    let intervalId = setInterval(() => {
      window.scrollTo(0, document.body.scrollHeight);
      extractPosts();
    }, 4000);

    window.onunload = () => clearInterval(intervalId);
  })();
`;

const Jobs = () => {
  const navigation = useNavigation();
  const [showWebView, setShowWebView] = useState(false);
  const [scrapedData, setScrapedData] = useState(null);
  const [showInitialPopup, setShowInitialPopup] = useState(true);
  const [showWarningPopup, setShowWarningPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [linkedinURL, setLinkedinURL] = useState('');
  const webViewRef = useRef(null);

  useEffect(() => {
    const fetchHashtag = async () => {
      try {
        const tag = await AsyncStorage.getItem('generatedHashtag');
        const cleanTag = tag?.replace(/^#/, '').trim();
        const encodedTag = encodeURIComponent(`#hiring ${cleanTag ? `#${cleanTag}` : ''}`.trim());
        const url = `${BASE_URL}${encodedTag}&origin=GLOBAL_SEARCH_HEADER`;
        setLinkedinURL(url);
      } catch (e) {
        console.warn('Failed to load hashtag from storage:', e);
        const fallbackEncoded = encodeURIComponent('#hiring');
        const url = `${BASE_URL}${fallbackEncoded}&origin=GLOBAL_SEARCH_HEADER`;
        setLinkedinURL(url);
      }
    };

    fetchHashtag();
  }, []);

  const handleMessage = useCallback(async (event) => {
    try {
      const messageData = event?.nativeEvent?.data || event;
      if (typeof messageData !== 'string') return;

      const extracted = JSON.parse(messageData);
      setScrapedData(null);
      setLoading(true);

      const summarizedPosts = [];

      for (const post of extracted.posts) {
        try {
          const truncatedText = post.text.trim().slice(0, 1600);
          const prompt = `
          You are an AI assistant that filters LinkedIn posts.
          Your task is to detect ONLY posts made by people OFFERING a job or internship. These must be written by **recruiters, companies, hiring managers, or HR professionals**.
          ### VERY IMPORTANT ###
          Do NOT return posts from:
          - Job seekers
          - Students or freshers looking for work
          - Anyone "open to work", "seeking opportunities", or "interested in roles"
          
          ### INSTRUCTIONS ###
          If and ONLY if the post is from someone offering a job/internship, return the following JSON:
          
          {
            "title": "Job title or role",
            "email": "If mentioned",
            "phone": "If mentioned",
            "description": "Summary of the job offer"
          }
          
          Otherwise, return EXACTLY the string: IGNORE
          
          ### POST ###
          ${truncatedText}
          `;

          const encodedPrompt = encodeURIComponent(prompt);
          const url = `https://text.pollinations.ai/${encodedPrompt}`;
          const response = await axios.get(url);
          const responseText =
            typeof response.data === 'string' ? response.data.trim() : JSON.stringify(response.data);

          if (responseText.toUpperCase() === 'IGNORE' || !responseText.includes('{')) continue;

          const match = responseText.match(/\{[\s\S]*?\}/);
          if (match) {
            const parsed = JSON.parse(match[0]);
            if (parsed?.title && parsed?.description && (parsed.email || parsed.phone)) {
              summarizedPosts.push({
                author: post.author.split('\n')[0].trim(),
                title: parsed.title,
                description: parsed.description,
                email: parsed.email,
                phone: parsed.phone,
              });
            }
          }
        } catch (e) {
          console.warn('Skipping post due to error:', e?.message);
          continue;
        }
      }

      setScrapedData({ ...extracted, posts: summarizedPosts });
    } catch (error) {
      console.warn('⚠️ handleMessage error:', error?.message || error);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <InfoPopup
        visible={showInitialPopup}
        onClose={() => setShowInitialPopup(false)}
        onCancel={() => {
          setShowInitialPopup(false);
          navigation.navigate('Home');
        }}
        title="Before You Start"
        message={`Use responsibly to speed up your job search.

How it works:
1. You'll be redirected to LinkedIn.
2. Log in if needed.
3. Stay on the Search page.
4. Hashtags are based on your resume and skills.
5. The page will auto-scroll to fetch results.
6. Just click "Show more results" — that's it to find your job!
          
Tap "Got it!" to start searching or "Cancel" to go back.`}
      />

      <InfoPopup
        visible={showWarningPopup}
        onClose={() => {
          setShowWarningPopup(false);
          setShowWebView(true);
        }}
        onCancel={() => {
          setShowWarningPopup(false);
          navigation.navigate('Home');
        }}
        title="⚠️ Just a Heads-Up"
        message={`You're about to open LinkedIn to explore job posts tailored to your resume and skills.

We don't collect or store any data — job info is briefly read and sent to AI to help verify relevance.

Please note: We're not affiliated with LinkedIn and aren't responsible for their content or terms. 

By continuing, you agree to use this tool responsibly and understand you're accessing LinkedIn on your own behalf.`}
      />

      {!showWebView ? (
        <View style={styles.homeContainer}>
          <Text style={styles.welcome}>🔍 Job Hunt Assistant</Text>
          <Text style={styles.subtitle}>Find the latest LinkedIn #hiring posts now!</Text>

          <TouchableOpacity style={styles.searchButton} onPress={() => setShowWarningPopup(true)}>
            <Text style={styles.searchButtonText}>Search Jobs</Text>
          </TouchableOpacity>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.loadingText}>Analyzing posts, please wait...</Text>
            </View>
          ) : scrapedData?.posts?.length > 0 ? (
            <ScrollView style={styles.resultScroll}>
              <Text style={styles.sectionHeader}>Job Posts</Text>
              <Text style={styles.note}>AI can make mistakes. Verify important info.</Text>
              {scrapedData.posts.map((post, index) => (
                <View key={index} style={styles.card}>
                  <Text style={styles.cardTitle}>{post.title}</Text>
                  <Text style={styles.cardAuthor}>{post.author}</Text>
                  <Text style={styles.cardText}>{post.description}</Text>

                  {(post.email || post.phone) && (
                    <View style={styles.linkBlock}>
                      {post.email && (
                        <TouchableOpacity
                          onPress={() => Linking.openURL(`mailto:${post.email}`)}
                          style={[styles.contactButton, { backgroundColor: '#2563eb' }]}
                        >
                          <Text style={styles.contactButtonText}>📧 Email</Text>
                        </TouchableOpacity>
                      )}
                      {post.phone && (
                        <TouchableOpacity
                          onPress={() => Linking.openURL(`tel:${post.phone}`)}
                          style={[styles.contactButton, { backgroundColor: '#10b981' }]}
                        >
                          <Text style={styles.contactButtonText}>📞 Call</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          ) : scrapedData ? (
            <Text style={styles.subtitle}>😕 No jobs found right now. Try again later!</Text>
          ) : (
            <Text style={styles.subtitle}>No data yet. Start searching!</Text>
          )}
        </View>
      ) : (
        <View style={styles.webViewWrapper}>
          <WebView
            ref={webViewRef}
            source={{ uri: linkedinURL }}
            javaScriptEnabled
            originWhitelist={['*']}
            injectedJavaScript={INJECTED_JAVASCRIPT}
            onMessage={handleMessage}
            startInLoadingState
            style={styles.webView}
          />
          <TouchableOpacity style={styles.closeButton} onPress={() => setShowWebView(false)}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Jobs;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0,
  },
  homeContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  welcome: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: '#2563eb',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 30,
    color: '#555',
  },
  searchButton: {
    backgroundColor: '#2563eb',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 30,
    elevation: 4,
    shadowColor: '#2563eb',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2563eb',
    marginVertical: 10,
  },
  resultScroll: {
    flex: 1,
    marginBottom: 80,
  },
  note: {
    fontSize: 14,
    color: '#C0392B',
    fontStyle: 'italic',
    marginTop: 2,
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 5,
    color: '#111827',
  },
  cardAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#374151',
  },
  linkBlock: {
    marginTop: 15,
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  contactButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  contactButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  webViewWrapper: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    bottom: 105,
    right: 25,
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 50,
    elevation: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 15,
    color: '#555',
  },
});
