import React, { useMemo, useState, useEffect } from 'react';
import { Modal, View } from 'react-native';
import SplitCreateView from './SplitCreateView';
import SplitConfirmationView from './SplitConfirmationView';
import SplitStatusView from './SplitStatusView';


type SplitTransactionModalProps = {
  visible: boolean;
  onClose: () => void;
  transaction: any; // you can replace 'any' with your TransactionModel type later
  onSplitCreated?: (data: any) => void;
};

export default function SplitTransactionModal({
  visible,
  onClose,
  transaction,
  onSplitCreated,
}: SplitTransactionModalProps) {
const [tempSplit, setTempSplit] = useState<any | null>(null);
const [showBanner, setShowBanner] = useState(false);
const [mode, setMode] = useState<'create' | 'confirm' | 'status'>('create');

// Determine current state
const baseSplit = transaction?.splitData || tempSplit;
const hasSplit = !!(baseSplit?.splits?.length);
const hasReceived = !!baseSplit?.splits?.some((s: any) => s.isPaid);
const effectiveSplit = useMemo(
  () => transaction?.splitData || tempSplit,
  [transaction, tempSplit]
);

const modalHeightClass =
  mode === 'create' ? 'max-h-[70%]' : 'h-[65%]';

// Initialize correct mode when modal opens
useEffect(() => {
  if (visible) {
    if (hasSplit) {
      setMode('status'); // existing split → open in status view
      setShowBanner(false);
    } else {
      setMode('create'); // no split → open in create view
    }
  }
}, [visible, hasSplit]);

// When user creates a split
const handleCreated = (data: any) => {
  setTempSplit(data);
  onSplitCreated?.(data);
  setShowBanner(true); 
  setMode('confirm');
};

// When user clicks edit
const handleEdit = () => {
  if (effectiveSplit && !hasReceived) {
    setMode('create'); 
  }
};

// Close modal, reset banner
const handleClose = () => {
  setShowBanner(false);
  onClose();
};

return (
  <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
    <View className="flex-1 bg-black/50 justify-end">
      <View className={`bg-white rounded-t-3xl p-6 ${modalHeightClass}`}>
        {mode === 'create' ? (
          <SplitCreateView
            transaction={transaction}
            existingSplit={effectiveSplit}
            onClose={handleClose}
            onCreated={handleCreated}
          />
        ) : mode === 'confirm' ? (
          <SplitConfirmationView
            transaction={transaction}
            splitData={effectiveSplit}
            onClose={handleClose}
            onEdit={handleEdit}
            showBanner={showBanner}
          />
        ) : (
          <SplitStatusView
            transaction={transaction}
            splitData={effectiveSplit}
            onClose={handleClose}
            onEdit={handleEdit}
          />
        )}
      </View>
    </View>
  </Modal>
);
}

