function toggleTheme() {
    const theme = document.getElementById('theme').href.includes('dark') ? 'light' : 'dark';
    localStorage.setItem('theme', theme);
    document.getElementById('theme').href = `${theme}.css`;
  }
  
  async function logout() {
    await fetch('/logout', { method: 'POST' });
    window.location = '/';
  }
  
  async function loadData() {
    const response = await fetch('/data');
    const data = await response.json();
    document.getElementById('dataContainer').textContent = JSON.stringify(data, null, 2);
  }
  
  fetch('/profile').then(res => {
    if (!res.ok) window.location = '/';
    else {
      const theme = localStorage.getItem('theme') || 'light';
      document.getElementById('theme').href = `${theme}.css`;
      loadData();
    }
  });