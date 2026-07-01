import { TouchableOpacity, Text } from "react-native"

interface GameButtonProps {
    label: string
    onPress: () => void
    variant?: "primary" | "secondary"
    className?: string
}

export const GameButton = ({ label, onPress, variant = "primary", className = "" }: GameButtonProps) => {
    const baseStyles = "rounded-xl items-center justify-center shadow-xl text-xs tracking-wider border border-neutral-200"
    const variantStyles = variant === "primary"
        ? "bg-black text-white"
        : "bg-white text-neutral-500"

    return (
        <TouchableOpacity
            onPress={onPress}
            className={`${baseStyles} ${variantStyles} ${className}`}
        >
            <Text className={`w-full text-center text-sm font-button ${variant === "primary" ? "text-white" : "text-neutral-500"}`}>
                {label}
            </Text>
        </TouchableOpacity>
    )
}
