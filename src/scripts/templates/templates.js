// Template Navigasi
export const createAuthenticatedNavTemplate = () => `
  <a href="#/home">Overview</a>
  <a href="#/articles">Articles</a>
  <a href="#" id="logoutButton">Logout</a>
`;

export const createUnauthenticatedNavTemplate = () => `
  <a href="#/login">Login</a>
`;

// Template Halaman Home
export const createHomePageTemplate = () => `
  <div class="page-header">
    <h1 id="welcome-title">Dashboard Overview</h1>
    <p id="welcome-message">Selamat datang kembali!</p>
  </div>
`;

export const createMainLayoutTemplate = () => `
  <header class="main-header">
    <div class="header-content">
      <div class="header-left">
        <a href="#/home" class="brand-logo">
          <img src="/images/favicon.svg" alt="App Logo" />
          <span>Kuizo Web App</span>
        </a>
      </div>
      <nav class="header-nav">
        <a href="#/home" data-path="#/home">Home</a>
        <a href="#/activity" data-path="#/activity">Activity</a>
        <a href="#/badge" data-path="#/badge">Badge</a>
        <a href="#/setting" data-path="#/setting">Setting</a>
      </nav>
      <div class="header-right">
        <button id="logoutButton" class="logout-btn">
          <i class="bi bi-box-arrow-right"></i>
          <span>Logout</span>
        </button>
      </div>
    </div>
  </header>
  <main id="main-content" class="main-content" tabindex="-1"></main>
`;

// Template untuk Halaman Login
export const createLoginPageTemplate = () => `
  <div class="login-page-container">
    <div class="login-form-wrapper">
      <div class="login-header">
        <h2>Selamat Datang</h2>
        <p>
          Silakan masuk untuk memulai sesi asesmen.
        </p>

      </div>
      <form id="loginForm" class="login-form">
        <div class="form-group">
          <label for="email">Alamat Email</label>
          <div class="input-wrapper">
            <input type="email" id="email" name="email" placeholder="contoh@email.com" required/>
          </div>
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <div class="input-wrapper">
            <input type="password" id="password" name="password" placeholder="Masukkan password Anda" required/>
          </div>
        </div>
        <div id="submit-container">
          <button type="submit" class="submit-btn">
            <span class="btn-text">Masuk</span>
          </button>
        </div>
      </form>
      
    </div>
  </div>
`;

export const createNotFoundPageTemplate = () => `
  <div class="not-found-container">
    <h1>404</h1>
    <p>Oops! Halaman yang Anda cari tidak ditemukan.</p>
    <a href="#/home" class="btn-back">Kembali ke Beranda</a>
  </div>
`;
