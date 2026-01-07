import type { ResponseOption } from '@/lib/types';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Modal from '../common/Modal';

interface Props {
  responseOptions: ResponseOption[];
  setResponseOptions: (opts: ResponseOption[]) => void;
  isLoading?: boolean;
}

export function EventOptionEditor({ responseOptions, setResponseOptions, isLoading }: Props) {
  const [optionText, setOptionText] = useState('');
  const [selectedColor, setSelectedColor] = useState<ResponseOption['color']>('green');
  const [showAddOptionSheet, setShowAddOptionSheet] = useState(false);
  const [newOptionCounts, setNewOptionCounts] = useState(false);

  return (
    <View>
      <View style={styles.optionsSection}>
        <Text style={styles.label}>Možnosti odpovědí</Text>

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
    </View>
  );
}

const styles = StyleSheet.create({
  optionsSection: { gap: 4 },
  label: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
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
  optionLeftRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  optionLeft: { minWidth: 0 },
  optionRowText: { fontSize: 14, color: '#1A1A1A', flexShrink: 1 },
  optionRowMeta: { fontSize: 12, color: '#8E8E93' },
  optionRight: { flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 8, minWidth: 92, justifyContent: 'flex-end', paddingLeft: 8 },
  trashButton: { padding: 8, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  colorPickerRow: { flexDirection: 'row', gap: 6, marginTop: 6, alignItems: 'center' },
  colorSwatch: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: 'transparent' },
  colorSwatchSelected: { borderColor: '#1A1A1A' },
  color_green: { backgroundColor: '#5fd08d' },
  color_red: { backgroundColor: '#ff6b6b' },
  color_blue: { backgroundColor: '#4aa3ff' },
  color_yellow: { backgroundColor: '#ffd166' },
  color_purple: { backgroundColor: '#b285ff' },
  addOptionContainer: { alignItems: 'center' },
  bigAddButton: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#007AFF', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 },
  bigAddButtonText: { color: '#FFFFFF', fontWeight: '600' },
  input: { width: '100%', padding: 16, backgroundColor: '#F5F5F5', borderRadius: 12, fontSize: 16 },
  sheetInput: { padding: 12, fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center' },
  sheetLabel: { fontSize: 12, color: '#8E8E93', marginBottom: 6 },
  button: { width: '100%', padding: 16, borderRadius: 12, alignItems: 'center' },
  primaryButton: { backgroundColor: '#007AFF', marginTop: 8 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
