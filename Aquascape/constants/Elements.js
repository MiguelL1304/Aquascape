import { StyleSheet } from 'react-native';
import Colors from './Colors';

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
    fontSize: 40,
    fontWeight: '500',
    color: Colors.primary,
    marginBottom: 20,
  },

  // Text Field Styles
  textField: {
    height: 50,
    width: '90%',
    borderColor: Colors.border,
    borderBottomWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: Colors.background,
    fontSize: 16,
  },

  // Header Styles
  header: {
    fontSize: 20,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
});

export default Elements;