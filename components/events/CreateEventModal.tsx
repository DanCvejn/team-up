import useAlert from '@/hooks/useAlert';
import type { ResponseOption } from '@/lib/types';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Modal from '../common/Modal';

interface CreateEventModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; description?: string; date: string; location?: string; capacity: number; response_options: ResponseOption[] }) => Promise<void>;
}

export function CreateEventModal({ visible, onClose, onCreate }: CreateEventModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState<string>('');
  const [responseOptions, setResponseOptions] = useState<ResponseOption[]>([
    { id: Date.now(), label: 'Jdu', countsToCapacity: true, color: 'green' },
    { id: Date.now() + 1, label: 'Nejdu', countsToCapacity: false, color: 'red' },
  ]);
  const [optionText, setOptionText] = useState('');
  const [selectedColor, setSelectedColor] = useState<ResponseOption['color']>('green');
  const [showAddOptionSheet, setShowAddOptionSheet] = useState(false);
  const [newOptionCounts, setNewOptionCounts] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { error: showError } = useAlert();

  const handleCreate = async () => {
    if (!name.trim()) {
      showError('Chyba', 'Zadej název události');
      return;
    }
    if (!date) {
      showError('Chyba', 'Zadej datum události');
      return;
    }
    const cap = parseInt(capacity || '0', 10);
    // capacity == 0 means unlimited
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
      await onCreate({
        name: name.trim(),
        description: description.trim() || undefined,
        date: date.toISOString(),
        location: location.trim() || undefined,
        capacity: cap,
        response_options: responseOptions,
      });
      setName('');
      setDescription('');
      setDate(null);
      setLocation('');
      setCapacity('');
      setResponseOptions([]);
      onClose();
    } catch (error: any) {
      showError('Chyba', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="Vytvoř novou událost"
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
            value={name}
            onChangeText={setName}
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

        {/* Date */}
        <View style={styles.section}>
          <Text style={styles.label}>Datum *</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
            disabled={isLoading}
          >
            <Text>
              {date ? date.toLocaleDateString() : 'Vyber datum'}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date || new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
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

        {/* Response options */}
        <View style={styles.optionsSection}>
          <Text style={styles.label}>Možnosti odpovědí</Text>
          {/* existing options list rendered below */}

          {/* Options as full-width rows with controls */}
          {responseOptions.map((opt) => (
            <View key={opt.id} style={styles.optionRowFull}>
              <View style={styles.optionLeftRow}>
                <TouchableOpacity
                  style={[styles.colorSwatch, (styles as any)[`color_${opt.color}`]]}
                  onPress={() => {
                    const colors: ResponseOption['color'][] = ['green', 'red', 'blue', 'yellow', 'purple'];
                    const idx = colors.indexOf(opt.color);
                    const next = colors[(idx + 1) % colors.length];
                    setResponseOptions(prev => prev.map(o => o.id === opt.id ? { ...o, color: next } : o));
                  }}
                />

                <View style={styles.optionLeft}>
                  <Text style={styles.optionRowText} numberOfLines={2} ellipsizeMode="tail">{opt.label}</Text>
                  <Text style={styles.optionRowMeta}>{opt.countsToCapacity ? 'Počítá se do kapacity' : 'Nepočítá se do kapacity'}</Text>
                </View>
              </View>

              <View style={styles.optionRight}>
                <Switch
                  value={opt.countsToCapacity}
                  onValueChange={() => setResponseOptions(prev => prev.map(o => o.id === opt.id ? { ...o, countsToCapacity: !o.countsToCapacity } : o))}
                  trackColor={{ false: '#cfcfcf', true: '#5fd08d' }}
                />
                <TouchableOpacity
                  onPress={() => setResponseOptions(prev => prev.filter(o => o.id !== opt.id))}
                  style={styles.trashButton}
                  accessibilityLabel={`Remove option ${opt.label}`}
                >
                  <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* big add button under list */}
        <View style={styles.addOptionContainer}>
          <TouchableOpacity
            style={styles.bigAddButton}
            onPress={() => {
              setOptionText('');
              setSelectedColor('green');
              setNewOptionCounts(false);
              setShowAddOptionSheet(true);
            }}
            disabled={isLoading}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.bigAddButtonText}>Přidat možnost</Text>
          </TouchableOpacity>
        </View>

        {/* add-option modal overlay */}
        <Modal title="Přidat možnost" visible={showAddOptionSheet} onClose={() => setShowAddOptionSheet(false)}>
          <View>
            <TextInput
              style={[styles.input, styles.sheetInput]}
              placeholder="Napiš možnost, např. Jdu"
              value={optionText}
              onChangeText={setOptionText}
              editable={!isLoading}
            />

            <View style={[styles.row, { justifyContent: 'space-between', marginTop: 8 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetLabel}>Barva</Text>
                <View style={styles.colorPickerRow}>
                  {(['green', 'red', 'blue', 'yellow', 'purple'] as ResponseOption['color'][]).map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[styles.colorSwatch, selectedColor === c && styles.colorSwatchSelected, (styles as any)[`color_${c}`]]}
                      onPress={() => setSelectedColor(c)}
                    />
                  ))}
                </View>
              </View>

              <View style={{ marginLeft: 12, alignItems: 'flex-end' }}>
                <Text style={styles.sheetLabel}>Počítát do kapacity</Text>
                <Switch
                  value={newOptionCounts}
                  onValueChange={setNewOptionCounts}
                  trackColor={{ false: '#cfcfcf', true: '#5fd08d' }}
                />
              </View>
            </View>

            <View style={{ marginTop: 12 }}>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={() => {
                  const text = optionText.trim();
                  if (!text) return;
                  const newOption: ResponseOption = {
                    id: Date.now(),
                    label: text,
                    countsToCapacity: newOptionCounts,
                    color: selectedColor,
                  };
                  setResponseOptions(prev => [...prev, newOption]);
                  setOptionText('');
                  setSelectedColor('green');
                  setNewOptionCounts(false);
                  setShowAddOptionSheet(false);
                }}
                disabled={isLoading}
              >
                <Text style={styles.primaryButtonText}>Přidat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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
          onPress={handleCreate}
          disabled={isLoading}
        >
          <Text style={styles.primaryButtonText}>
            {isLoading ? 'Vytvářím...' : 'Vytvořit událost'}
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
