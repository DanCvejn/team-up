import useAlert from '@/hooks/useAlert';
import type { Event, ResponseOption } from '@/lib/types';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Modal from '../common/Modal';
import { EventOptionEditor } from './EventOptionEditor';

interface EditEventModalProps {
  visible: boolean;
  onClose: () => void;
  onUpdate: (data: { title: string; description?: string; date: string; location?: string; capacity: number; response_options: ResponseOption[] }) => Promise<void>;
  event: Event;
}

export function EditEventModal({ visible, onClose, onUpdate, event }: EditEventModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState<string>('');
  const [responseOptions, setResponseOptions] = useState<ResponseOption[]>([]);
  const [optionText, setOptionText] = useState('');
  const [selectedColor, setSelectedColor] = useState<ResponseOption['color']>('green');
  const [showAddOptionSheet, setShowAddOptionSheet] = useState(false);
  const [newOptionCounts, setNewOptionCounts] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { error: showError } = useAlert();

  // Pre-populate form with existing event data
  useEffect(() => {
    if (visible && event) {
      setTitle(event.title || '');
      setDescription(event.description || '');
      setDate(event.date ? new Date(event.date) : null);
      setLocation(event.location || '');
      setCapacity(String(event.capacity ?? 0));
      setResponseOptions(event.response_options || []);
    }
  }, [visible, event]);

  const handleUpdate = async () => {
    if (!title.trim()) {
      showError('Chyba', 'Zadej název události');
      return;
    }
    if (!date) {
      showError('Chyba', 'Zadej datum události');
      return;
    }
    const cap = parseInt(capacity || '0', 10);
    if (Number.isNaN(cap) || cap < 0) {
      showError('Chyba', 'Zadej platnou kapacitu (0 = neomezeno)');
      return;
    }

    if (responseOptions.length === 0) {
      showError('Chyba', 'Přidej alespoň jednu možnost odpovědi');
      return;
    }
    setIsLoading(true);
    try {
      await onUpdate({
        title: title.trim(),
        description: description.trim() || undefined,
        date: date.toISOString(),
        location: location.trim() || undefined,
        capacity: cap,
        response_options: responseOptions,
      });
      onClose();
    } catch (error: any) {
      showError('Chyba', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="Upravit událost"
      scroll
      visible={visible}
      onClose={onClose}
    >
      <View style={styles.form}>
        {/* Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Název události *</Text>
          <TextInput
            style={styles.input}
            placeholder="např. Turnaj v šipkách"
            value={title}
            onChangeText={setTitle}
            maxLength={50}
            editable={!isLoading}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Popis (volitelné)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Krátký popis události..."
            value={description}
            onChangeText={setDescription}
            maxLength={200}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            editable={!isLoading}
          />
        </View>

        {/* Date & Time */}
        <View style={styles.section}>
          <Text style={styles.label}>Datum a čas *</Text>
          <View style={styles.dateTimeRow}>
            <TouchableOpacity
              style={[styles.input, styles.dateTimeInput]}
              onPress={() => setShowDatePicker(true)}
              disabled={isLoading}
            >
              <Ionicons name="calendar-outline" size={20} color="#8E8E93" />
              <Text style={styles.dateTimeText}>
                {date ? date.toLocaleDateString('cs-CZ') : 'Vyber datum'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.input, styles.dateTimeInput]}
              onPress={() => setShowTimePicker(true)}
              disabled={isLoading}
            >
              <Ionicons name="time-outline" size={20} color="#8E8E93" />
              <Text style={styles.dateTimeText}>
                {date ? date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }) : 'Vyber čas'}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={date || new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  if (date) {
                    selectedDate.setHours(date.getHours());
                    selectedDate.setMinutes(date.getMinutes());
                  }
                  setDate(selectedDate);
                }
              }}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={date || new Date()}
              mode="time"
              display="default"
              onChange={(event, selectedTime) => {
                setShowTimePicker(false);
                if (selectedTime) {
                  setDate(selectedTime);
                }
              }}
            />
          )}
        </View>

        {/* Capacity */}
        <View style={styles.section}>
          <Text style={styles.label}>Kapacita *</Text>
          <TextInput
            style={styles.input}
            placeholder="např. 0 (neomezeno)"
            value={capacity}
            onChangeText={(t) => setCapacity(t.replace(/[^0-9]/g, ''))}
            maxLength={6}
            keyboardType="numeric"
            editable={!isLoading}
          />
        </View>

        {/* Response options (extracted) */}
        <EventOptionEditor
          responseOptions={responseOptions}
          setResponseOptions={setResponseOptions}
          isLoading={isLoading}
        />

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.label}>Místo (volitelné)</Text>
          <TextInput
            style={styles.input}
            placeholder="např. Sportovní hala"
            value={location}
            onChangeText={setLocation}
            maxLength={100}
            editable={!isLoading}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleUpdate}
          disabled={isLoading}
        >
          <Text style={styles.primaryButtonText}>
            {isLoading ? 'Aktualizuji...' : 'Uložit změny'}
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 16,
  },
  section: {
    gap: 12,
  },
  optionsSection: {
    gap: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  input: {
    width: '100%',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    fontSize: 16,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateTimeText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  optionInputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  optionInput: {
    flex: 1,
  },
  addOptionButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 14,
    color: '#1A1A1A',
    marginRight: 8,
  },
  tagRemove: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  smallText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  optionList: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EFEFF4',
    paddingTop: 10,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  optionRowText: {
    fontSize: 14,
    color: '#1A1A1A',
    flexShrink: 1,
  },
  optionRowMeta: {
    fontSize: 12,
    color: '#8E8E93',
  },
  optionRowFull: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 10,
    marginTop: 4,
  },
  optionLeft: {
    minWidth: 0,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 8,
    minWidth: 92,
    justifyContent: 'flex-end',
    paddingLeft: 8,
  },
  removeButton: {
    padding: 6,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trashButton: {
    padding: 8,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorPickerRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
    alignItems: 'center',
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  colorSwatchSelected: {
    borderColor: '#1A1A1A',
  },
  color_green: {
    backgroundColor: '#5fd08d',
  },
  color_red: {
    backgroundColor: '#ff6b6b',
  },
  color_blue: {
    backgroundColor: '#4aa3ff',
  },
  color_yellow: {
    backgroundColor: '#ffd166',
  },
  color_purple: {
    backgroundColor: '#b285ff',
  },
  optionLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  sheetInput: {
    padding: 12,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sheetLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 6,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  addOptionContainer: {
    alignItems: 'center',
  },
  bigAddButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  bigAddButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  textArea: {
    minHeight: 80,
  },
  button: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#F5F5F5',
  },
  secondaryButtonText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '600',
  },
});
