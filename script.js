// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

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

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
});

// Active navigation link highlighting
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Initialize EmailJS
(function() {
    emailjs.init("99mp0ex1OC6hlcSO2"); // Replace with your actual EmailJS public key
})();

// Rate limiting configuration
const rateLimitConfig = {
    maxEmailsPerHour: 3, // Maximum emails per hour per IP/email
    maxEmailsPerDay: 10, // Maximum emails per day per IP/email
    cooldownMinutes: 15  // Cooldown period between emails from same sender
};

// Rate limiting storage (in production, use localStorage or server-side)
let emailAttempts = JSON.parse(localStorage.getItem('emailAttempts') || '{}');
let lastEmailTime = JSON.parse(localStorage.getItem('lastEmailTime') || '{}');

// Rate limiting functions
function checkRateLimit(email) {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const oneDay = 24 * 60 * 60 * 1000;
    const cooldown = rateLimitConfig.cooldownMinutes * 60 * 1000;
    
    // Clean old entries
    Object.keys(emailAttempts).forEach(key => {
        if (now - emailAttempts[key].timestamp > oneDay) {
            delete emailAttempts[key];
        }
    });
    
    // Check if email exists in attempts
    if (!emailAttempts[email]) {
        emailAttempts[email] = {
            hourly: 0,
            daily: 0,
            timestamp: now,
            lastEmail: 0
        };
    }
    
    const attempt = emailAttempts[email];
    
    // Check cooldown period
    if (now - attempt.lastEmail < cooldown) {
        const remainingMinutes = Math.ceil((cooldown - (now - attempt.lastEmail)) / (60 * 1000));
        return {
            allowed: false,
            message: `Please wait ${remainingMinutes} minutes before sending another email.`
        };
    }
    
    // Check hourly limit
    if (now - attempt.timestamp < oneHour) {
        if (attempt.hourly >= rateLimitConfig.maxEmailsPerHour) {
            const remainingMinutes = Math.ceil((oneHour - (now - attempt.timestamp)) / (60 * 1000));
            return {
                allowed: false,
                message: `Hourly limit reached. Please wait ${remainingMinutes} minutes.`
            };
        }
    } else {
        // Reset hourly counter if more than an hour has passed
        attempt.hourly = 0;
        attempt.timestamp = now;
    }
    
    // Check daily limit
    if (attempt.daily >= rateLimitConfig.maxEmailsPerDay) {
        return {
            allowed: false,
            message: 'Daily email limit reached. Please try again tomorrow.'
        };
    }
    
    return { allowed: true };
}

function updateRateLimit(email) {
    if (!emailAttempts[email]) {
        emailAttempts[email] = {
            hourly: 0,
            daily: 0,
            timestamp: Date.now(),
            lastEmail: 0
        };
    }
    
    emailAttempts[email].hourly++;
    emailAttempts[email].daily++;
    emailAttempts[email].lastEmail = Date.now();
    
    // Save to localStorage
    localStorage.setItem('emailAttempts', JSON.stringify(emailAttempts));
    localStorage.setItem('lastEmailTime', JSON.stringify(lastEmailTime));
}

function getRemainingAttempts(email) {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    if (!emailAttempts[email]) {
        return {
            hourly: rateLimitConfig.maxEmailsPerHour,
            daily: rateLimitConfig.maxEmailsPerDay
        };
    }
    
    const attempt = emailAttempts[email];
    let hourlyRemaining = rateLimitConfig.maxEmailsPerHour - attempt.hourly;
    let dailyRemaining = rateLimitConfig.maxEmailsPerDay - attempt.daily;
    
    // Reset hourly if more than an hour has passed
    if (now - attempt.timestamp > oneHour) {
        hourlyRemaining = rateLimitConfig.maxEmailsPerHour;
    }
    
    return {
        hourly: Math.max(0, hourlyRemaining),
        daily: Math.max(0, dailyRemaining)
    };
}

