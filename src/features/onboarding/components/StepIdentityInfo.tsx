import React, { useState } from 'react';
import { User, Calendar, X } from 'lucide-react-native';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Modal, FlatList, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Button } from '../../../shared/components/ui/Button';
import { OnboardingHeader } from '../../../shared/components/ui/OnboardingHeader';

import { UserData } from '../../../shared/types/user';
import { useTheme } from '../../../shared/hooks/useTheme';

interface StepIdentityInfoProps {
  userData: UserData;
  onNext: (data: Partial<UserData>) => void;
}

export default function StepIdentityInfo({ userData, onNext }: StepIdentityInfoProps) {
  const { colors, isDark } = useTheme();
  const [fullName, setFullName] = useState(userData.fullName || '');
  const [dateOfBirth, setDateOfBirth] = useState(userData.dateOfBirth || '');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Default picker values
  const initialDate = dateOfBirth ? dateOfBirth.split('/') : ['01', '01', '2000'];
  const [tempDay, setTempDay] = useState(initialDate[0]);
  const [tempMonth, setTempMonth] = useState(initialDate[1]);
  const [tempYear, setTempYear] = useState(initialDate[2]);

  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => (currentYear - i).toString());

  const ITEM_HEIGHT = 45;

  const WheelPicker = ({ 
    data, 
    selectedValue, 
    onValueChange 
  }: { 
    data: string[], 
    selectedValue: string, 
    onValueChange: (val: string) => void 
  }) => {
    // Add empty items for padding
    const paddedData = ['', ...data, ''];
    const initialIndex = data.indexOf(selectedValue);

    const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = event.nativeEvent.contentOffset.y;
      const index = Math.round(y / ITEM_HEIGHT);
      if (index >= 0 && index < data.length) {
        onValueChange(data[index]);
      }
    };

    return (
      <View style={{ height: ITEM_HEIGHT * 3, width: '100%', overflow: 'hidden' }}>
        <View style={styles.selectionHighlight} />
        <FlatList
          data={paddedData}
          keyExtractor={(_, i) => i.toString()}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          onMomentumScrollEnd={onScroll}
          initialScrollIndex={initialIndex >= 0 ? initialIndex : 0}
          getItemLayout={(_, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          })}
          renderItem={({ item, index }) => {
            const isSelected = item === selectedValue;
            return (
              <View style={[styles.pickerItem, { height: ITEM_HEIGHT }]}>
                <Text style={[
                  styles.pickerItemText, 
                  { 
                    color: isSelected ? colors.primary : colors.textSecondary,
                    fontWeight: isSelected ? '700' : '400',
                    fontSize: isSelected ? 20 : 16
                  }
                ]}>
                  {item}
                </Text>
              </View>
            );
          }}
        />
      </View>
    );
  };

  const handleBirthDateChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let day = cleaned.slice(0, 2);
    let month = cleaned.slice(2, 4);
    let year = cleaned.slice(4, 8);

    // Validate Day
    if (day.length === 2) {
      const d = parseInt(day);
      if (d > 31) day = '31';
      else if (d === 0) day = '01';
    }

    // Validate Month
    if (month.length === 2) {
      const m = parseInt(month);
      if (m > 12) month = '12';
      else if (m === 0) month = '01';
    }

    let formatted = day;
    if (cleaned.length > 2) formatted += '/' + month;
    if (cleaned.length > 4) formatted += '/' + year;

    setDateOfBirth(formatted);
  };

  const checkAge = (dateStr: string) => {
    if (dateStr.length !== 10) return { isValid: false, isUnderage: false, isFuture: false };
    const [day, month, year] = dateStr.split('/').map(Number);
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    
    // Future check
    if (birthDate > today) return { isValid: false, isUnderage: false, isFuture: true };

    // Age check (18+)
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return { 
      isValid: age >= 18, 
      isUnderage: age < 18, 
      isFuture: false 
    };
  };

  const ageStatus = checkAge(dateOfBirth);
  const isValid = fullName.trim().length > 0 && ageStatus.isValid;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <OnboardingHeader 
          Icon={User}
          title="What's your identity?"
          subtitle="Enter your name and birthday to continue"
        />

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Full Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="Enter your name"
            placeholderTextColor={colors.textSecondary}
            value={fullName}
            onChangeText={setFullName}
            maxLength={15}
            autoFocus
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Birthday (DD/MM/YYYY)</Text>
          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => setShowDatePicker(true)}
            style={[styles.input, {
              backgroundColor: colors.surface,
              borderColor: (ageStatus.isFuture || ageStatus.isUnderage) ? '#ef4444' : colors.border,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between'
            }]}
          >
            <Text style={{ 
              fontSize: 18, 
              color: dateOfBirth ? colors.text : colors.textSecondary 
            }}>
              {dateOfBirth || 'Select your birthday'}
            </Text>
            <Calendar size={20} color={colors.primary} />
          </TouchableOpacity>
          {ageStatus.isFuture && (
            <Text style={styles.errorText}>Birth date cannot be in the future</Text>
          )}
          {ageStatus.isUnderage && (
            <Text style={styles.errorText}>You must be at least 18 years old</Text>
          )}
        </View>

        {/* Date Picker Modal */}
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Select Birthday</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <X size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.pickerContainer}>
                <View style={styles.pickerWrapDayMonth}>
                  <WheelPicker
                    data={days}
                    selectedValue={tempDay}
                    onValueChange={setTempDay}
                  />
                </View>
                <View style={styles.pickerWrapDayMonth}>
                  <WheelPicker
                    data={months}
                    selectedValue={tempMonth}
                    onValueChange={setTempMonth}
                  />
                </View>
                <View style={styles.pickerWrapYear}>
                  <WheelPicker
                    data={years}
                    selectedValue={tempYear}
                    onValueChange={setTempYear}
                  />
                </View>
              </View>

              <Button
                title="Confirm"
                onPress={() => {
                  setDateOfBirth(`${tempDay}/${tempMonth}/${tempYear}`);
                  setShowDatePicker(false);
                }}
              />
            </View>
          </View>
        </Modal>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={() => onNext({ fullName, dateOfBirth })}
          disabled={!isValid}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  footer: {
    paddingBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    height: 180,
  },
  pickerWrapDayMonth: {
    flex: 1,
  },
  pickerWrapYear: {
    flex: 1.5,
  },
  pickerItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerItemText: {
    textAlign: 'center',
  },
  selectionHighlight: {
    position: 'absolute',
    top: 45, // ITEM_HEIGHT
    left: 10,
    right: 10,
    height: 45, // ITEM_HEIGHT
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
});
