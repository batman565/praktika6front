document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.getElementById('theme').href = `${savedTheme}.css`;
  
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        username: e.target.username.value,
        password: e.target.password.value
      };
      
      const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) window.location.reload();
      else document.getElementById('error').textContent = await response.text();
    });
  
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        username: e.target.username.value,
        password: e.target.password.value
      };
      
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) window.location = '/profile';
      else document.getElementById('error').textContent = await response.text();
    });
  });