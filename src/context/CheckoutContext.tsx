import React, { createContext, useContext, useState } from "react";

export interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

interface CheckoutContextType {
  shippingInfo: ShippingInfo;
  setShippingInfo: (info: ShippingInfo) => void;
  isPaymentComplete: boolean;
  setIsPaymentComplete: (complete: boolean) => void;
}

const defaultShippingInfo: ShippingInfo = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
};

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export const CheckoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>(defaultShippingInfo);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);

  return (
    <CheckoutContext.Provider
      value={{
        shippingInfo,
        setShippingInfo,
        isPaymentComplete,
        setIsPaymentComplete,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return context;
};
