module.exports = {
 apps: [
  {
   name: 'client',
   script: 'npm',
   args: 'run preview',
   env: {
    VITE_AVATAR_KEY: '5jfC7S3hOiG8Us',
    VITE_SERVER_URL: 'https://chat.boliang.lol',
   },
  },
 ],
}
