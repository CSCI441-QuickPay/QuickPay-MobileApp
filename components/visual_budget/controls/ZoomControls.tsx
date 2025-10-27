import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ZoomControls({ onZoomIn, onZoomOut }: { onZoomIn: () => void; onZoomOut: () => void }) {
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 16,
        right: 16,
        backgroundColor: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
      }}
    >
      <TouchableOpacity onPress={onZoomIn} className="p-3 border-b border-gray-200">
        <Ionicons name="add" size={22} color="#374151" />
      </TouchableOpacity>
      <TouchableOpacity onPress={onZoomOut} className="p-3">
        <Ionicons name="remove" size={22} color="#374151" />
      </TouchableOpacity>
    </View>
  );
}
