import { StyleSheet } from 'react-native';
import Colors from './Colors'; // Assuming Colors.js already exists

const Elements = StyleSheet.create({
  // Main Button Styles
  mainButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    borderWidth: 3,
    paddingVertical: 6,
    paddingHorizontal: 25,
    borderRadius: 50,
    alignItems: 'center',
  },
  mainButtonText: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },

  //Secondary Button Styles

  secondaryButton: {
    backgroundColor: Colors.background,
    borderColor: Colors.primary,
    borderWidth: 3,
    paddingVertical: 6,
    paddingHorizontal: 25,
    borderRadius: 50,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },

  // Title Text Styles
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 20,
  },

  // Text Field Styles
  textField: {
    height: 50,
    width: '100%',
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: Colors.white,
    fontSize: 20,
  },

  // Header Styles
  header: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 10,
  },
});

export default Elements;