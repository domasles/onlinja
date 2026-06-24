import { View, Text, TouchableOpacity } from "react-native"
import { useState } from "react"

interface DropdownOption<T extends string> {
    label: string
    value: T
}

interface DropdownProps<T extends string> {
    options: DropdownOption<T>[]
    selectedValue: T
    onSelect: (value: T) => void
}

export const Dropdown = <T extends string>({ options, selectedValue, onSelect }: DropdownProps<T>) => {
    const [isOpen, setIsOpen] = useState(false)
    const currentOption = options.find((opt) => opt.value === selectedValue)

    const handleSelect = (value: T) => {
        onSelect(value)
        setIsOpen(false)
    }

    return (
        <View className="w-[280px] self-center relative z-50">
            <TouchableOpacity 
                onPress={() => setIsOpen(!isOpen)}
                className="w-full h-11 bg-neutral-100 border border-neutral-200 rounded-xl px-4 flex-row items-center justify-between"
            >
                <Text className="text-xs font-button text-neutral-800">
                    {currentOption?.label || "Select Option"}
                </Text>
                <Text className="text-xs text-neutral-400">{isOpen ? "▲" : "▼"}</Text>
            </TouchableOpacity>

            {isOpen && (
                <View className="absolute top-12 left-0 right-0 bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden z-50">
                    {options.map((opt) => (
                        <TouchableOpacity
                            key={opt.value}
                            onPress={() => handleSelect(opt.value)}
                            className={`w-full h-10 px-4 justify-center ${selectedValue === opt.value ? "bg-neutral-100" : "bg-white"}`}
                        >
                            <Text className={`text-xs font-button ${selectedValue === opt.value ? "text-black font-bold" : "text-neutral-600"}`}>
                                {opt.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    )
}
