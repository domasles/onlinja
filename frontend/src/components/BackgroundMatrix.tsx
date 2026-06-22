import { View } from "react-native"

export const BackgroundMatrix = () => {
    return (
        <View 
            className="absolute inset-0 opacity-[0.04]" 
            style={{ 
                backgroundImage: "radial-gradient(#000000 1.75px, transparent 1.75px)", 
                backgroundSize: "20px 20px" 
            } as any} 
        />
    )
}
