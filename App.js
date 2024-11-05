import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, TextInput, Alert } from 'react-native';
import * as Location from 'expo-location';
import * as MailComposer from 'expo-mail-composer';

const App = () => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [recipient, setRecipient] = useState('');
  const [emailBody, setEmailBody] = useState('');

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permissão de localização negada');
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);

      const { latitude, longitude } = currentLocation.coords;
      const address = await Location.reverseGeocodeAsync({ latitude, longitude });
      setAddress(address[0]?.name || address[0]?.city || address[0]?.region || 'Endereço não disponível');
    } catch (error) {
      console.error(error);
      Alert.alert('Erro ao obter localização', error.message);
    }
  };

  const sendEmail = async () => {
    try {
      const emailContent = `
        Latitude: ${location.latitude}
        Longitude: ${location.longitude}
        Endereço: ${address}
        ${emailBody}
      `;

      const isAvailable = await MailComposer.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Cliente de e-mail não disponível');
      }

      await MailComposer.composeAsync({
        recipients: [recipient],
        subject: 'Dados de Localização',
        body: emailContent,
      });

      Alert.alert('E-mail enviado com sucesso!');
    } catch (error) {
      console.error(error);
      Alert.alert('Erro ao enviar e-mail', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Obtendo sua Localização</Text>

      <Text style={styles.info}>Latitude: {location?.latitude}</Text>
      <Text style={styles.info}>Longitude: {location?.longitude}</Text>
      <Text style={styles.info}>Endereço: {address}</Text>

      <TextInput
        style={styles.input}
        placeholder="Destinatário"
        onChangeText={(text) => setRecipient(text)}
        value={recipient}
      />

      <TextInput
        style={styles.input}
        placeholder="Corpo do Email"
        multiline
        onChangeText={(text) => setEmailBody(text)}
        value={emailBody}
      />

      <Button title="Enviar Email" onPress={sendEmail} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  info: {
    marginBottom: 10,
  },
  input: {
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    width: '100%',
  },
});

export default App;