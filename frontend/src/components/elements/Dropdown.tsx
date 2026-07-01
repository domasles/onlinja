import { View, Text, TouchableOpacity, useWindowDimensions } from "react-native"
import { MotiView, AnimatePresence } from "moti"
import { useState } from "react"

interface DropdownOption<T extends string> {
    label: string
    value: T
}

interface DropdownProps<T extends string> {
    options: DropdownOption<T>[]
    defaultValue?: T
    className?: string
    onChange?: (value: T) => void
}

export const Dropdown = <T extends string>({ options, defaultValue, className = "", onChange }: DropdownProps<T>) => {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedValue, setSelectedValue] = useState<T>(defaultValue ?? options[0].value)
    
    const currentOption = options.find((opt) => opt.value === selectedValue)
    const { width, height } = useWindowDimensions()

    const handleSelect = (value: T) => {
        setSelectedValue(value)
        onChange?.(value)
        setIsOpen(false)
    }

    return (
        <View className={`${className}`}>
            {isOpen && (
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setIsOpen(false)}

                    style={{
                        position: "absolute",
                        top: -height,
                        left: -width,
                        width: width * 2,
                        height: height * 2,
                        zIndex: 900,
                        backgroundColor: "transparent"
                    }}
                />
            )}

            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setIsOpen(!isOpen)}
                className="w-full h-11 bg-neutral-100 border border-neutral-200 rounded-xl px-4 flex-row items-center justify-between"
            >
                <Text className="text-xs font-button text-neutral-800">
                    {currentOption?.label || "Select Option"}
                </Text>

                <MotiView
                    animate={{ rotate: isOpen ? "180deg" : "0deg" }}
                    transition={{ type: "timing", duration: 200 }}
                >
                    <Text className="text-xs text-neutral-400">▼</Text>
                </MotiView>
            </TouchableOpacity>

            <AnimatePresence>
                {isOpen && (
                    <MotiView
                        key="dropdown-menu"
                        from={{ opacity: 0, translateY: -10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        exit={{ opacity: 0, translateY: -10 }}
                        transition={{ type: "timing", duration: 180 }}

                        style={{
                            position: "absolute",
                            top: 48,
                            left: 0,
                            right: 0,
                            backgroundColor: "white",
                            borderRadius: 12,
                            boxShadow: "0px 10px 16px rgba(0, 0, 0, 0.12)",
                            elevation: 6,
                            overflow: "hidden",
                            zIndex: 999,
                            borderWidth: 1,
                            borderColor: "#e5e5e5"
                        }}
                    >
                        {options.map((opt) => (
                            <TouchableOpacity
                                key={opt.value}
                                onPress={() => handleSelect(opt.value)}
                                className={`w-full h-10 px-4 justify-center ${selectedValue === opt.value ? "bg-neutral-50" : "bg-white"}`}
                            >
                                <Text className={`text-xs font-button ${selectedValue === opt.value ? "text-black" : "text-neutral-600"}`}>
                                    {opt.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </MotiView>
                )}
            </AnimatePresence>
        </View>
    )
}
