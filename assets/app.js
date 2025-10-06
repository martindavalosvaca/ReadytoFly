
// assets/app.js
document.addEventListener('partials:loaded', function() {

          /* ============================================
             JAVASCRIPT
             ============================================ */

          // Configuration
          const APP_CONFIG = {
              webhookUrl: 'https://your-webhook-endpoint.com/waitlist',
              scrollThreshold: 0.3,
              modalCloseDelay: 2000,
              activeSectionThreshold: 0.5
          };

          // DOM Elements
          const elements = {
              modal: document.getElementById('waitlist-modal'),
              modalTriggers: document.querySelectorAll('[data-modal-trigger]'),
              modalClose: document.querySelector('.modal__close'),
              form: document.getElementById('waitlist-form'),
              progressBar: document.querySelector('.progress-bar'),
              header: document.getElementById('header'),
              mobileMenuToggle: document.querySelector('.mobile-menu-toggle'),
              mobileMenu: document.getElementById('mobile-menu'),
              navLinks: document.querySelectorAll('.header__link'),
              stickyCTA: document.querySelector('.sticky-cta')
          };

          // ============================================
          // SMOOTH SCROLL & ACTIVE SECTION
          // ============================================
          class ScrollManager {
              constructor() {
                  this.progressBar = elements.progressBar;
                  this.header = elements.header;
                  this.navLinks = elements.navLinks;
                  this.stickyCTA = elements.stickyCTA;
                  this.sections = [];
                  this.init();
              }

              init() {
                  // Get all sections with IDs
                  this.sections = Array.from(document.querySelectorAll('section[id]'));

                  // Setup Intersection Observer for active sections
                  this.setupIntersectionObserver();

                  // Handle smooth scroll for nav links
                  this.setupSmoothScroll();

                  // Update on scroll
                  this.handleScroll = this.throttle(this.update.bind(this), 16);
                  window.addEventListener('scroll', this.handleScroll);

                  // Initial update
                  this.update();
              }

              setupIntersectionObserver() {
                  const options = {
                      rootMargin: '-20% 0px -70% 0px',
                      threshold: 0
                  };

                  this.observer = new IntersectionObserver((entries) => {
                      entries.forEach(entry => {
                          if (entry.isIntersecting) {
                              this.setActiveSection(entry.target.id);
                          }
                      });
                  }, options);

                  this.sections.forEach(section => {
                      this.observer.observe(section);
                  });
              }

              setupSmoothScroll() {
                  this.navLinks.forEach(link => {
                      const href = link.getAttribute('href');
                      if (href && href.startsWith('#') && href.length > 1) {
                          link.addEventListener('click', (e) => {
                              const targetId = href.substring(1);
                              const targetSection = document.getElementById(targetId);

                              if (targetSection) {
                                  e.preventDefault();

                                  // Close mobile menu if open
                                  if (elements.mobileMenu.classList.contains('header__menu--open')) {
                                      elements.mobileMenuToggle.setAttribute('aria-expanded', 'false');
                                      elements.mobileMenu.classList.remove('header__menu--open');
                                  }

                                  // Scroll to section
                                  const headerHeight = this.header.offsetHeight;
                                  const targetPosition = targetSection.offsetTop - headerHeight - 20;

                                  window.scrollTo({
                                      top: targetPosition,
                                      behavior: 'smooth'
                                  });

                                  // Update URL hash without jumping
                                  history.pushState(null, null, href);
                              }
                          });
                      }
                  });
              }

              setActiveSection(sectionId) {
                  this.navLinks.forEach(link => {
                      const href = link.getAttribute('href');
                      if (href === `#${sectionId}`) {
                          link.classList.add('active');
                          link.setAttribute('aria-current', 'page');
                      } else {
                          link.classList.remove('active');
                          link.removeAttribute('aria-current');
                      }
                  });
              }

              update() {
                  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
                  const scrollPosition = window.scrollY;
                  const scrollProgress = scrollPosition / scrollHeight;

                  // Update progress bar
                  this.progressBar.style.width = `${scrollProgress * 100}%`;

                  // Update header state
                  if (scrollPosition > 50) {
                      this.header.classList.add('header--scrolled');
                  } else {
                      this.header.classList.remove('header--scrolled');
                  }

                  // Update sticky CTA visibility
                  if (scrollProgress > APP_CONFIG.scrollThreshold) {
                      this.stickyCTA.classList.add('sticky-cta--visible');
                  } else {
                      this.stickyCTA.classList.remove('sticky-cta--visible');
                  }
              }

              throttle(func, delay) {
                  let timeoutId;
                  let lastExecTime = 0;
                  return function (...args) {
                      const currentTime = Date.now();
                      if (currentTime - lastExecTime > delay) {
                          func.apply(this, args);
                          lastExecTime = currentTime;
                      } else {
                          clearTimeout(timeoutId);
                          timeoutId = setTimeout(() => {
                              func.apply(this, args);
                              lastExecTime = Date.now();
                          }, delay - (currentTime - lastExecTime));
                      }
                  };
              }
          }

          // ============================================
          // MOBILE MENU
          // ============================================
          class MobileMenuManager {
              constructor() {
                  this.toggle = elements.mobileMenuToggle;
                  this.menu = elements.mobileMenu;
                  this.init();
              }

              init() {
                  this.toggle.addEventListener('click', () => {
                      const isOpen = this.menu.classList.contains('header__menu--open');

                      if (isOpen) {
                          this.close();
                      } else {
                          this.open();
                      }
                  });

                  // Close on escape key
                  document.addEventListener('keydown', (e) => {
                      if (e.key === 'Escape' && this.menu.classList.contains('header__menu--open')) {
                          this.close();
                      }
                  });
              }

              open() {
                  this.menu.classList.add('header__menu--open');
                  this.toggle.setAttribute('aria-expanded', 'true');
                  document.body.style.overflow = 'hidden';
              }

              close() {
                  this.menu.classList.remove('header__menu--open');
                  this.toggle.setAttribute('aria-expanded', 'false');
                  document.body.style.overflow = '';
              }
          }

          // ============================================
          // MODAL MANAGEMENT
          // ============================================
          class ModalManager {
              constructor(modalElement) {
                  this.modal = modalElement;
                  this.focusableElements = null;
                  this.previousFocus = null;
              }

              open() {
                  this.previousFocus = document.activeElement;
                  this.modal.classList.add('modal--active');
                  document.body.style.overflow = 'hidden';

                  // Setup focus trap
                  this.focusableElements = this.modal.querySelectorAll(
                      'input, button, [tabindex]:not([tabindex="-1"])'
                  );

                  // Focus first element
                  setTimeout(() => {
                      if (this.focusableElements.length) {
                          this.focusableElements[0].focus();
                      }
                  }, 100);

                  // Add event listeners
                  document.addEventListener('keydown', this.handleKeydown);
                  this.modal.addEventListener('click', this.handleBackdropClick);
              }

              close() {
                  this.modal.classList.remove('modal--active');
                  document.body.style.overflow = '';

                  // Remove event listeners
                  document.removeEventListener('keydown', this.handleKeydown);
                  this.modal.removeEventListener('click', this.handleBackdropClick);

                  // Restore focus
                  if (this.previousFocus) {
                      this.previousFocus.focus();
                  }

                  // Reset form status
                  const statusElement = this.modal.querySelector('.form__status');
                  if (statusElement) {
                      statusElement.style.display = 'none';
                      statusElement.className = 'form__status';
                  }
              }

              handleKeydown = (e) => {
                  if (e.key === 'Escape') {
                      this.close();
                  }

                  // Focus trap
                  if (e.key === 'Tab' && this.focusableElements) {
                      const firstElement = this.focusableElements[0];
                      const lastElement = this.focusableElements[this.focusableElements.length - 1];

                      if (e.shiftKey && document.activeElement === firstElement) {
                          e.preventDefault();
                          lastElement.focus();
                      } else if (!e.shiftKey && document.activeElement === lastElement) {
                          e.preventDefault();
                          firstElement.focus();
                      }
                  }
              }

              handleBackdropClick = (e) => {
                  if (e.target === this.modal) {
                      this.close();
                  }
              }
          }

          // ============================================
          // FORM HANDLER
          // ============================================
          class FormHandler {
              constructor(formElement) {
                  this.form = formElement;
                  this.submitButton = formElement.querySelector('button[type="submit"]');
                  this.statusElement = formElement.querySelector('.form__status');
              }

              async submit(e) {
                  e.preventDefault();

                  const formData = this.getFormData();

                  // Validation
                  if (!this.validate(formData)) {
                      return;
                  }

                  // Update UI
                  this.setLoading(true);

                  try {
                      // Simulate API call
                      await this.sendToWebhook(formData);
                      this.showSuccess();
                      this.form.reset();

                      // Close modal after delay
                      setTimeout(() => {
                          modalManager.close();
                      }, APP_CONFIG.modalCloseDelay);
                  } catch (error) {
                      this.showError();
                  } finally {
                      this.setLoading(false);
                  }
              }

              getFormData() {
                  return {
                      name: this.form.name.value.trim(),
                      email: this.form.email.value.trim(),
                      timestamp: new Date().toISOString(),
                      source: 'waitlist-modal'
                  };
              }

              validate(data) {
                  // Check required fields
                  if (!data.name || !data.email) {
                      this.showError('Please fill in all fields');
                      return false;
                  }

                  // Email validation
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (!emailRegex.test(data.email)) {
                      this.showError('Please enter a valid email');
                      return false;
                  }

                  return true;
              }

              async sendToWebhook(data) {
                  // In production, this would be a real API call
                  return new Promise((resolve) => {
                      setTimeout(() => {
                          // Simulate success
                          resolve();
                      }, 1000);
                  });
              }

              setLoading(isLoading) {
                  this.submitButton.disabled = isLoading;
                  this.submitButton.textContent = isLoading ? 'Submitting...' : 'Join the Waitlist';
              }

              showSuccess() {
                  this.statusElement.textContent = 'Welcome! Check your email for next steps.';
                  this.statusElement.className = 'form__status form__status--success';
                  this.statusElement.style.display = 'block';
              }

              showError(message = 'Something went wrong. Please try again.') {
                  this.statusElement.textContent = message;
                  this.statusElement.className = 'form__status form__status--error';
                  this.statusElement.style.display = 'block';
              }
          }

          // ============================================
          // INITIALIZATION
          // ============================================
          const scrollManager = new ScrollManager();
          const mobileMenuManager = new MobileMenuManager();

          // Modal functionality commented out since CTAs now link to quiz
          // const modalManager = new ModalManager(elements.modal);
          // const formHandler = new FormHandler(elements.form);

          // Event Listeners - Modal triggers removed (now direct links to quiz.html)
          /*
          elements.modalTriggers.forEach(trigger => {
              trigger.addEventListener('click', (e) => {
                  e.preventDefault();
                  modalManager.open();
              });
          });

          elements.modalClose.addEventListener('click', () => {
              modalManager.close();
          });

          elements.form.addEventListener('submit', (e) => {
              formHandler.submit(e);
          });
          */

          // FAQ Accordion
          const faqItems = document.querySelectorAll('.faq__item');
          faqItems.forEach(item => {
              const question = item.querySelector('.faq__question');
              question.addEventListener('click', () => {
                  const isActive = item.classList.contains('faq__item--active');

                  // Close all items
                  faqItems.forEach(i => {
                      i.classList.remove('faq__item--active');
                      i.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
                  });

                  // Open clicked item if it wasn't already open
                  if (!isActive) {
                      item.classList.add('faq__item--active');
                      question.setAttribute('aria-expanded', 'true');
                  }
              });
          });

});
