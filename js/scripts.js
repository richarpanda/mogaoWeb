// Header scroll effect mejorado
window.addEventListener('scroll', function () {
    const header = document.querySelector('header');
    const scrolled = window.scrollY > 50;

    if (scrolled) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    // Parallax effects - Solo en desktop
    if (window.innerWidth > 1024) {
        const scrollTop = window.pageYOffset;

        // Hero parallax
        const heroParallax = document.querySelector('.parallax-bg');
        if (heroParallax) {
            heroParallax.style.transform = `translateY(${scrollTop * 0.3}px)`;
        }

        // About section parallax
        const aboutSection = document.querySelector('.about');
        if (aboutSection) {
            const rect = aboutSection.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            if (isVisible) {
                const parallaxValue = (window.innerHeight - rect.top) * 0.1;
                const afterElement = aboutSection.querySelector('::after');
                if (afterElement) {
                    aboutSection.style.setProperty('--parallax-about', parallaxValue + 'px');
                }
            }
        }

        // Parallax para elementos específicos - Solo hero y about
        document.querySelectorAll('.hero .parallax-element, .about .parallax-element').forEach(element => {
            const rect = element.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            if (isVisible) {
                const speed = element.dataset.speed || 0.2;
                const yPos = -(scrollTop * speed);
                element.style.transform = `translateY(${yPos}px)`;
            }
        });
    }
});

// Optimized parallax with requestAnimationFrame - Solo desktop
let ticking = false;

function updateParallax() {
    if (window.innerWidth > 1024) {
        const scrollTop = window.pageYOffset;
        document.documentElement.style.setProperty('--scroll-top', scrollTop + 'px');
    }
    ticking = false;
}

window.addEventListener('scroll', function () {
    if (!ticking && window.innerWidth > 1024) {
        requestAnimationFrame(updateParallax);
        ticking = true;
    }
});

// Disable parallax on resize if mobile
window.addEventListener('resize', function () {
    if (window.innerWidth <= 1024) {
        document.querySelectorAll('.parallax-element').forEach(element => {
            element.style.transform = 'none';
        });
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Form submission
document.querySelector('.contact-form').addEventListener('submit', function (e) {
    e.preventDefault();
    alert('¡Gracias por tu consulta! Nos pondremos en contacto contigo pronto.');
    this.reset();
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.service-card, .property-card, .testimonial, .stat-card').forEach(el => {
    observer.observe(el);
});

// Enhanced Parallax Effects with Images
window.addEventListener('scroll', function () {
    const header = document.querySelector('header');
    const scrolled = window.scrollY > 50;

    if (scrolled) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    // Enhanced parallax effects - Solo en desktop
    if (window.innerWidth > 1024) {
        const scrollTop = window.pageYOffset;

        // Parallax images with different speeds
        document.querySelectorAll('.parallax-layer-1').forEach(element => {
            const rect = element.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            if (isVisible) {
                const speed = 0.5;
                const yPos = scrollTop * speed;
                element.style.transform = `translateY(${yPos}px)`;
            }
        });

        // Parallax text elements (slower)
        document.querySelectorAll('.parallax-layer-2').forEach(element => {
            const rect = element.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            if (isVisible) {
                const speed = 0.1;
                const yPos = -(scrollTop * speed);
                element.style.transform = `translateY(${yPos}px)`;
            }
        });

        // Parallax images in content (medium speed)
        document.querySelectorAll('.parallax-layer-3').forEach(element => {
            const rect = element.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            if (isVisible) {
                const speed = 0.2;
                const yPos = -(scrollTop * speed);
                element.style.transform = `translateY(${yPos}px)`;
            }
        });

        // Geometric shapes parallax
        document.querySelectorAll('.geometric-shape').forEach((shape, index) => {
            const rect = shape.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            if (isVisible) {
                const speed = 0.05 + (index * 0.02);
                const yPos = -(scrollTop * speed);
                const rotation = scrollTop * 0.1;
                shape.style.transform = `translateY(${yPos}px) rotate(${rotation}deg)`;
            }
        });

        // Services section rotating gradient
        const servicesSection = document.querySelector('.services');
        if (servicesSection) {
            const rect = servicesSection.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            if (isVisible) {
                const rotation = scrollTop * 0.1;
                servicesSection.style.setProperty('--rotation', rotation + 'deg');
            }
        }
    }
});

// Smooth parallax with requestAnimationFrame
let parallaxTicking = false;

function updateParallaxEffects() {
    if (window.innerWidth > 1024) {
        const scrollTop = window.pageYOffset;

        // Update CSS custom properties for complex animations
        document.documentElement.style.setProperty('--scroll-progress', scrollTop + 'px');

        // Floating particles speed variation
        document.querySelectorAll('.particle').forEach((particle, index) => {
            const speed = 0.02 + (index * 0.01);
            const yPos = -(scrollTop * speed);
            particle.style.transform = `translateY(${yPos}px)`;
        });
    }
    parallaxTicking = false;
}

window.addEventListener('scroll', function () {
    if (!parallaxTicking && window.innerWidth > 1024) {
        requestAnimationFrame(updateParallaxEffects);
        parallaxTicking = true;
    }
});

// Image Loading Optimization
document.addEventListener('DOMContentLoaded', function () {
    const parallaxImages = document.querySelectorAll('.parallax-image-bg img');

    parallaxImages.forEach(img => {
        img.addEventListener('load', function () {
            this.style.opacity = '1';
            this.style.transition = 'opacity 0.5s ease-in-out';
        });
    });
});