document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.main-nav');
  const navLinks = document.querySelectorAll('.main-nav a');
  const year = document.querySelector('#current-year');
  const timerDisplay = document.querySelector('#timer-display');
  const timerToggle = document.querySelector('#timer-toggle');
  const timerReset = document.querySelector('#timer-reset');
  const addTaskButton = document.querySelector('.add-task');
  const taskPanel = document.querySelector('.task-panel');
  const initialSeconds = 25 * 60;
  let remainingSeconds = initialSeconds;
  let timerId = null;

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
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  const renderTimer = () => { timerDisplay.textContent = formatTime(remainingSeconds); };

  const stopTimer = () => {
    window.clearInterval(timerId);
    timerId = null;
    timerToggle.textContent = remainingSeconds === 0 ? 'Iniciar sesión' : 'Reanudar sesión';
  };

  timerToggle.addEventListener('click', () => {
    if (timerId) {
      stopTimer();
      return;
    }

    if (remainingSeconds === 0) remainingSeconds = initialSeconds;
    timerToggle.textContent = 'Pausar sesión';
    timerId = window.setInterval(() => {
      remainingSeconds -= 1;
      renderTimer();
      if (remainingSeconds === 0) stopTimer();
    }, 1000);
  });

  timerReset.addEventListener('click', () => {
    window.clearInterval(timerId);
    timerId = null;
    remainingSeconds = initialSeconds;
    renderTimer();
    timerToggle.textContent = 'Iniciar sesión';
  });

  addTaskButton.addEventListener('click', () => {
    if (taskPanel.querySelector('.task-row.added')) return;
    const task = document.createElement('div');
    task.className = 'task-row added';
    task.innerHTML = '<span></span><p>Definir la próxima prioridad</p>';
    taskPanel.appendChild(task);
    addTaskButton.textContent = '✓';
    addTaskButton.setAttribute('aria-label', 'Tarea añadida');
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
