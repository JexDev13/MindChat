import type { Config } from "tailwindcss"

const config: Config = {
 darkMode: ["class"],
 content: [
 "./src/app/**/*.{ts,tsx}",
 "./src/components/**/*.{ts,tsx}",
 "./src/lib/**/*.{ts,tsx}",
 ],
 theme: {
 extend: {
 colors: {
 brand: {
50: "#f2f1ff",
100: "#e6e3ff",
200: "#c9c3ff",
300: "#a9a0ff",
400: "#8a7eff",
500: "#6b5cff",
600: "#584ae6",
700: "#473cc0",
800: "#372f99",
900: "#28226e",
 },
 },
 backgroundImage: {
 'glass-gradient': 'linear-gradient(135deg, rgba(107,92,255,0.12), rgba(56,189,248,0.12))',
 'brand-gradient': 'linear-gradient(135deg, #1a102f0%, #0d103545%, #0a245a100%)',
 },
 boxShadow: {
 glass: '08px32px0 rgba(31,38,135,0.37)',
 inset: 'inset01px1px rgba(255,255,255,0.06)',
 },
 backdropBlur: {
 xs: '2px',
 },
 },
 },
 plugins: [],
}
export default config
