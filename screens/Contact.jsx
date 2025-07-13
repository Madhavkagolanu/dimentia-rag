import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Modal,
  TouchableOpacity,
  Linking,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GOOGLE_FORM_URL = 'https://forms.gle/UaXbekSxksGPvcPU9';
const SUPPORT_EMAIL = 'astraai45@gmail.com';

const ContactUsScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState(null);

  const handlePress = (url) => {
    setSelectedUrl(url);
    setModalVisible(true);
  };

  const handleContinue = () => {
    setModalVisible(false);
    if (selectedUrl) Linking.openURL(selectedUrl);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setSelectedUrl(null);
  };

  const contactOptions = [
    {
      id: 'email',
      title: 'Email Us',
      description: 'Report bugs or ask for help',
      icon: 'https://img.icons8.com/fluency/48/mail.png',
      color: '#D44638',
      url: `mailto:${SUPPORT_EMAIL}`,
    },
    {
      id: 'form',
      title: 'Feedback Form',
      description: 'Send feedback via Google Form',
      icon: 'https://www.gstatic.com/images/branding/product/1x/forms_2020q4_48dp.png',
      color: '#4285F4',
      url: GOOGLE_FORM_URL,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Contact Us</Text>
          <Text style={styles.subtitle}>Choose an option below to reach out</Text>
        </View>

        <View style={styles.optionsContainer}>
          {contactOptions.map((option) => (
            <Pressable
              key={option.id}
              style={({ pressed }) => [
                styles.option,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={() => handlePress(option.url)}
            >
              <View
                style={[styles.iconContainer, { backgroundColor: `${option.color}10` }]}
              >
                <Image source={{ uri: option.icon }} style={styles.iconImage} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Built with</Text>
          <Text style={styles.heartText}>❤️</Text>
          <Text style={styles.footerText}>by Astra AI</Text>
        </View>
      </ScrollView>

      {/* Modal for confirmation */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Redirect Confirmation</Text>
            <Text style={styles.modalText}>
              You’re about to be redirected to an external link. Continue?
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.continueButton]}
                onPress={handleContinue}
              >
                <Text style={[styles.modalButtonText, styles.continueButtonText]}>
                  Continue
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ContactUsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  optionsContainer: {
    marginBottom: 32,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconImage: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  heartText: {
    fontSize: 16,
    color: '#EC4899',
    marginHorizontal: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  continueButton: {
    backgroundColor: '#3B82F6',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#111827',
  },
  continueButtonText: {
    color: '#ffffff',
  },
});
