import React, { useEffect, useState } from "react";
import { Alert, Image, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import ScreenContainer from "../../components/ScreenContainer";
import PrimaryButton from "../../components/PrimaryButton";
import InputField from "../../components/InputField";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { RADIUS, SPACING, TYPOGRAPHY } from "../../constants/theme";

export default function ProfileScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { user, updateProfile, logout, changePassword, deactivateMyAccount } = useAuth();
  const [form, setForm] = useState({ title: "Mr", name: "", email: "", phone: "" });
  const [selectedImage, setSelectedImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    setForm({
      title: user?.title || "Mr",
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || ""
    });
    setSelectedImage(null);
    setIsEditing(false);
  }, [user]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow media access to upload profile picture");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true
    });

    if (!result.canceled && result.assets?.[0]) {
      setSelectedImage(result.assets[0]);
    }
  };

  const onSave = async () => {
    try {
      setSaving(true);
      await updateProfile({
        name: form.name.trim(),
        title: form.title,
        email: form.email.trim(),
        phone: form.phone.trim(),
        profileImageAsset: selectedImage
      });
      setSelectedImage(null);
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      Alert.alert("Update failed", error?.response?.data?.message || "Please try again");
    } finally {
      setSaving(false);
    }
  };

  const onCancelEdit = () => {
    setForm({
      title: user?.title || "Mr",
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || ""
    });
    setSelectedImage(null);
    setIsEditing(false);
  };

  const onChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      Alert.alert("Validation", "All password fields are required");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      Alert.alert("Validation", "New password must be at least 6 characters");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert("Validation", "Passwords do not match");
      return;
    }
    try {
      setChangingPassword(true);
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordSection(false);
      Alert.alert("Success", "Password changed successfully");
    } catch (error) {
      Alert.alert("Failed", error?.response?.data?.message || "Could not change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const onDeactivateAccount = () => {
    Alert.alert(
      "Deactivate account",
      "Your account will be deactivated and you'll be logged out.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Deactivate",
          style: "destructive",
          onPress: async () => {
            try {
              await deactivateMyAccount();
            } catch (error) {
              Alert.alert("Failed", error?.response?.data?.message || "Could not deactivate account");
            }
          }
        }
      ]
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.card}>
        <View style={styles.imageWrap}>
          {selectedImage?.uri || user?.profileImage ? (
            <Image source={{ uri: selectedImage?.uri || user?.profileImage }} style={styles.image} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
          {isEditing ? (
            <PrimaryButton
              title="Upload Photo"
              variant="outline"
              onPress={pickImage}
              style={styles.uploadButton}
            />
          ) : null}
        </View>
        <Text style={styles.label}>Title</Text>
        <View style={styles.row}>
          {["Mr", "Mrs", "Ms", "Dr"].map((title) => (
            <PrimaryButton
              key={title}
              title={title}
              variant={form.title === title ? "solid" : "outline"}
              style={styles.rowBtn}
              disabled={!isEditing}
              onPress={() => setForm((prev) => ({ ...prev, title }))}
            />
          ))}
        </View>
        <InputField
          label="Name"
          value={form.name}
          onChangeText={(value) => setForm((prev) => ({ ...prev, name: value }))}
          placeholder="Your name"
          editable={isEditing}
        />
        <InputField
          label="Email"
          value={form.email}
          onChangeText={(value) => setForm((prev) => ({ ...prev, email: value }))}
          placeholder="Enter email"
          editable={isEditing}
        />
        <InputField
          label="Phone"
          value={form.phone}
          onChangeText={(value) => {
            const numericValue = value.replace(/[^0-9]/g, "");
            if (numericValue.length <= 10) {
              setForm((prev) => ({ ...prev, phone: numericValue }));
            }
          }}
          placeholder="07xxxxxxxx"
          editable={isEditing}
          keyboardType="numeric"
          maxLength={10}
        />
        <Text style={styles.item}>Role: {user?.role}</Text>
      </View>
      <PrimaryButton
        title={showPasswordSection ? "Hide Change Password" : "Change Password"}
        variant="outline"
        onPress={() => {
          if (showPasswordSection) {
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setShowPasswordSection(false);
          } else {
            setShowPasswordSection(true);
          }
        }}
      />
      {showPasswordSection ? (
        <>
          <View style={{ height: 10 }} />
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Change Password</Text>
            <InputField
              label="Current Password"
              value={passwordForm.currentPassword}
              onChangeText={(value) => setPasswordForm((prev) => ({ ...prev, currentPassword: value }))}
              secureTextEntry
              placeholder="Enter current password"
            />
            <InputField
              label="New Password"
              value={passwordForm.newPassword}
              onChangeText={(value) => setPasswordForm((prev) => ({ ...prev, newPassword: value }))}
              secureTextEntry
              placeholder="Minimum 6 characters"
            />
            <InputField
              label="Confirm New Password"
              value={passwordForm.confirmPassword}
              onChangeText={(value) => setPasswordForm((prev) => ({ ...prev, confirmPassword: value }))}
              secureTextEntry
              placeholder="Re-enter new password"
            />
            <PrimaryButton
              title="Update Password"
              variant="outline"
              onPress={onChangePassword}
              loading={changingPassword}
            />
          </View>
        </>
      ) : null}
      <View style={{ height: 10 }} />
      {isEditing ? (
        <>
          <PrimaryButton title="Save Profile" onPress={onSave} loading={saving} />
          <View style={{ height: 10 }} />
          <PrimaryButton title="Cancel" variant="outline" onPress={onCancelEdit} />
          <View style={{ height: 10 }} />
        </>
      ) : (
        <>
          <PrimaryButton title="Edit Profile" onPress={() => setIsEditing(true)} />
          <View style={{ height: 10 }} />
        </>
      )}
      <PrimaryButton title="Logout" onPress={logout} />
      <View style={{ height: 10 }} />
      <PrimaryButton title="Deactivate Account" variant="outline" onPress={onDeactivateAccount} />
    </ScreenContainer>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    title: {
      fontSize: TYPOGRAPHY.xxl,
      fontWeight: "800",
      color: colors.primaryDark,
      marginBottom: SPACING.md
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: RADIUS.sm,
      padding: SPACING.md,
      marginBottom: SPACING.md
    },
    imageWrap: {
      alignItems: "center",
      marginBottom: 14
    },
    uploadButton: {
      marginTop: 10,
      paddingHorizontal: 24,
      minWidth: 170
    },
    image: {
      width: 92,
      height: 92,
      borderRadius: 46,
      marginBottom: 8
    },
    placeholder: {
      width: 92,
      height: 92,
      borderRadius: 46,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 8
    },
    placeholderText: {
      color: colors.muted
    },
    item: {
      color: colors.text,
      marginBottom: 6
    },
    sectionTitle: {
      marginTop: SPACING.xs + 2,
      marginBottom: SPACING.sm,
      color: colors.primaryDark,
      fontWeight: "700",
      fontSize: TYPOGRAPHY.lg
    },
    label: {
      marginBottom: 8,
      color: colors.text,
      fontWeight: "600"
    },
    row: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 10
    },
    rowBtn: {
      minWidth: "22%",
      flex: 1
    }
  });
