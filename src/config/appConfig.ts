const getRequiredConfigValue = (name: string): string => {
  const value = import.meta.env[name];

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
};

const getAppConfig = () => ({
  API_URL: getRequiredConfigValue('VITE_API_URL'),
});

export default getAppConfig;
