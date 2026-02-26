const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const userNameEl = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');

if (registerForm) {
  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const payload = {
      username: document.getElementById('username').value.trim(),
      name: document.getElementById('name').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      email: document.getElementById('email').value.trim(),
      password: document.getElementById('password').value,
      confirmPassword: document.getElementById('confirmPassword').value,
    };

    const message = document.getElementById('registerMessage');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.status === 201) {
        message.className = 'message success';
        message.textContent = 'Registration successful. Redirecting to login...';
        setTimeout(() => {
          window.location.href = '/login.html';
        }, 1200);
      } else {
        message.className = 'message error';
        message.textContent = result.message || 'Registration failed.';
      }
    } catch (_error) {
      message.className = 'message error';
      message.textContent = 'Unable to connect to server.';
    }
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const payload = {
      email: document.getElementById('loginEmail').value.trim(),
      password: document.getElementById('loginPassword').value,
    };

    const message = document.getElementById('loginMessage');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.status === 200) {
        localStorage.setItem('loggedInUser', JSON.stringify(result.user));
        window.location.href = '/home.html';
      } else {
        message.className = 'message error';
        message.textContent = result.message || 'Login failed.';
      }
    } catch (_error) {
      message.className = 'message error';
      message.textContent = 'Unable to connect to server.';
    }
  });
}

if (userNameEl) {
  const currentUser = JSON.parse(localStorage.getItem('loggedInUser') || 'null');

  if (!currentUser) {
    window.location.href = '/login.html';
  } else {
    userNameEl.textContent = currentUser.name;
  }
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('loggedInUser');
  });
}
