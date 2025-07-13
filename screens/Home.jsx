import React from 'react';
import { View, Text, ImageBackground, StyleSheet, SafeAreaView, ScrollView } from 'react-native';

const HomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Hero Section */}
        <ImageBackground 
          source={{ uri: 'https://images.unsplash.com/photo-1521791055366-0d553872125f?auto=format&fit=crop&w=2069&q=80' }}
          style={styles.heroImage}
          imageStyle={{ opacity: 0.8 }}
        >
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Find Your Dream Job</Text>
            <Text style={styles.heroSubtitle}>AI-Powered Job Search Platform</Text>
          </View>
        </ImageBackground>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose Us</Text>

          <View style={styles.featureCard}>
            <ImageBackground
              source={{ uri: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=2070&q=80' }}
              style={styles.featureImage}
              imageStyle={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
            >
              <View style={styles.featureImageOverlay} />
            </ImageBackground>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Smart Matching</Text>
              <Text style={styles.featureDescription}>
                AI scans your profile to connect you with tailored job opportunities based on skills and goals.
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <ImageBackground
              source={{ uri: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2070&q=80' }}
              style={styles.featureImage}
              imageStyle={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
            >
              <View style={styles.featureImageOverlay} />
            </ImageBackground>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Real-time Insights</Text>
              <Text style={styles.featureDescription}>
                Analyze job posts instantly with insights, contact highlights, and skill fit analysis.
              </Text>
            </View>
          </View>
        </View>

        {/* Visual Callout Section */}
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1579389083078-4e7018379f7e?auto=format&fit=crop&w=2070&q=80' }}
          style={styles.ctaSection}
          imageStyle={{ borderRadius: 16, opacity: 0.85 }}
        >
          <View style={styles.ctaOverlay}>
            <Text style={styles.ctaText}>Empowering you to take control of your career journey.</Text>
            <Text style={styles.ctaSubText}>No spam. No noise. Just smart job discovery.</Text>
          </View>
        </ImageBackground>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom:60,
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  heroImage: {
    width: '100%',
    height: 420,
    justifyContent: 'center',
  },
  heroOverlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 30,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 38,
    fontWeight: '900',
    color: 'white',
    marginBottom: 14,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 8,
  },
  heroSubtitle: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 24,
    textAlign: 'center',
  },
  featureCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  featureImage: {
    height: 180,
    width: '100%',
  },
  featureImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  featureTextContainer: {
    padding: 20,
  },
  featureTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 10,
  },
  featureDescription: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  ctaSection: {
    marginHorizontal: 24,
    marginTop: 20,
    height: 240,
    justifyContent: 'center',
  },
  ctaOverlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 28,
    borderRadius: 16,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  ctaSubText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    opacity: 0.9,
  },
});

export default HomeScreen;
