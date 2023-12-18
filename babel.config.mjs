import * as dotenv from 'dotenv';
dotenv.config();

const config = {
  presets: ["@babel/preset-typescript"],
  plugins: [['transform-inline-environment-variables', {include: ['npm_package_version']}]],
};
export default config;
