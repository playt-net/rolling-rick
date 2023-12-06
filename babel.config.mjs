import * as dotenv from 'dotenv';
dotenv.config();

const config = {
  presets: ["@babel/preset-typescript"],
  plugins: ['transform-inline-environment-variables'],
};
export default config;
