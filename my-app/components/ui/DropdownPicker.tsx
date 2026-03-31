import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  ViewStyle,
} from 'react-native';

export interface DropdownOption {
  label: string;
  value: string;
}

interface Props {
  options: DropdownOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  style?: ViewStyle;
}

export default function DropdownPicker({ options, selectedValue, onSelect, style }: Props) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === selectedValue);

  return (
    <View style={style}>
      <TouchableOpacity style={styles.trigger} onPress={() => setOpen(true)}>
        <Text style={styles.triggerText} numberOfLines={1}>
          {selected?.label ?? selectedValue}
        </Text>
        <Text style={styles.arrow}>▾</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={styles.menu}>
            <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
              {options.map((opt, idx) => {
                const isActive = opt.value === selectedValue;
                const isLast = idx === options.length - 1;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.option,
                      isActive && styles.optionActive,
                      isLast && styles.optionLast,
                    ]}
                    onPress={() => {
                      onSelect(opt.value);
                      setOpen(false);
                    }}
                  >
                    <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                      {opt.label}
                    </Text>
                    {isActive && <Text style={styles.check}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    backgroundColor: '#252542',
    borderWidth: 2,
    borderColor: '#3d3d5c',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  triggerText: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  arrow: {
    color: '#888',
    fontSize: 16,
    marginLeft: 8,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  menu: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3d3d5c',
    width: '100%',
    maxHeight: 320,
    overflow: 'hidden',
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#252542',
  },
  optionActive: {
    backgroundColor: '#252542',
  },
  optionLast: {
    borderBottomWidth: 0,
  },
  optionText: {
    color: '#ccc',
    fontSize: 15,
  },
  optionTextActive: {
    color: '#f59e0b',
    fontWeight: '700',
  },
  check: {
    color: '#f59e0b',
    fontSize: 14,
    fontWeight: '700',
  },
});
