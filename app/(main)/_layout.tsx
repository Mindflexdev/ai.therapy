import { Drawer } from 'expo-router/drawer';
import { CustomDrawer } from '../../src/components/CustomDrawer';
import { Theme } from '../../src/constants/Theme';

export default function MainLayout() {
    return (
        <Drawer
            drawerContent={(props) => <CustomDrawer {...props} />}
            screenOptions={{
                headerShown: false,
                drawerStyle: {
                    backgroundColor: Theme.colors.background,
                    width: '80%',
                },
                drawerType: 'slide',
                overlayColor: 'rgba(0,0,0,0.7)',
            }}
        >
            <Drawer.Screen name="chat" />
        </Drawer>
    );
}
