const isEnvironment = (env: string) => process.env.NODE_ENV === env;
export const isDevelopmentEnvironment = () => isEnvironment("development");
export const isTestEnvironment = () => isEnvironment("test");
