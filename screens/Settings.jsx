import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InfoPopup from '../Components/Popup'; // Ensure this component exists

export default function UpdateResume({ onFinish }) {
  const [name, setName] = useState('');
  const [resumeURL, setResumeURL] = useState('');
  const [skills, setSkills] = useState('');
  const [description, setDescription] = useState('');
  const [experience, setExperience] = useState('');
  const [loading, setLoading] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);

  const isFormComplete =
    name.trim() &&
    resumeURL.trim() &&
    skills.trim() &&
    description.trim() &&
    experience.trim();

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const keys = ['name', 'resumeURL', 'skills', 'description', 'experience'];
        const values = await AsyncStorage.multiGet(keys);
        const data = Object.fromEntries(values);

        setName(data.name || '');
        setResumeURL(data.resumeURL || '');
        setSkills(data.skills || '');
        setDescription(data.description || '');
        setExperience(data.experience || '');
      } catch (e) {
        console.error('Error loading profile data:', e);
      }
    };

    loadProfileData();
  }, []);

  const generateHashtag = async ({ skills, description, experience }) => {
    try {
      const prompt = encodeURIComponent(
        `Suggest one popular and specific hashtag (like #react, #uiux, #sales, #productmanager, #java, #datascience, #marketing) that best represents a person's core skills. 
        The person has these skills: ${skills}. 
        Bio: ${description}. 
        Experience: ${experience} years. 
        Return only one hashtag that is relevant to their field (tech or non-tech). Do not use generic tags like #jobsearch or #career. Just one specific hashtag.`
      );

      const response = await fetch(`http://text.pollinations.ai/${prompt}`);
      const text = await response.text();

      const hashtag = text.match(/#\w+/)?.[0] || '#professional';
      await AsyncStorage.setItem('generatedHashtag', hashtag);
      console.log('Updated Hashtag:', hashtag);
    } catch (error) {
      console.error('Error generating hashtag:', error);
    }
  };

  const handleUpdate = async () => {
    if (!isFormComplete) {
      Alert.alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await AsyncStorage.multiSet([
        ['name', name],
        ['resumeURL', resumeURL],
        ['skills', skills],
        ['description', description],
        ['experience', experience],
      ]);

      // Also update hashtag
      await generateHashtag({ skills, description, experience });

      setPopupVisible(true);
    } catch (e) {
      console.error('Error updating profile data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePopupClose = () => {
    setPopupVisible(false);
    if (onFinish) onFinish();
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>✏️ Update Your Resume</Text>
        <Text style={styles.subText}>
          Keep your profile up-to-date to get the best job matches.
        </Text>

        <TextInput
          placeholder="Your Full Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholderTextColor="#94a3b8"
        />
        <TextInput
          placeholder="Resume URL"
          value={resumeURL}
          onChangeText={setResumeURL}
          style={styles.input}
          placeholderTextColor="#94a3b8"
        />
        <TextInput
          placeholder="Skills / Interests"
          value={skills}
          onChangeText={setSkills}
          style={styles.input}
          placeholderTextColor="#94a3b8"
        />
        <TextInput
          placeholder="Short Bio"
          value={description}
          onChangeText={setDescription}
          multiline
          style={[styles.input, styles.textArea]}
          placeholderTextColor="#94a3b8"
        />
        <TextInput
          placeholder="Years of Experience"
          value={experience}
          onChangeText={setExperience}
          keyboardType="numeric"
          style={styles.input}
          placeholderTextColor="#94a3b8"
        />

        {loading ? (
          <ActivityIndicator size="large" color="#2563eb" />
        ) : (
          <TouchableOpacity
            onPress={handleUpdate}
            style={[
              styles.button,
              { backgroundColor: isFormComplete ? '#22c55e' : '#64748b' },
            ]}
            disabled={!isFormComplete}
          >
            <Text style={styles.buttonText}>🔁 Update Resume</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <InfoPopup
        visible={popupVisible}
        title="✅ Resume Updated!"
        message="Your profile and hashtag have been updated successfully."
        onClose={handlePopupClose}
        onCancel={() => setPopupVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    padding: 24,
  },
  heading: {
    fontSize: 24,
    color: '#22d3ee',
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '800',
  },
  subText: {
    fontSize: 14,
    color: '#cbd5e1',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#1e293b',
    marginBottom: 15,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#f8fafc',
    borderWidth: 1,
    borderColor: '#334155',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
});
