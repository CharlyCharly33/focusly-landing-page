document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.main-nav');
  const navLinks = document.querySelectorAll('.main-nav a');
  const year = document.querySelector('#current-year');
  const registration = document.querySelector('#registro');
  const registerView = document.querySelector('#register-view');
  const loginView = document.querySelector('#login-view');
  const registerForm = document.querySelector('#signup-form');
  const loginForm = document.querySelector('#login-form');
  const authState = document.querySelector('#auth-state');
  const authTitle = document.querySelector('#auth-title');
  const authMessage = document.querySelector('#auth-message');
  const authContinue = document.querySelector('#auth-continue');
  const authLogout = document.querySelector('#auth-logout');
  const showLogin = document.querySelector('#show-login');
  const showRegister = document.querySelector('#show-register');
  const registerFields = {
    fullName: document.querySelector('#full-name'),
    email: document.querySelector('#email'),
    password: document.querySelector('#password'),
    goal: document.querySelector('#goal'),
    terms: document.querySelector('#terms')
  };
  const loginFields = {
    email: document.querySelector('#login-email'),
    password: document.querySelector('#login-password')
  };

  year.textContent = new Date().getFullYear();

  const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 10);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const closeMenu = () => {
    navigation.classList.remove('open');
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menú de navegación');
  };

  menuToggle.addEventListener('click', () => {
    const isOpen = navigation.classList.toggle('open');
    menuToggle.classList.toggle('active', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
  });
  navLinks.forEach((link) => link.addEventListener('click', closeMenu));

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: target === registration ? 'center' : 'start' });
      if (target === registration) {
        window.setTimeout(() => activeFirstField().focus({ preventScroll: true }), 500);
      }
    });
  });

  const activeFirstField = () => (loginView.hidden ? registerFields.fullName : loginFields.email);

  const fieldError = (field, message) => {
    const error = document.querySelector(`#${field.id}-error`);
    const group = field.closest('.form-field');
    error.textContent = message;
    field.setAttribute('aria-invalid', String(Boolean(message)));
    if (group) group.classList.toggle('invalid', Boolean(message));
  };

  const generalError = (form, message = '') => {
    form.querySelector('.form-error').textContent = message;
  };

  const clearFormErrors = (form) => {
    generalError(form);
    form.querySelectorAll('[aria-invalid]').forEach((field) => fieldError(field, ''));
  };

  const validEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateRegisterField = (key) => {
    const field = registerFields[key];
    const value = typeof field.value === 'string' ? field.value.trim() : '';
    let message = '';
    if (key === 'fullName' && !value) message = 'Escribe tu nombre completo.';
    if (key === 'email') {
      if (!value) message = 'Escribe tu correo electrónico.';
      else if (!validEmail(value)) message = 'Introduce un correo válido.';
    }
    if (key === 'password') {
      if (!value) message = 'Crea una contraseña para tu cuenta.';
      else if (value.length < 8) message = 'La contraseña debe tener al menos 8 caracteres.';
    }
    if (key === 'goal' && !value) message = 'Selecciona una opción.';
    if (key === 'terms' && !field.checked) message = 'Debes aceptar los términos para continuar.';
    fieldError(field, message);
    return !message;
  };

  const validateLoginField = (key) => {
    const field = loginFields[key];
    const value = field.value.trim();
    let message = '';
    if (key === 'email' && (!value || !validEmail(value))) message = 'Introduce un correo válido.';
    if (key === 'password' && !value) message = 'Escribe tu contraseña.';
    fieldError(field, message);
    return !message;
  };

  Object.entries(registerFields).forEach(([key, field]) => {
    field.addEventListener(field.type === 'checkbox' || field.tagName === 'SELECT' ? 'change' : 'input', () => {
      generalError(registerForm);
      validateRegisterField(key);
    });
  });
  Object.entries(loginFields).forEach(([key, field]) => {
    field.addEventListener('input', () => {
      generalError(loginForm);
      validateLoginField(key);
    });
  });

  document.querySelectorAll('[data-password-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const input = document.querySelector(`#${button.dataset.passwordToggle}`);
      const isVisible = input.type === 'text';
      input.type = isVisible ? 'password' : 'text';
      button.setAttribute('aria-pressed', String(!isVisible));
      button.setAttribute('aria-label', isVisible ? 'Mostrar contraseña' : 'Ocultar contraseña');
      button.querySelector('span').textContent = isVisible ? '◉' : '◌';
      input.focus();
    });
  });

  const sendRequest = async (url, payload) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    return { response, data };
  };

  const showView = (view) => {
    authState.hidden = true;
    registerView.hidden = view !== 'register';
    loginView.hidden = view !== 'login';
    window.setTimeout(() => activeFirstField().focus({ preventScroll: true }), 0);
  };

  const firstName = (name) => name.trim().split(/\s+/)[0] || 'nuevo usuario';

  const showAuthenticated = (user, isNewAccount = false) => {
    registerView.hidden = true;
    loginView.hidden = true;
    authTitle.textContent = isNewAccount ? `¡Gracias por crear tu cuenta, ${firstName(user.name)}!` : `¡Bienvenido de nuevo, ${firstName(user.name)}!`;
    authMessage.textContent = isNewAccount
      ? 'Tu cuenta está lista. Ahora conoce todo lo que Focusly puede ayudarte a lograr.'
      : 'Qué bueno tenerte de vuelta. Sigue descubriendo cómo Focusly puede ayudarte a trabajar con más claridad.';
    authContinue.textContent = 'Explorar Focusly';
    authState.hidden = false;
    authContinue.focus();
  };

  const applyServerErrors = (form, fields, errors = {}) => {
    Object.entries(errors).forEach(([key, message]) => {
      if (fields[key]) fieldError(fields[key], message);
    });
    const firstInvalid = form.querySelector('[aria-invalid="true"]');
    if (firstInvalid) firstInvalid.focus();
  };

  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFormErrors(registerForm);
    const valid = Object.keys(registerFields).map(validateRegisterField).every(Boolean);
    if (!valid) {
      registerForm.querySelector('[aria-invalid="true"]').focus();
      return;
    }

    const submit = registerForm.querySelector('[type="submit"]');
    submit.disabled = true;
    submit.textContent = 'Creando cuenta...';
    try {
      const { data } = await sendRequest('api/register.php', {
        fullName: registerFields.fullName.value.trim(),
        email: registerFields.email.value.trim(),
        password: registerFields.password.value,
        goal: registerFields.goal.value,
        termsAccepted: registerFields.terms.checked
      });
      if (!data.success) {
        applyServerErrors(registerForm, registerFields, data.errors);
        generalError(registerForm, data.message || 'Revisa los datos e inténtalo de nuevo.');
        return;
      }
      showAuthenticated(data.user, true);
    } catch (error) {
      generalError(registerForm, 'No pudimos conectar con el servidor. Inténtalo de nuevo.');
    } finally {
      submit.disabled = false;
      submit.innerHTML = 'Crear mi cuenta gratis <span aria-hidden="true">→</span>';
    }
  });

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFormErrors(loginForm);
    const valid = Object.keys(loginFields).map(validateLoginField).every(Boolean);
    if (!valid) {
      loginForm.querySelector('[aria-invalid="true"]').focus();
      return;
    }

    const submit = loginForm.querySelector('[type="submit"]');
    submit.disabled = true;
    submit.textContent = 'Iniciando sesión...';
    try {
      const { data } = await sendRequest('api/login.php', {
        email: loginFields.email.value.trim(),
        password: loginFields.password.value
      });
      if (!data.success) {
        applyServerErrors(loginForm, loginFields, data.errors);
        generalError(loginForm, data.message || 'No pudimos iniciar sesión. Inténtalo de nuevo.');
        return;
      }
      showAuthenticated(data.user);
    } catch (error) {
      generalError(loginForm, 'No pudimos conectar con el servidor. Inténtalo de nuevo.');
    } finally {
      submit.disabled = false;
      submit.innerHTML = 'Iniciar sesión <span aria-hidden="true">→</span>';
    }
  });

  showLogin.addEventListener('click', () => {
    clearFormErrors(loginForm);
    showView('login');
  });
  showRegister.addEventListener('click', () => {
    clearFormErrors(registerForm);
    showView('register');
  });

  authContinue.addEventListener('click', () => {
    document.querySelector('#funciones').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  authLogout.addEventListener('click', async () => {
    authLogout.disabled = true;
    try {
      const { data } = await sendRequest('api/logout.php', {});
      if (data.success) {
        registerForm.reset();
        loginForm.reset();
        clearFormErrors(registerForm);
        clearFormErrors(loginForm);
        showView('register');
      }
    } catch (error) {
      authMessage.textContent = 'No pudimos cerrar la sesión. Inténtalo de nuevo.';
    } finally {
      authLogout.disabled = false;
    }
  });

  fetch('api/session.php', { credentials: 'same-origin', headers: { Accept: 'application/json' } })
    .then((response) => response.json())
    .then((data) => {
      if (data.success && data.loggedIn && data.user) showAuthenticated(data.user);
    })
    .catch(() => {});

  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealElements.forEach((element) => observer.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add('visible'));
  }
});
