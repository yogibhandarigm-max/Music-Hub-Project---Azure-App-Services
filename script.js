// Form Validation and Handling

// Login Form Validation
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Clear previous errors
        clearErrors();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        
        let isValid = true;
        
        // Validate email
        if (!email) {
            showError('emailError', 'Email is required');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showError('emailError', 'Please enter a valid email');
            isValid = false;
        }
        
        // Validate password
        if (!password) {
            showError('passwordError', 'Password is required');
            isValid = false;
        } else if (password.length < 6) {
            showError('passwordError', 'Password must be at least 6 characters');
            isValid = false;
        }
        
        if (isValid) {
            // Store login info in localStorage
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userName', email.split('@')[0]);
            localStorage.setItem('isLoggedIn', 'true');
            
            // Show success message
            const successMsg = document.getElementById('successMessage');
            successMsg.style.display = 'block';
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        }
    });
}

// Sign Up Form Validation
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Clear previous errors
        clearErrors();
        
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const userRole = document.getElementById('userRole').value;
        const password = document.getElementById('signupPassword').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();
        const termsChecked = document.getElementById('terms').checked;
        
        let isValid = true;
        
        // Validate first name
        if (!firstName) {
            showError('firstNameError', 'First name is required');
            isValid = false;
        } else if (firstName.length < 2) {
            showError('firstNameError', 'First name must be at least 2 characters');
            isValid = false;
        }
        
        // Validate last name
        if (!lastName) {
            showError('lastNameError', 'Last name is required');
            isValid = false;
        } else if (lastName.length < 2) {
            showError('lastNameError', 'Last name must be at least 2 characters');
            isValid = false;
        }
        
        // Validate email
        if (!email) {
            showError('signupEmailError', 'Email is required');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showError('signupEmailError', 'Please enter a valid email');
            isValid = false;
        }
        
        // Validate user role
        if (!userRole) {
            showError('userRoleError', 'Please select your role');
            isValid = false;
        }
        
        // Validate password
        if (!password) {
            showError('signupPasswordError', 'Password is required');
            isValid = false;
        } else if (!isValidPassword(password)) {
            showError('signupPasswordError', 'Password must contain at least 8 characters, including uppercase, lowercase, and numbers');
            isValid = false;
        }
        
        // Validate password confirmation
        if (!confirmPassword) {
            showError('confirmPasswordError', 'Please confirm your password');
            isValid = false;
        } else if (password !== confirmPassword) {
            showError('confirmPasswordError', 'Passwords do not match');
            isValid = false;
        }
        
        // Validate terms
        if (!termsChecked) {
            showError('termsError', 'You must agree to the terms and conditions');
            isValid = false;
        }
        
        if (isValid) {
            // Store signup info in localStorage
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userName', firstName);
            localStorage.setItem('userRole', userRole);
            localStorage.setItem('isLoggedIn', 'true');
            
            // Show success message
            const successMsg = document.getElementById('successMessage');
            successMsg.style.display = 'block';
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        }
    });
}

// Helper Functions

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPassword(password) {
    // At least 8 characters, one uppercase, one lowercase, one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
        
        // Find the input field and add error class
        const formGroup = errorElement.closest('.form-group');
        if (formGroup) {
            const input = formGroup.querySelector('input, select');
            if (input) {
                input.classList.add('error');
            }
        }
    }
}

function clearErrors() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(error => {
        error.textContent = '';
        error.classList.remove('show');
    });
    
    const inputs = document.querySelectorAll('input.error, select.error');
    inputs.forEach(input => {
        input.classList.remove('error');
    });
}

// Add real-time validation
document.addEventListener('DOMContentLoaded', function() {
    // Email validation on input
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value && !isValidEmail(this.value)) {
                this.classList.add('error');
            } else {
                this.classList.remove('error');
            }
        });
    });
    
    // Password strength indicator for signup
    const passwordInput = document.getElementById('signupPassword');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            if (this.value) {
                const isStrong = isValidPassword(this.value);
                if (isStrong) {
                    this.classList.remove('error');
                } else {
                    this.classList.add('error');
                }
            }
        });
    }

    // Search functionality - filter trending songs by name
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            const songCards = document.querySelectorAll('.song-card');
            
            songCards.forEach(card => {
                const songName = card.querySelector('h4').textContent.toLowerCase();
                const artistName = card.querySelector('p').textContent.toLowerCase();
                
                if (songName.includes(query) || artistName.includes(query)) {
                    card.style.display = 'flex';
                    card.style.flexDirection = 'column';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // Smooth scroll for anchor links
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});

