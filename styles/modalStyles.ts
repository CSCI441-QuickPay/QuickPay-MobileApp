import { StyleSheet } from 'react-native';

const palette = {
  background: '#F5F6F7',      
  surface: '#FFFFFF',       
  border: '#E5E7EB',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  accent: '#00332d',
  danger: '#DC2626',
  success: '#16A34A',
};

export const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  container: {
    backgroundColor: palette.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    height: '65%',
  },

  scrollArea: {
    paddingBottom: 24,
  },

  // Section Containers
  card: {
    backgroundColor: palette.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: 10,
  },

  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  fieldLabel: {
    fontSize: 14,
    color: palette.textSecondary,
  },

  fieldValue: {
    fontSize: 14,
    fontWeight: '500',
    color: palette.textPrimary,
  },

  // Notes
  notesContainer: {
    backgroundColor: palette.surface,
    borderRadius: 20,
    padding: 16,
  },

  noteInput: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
    padding: 12,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
    color: palette.textPrimary,
  },

  notePlaceholder: {
    color: palette.textSecondary,
    fontStyle: 'italic',
  },

  remarkBox: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
  },

  closeButton: {
    backgroundColor: palette.surface,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },

  closeButtonText: {
    fontWeight: '600',
    color: palette.textSecondary,
  },
});
