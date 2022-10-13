export default () => ({
  env: process.env.NODE_ENV!,
  port: parseInt(process.env.PORT!, 10) || 4000,
  corsOrigin: process.env.CORS_ORIGIN!,
});
