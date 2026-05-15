import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PASSWORD_KEY = '@bending_assistant/admin_password';
const DEFAULT_PASSWORD = 'LUSA26';

interface AdminPasswordContextValue {
  password: string;
  changePassword: (newPassword: string) => Promise<void>;
}

const AdminPasswordContext = createContext<AdminPasswordContextValue>({
  password: DEFAULT_PASSWORD,
  changePassword: async () => {},
});

export function AdminPasswordProvider({ children }: { children: React.ReactNode }) {
  const [password, setPassword] = useState(DEFAULT_PASSWORD);

  useEffect(() => {
    AsyncStorage.getItem(PASSWORD_KEY).then(stored => {
      if (stored) setPassword(stored);
    }).catch(() => {});
  }, []);

  const changePassword = useCallback(async (newPassword: string) => {
    await AsyncStorage.setItem(PASSWORD_KEY, newPassword);
    setPassword(newPassword);
  }, []);

  return (
    <AdminPasswordContext.Provider value={{ password, changePassword }}>
      {children}
    </AdminPasswordContext.Provider>
  );
}

export function useAdminPassword() {
  return useContext(AdminPasswordContext);
}
