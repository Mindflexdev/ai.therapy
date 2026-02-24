import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import Purchases, {
    LOG_LEVEL,
    PurchasesPackage,
    CustomerInfo,
    PurchasesOfferings,
} from 'react-native-purchases';
import { supabase } from '../lib/supabase';

// RevenueCat Public API Keys (from environment variables)
const API_KEYS = {
    ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || '',
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || '',
};

type SubscriptionContextType = {
    isPro: boolean;
    offerings: PurchasesOfferings | null;
    customerInfo: CustomerInfo | null;
    isLoading: boolean;
    purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
    restorePurchases: () => Promise<void>;
    setDevOverridePro: (val: boolean) => void; // DEV only — simulates Pro for testing
};

const SubscriptionContext = createContext<SubscriptionContextType>({
    isPro: false,
    offerings: null,
    customerInfo: null,
    isLoading: true,
    purchasePackage: async () => false,
    restorePurchases: async () => {},
    setDevOverridePro: () => {},
});

const checkEntitlement = (info: CustomerInfo): boolean => {
    return info.entitlements.active['pro'] !== undefined;
};

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
    const [isPro, setIsPro] = useState(false);
    const [devOverridePro, setDevOverridePro] = useState(false); // DEV: simulate Pro
    const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // RevenueCat does not support web
        if (Platform.OS === 'web') {
            setIsLoading(false);
            return;
        }

        let listenerRemoved = false;

        const init = async () => {
            try {
                if (__DEV__) {
                    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
                }

                Purchases.configure({
                    apiKey: Platform.OS === 'ios' ? API_KEYS.ios : API_KEYS.android,
                });

                // Identify user with RevenueCat if already logged in
                // This ties the subscription to the Supabase user, not the device
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    await Purchases.logIn(session.user.id);
                }

                // Fetch initial state (after login so we get the correct user's info)
                const [info, offers] = await Promise.all([
                    Purchases.getCustomerInfo(),
                    Purchases.getOfferings(),
                ]);

                setCustomerInfo(info);
                setOfferings(offers);
                setIsPro(checkEntitlement(info));

                // Only add listener AFTER successful configure
                if (!listenerRemoved) {
                    Purchases.addCustomerInfoUpdateListener((updatedInfo) => {
                        setCustomerInfo(updatedInfo);
                        setIsPro(checkEntitlement(updatedInfo));
                    });
                }
            } catch (e) {
                console.warn('RevenueCat init error:', e);
            } finally {
                setIsLoading(false);
            }
        };

        init();

        return () => {
            listenerRemoved = true;
        };
    }, []);

    const purchasePackage = async (pkg: PurchasesPackage): Promise<boolean> => {
        try {
            const { customerInfo: updatedInfo } = await Purchases.purchasePackage(pkg);
            setCustomerInfo(updatedInfo);
            const isNowPro = checkEntitlement(updatedInfo);
            setIsPro(isNowPro);
            return isNowPro;
        } catch (e: any) {
            if (!e.userCancelled) {
                Alert.alert('Purchase Error', e.message);
            }
            return false;
        }
    };

    const restorePurchases = async () => {
        try {
            const info = await Purchases.restorePurchases();
            setCustomerInfo(info);
            const restored = checkEntitlement(info);
            setIsPro(restored);

            if (restored) {
                Alert.alert('Restored!', 'Your Pro subscription has been restored.');
            } else {
                Alert.alert('No Subscription Found', 'No active subscription was found for this account.');
            }
        } catch (e: any) {
            Alert.alert('Restore Error', e.message);
        }
    };

    return (
        <SubscriptionContext.Provider
            value={{
                isPro: devOverridePro || isPro,
                offerings,
                customerInfo,
                isLoading,
                purchasePackage,
                restorePurchases,
                setDevOverridePro,
            }}
        >
            {children}
        </SubscriptionContext.Provider>
    );
};

export const useSubscription = () => useContext(SubscriptionContext);
