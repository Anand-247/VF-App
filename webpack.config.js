const createExpoWebpackConfigAsync = require("@expo/webpack-config")

module.exports = async (env, argv) => {
  const config = await createExpoWebpackConfigAsync(env, argv)
  return config
}
