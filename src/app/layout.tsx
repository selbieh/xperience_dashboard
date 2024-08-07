import { Inter } from "next/font/google";
import "./globals.css";
import { ConfigProvider } from "antd";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConfigProvider
      theme={{
        hashed: false,
        components: {
          Button: {
            colorPrimaryBorderHover: "#F1DF78",
            colorPrimaryHover: "#F1DF78",
            colorPrimaryBgHover: "#F1DF78",
            colorPrimary: "#292D4A",
            colorPrimaryBorder: "#ABADB7",
            colorPrimaryActive: "white",
            colorPrimaryTextHover: "white",
            colorPrimaryText: "white",
          },
          Form: {
            labelRequiredMarkColor: "#F1DF78",
            colorError: "#F1DF78",
          },
          Menu: {
            itemSelectedBg: "#363B5E",
          },
        },
      }}
    >
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ConfigProvider>
  );
}
