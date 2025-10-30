import React, { useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  Modal,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export type FilterType = "all" | "week" | "last_week" | "last_month";
export type BankFilter = "all" | "chase" | "boa" | "wells" | "citi";
export type SortType = "date_desc" | "date_asc" | "amount_desc" | "amount_asc";

interface FilterState {
  timeFilter: FilterType;
  bankFilter: BankFilter;
  sortType: SortType;
}

interface TransactionFilterProps {
  onFilterChange?: (filters: FilterState) => void;
}

export default function TransactionFilter({ onFilterChange }: TransactionFilterProps) {
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    timeFilter: "all",
    bankFilter: "all",
    sortType: "date_desc",
  });

  const timeOptions = [
    { label: "All Time", value: "all" as FilterType },
    { label: "This Week", value: "week" as FilterType },
    { label: "Last Week", value: "last_week" as FilterType },
    { label: "Last Month", value: "last_month" as FilterType },
  ];

  const bankOptions = [
    { label: "All Banks", value: "all" as BankFilter },
    { label: "Chase", value: "chase" as BankFilter },
    { label: "Bank of America", value: "boa" as BankFilter },
    { label: "Wells Fargo", value: "wells" as BankFilter },
    { label: "Citi", value: "citi" as BankFilter },
  ];

  const sortOptions = [
    { label: "Date (Newest)", value: "date_desc" as SortType },
    { label: "Date (Oldest)", value: "date_asc" as SortType },
    { label: "Amount (High to Low)", value: "amount_desc" as SortType },
    { label: "Amount (Low to High)", value: "amount_asc" as SortType },
  ];

  const handleFilterChange = (
    key: keyof FilterState,
    value: FilterType | BankFilter | SortType
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const getActiveTimeLabel = () => {
    return timeOptions.find((opt) => opt.value === filters.timeFilter)?.label || "All Time";
  };

  const getActiveBankLabel = () => {
    return bankOptions.find((opt) => opt.value === filters.bankFilter)?.label || "All Banks";
  };

  const getActiveSortLabel = () => {
    const label = sortOptions.find((opt) => opt.value === filters.sortType)?.label || "Date";
    return label.split("(")[0].trim();
  };

  const hasActiveFilters = filters.timeFilter !== "all" || filters.bankFilter !== "all" || filters.sortType !== "date_desc";

  return (
    <View className="px-6 py-3">
      {/* Title with Clear Button */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-bold text-gray-900">Transactions</Text>
        {hasActiveFilters && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              const defaultFilters = { timeFilter: "all" as FilterType, bankFilter: "all" as BankFilter, sortType: "date_desc" as SortType };
              setFilters(defaultFilters);
              onFilterChange?.(defaultFilters);
            }}
            className="px-3 py-1 bg-gray-100 rounded-lg"
          >
            <Text className="text-sm font-semibold text-gray-600">Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <View className="flex-row gap-2">
        {/* Time Filter */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setShowTimeModal(true)}
          className={`flex-row items-center rounded-xl px-3 py-2 border ${
            filters.timeFilter !== "all"
              ? "bg-[#00332d] border-[#00332d]"
              : "bg-white border-gray-300"
          }`}
        >
          <Ionicons
            name="calendar-outline"
            size={16}
            color={filters.timeFilter !== "all" ? "#fff" : "#6B7280"}
            style={{ marginRight: 4 }}
          />
          <Text
            className={`text-sm font-semibold ${
              filters.timeFilter !== "all" ? "text-white" : "text-gray-700"
            }`}
          >
            {getActiveTimeLabel()}
          </Text>
        </TouchableOpacity>

        {/* Bank Filter */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setShowBankModal(true)}
          className={`flex-row items-center rounded-xl px-3 py-2 border ${
            filters.bankFilter !== "all"
              ? "bg-[#00332d] border-[#00332d]"
              : "bg-white border-gray-300"
          }`}
        >
          <Ionicons
            name="business-outline"
            size={16}
            color={filters.bankFilter !== "all" ? "#fff" : "#6B7280"}
            style={{ marginRight: 4 }}
          />
          <Text
            className={`text-sm font-semibold ${
              filters.bankFilter !== "all" ? "text-white" : "text-gray-700"
            }`}
          >
            {getActiveBankLabel()}
          </Text>
        </TouchableOpacity>

        {/* Sort Filter */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setShowSortModal(true)}
          className={`flex-row items-center rounded-xl px-3 py-2 border ${
            filters.sortType !== "date_desc"
              ? "bg-[#00332d] border-[#00332d]"
              : "bg-white border-gray-300"
          }`}
        >
          <Ionicons
            name="swap-vertical-outline"
            size={16}
            color={filters.sortType !== "date_desc" ? "#fff" : "#6B7280"}
            style={{ marginRight: 4 }}
          />
          <Text
            className={`text-sm font-semibold ${
              filters.sortType !== "date_desc" ? "text-white" : "text-gray-700"
            }`}
          >
            {getActiveSortLabel()}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Time Filter Modal */}
      <FilterModal
        visible={showTimeModal}
        onClose={() => setShowTimeModal(false)}
        title="Time Period"
        options={timeOptions}
        selectedValue={filters.timeFilter}
        onSelect={(value) => {
          handleFilterChange("timeFilter", value);
          setShowTimeModal(false);
        }}
      />

      {/* Bank Filter Modal */}
      <FilterModal
        visible={showBankModal}
        onClose={() => setShowBankModal(false)}
        title="Select Bank"
        options={bankOptions}
        selectedValue={filters.bankFilter}
        onSelect={(value) => {
          handleFilterChange("bankFilter", value);
          setShowBankModal(false);
        }}
      />

      {/* Sort Modal */}
      <FilterModal
        visible={showSortModal}
        onClose={() => setShowSortModal(false)}
        title="Sort By"
        options={sortOptions}
        selectedValue={filters.sortType}
        onSelect={(value) => {
          handleFilterChange("sortType", value);
          setShowSortModal(false);
        }}
      />
    </View>
  );
}

// Reusable Filter Modal Component
function FilterModal({
  visible,
  onClose,
  title,
  options,
  selectedValue,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: Array<{ label: string; value: any }>;
  selectedValue: any;
  onSelect: (value: any) => void;
}) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        className="flex-1 bg-black/50 justify-end"
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <View className="bg-white rounded-t-3xl pt-2 pb-8">
            {/* Handle Bar */}
            <View className="items-center py-2">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>

            {/* Title */}
            <View className="px-6 py-3 border-b border-gray-200">
              <Text className="text-xl font-bold text-gray-900">{title}</Text>
            </View>

            {/* Options */}
            <View className="px-6 py-2">
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  activeOpacity={0.7}
                  onPress={() => onSelect(option.value)}
                  className="py-4 border-b border-gray-100"
                >
                  <View
                    className={`flex-row items-center justify-between px-3 py-1 rounded-lg ${
                      option.value === selectedValue ? "bg-[#f0fdf4]" : ""
                    }`}
                  >
                    <Text
                      className={`text-base font-semibold ${
                        option.value === selectedValue
                          ? "text-[#00332d]"
                          : "text-gray-700"
                      }`}
                    >
                      {option.label}
                    </Text>
                    {option.value === selectedValue && (
                      <Ionicons name="checkmark-circle" size={24} color="#00332d" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}