import tailwindcssPostcss from "@tailwindcss/postcss";

const resolveOptimizeSetting = () => {
  if (process.env.TAILWIND_FORCE_OPTIMIZE === "1") {
    return true;
  }
  if (process.env.TAILWIND_DISABLE_OPTIMIZE === "1") {
    return false;
  }
  return process.env.NODE_ENV === "production";
};

const resolveLightningCssSetting = () => {
  if (process.env.TAILWIND_DISABLE_LIGHTNINGCSS === "1") {
    return false;
  }
  // Default to true for optimization
  return true;
};

export default {
  plugins: [
    tailwindcssPostcss({
      optimize: resolveOptimizeSetting(),
      lightningcss: resolveLightningCssSetting(),
    }),
  ],
};