export default {
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
      '/login': 'http://localhost:3001',
      '/register': 'http://localhost:3001',
      '/users': 'http://localhost:3001',
      '/messages': 'http://localhost:3001'
    }
  }
}