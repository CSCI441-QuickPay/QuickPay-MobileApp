import React, { useMemo, useState, useEffect } from 'react';
import { Modal, View, Alert } from 'react-native';
import SplitCreateView from './SplitCreateView';
import SplitConfirmationView from './SplitConfirmationView';
import SplitStatusView from './SplitStatusView';

type SplitTransactionModalProps = {
  visible: boolean;
  onClose: () => void;
  transaction: any;
  onSplitCreated?: (data: any) => void;
  onSplitCanceled?: () => void;
};

export default function SplitTransactionModal({
  visible,
  onClose,
  transaction,
  onSplitCreated,
  onSplitCanceled,
}: SplitTransactionModalProps) {
  const [tempSplit, setTempSplit] = useState<any | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [mode, setMode] = useState<'create' | 'confirm' | 'status'>('create');

  const baseSplit = transaction?.splitData || tempSplit;
  const hasSplit = !!(baseSplit?.splits?.length);
  const hasReceived = !!baseSplit?.splits?.some((s: any) => s.isPaid);

  const effectiveSplit = useMemo(
    () => transaction?.splitData || tempSplit,
    [transaction, tempSplit]
  );

  const modalHeightClass = mode === 'create' ? 'max-h-[70%]' : 'h-[65%]';

  // ✅ Fixed logic: prevent overriding banner on new split creation
  useEffect(() => {
    if (visible) {
      if (hasSplit && !showBanner) {
        setMode('status');
        setShowBanner(false);
      } else if (!hasSplit) {
        setMode('create');
      }
    }
  }, [visible, hasSplit, showBanner]);

  // When user creates a split
  const handleCreated = (data: any) => {
    setTempSplit(data);
    onSplitCreated?.(data);
    setShowBanner(true);
    setMode('confirm');
  };

  const handleEdit = () => {
    if (effectiveSplit && !hasReceived) {
      setMode('create');
    }
  };

  const handleClose = () => {
    setShowBanner(false);
    onClose();
  };

  const handleCancelSplit = () => {
    Alert.alert(
      'Cancel Split',
      'Are you sure you want to cancel this split transaction? This action cannot be undone.',
      [
        {
          text: 'No, Keep Split',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel Split',
          style: 'destructive',
          onPress: () => {
            setTempSplit(null);
            onSplitCanceled?.();
            handleClose();
          },
        },
      ]
    );
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
              onCancelSplit={handleCancelSplit}
              showBanner={showBanner}
            />
          ) : (
            <SplitStatusView
              transaction={transaction}
              splitData={effectiveSplit}
              onClose={handleClose}
              onEdit={handleEdit}
              onCancelSplit={handleCancelSplit}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}
