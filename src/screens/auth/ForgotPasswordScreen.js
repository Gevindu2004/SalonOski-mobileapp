import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import ScreenContainer from "../../components/ScreenContainer";
import InputField from "../../components/InputField";
import PrimaryButton from "../../components/PrimaryButton";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { FONTS } from "../../constants/theme";

export default function ForgotPasswordScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email.trim()) {
      Alert.alert("Validation", "Email is required");
      return;
    }
    try {
      setLoading(true);
      const result = await forgotPassword(email.trim());
      Alert.alert(
        "Reset Token",
        result?.resetToken
          ? `Use this reset token: ${result.resetToken}`
          : "If the account exists, reset instructions were generated.",
        [{ text: "Continue", onPress: () => navigation.navigate("ResetPassword") }]
      );
    } catch (error) {
      Alert.alert("Failed", error?.response?.data?.message || "Please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>Enter your email to generate a reset token.</Text>
      <InputField
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="Enter email"
        keyboardType="email-address"
      />
      <PrimaryButton title="Generate Reset Token" onPress={onSubmit} loading={loading} />
      <View style={{ height: 10 }} />
      <PrimaryButton title="Already have token" variant="outline" onPress={() => navigation.navigate("ResetPassword")} />
    </ScreenContainer>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    title: {
      color: colors.primaryDark,
      fontSize: 30,
      fontFamily: FONTS.heading,
      marginBottom: 6
    },
    subtitle: {
      color: colors.muted,
      marginBottom: 12,
      fontFamily: FONTS.body
    }
  });
