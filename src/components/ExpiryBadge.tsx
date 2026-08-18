import { ExpiryStatus } from '@/types';
import { AlertTriangle, CheckCircle2, XCircle, Calendar } from 'lucide-react-native';
import { View, Text } from 'react-native';

interface Props {
  status: ExpiryStatus;
  size?: 'sm' | 'md';
}

export function ExpiryBadge({ status, size = 'md' }: Props) {
  const config = {
    fresh: { bg: 'bg-accent-100', text: 'text-accent-700', iconColor: '#059669', icon: CheckCircle2, label: 'Fresh' },
    soon: { bg: 'bg-warning-100', text: 'text-warning-700', iconColor: '#b45309', icon: AlertTriangle, label: 'Expiring Soon' },
    expired: { bg: 'bg-danger-100', text: 'text-danger-700', iconColor: '#b91c1c', icon: XCircle, label: 'Expired' },
    none: { bg: 'bg-slate-100', text: 'text-slate-500', iconColor: '#64748b', icon: Calendar, label: 'No Expiry' },
  } as const;

  const { bg, text, iconColor, icon: Icon, label } = config[status];
  const sizing = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1';
  const iconSize = size === 'sm' ? 11 : 13;
  const fontSize = size === 'sm' ? 11 : 12;

  return (
    <View className={`flex-row items-center gap-1 rounded-full ${bg} ${sizing}`}>
      <Icon size={iconSize} strokeWidth={2.5} color={iconColor} />
      <Text style={{ fontSize }} className={`font-medium ${text}`}>{label}</Text>
    </View>
  );
}
