// --- Firebase Configuration ---
// (Estas variables __firebase_config y __initial_auth_token son proporcionadas por el entorno)
let firebaseConfig;
try {
    firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
} catch (e) {
    console.error("Error parsing Firebase config:", e);
    firebaseConfig = {}; // Configuración vacía para evitar fallos
}
const authToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Initialize Firebase
let app, auth;
if (firebaseConfig.apiKey) {
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    
    // --- Autenticación Inicial ---
    if (authToken) {
        auth.signInWithCustomToken(authToken).catch(error => {
            console.error("Error signing in with custom token:", error);
            auth.signInAnonymously().catch(anonError => {
                console.error("Error signing in anonymously:", anonError);
            });
        });
    } else {
        auth.signInAnonymously().catch(anonError => {
            console.error("Error signing in anonymously:", anonError);
        });
    }
} else {
    console.warn("Firebase config not found. Auth features will be disabled.");
}

// --- CORREGIDO: Flag para mostrar el modal solo una vez ---
let welcomeModalShown = false;

// This function updates the UI based on auth state.
const updateAuthUI = (user) => {
    const loggedOutView = document.getElementById('logged-out-view');
    const loggedInView = document.getElementById('logged-in-view');
    const userEmailSpan = document.getElementById('user-email');
    const mobileLoggedOutView = document.getElementById('mobile-logged-out-view');
    const mobileLoggedInView = document.getElementById('mobile-logged-in-view');
    const mobileUserEmailSpan = document.getElementById('mobile-user-email');

    // Solo mostramos la UI de logueado si NO es anónimo
    if (user && !user.isAnonymous) {
        loggedOutView.classList.add('hidden');
        loggedInView.classList.remove('hidden');
        loggedInView.classList.add('flex');
        userEmailSpan.textContent = user.email;

        mobileLoggedOutView.classList.add('hidden');
        mobileLoggedInView.classList.remove('hidden');
        mobileUserEmailSpan.textContent = user.email;
    } else {
        loggedInView.classList.add('hidden');
        loggedInView.classList.remove('flex');
        loggedOutView.classList.remove('hidden');

        mobileLoggedInView.classList.add('hidden');
        mobileLoggedOutView.classList.remove('hidden');
    }

    // --- CORREGIDO: Lógica para mostrar el modal de bienvenida ---
    // Se ejecuta en cuanto Firebase confirma el estado de autenticación.
    if (user && user.isAnonymous && !welcomeModalShown) {
        // Esperamos un breve momento para que el preloader termine su animación
        setTimeout(() => {
            document.getElementById('welcomeModal').classList.add('is-open');
            welcomeModalShown = true; // Marcar como mostrado para que no vuelva a salir
        }, 500); // 500ms de retraso
    }
};

// Observador de estado de Auth
if (auth) {
    auth.onAuthStateChanged(updateAuthUI);
}


