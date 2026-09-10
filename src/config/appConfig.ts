const getRequiredConfigValue = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
};

const getAppConfig = () => ({
  API_URL: getRequiredConfigValue('REACT_APP_API_URL'),
});

export default getAppConfig;
