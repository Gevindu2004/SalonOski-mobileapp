import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from "react-native";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";
import ScreenContainer from "../../components/ScreenContainer";
import PrimaryButton from "../../components/PrimaryButton";
import DateTimeBar from "../../components/DateTimeBar";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { FONTS, LAYOUT, RADIUS, SPACING, TYPOGRAPHY } from "../../constants/theme";

export default function CustomerDashboardScreen({ navigation }) {
  const { colors, mode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { width } = useWindowDimensions();
  const styles = createStyles(colors);
  
  const [greeting, setGreeting] = useState("Good morning");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const drawerTranslateX = useRef(new Animated.Value(-500)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const drawerWidth = Math.min(LAYOUT.sidebarWidth, width * 0.88);
  const appVersion = Constants.expoConfig?.version || "1.0.0";

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 12 && hour < 17) setGreeting("Good afternoon");
    else if (hour >= 17) setGreeting("Good evening");
    else setGreeting("Good morning");
  }, []);

  const openDrawer = useCallback(() => {
    drawerTranslateX.setValue(-drawerWidth);
    backdropOpacity.setValue(0);
    setDrawerVisible(true);
    Animated.parallel([
      Animated.timing(drawerTranslateX, { toValue: 0, duration: 220, useNativeDriver: true }),
      Animated.timing(backdropOpacity, { toValue: 1, duration: 220, useNativeDriver: true })
    ]).start();
  }, [backdropOpacity, drawerTranslateX, drawerWidth]);

  const closeDrawer = useCallback(() => {
    Animated.parallel([
      Animated.timing(drawerTranslateX, { toValue: -drawerWidth, duration: 180, useNativeDriver: true }),
      Animated.timing(backdropOpacity, { toValue: 0, duration: 180, useNativeDriver: true })
    ]).start(() => setDrawerVisible(false));
  }, [backdropOpacity, drawerTranslateX, drawerWidth]);

  const edgeSwipeResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (evt, gestureState) =>
          !drawerVisible &&
          evt?.nativeEvent?.pageX <= 24 &&
          gestureState.dx > 12 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx > 36) openDrawer();
        }
      }),
    [drawerVisible, openDrawer]
  );

  const drawerSwipeResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          drawerVisible &&
          gestureState.dx < -8 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx < -40) closeDrawer();
        }
      }),
    [closeDrawer, drawerVisible]
  );

  const navigateFromDrawer = useCallback(
    (routeName) => {
      closeDrawer();
      setTimeout(() => navigation.navigate(routeName), 90);
    },
    [closeDrawer, navigation]
  );

  const menuItems = useMemo(
    () => [
      {
        key: "booking-history",
        icon: "time-outline",
        label: "My appointments",
        onPress: () => navigateFromDrawer("Appointments")
      },
      {
        key: "book-appointment",
        icon: "calendar-outline",
        label: "Book Appointment",
        onPress: () => navigateFromDrawer("BookAppointment")
      }
    ],
    [navigateFromDrawer]
  );

  const handleLogout = useCallback(() => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          closeDrawer();
          await logout();
        }
      }
    ]);
  }, [closeDrawer, logout]);

  return (
    <>
      <View style={{ flex: 1 }}>
        <ScreenContainer scroll={true} showThemeToggle={false}>
          <View style={styles.headerWrapper}>
            <View style={styles.topOptionsRow}>
              <View />
              <Pressable style={styles.topOptionsButton} onPress={openDrawer}>
                <Ionicons name="ellipsis-horizontal" size={20} color={colors.text} />
              </Pressable>
            </View>
            <DateTimeBar />
            <View style={styles.greetingCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.greetingTitle}>{greeting}</Text>
                <Text style={styles.greetingName}>{user?.name || "Customer"}</Text>
              </View>
              <Pressable style={styles.profileIconButton} onPress={openDrawer}>
                {user?.profileImage ? (
                  <Image source={{ uri: user.profileImage }} style={{ width: 40, height: 40, borderRadius: 20 }} />
                ) : (
                  <Ionicons name="person-circle-outline" size={36} color={colors.primaryDark} />
                )}
              </Pressable>
            </View>

            <View style={{ marginTop: 40 }}>
                <PrimaryButton 
                    title="View My Appointments" 
                    onPress={() => navigation.navigate("Appointments")}
                    style={{ marginBottom: 16 }}
                />
                <PrimaryButton 
                    title="Book New Appointment" 
                    variant="outline"
                    onPress={() => navigation.navigate("BookAppointment")}
                />
            </View>
          </View>
        </ScreenContainer>
        {!drawerVisible ? <View style={styles.edgeSwipeZone} {...edgeSwipeResponder.panHandlers} /> : null}
      </View>

      <Modal visible={drawerVisible} transparent animationType="none" onRequestClose={closeDrawer}>
        <View style={styles.drawerLayer}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer}>
            <Animated.View style={[styles.drawerBackdrop, { opacity: backdropOpacity }]} />
          </Pressable>

          <Animated.View
            {...drawerSwipeResponder.panHandlers}
            style={[
              styles.drawerPanel,
              {
                width: drawerWidth,
                transform: [{ translateX: drawerTranslateX }],
                paddingTop: SPACING.xl + SPACING.sm
              }
            ]}
          >
            <View style={styles.drawerHeader}>
              {user?.profileImage ? (
                <Image source={{ uri: user.profileImage }} style={styles.drawerAvatar} />
              ) : (
                <Ionicons name="person-circle" size={54} color={colors.primary} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.drawerName}>{user?.name || "Customer"}</Text>
                <Text style={styles.drawerPhone}>{user?.phone || "No phone added"}</Text>
              </View>
              <Pressable onPress={() => navigateFromDrawer("Profile")}>
                <Text style={styles.editText}>Edit</Text>
              </Pressable>
            </View>

            <View style={styles.divider} />

            <View style={styles.menuWrap}>
              {menuItems.map((item) => (
                <Pressable key={item.key} style={styles.drawerItem} onPress={item.onPress}>
                  <Ionicons name={item.icon} size={24} color={colors.text} />
                  <Text style={styles.drawerItemLabel}>{item.label}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable style={styles.themeButton} onPress={toggleTheme}>
              <Ionicons
                name={mode === "dark" ? "sunny-outline" : "moon-outline"}
                size={20}
                color={colors.primary}
              />
              <Text style={styles.themeButtonText}>{mode === "dark" ? "Switch to Light" : "Switch to Dark"}</Text>
            </Pressable>

            <Pressable style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color={colors.buttonText} />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </Pressable>

            <Text style={styles.versionText}>v{appVersion}</Text>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    headerWrapper: {
      marginBottom: SPACING.sm,
      paddingTop: SPACING.sm
    },
    topOptionsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: SPACING.sm
    },
    topOptionsButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center"
    },
    greetingCard: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: RADIUS.lg,
      paddingVertical: SPACING.sm + 1,
      paddingHorizontal: SPACING.sm + 2,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between"
    },
    profileIconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.accent
    },
    greetingTitle: {
      fontSize: TYPOGRAPHY.xl,
      fontFamily: FONTS.heading,
      color: colors.primaryDark,
      lineHeight: TYPOGRAPHY.xxl + 2
    },
    greetingName: {
      fontSize: TYPOGRAPHY.xxl,
      fontFamily: FONTS.heading,
      color: colors.text,
      marginTop: SPACING.xs
    },
    drawerLayer: {
      flex: 1,
      justifyContent: "flex-start"
    },
    drawerBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.36)"
    },
    drawerPanel: {
      height: "100%",
      backgroundColor: colors.card,
      borderRightWidth: 1,
      borderRightColor: colors.border,
      paddingTop: SPACING.md,
      paddingHorizontal: SPACING.md
    },
    drawerHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      backgroundColor: colors.accent,
      borderRadius: RADIUS.md,
      padding: SPACING.sm + 1
    },
    drawerAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card
    },
    drawerName: {
      color: colors.text,
      fontSize: TYPOGRAPHY.xl,
      lineHeight: TYPOGRAPHY.xxl + 2,
      fontFamily: FONTS.heading
    },
    drawerPhone: {
      marginTop: 2,
      color: colors.text,
      fontFamily: FONTS.bodyMedium,
      fontSize: TYPOGRAPHY.sm
    },
    editText: {
      color: colors.primaryDark,
      fontFamily: FONTS.bodySemiBold,
      fontSize: TYPOGRAPHY.md
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginTop: SPACING.sm,
      marginBottom: SPACING.xs
    },
    menuWrap: {
      paddingTop: 2
    },
    drawerItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.md,
      paddingVertical: SPACING.md
    },
    drawerItemLabel: {
      color: colors.text,
      fontSize: TYPOGRAPHY.md,
      fontFamily: FONTS.bodyMedium
    },
    versionText: {
      marginTop: SPACING.sm,
      marginBottom: SPACING.sm + 2,
      textAlign: "right",
      color: colors.muted,
      fontFamily: FONTS.body,
      fontSize: TYPOGRAPHY.sm
    },
    logoutButton: {
      marginTop: SPACING.sm,
      backgroundColor: colors.danger,
      borderRadius: RADIUS.md,
      minHeight: 40,
      paddingHorizontal: SPACING.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8
    },
    logoutButtonText: {
      color: colors.buttonText,
      fontFamily: FONTS.bodySemiBold,
      fontSize: TYPOGRAPHY.md
    },
    themeButton: {
      marginTop: "auto",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      borderRadius: RADIUS.md,
      minHeight: 40,
      paddingHorizontal: SPACING.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8
    },
    themeButtonText: {
      color: colors.text,
      fontFamily: FONTS.bodySemiBold,
      fontSize: TYPOGRAPHY.sm
    },
    edgeSwipeZone: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 22,
      zIndex: 10
    }
  });