// Main App Initialization Logic
const initializeMainApp = () => {
    
    // --- DATOS DE MANUTOYS (CORREGIDOS) ---
    const products = [
        // --- Hot Wheels Normales (3) ---
        { 
            id: 1, 
            name: 'Hot Wheels Datsun 240z', 
            price: 80.00, // CORREGIDO: Precio como número
            image: 'images/Hot Wheels Datsun 240z.PNG', 
            desc: 'Un clásico JDM (Mercado Doméstico Japonés) que captura la esencia de las carreras de los 70. Este Datsun 240z en rojo vibrante es una pieza esencial.', 
            tags: ['normal'], 
            badge: 'Destacado'
        },
        { 
            id: 2, 
            name: 'Hot Wheels Porsche 911 GT3 RS', 
            price: 80.00, // CORREGIDO: Precio como número
            image: 'images/Hot Wheels Porsche 911 GT3 RS.PNG', 
            desc: 'La leyenda de las pistas alemanas. Este Porsche 911 GT3 RS presenta detalles realistas y un diseño aerodinámico listo para la velocidad.', 
            tags: ['normal'],
            badge: 'Nuevo'
        },
        { 
            id: 3, 
            name: 'Williams Racing F1', 
            price: 80.00, // CORREGIDO: Precio como número
            image: 'images/Hot Wheels Williams Racing.PNG', 
            desc: 'Listo para cualquier terreno. El Williams Racing F1 es un coche de carreras diseñado para la velocidad, con detalles que capturan su espíritu competitivo.', 
            tags: ['normal'],
            badge: null
        },
        // --- Hot Wheels Premium (3) ---
        { 
            id: 4, 
            name: 'Hot Wheels Premium McLaren F1 #81', 
            price: 400.00, // CORREGIDO: Precio como número
            image: 'images/Hot Wheels Premium Mclaren F1.PNG', // CORREGIDO: Ruta con espacio
            desc: 'El coche que dominó la Fórmula 1. Este modelo Premium del McLaren F1 #81 viene con detalles de alta calidad y llantas Real Riders.', 
            tags: ['premium'],
            badge: 'Premium'
        },
        { 
            id: 5, 
            name: 'Hot Wheels Premium Kick Sauber F1 #77', 
            price: 400.00, // CORREGIDO: Precio como número
            image: 'images/Hot Wheels Premium Kick Sauber F1.PNG', 
            desc: 'El bólido de Bottas. La réplica Premium del Kick Sauber F1, con su icónico diseño y la precisión que todo coleccionista de F1 busca.', 
            tags: ['premium'],
            badge: 'Premium'
        },
        { 
            id: 6, 
            name: 'Hot Wheels Premium Williams Racing #43', 
            price: 400.00, // CORREGIDO: Precio como número
            image: 'images/Hot Wheels Premium Williams Racing.PNG', // CORREGIDO: Ruta con espacio al final
            desc: 'La pasión de un legado en tu colección. Este Williams Racing #43 Premium rinde homenaje al icónico equipo, con acabados metálicos.', 
            tags: ['premium'],
            badge: 'Premium'
        },
        // --- Mini GT ---
        { 
            id: 7, 
            name: 'Mini GT Porsche 911 GT3 R "Rexy"', 
            price: 1200.00, // CORREGIDO: Precio como número
            image: 'images/Mini GT Porsche 911 Rexy.PNG', 
            gallery: ['images/Mini GT Porsche 911 Rexy.PNG', 'images/Mini GT Porsche 911 Rexy1.PNG'], 
            desc: 'El icónico \'Rexy\' de Mini GT. Esta réplica del Porsche 911 GT3 R es famosa por su inconfundible diseño de T-Rex. Un modelo de alta fidelidad 1:64.', 
            tags: ['minigt'],
            badge: 'Lo Más Buscado'
        },
    ];

    const heroImages = [
        'images/Head1.PNG',
        'images/Head2.PNG',
        'images/Head3.PNG', // CORREGIDO: Ruta
        'images/Head4.PNG',
        'images/Head5.PNG' // CORREGIDO: Ruta
    ];
    // --- FIN DE DATOS DE MANUTOYS ---


    let cart = []; // El carrito está activo
    
    // --- Core App Logic ---
    const productGrid = document.getElementById('product-grid');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const emptyCartMessage = document.getElementById('empty-cart-message');

    const showNotification = (message, type = "success") => {
        const notification = document.getElementById('notification');
        const content = document.getElementById('notification-content');
        document.getElementById('notification-message').textContent = message;
        // Clases de Tailwind para éxito (verde) y error (rojo)
        content.className = `text-white font-bold rounded-lg shadow-lg px-6 py-4 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`;
        notification.classList.add('show');
        setTimeout(() => notification.classList.remove('show'), 3000);
    };

    // --- Lógica del Carrito (ACTUALIZADA) ---
    const updateCart = () => {
        // Limpiar items anteriores (excepto el mensaje de vacío)
        cartItemsContainer.querySelectorAll('.cart-item').forEach(item => item.remove());
        
        let subtotal = 0;
        let totalItems = 0;

        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block';
        } else {
            emptyCartMessage.style.display = 'none';
            cart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item flex items-center gap-4 mb-4'; // Clase para identificar items
                itemElement.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="w-20 h-20 rounded-md object-contain border border-gray-700">
                    <div class="flex-grow">
                        <p class="font-bold text-white text-sm">${item.name}</p>
                        <p class="text-sm text-gray-400">$${item.price.toFixed(2)} MXN</p>
                        <div class="flex items-center gap-2 mt-1">
                            <button class="cart-quantity-btn" data-id="${item.id}" data-action="decrease">-</button>
                            <span class="text-white font-bold">${item.quantity}</span>
                            <button class="cart-quantity-btn" data-id="${item.id}" data-action="increase">+</button>
                        </div>
                    </div>
                    <button class="cart-remove-btn text-red-500 hover:text-red-400 text-2xl" data-id="${item.id}">&times;</button>
                `;
                cartItemsContainer.appendChild(itemElement);

                subtotal += item.price * item.quantity;
                totalItems += item.quantity;
            });
        }
        
        cartCount.textContent = totalItems;
        cartSubtotal.textContent = `$${subtotal.toFixed(2)} MXN`;
    };

    const addToCart = (productId, showNotificationMsg = true) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        
        if (showNotificationMsg) {
            showNotification(`${product.name} añadido al carrito.`);
        }
        updateCart();
    };

    const removeFromCart = (productId) => {
        cart = cart.filter(item => item.id !== productId);
        updateCart();
    };

    const updateQuantity = (productId, action) => {
        const item = cart.find(item => item.id === productId);
        if (!item) return;

        if (action === 'increase') {
            item.quantity++;
        } else if (action === 'decrease') {
            item.quantity--;
            if (item.quantity === 0) {
                removeFromCart(productId);
                return; // Salir de la función
            }
        }
        updateCart();
    };

    // Event listener para los botones del carrito
    cartItemsContainer.addEventListener('click', e => {
        const target = e.target;
        if (target.classList.contains('cart-remove-btn')) {
            removeFromCart(parseInt(target.dataset.id));
        }
        if (target.classList.contains('cart-quantity-btn')) {
            updateQuantity(parseInt(target.dataset.id), target.dataset.action);
        }
    });

    // --- Fin Lógica del Carrito ---
    
    // --- Lógica para rotar imágenes en hover (SOLO si hay galería) ---
    const setupProductCardHover = () => {
        document.querySelectorAll('.product-card').forEach(card => {
            let hoverInterval;
            const productId = parseInt(card.dataset.id);
            const product = products.find(p => p.id === productId);
            const imgElement = card.querySelector('.product-card-clickable img');

            // Solo activar si hay una galería con más de 1 imagen
            if (!product || !product.gallery || product.gallery.length <= 1) {
                return; 
            }

            const startImageRotation = () => {
                let currentIndex = 1; // Empezar en la segunda imagen
                hoverInterval = setInterval(() => {
                    if (!imgElement) return;
                    imgElement.style.opacity = 0;
                    setTimeout(() => {
                        imgElement.src = product.gallery[currentIndex];
                        imgElement.style.opacity = 1;
                        currentIndex = (currentIndex + 1) % product.gallery.length;
                    }, 400); // 400ms para la transición de opacidad
                }, 1500); // Cambiar imagen cada 1.5s
            };

            const stopImageRotation = () => {
                clearInterval(hoverInterval);
                if (imgElement && imgElement.src !== product.image) {
                    imgElement.style.opacity = 0;
                    setTimeout(() => {
                        imgElement.src = product.image; // Volver a la imagen principal
                        imgElement.style.opacity = 1;
                    }, 400);
                }
            };

            card.addEventListener('mouseenter', startImageRotation);
            card.addEventListener('mouseleave', stopImageRotation);
        });
    };

    // Función de renderizado de productos (ACTUALIZADA con Insignias)
    const renderProducts = (filter = 'all') => {
        productGrid.innerHTML = '';
        products.filter(p => filter === 'all' || p.tags.includes(filter)).forEach(product => {
            
            // Lógica para la insignia
            let badgeHTML = '';
            if (product.badge) {
                const isPremium = product.badge.toLowerCase() === 'premium' || product.badge.toLowerCase() === 'mini gt';
                let isMostSearched = product.badge.toLowerCase() === 'lo más buscado';
                
                let badgeClasses = 'product-badge';
                if (isPremium) badgeClasses += ' premium';
                if (isMostSearched) badgeClasses += ' most-searched-badge'; // Clase para la insignia

                badgeHTML = `<div class="${badgeClasses}">${product.badge}</div>`;
            }

            // Lógica para la tarjeta especial
            let cardClasses = 'product-card bg-stone-900/50 border border-white/5 rounded-lg shadow-lg overflow-hidden group';
            if (product.badge === 'Lo Más Buscado') {
                cardClasses += ' most-searched-card'; // Clase para la tarjeta
            }

            // Usamos las clases de Tailwind para la imagen (h-72 object-contain p-4)
            productGrid.innerHTML += `
                <div class="${cardClasses}" data-id="${product.id}">
                    <div class="product-card-clickable w-full">
                        ${badgeHTML} <!-- Insignia añadida aquí -->
                        <img src="${product.image}" alt="${product.name}" class="w-full h-72 object-contain p-4">
                        <div class="p-6">
                            <h4 class="text-xl font-bold text-white mb-2 font-display">${product.name}</h4>
                            <p class="text-gray-400 mb-4 text-sm">${product.desc.substring(0, 100)}...</p>
                        </div>
                    </div>
                    <div class="p-6 pt-0 mt-auto flex justify-between items-center w-full">
                        <p class="text-2xl font-semibold text-secundario">$${product.price.toFixed(2)} MXN</p>
                        <button class="add-to-cart-btn bg-primario hover:bg-primario-hover font-bold py-2 px-4 rounded-lg transition-colors button-glow">Añadir</button>
                    </div>
                </div>
            `;
        });

        // Llamar a la función de hover después de renderizar
        setupProductCardHover();
    };

    const heroBg1 = document.getElementById('hero-bg-1');
    const heroBg2 = document.getElementById('hero-bg-2');
    let heroImageIndex = 0;
    let activeHeroBg = heroBg1;

    const changeHeroImage = () => {
        heroImageIndex = (heroImageIndex + 1) % heroImages.length;
        const nextImage = heroImages[heroImageIndex];
        const inactiveHeroBg = (activeHeroBg === heroBg1) ? heroBg2 : heroBg1;
        
        // Ruta relativa al index.html
        inactiveHeroBg.style.backgroundImage = `url('${nextImage}')`;
        
        activeHeroBg.classList.remove('active');
        inactiveHeroBg.classList.add('active');
        activeHeroBg = inactiveHeroBg;
    };
    
    // Precargar imágenes del Hero
    heroImages.forEach(src => { (new Image()).src = `${src}`; });
    
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    const promoBanner = document.getElementById('promo-banner'); // NUEVO: Obtener el banner
    let promoBannerShown = false; // NUEVO: Bandera para mostrar solo una vez

    window.addEventListener('scroll', () => {
        // Lógica del botón de scroll
        scrollToTopBtn.classList.toggle('visible', window.scrollY > 300);
        
        // NUEVA Lógica para el banner de "Rexy"
        if (promoBanner && !promoBannerShown && window.scrollY > 800) {
            promoBanner.classList.add('is-visible');
            promoBannerShown = true; // Solo mostrar una vez
        }
    });
    
    // NUEVO: Lógica para cerrar el banner promocional
    document.getElementById('close-promo-btn')?.addEventListener('click', () => {
        const promoBanner = document.getElementById('promo-banner');
        if (promoBanner) {
            promoBanner.classList.remove('is-visible');
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.getElementById('filters').addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-button')) {
            document.querySelector('.filter-button.active').classList.remove('active', 'bg-primario');
            e.target.classList.add('active', 'bg-primario');
            renderProducts(e.target.dataset.filter);
        }
    });

    productGrid.addEventListener('click', e => {
        const card = e.target.closest('.product-card');
        if (!card) return;
        const productId = parseInt(card.dataset.id);
        if (e.target.closest('.add-to-cart-btn')) {
            addToCart(productId);
        } else if (e.target.closest('.product-card-clickable')) {
            const product = products.find(p => p.id === productId);
            if (product) {
                document.getElementById('modal-product-name').textContent = product.name;
                document.getElementById('modal-product-price').textContent = `$${product.price.toFixed(2)} MXN`;
                document.getElementById('modal-product-desc').textContent = product.desc;
                
                const modalProductImage = document.getElementById('modal-product-image');
                modalProductImage.src = product.image; 

                // Lógica del modal para mostrar galería si existe
                const galleryContainer = document.getElementById('modal-thumbnail-gallery');
                if (galleryContainer) { 
                    galleryContainer.innerHTML = ''; // Limpiar galería
                    // Mostrar miniaturas SOLO si hay galería
                    if (product.gallery && product.gallery.length > 1) {
                        product.gallery.forEach((imgSrc, index) => {
                            const img = document.createElement('img');
                            img.src = imgSrc;
                            img.alt = `${product.name} - Vista ${index + 1}`;
                            img.className = `thumbnail ${index === 0 ? 'border-primario' : ''}`;
                            
                            img.addEventListener('click', () => {
                                modalProductImage.src = imgSrc;
                                // Actualizar la miniatura activa
                                galleryContainer.querySelector('.border-primario')?.classList.remove('border-primario');
                                img.classList.add('border-primario');
                            });
                            galleryContainer.appendChild(img);
                        });
                    }
                }

                document.getElementById('modal-add-to-cart-btn').dataset.productId = productId;
                document.getElementById('productDetailModal').classList.add('is-open');
            }
        }
    });
    
    const setupModalCloseEvents = (modalId, onCloseCallback) => {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        modal.querySelector('.close-modal-btn')?.addEventListener('click', () => {
            modal.classList.remove('is-open');
            if (onCloseCallback) onCloseCallback();
        });
        modal.addEventListener('click', e => {
            if (e.target === modal) {
                modal.classList.remove('is-open');
                if (onCloseCallback) onCloseCallback();
            }
        });
    };

    setupModalCloseEvents('productDetailModal'); 
    setupModalCloseEvents('loginModal');
    setupModalCloseEvents('registerModal');
    setupModalCloseEvents('welcomeModal');

    document.getElementById('modal-add-to-cart-btn').addEventListener('click', (e) => {
        addToCart(parseInt(e.target.dataset.productId));
        // Opcional: cerrar el modal al añadir
        // document.getElementById('productDetailModal').classList.remove('is-open');
    });

    // Lógica para abrir/cerrar carrito
    const toggleCart = () => {
        cartSidebar.classList.toggle('translate-x-full');
        cartOverlay.classList.toggle('hidden');
    };
    document.getElementById('cart-button').addEventListener('click', toggleCart);
    document.getElementById('close-cart-btn').addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', toggleCart);
    
    ['loginBtn', 'mobileLoginBtn', 'welcomeLoginBtn'].forEach(id => document.getElementById(id)?.addEventListener('click', () => {
        document.getElementById('welcomeModal').classList.remove('is-open');
        document.getElementById('loginModal').classList.add('is-open');
    }));
    ['registerBtn', 'mobileRegisterBtn', 'welcomeRegisterBtn'].forEach(id => document.getElementById(id)?.addEventListener('click', () => {
        document.getElementById('welcomeModal').classList.remove('is-open');
        document.getElementById('registerModal').classList.add('is-open');
    }));
    
    const mobileMenu = document.getElementById('mobileMenu');
    document.getElementById('mobileMenuBtn').addEventListener('click', () => {
        mobileMenu.classList.toggle('opacity-0');
        mobileMenu.classList.toggle('-translate-y-4');
        mobileMenu.classList.toggle('pointer-events-none');
    });
    mobileMenu.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') {
            mobileMenu.classList.add('opacity-0', '-translate-y-4', 'pointer-events-none');
        }
    });
    
    // --- Lógica de Formulario de Registro y Login ---
    const validateField = (field) => {
        const errorMsg = field.parentElement.querySelector('.error-message');
        if (!errorMsg) return true; // Si no hay mensaje de error, no validamos
        
        let isValid = true;
        if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
            isValid = false;
        }
        if (field.type === 'password' && field.value.length < (field.minLength || 6)) {
            isValid = false;
        }
        if (field.required && field.value.trim() === '') {
            isValid = false;
        }
        
        if (!isValid) {
            field.classList.add('invalid');
            errorMsg.style.display = 'block';
        } else {
            field.classList.remove('invalid');
            errorMsg.style.display = 'none';
        }
        return isValid;
    };
    
    const validateForm = (form) => {
        let isValid = true;
        form.querySelectorAll('input[required]').forEach(input => {
            if (!validateField(input)) isValid = false;
        });
        return isValid;
    };
    
    document.querySelectorAll('.form-input[required]').forEach(input => {
        input.addEventListener('input', () => validateField(input));
    });
    
    // Formulario de Contacto
    document.getElementById('contact-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validateForm(e.target)) {
            showNotification('Por favor corrige los errores en el formulario.', 'error');
            return;
        }
        // Aquí iría la lógica de envío (p.ej. Formspree)
        showNotification('¡Mensaje enviado con éxito! (Simulación)', 'success');
        e.target.reset();
    });


    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        if (!auth || !validateForm(e.target)) return;
        const email = e.target.email.value;
        const password = e.target.password.value;
        auth.signInWithEmailAndPassword(email, password)
            .then(userCredential => {
                document.getElementById('loginModal').classList.remove('is-open');
                showNotification('¡Bienvenido de vuelta!', 'success');
            })
            .catch(error => {
                showNotification(error.message, 'error');
            });
    });

    document.getElementById('register-form').addEventListener('submit', (e) => {
        e.preventDefault();
        if (!auth || !validateForm(e.target)) return;
        const email = e.target.email.value;
        const password = e.target.password.value;
        auth.createUserWithEmailAndPassword(email, password)
            .then(userCredential => {
                document.getElementById('registerModal').classList.remove('is-open');
                showNotification('¡Cuenta creada con éxito!', 'success');
            })
            .catch(error => {
                showNotification(error.message, 'error');
            });
    });

    const logout = () => {
        if (!auth) return;
        auth.signOut().then(() => {
            showNotification('Has cerrado sesión.', 'success');
        });
    };
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('mobileLogoutBtn').addEventListener('click', logout);

    // --- Lógica del Carrusel de Testimonios ---
    const initializeTestimonialSlider = () => {
        const slider = document.querySelector('.testimonial-slider');
        const slides = document.querySelectorAll('.testimonial-slide');
        const nextBtn = document.getElementById('testimonial-next');
        const prevBtn = document.getElementById('testimonial-prev');
        
        if (!slider || !slides.length || !nextBtn || !prevBtn) return; // No ejecutar si faltan elementos

        let currentSlide = 0;
        const totalSlides = slides.length;

        const updateSlider = () => {
            slider.style.transform = `translateX(-${currentSlide * 100}%)`;
            // Deshabilitar botones en los extremos
            prevBtn.disabled = currentSlide === 0;
            nextBtn.disabled = currentSlide === totalSlides - 1;
            prevBtn.style.opacity = currentSlide === 0 ? '0.3' : '1';
            nextBtn.style.opacity = currentSlide === totalSlides - 1 ? '0.3' : '1';
        };

        nextBtn.addEventListener('click', () => {
            if (currentSlide < totalSlides - 1) {
                currentSlide++;
                updateSlider();
            }
        });

        prevBtn.addEventListener('click', () => {
            if (currentSlide > 0) {
                currentSlide--;
                updateSlider();
            }
        });

        updateSlider(); // Estado inicial
    };
    // --- Fin Lógica de Testimonios ---

    // --- Renderizado Inicial ---
    renderProducts();
    updateCart();
    initializeTestimonialSlider(); // Iniciar el nuevo carrusel
    
    // Iniciar el carrusel del Hero
    if (heroImages.length > 0) {
        // Ruta relativa al index.html
        heroBg1.style.backgroundImage = `url('${heroImages[heroImages.length - 1]}')`;
        heroBg2.style.backgroundImage = `url('${heroImages[0]}')`;
        heroBg2.classList.add('active');
        activeHeroBg = heroBg2;
        setInterval(changeHeroImage, 5000); // Rotar cada 5 segundos
    }
    
    // Quitar el preloader
    window.addEventListener('load', () => {
        document.getElementById('preloader').classList.add('loaded');
        document.body.classList.remove('loading');
        
        // --- CORREGIDO: Lógica del modal movida a updateAuthUI ---
    });
    
    // Observador de scroll para animaciones
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

};

// Iniciar la aplicación
initializeMainApp();

