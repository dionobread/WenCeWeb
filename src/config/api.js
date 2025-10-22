/**
 * API配置文件
 * 用于管理不同环境下的API配置
 */

// 开发环境配置
const development = {
  baseURL: 'http://localhost:8000/api',
  timeout: 30000,
};

// 生产环境配置
const production = {
  baseURL: 'https://api.wence.com/api',
  timeout: 30000,
};

// 测试环境配置
const test = {
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
};

// 根据环境变量选择配置
const getConfig = () => {
  const env = import.meta.env.MODE || 'development';
  
  switch (env) {
    case 'production':
      return production;
    case 'test':
      return test;
    default:
      return development;
  }
};

export const apiConfig = getConfig();

// 导出配置信息
export default {
  development,
  production,
  test,
  current: apiConfig,
};
