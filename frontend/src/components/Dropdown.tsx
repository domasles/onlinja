import { View, Text, TouchableOpacity, Dimensions } from "react-native"
import { MotiView, AnimatePresence } from "moti"
import { useState } from "react"

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window")

interface DropdownOption<T extends string> {
    label: string
    value: T
}

interface DropdownProps<T extends string> {
    options: DropdownOption<T>[]
    selectedValue: T
    onSelect: (value: T) => void
    onToggle?: (isOpen: boolean) => void
}

export const Dropdown = <T extends string>({ options, selectedValue, onSelect, onToggle }: DropdownProps<T>) => {
    const [isOpen, setIsOpen] = useState(false)
    const currentOption = options.find((opt) => opt.value === selectedValue)

    const closeDropdown = () => {
        setIsOpen(false)

        if (onToggle) {
            setTimeout(() => onToggle(false), 200)
        }
    }

    const handleToggle = () => {
        const nextState = !isOpen
        setIsOpen(nextState)

        if (onToggle) {
            if (nextState) {
                onToggle(true)
            }

            else {
                setTimeout(() => onToggle(false), 200)
            }
        }
    }

    const handleSelect = (value: T) => {
        onSelect(value)
        closeDropdown()
    }

    return (
        <View className="w-[280px] self-center relative z-50">
            {isOpen && (
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={closeDropdown}
                    style={{
                        position: "absolute",
                        top: -SCREEN_HEIGHT,
                        left: -SCREEN_WIDTH,
                        width: SCREEN_WIDTH * 1.8,
                        height: SCREEN_HEIGHT * 1.8,
                        zIndex: 900,
                        backgroundColor: "transparent"
                    }}
                />
            )}

            <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleToggle}
                className="w-full h-11 bg-neutral-100 border border-neutral-200 rounded-xl px-4 flex-row items-center justify-between z-50"
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
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 10 },
                            shadowOpacity: 0.12,
                            shadowRadius: 16,
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
                                <Text className={`text-xs font-button ${selectedValue === opt.value ? "text-black font-bold" : "text-neutral-600"}`}>
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