// Contact form handling
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    // Update rate limit display when email field changes
    const emailInput = contactForm.querySelector('input[name="email"]');
    const rateLimitInfo = contactForm.querySelector('.rate-limit-info');
    
    if (emailInput && rateLimitInfo) {
        emailInput.addEventListener('input', function() {
            const email = this.value;
            if (email && isValidEmail(email)) {
                const remaining = getRemainingAttempts(email);
                rateLimitInfo.innerHTML = `<small>Remaining: ${remaining.hourly} emails/hour, ${remaining.daily} emails/day</small>`;
            } else {
                rateLimitInfo.innerHTML = '<small>Rate limit: 3 emails/hour, 10 emails/day</small>';
            }
        });
    }
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const name = formData.get('name');
        const email = formData.get('email');
        const subject = formData.get('subject');
        const message = formData.get('message');
        
        // Basic validation
        if (!name || !email || !subject || !message) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        // Check rate limiting
        const rateLimitCheck = checkRateLimit(email);
        if (!rateLimitCheck.allowed) {
            showNotification(rateLimitCheck.message, 'error');
            return;
        }
        
        // Show loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        // Prepare email template parameters
        const templateParams = {
            to_email: 'sonishivama@gmail.com',
            from_name: name,
            from_email: email,
            subject: subject,
            message: message,
            reply_to: email
        };
        
        // Send email using EmailJS
        emailjs.send('service_z7d0myu', 'template_v6aem9s', templateParams)
            .then(function(response) {
                // Update rate limiting on successful send
                updateRateLimit(email);
                showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
                contactForm.reset();
            }, function(error) {
                showNotification('Failed to send message. Please try again or contact me directly.', 'error');
                console.error('EmailJS Error:', error);
            })
            .finally(function() {
                // Reset button state
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
    });
}

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 5000);
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.project-card, .skill-category, .timeline-item, .stat');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Typing effect for hero title
function typeWriter(element, text, speed = 100) {
    // Store the original HTML content
    const originalHTML = element.innerHTML;
    
    // Extract text content without HTML tags for typing effect
    const textContent = element.textContent || element.innerText || '';
    
    // Clear the element
    element.innerHTML = '';
    
    let i = 0;
    
    function type() {
        if (i < textContent.length) {
            // Add characters one by one
            element.textContent = textContent.substring(0, i + 1);
            i++;
            setTimeout(type, speed);
        } else {
            // When typing is complete, restore the original HTML with span tags
            element.innerHTML = originalHTML;
        }
    }
    
    type();
}

// Initialize typing effect when page loads
document.addEventListener('DOMContentLoaded', () => {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        setTimeout(() => {
            typeWriter(heroTitle, '', 50);
        }, 500);
    }
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        const rate = scrolled * -0.5;
        hero.style.transform = `translateY(${rate}px)`;
    }
});

// Skills animation on hover
document.addEventListener('DOMContentLoaded', () => {
    const skillItems = document.querySelectorAll('.skill-item');
    
    skillItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateY(-5px) scale(1.05)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// Project cards hover effect enhancement
document.addEventListener('DOMContentLoaded', () => {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// Loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Back to top button
const backToTopButton = document.createElement('button');
backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
backToTopButton.className = 'back-to-top';
backToTopButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 1000;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

document.body.appendChild(backToTopButton);

backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTopButton.style.opacity = '1';
        backToTopButton.style.visibility = 'visible';
    } else {
        backToTopButton.style.opacity = '0';
        backToTopButton.style.visibility = 'hidden';
    }
});

// Add hover effect to back to top button
backToTopButton.addEventListener('mouseenter', () => {
    backToTopButton.style.background = '#1d4ed8';
    backToTopButton.style.transform = 'scale(1.1)';
});

backToTopButton.addEventListener('mouseleave', () => {
    backToTopButton.style.background = '#2563eb';
    backToTopButton.style.transform = 'scale(1)';
}); 