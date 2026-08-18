import { Pressable, View } from 'react-native';

interface Props {
  checked: boolean;
  onChange: (val: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, disabled }: Props) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      className={`h-7 w-12 rounded-full p-0.5 ${checked ? 'bg-primary-500' : 'bg-gray-300'} ${disabled ? 'opacity-40' : ''}`}
    >
      <View
        className="h-6 w-6 rounded-full bg-white"
        style={{ transform: [{ translateX: checked ? 20 : 0 }] }}
      />
    </Pressable>
  );
}
