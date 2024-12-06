 jest.setup.js
global.document.body.innerHTML = `
  <form id="loginForm">
    <input type="text" name="login-email" />
    <input type="password" name="login-password" />
  </form>
`;

// Mock addEventListener on loginForm
global.document.getElementById = jest.fn().mockImplementation((id) => {
  if (id === 'loginForm') {
    return { addEventListener: jest.fn() }; // Mock addEventListener
  }
  return null;
});
