import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
} from 'react-native';

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  containerStyle?: any;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  containerStyle,
  ...textInputProps
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...textInputProps}
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor="#999"
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  inputError: {
    borderColor: '#ff4757',
    backgroundColor: '#fff5f5',
  },
  errorText: {
    color: '#ff4757',
    fontSize: 12,
    marginTop: 4,
  },
});

export default FormInput;
