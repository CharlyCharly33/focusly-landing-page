document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.main-nav');
  const navLinks = document.querySelectorAll('.main-nav a');
  const year = document.querySelector('#current-year');
  const registration = document.querySelector('#registro');
  const form = document.querySelector('#signup-form');
  const passwordToggle = document.querySelector('.password-toggle');
  const successState = document.querySelector('#signup-success');
  const successBack = document.querySelector('#success-back');
  const signupHeading = document.querySelector('.signup-heading');
  const signupLogin = document.querySelector('.signup-login');
  const signupTrust = document.querySelector('.signup-trust');
  const fields = {
    name: document.querySelector('#full-name'),
    email: document.querySelector('#email'),
    password: document.querySelector('#password'),
    goal: document.querySelector('#goal'),
    terms: document.querySelector('#terms')
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
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });

      if (target === registration) {
        window.setTimeout(() => fields.name.focus({ preventScroll: true }), 500);
      }
    });
  });

  const errorFor = (field) => document.querySelector(`#${field.id}-error`);

  const setError = (field, message) => {
    const error = errorFor(field);
    const group = field.closest('.form-field');
    error.textContent = message;
    field.setAttribute('aria-invalid', String(Boolean(message)));
    if (group) group.classList.toggle('invalid', Boolean(message));
  };

  const validateField = (field) => {
    const value = field.value.trim();
    let message = '';

    if (field === fields.name && !value) message = 'Escribe tu nombre completo.';
    if (field === fields.email) {
      if (!value) message = 'Escribe tu correo electrónico.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = 'Introduce un correo válido.';
    }
    if (field === fields.password) {
      if (!value) message = 'Crea una contraseña para tu cuenta.';
      else if (value.length < 8) message = 'La contraseña debe tener al menos 8 caracteres.';
    }
    if (field === fields.goal && !value) message = 'Selecciona una opción.';
    if (field === fields.terms && !field.checked) message = 'Debes aceptar los términos para continuar.';

    setError(field, message);
    return !message;
  };

  Object.values(fields).forEach((field) => {
    const eventName = field.type === 'checkbox' || field.tagName === 'SELECT' ? 'change' : 'input';
    field.addEventListener(eventName, () => validateField(field));
  });

  passwordToggle.addEventListener('click', () => {
    const isVisible = fields.password.type === 'text';
    fields.password.type = isVisible ? 'password' : 'text';
    passwordToggle.setAttribute('aria-pressed', String(!isVisible));
    passwordToggle.setAttribute('aria-label', isVisible ? 'Mostrar contraseña' : 'Ocultar contraseña');
    passwordToggle.querySelector('span').textContent = isVisible ? '◉' : '◌';
    fields.password.focus();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const isValid = Object.values(fields).map(validateField).every(Boolean);
    if (!isValid) {
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    form.hidden = true;
    signupHeading.hidden = true;
    signupLogin.hidden = true;
    signupTrust.hidden = true;
    successState.hidden = false;
    successBack.focus();
  });

  successBack.addEventListener('click', () => {
    form.reset();
    Object.values(fields).forEach((field) => setError(field, ''));
    fields.password.type = 'password';
    passwordToggle.setAttribute('aria-pressed', 'false');
    passwordToggle.setAttribute('aria-label', 'Mostrar contraseña');
    passwordToggle.querySelector('span').textContent = '◉';
    successState.hidden = true;
    signupHeading.hidden = false;
    form.hidden = false;
    signupLogin.hidden = false;
    signupTrust.hidden = false;
    fields.name.focus();
  });

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
