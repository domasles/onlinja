import { Text } from "react-native"
import { Link } from "expo-router"
import { ReactNode } from "react"

interface LinkTextProps {
    url: string
    children: ReactNode
} 

export const LinkText = ({ url, children }: LinkTextProps) => {
    return (
        <Link 
            href={url as any} 
            asChild
            target="_blank" 
        >
            <Text className="text-black underline">
                {children}
            </Text>
        </Link>
    )
}
