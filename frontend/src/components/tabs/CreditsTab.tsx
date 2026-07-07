import { View, Text } from "react-native"

import { LineSeparator, LinkText } from "../elements"
import { TabWrapper } from "../layout"

interface CreditsTabProps {
    isFirstLoad?: boolean
    onMountComplete?: () => void
}

export const CreditsTab = ({ isFirstLoad = false, onMountComplete }: CreditsTabProps) => {
    return (
        <TabWrapper onMountComplete={onMountComplete} isFirstLoad={isFirstLoad}>
            <View className="w-full items-center self-center">
                <Text className="text-xs font-subheader text-neutral-400 uppercase tracking-widest mb-2 self-center">- Original Idea -</Text>
                <Text className="text-base font-desc-medium text-neutral-600 leading-relaxed text-center -mb-0.5 w-full">
                    This game was heavily inspired by the classic board game{" "}
                    <LinkText url="https://steffen-spiele.com/products/linja">
                        Linja
                    </LinkText>
                    , made by{" "}
                    <LinkText url="https://steffen-spiele.com">
                        Steffen Mühlhäuser
                    </LinkText>
                    .
                </Text>
            </View>

            <LineSeparator/>

            <View className="w-full items-center self-center">
                <Text className="text-xs font-subheader text-neutral-400 uppercase tracking-widest mb-2 self-center">- Game Assets -</Text>
                <Text className="text-base font-desc-medium text-neutral-600 leading-relaxed text-center -mb-0.5 w-full">Visual assets, rule modifications, and code were created by{" "}
                    <LinkText url="https://domax.lt">
                        Domas Leščinskas
                    </LinkText>
                    .
                </Text>
            </View>

            <LineSeparator/>

            <View className="w-full items-center self-center">
                <Text className="text-xs font-subheader text-neutral-400 uppercase tracking-widest mb-2 self-center">- Development Tools -</Text>
                <Text className="text-base font-desc-medium text-neutral-600 leading-relaxed text-center -mb-0.5 w-full">Tools used for development together with this game's code can be found in the official{" "}
                    <LinkText url="https://github.com/domasles/onlinja">
                        GitHub repository
                    </LinkText>
                    .
                </Text>
            </View>
        </TabWrapper>
    )
}
