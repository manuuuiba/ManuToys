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
};

// Observador de estado de Auth
if (auth) {
    auth.onAuthStateChanged(updateAuthUI);
}


// Main App Initialization Logic
const initializeMainApp = () => {
    
    // --- DATOS DE MANUTOYS (ACTUALIZADOS) ---
    const products = [
        // --- Hot Wheels Normales (3) ---
        { 
            id: 1, 
            name: 'Hot Wheels Datsun 240z', 
            price: 80, 
            image: 'images/Hot Wheels Datsun 240z.PNG', 
            desc: 'Un clásico JDM (Mercado Doméstico Japonés) que captura la esencia de las carreras de los 70. Este Datsun 240z en rojo vibrante es una pieza esencial para cualquier garage.', 
            tags: ['normal']
        },
        { 
            id: 2, 
            name: 'Hot Wheels Porsche 911 GT3 RS', 
            price: 80, 
            image: 'images/Hot Wheels Porsche 911 GT3 RS.PNG', 
            desc: 'La leyenda de las pistas alemanas. Este Porsche 911 GT3 RS presenta detalles realistas y un diseño aerodinámico listo para la velocidad. ¡Imprescindible!', 
            tags: ['normal']
        },
        { 
            id: 3, 
            name: 'Williams Racing F1', 
            price: 80, 
            image: 'images/Hot Wheels Williams Racing.PNG', 
            desc: 'Listo para cualquier terreno. El Williams Racing F1 es un coche de carreras diseñado para la velocidad, con detalles que capturan su espíritu competitivo.', 
            tags: ['normal']
        },
        // --- Hot Wheels Premium (3) ---
        { 
            id: 4, 
            name: 'Hot Wheels Premium McLaren F1 #81', 
            price: 400, 
            image: 'images/Hot Wheels PremiumMcLaren F1.PNG', 
            desc: 'El coche que dominó la Fórmula 1. Este modelo Premium del McLaren F1 #81 viene con detalles de alta calidad y llantas Real Riders.', 
            tags: ['premium']
        },
        { 
            id: 5, 
            name: 'Hot Wheels Premium Kick Sauber F1 #77', 
            price: 400, 
            image: 'images/Hot Wheels Premium Kick Sauber F1.PNG', 
            desc: 'El bólido de Bottas. La réplica Premium del Kick Sauber F1, con su icónico diseño y la precisión que todo coleccionista de F1 busca.', 
            tags: ['premium']
        },
        { 
            id: 6, 
            name: 'Hot Wheels Premium Williams Racing #43', 
            price: 400, 
            image: 'images/Hot Wheels Premium Williams Racing.PNG', 
            desc: 'La pasión de un legado en tu colección. Este Williams Racing #43 Premium rinde homenaje al icónico equipo, con acabados metálicos y neumáticos de goma.', 
            tags: ['premium']
        },
    ];

    const heroImages = [
        'images/Head1.PNG',
        'images/Head2.PNG',
        'images/Head3.PNG',
        'images/Head4.PNG',
        'images/Head5.PNG'
    ];
    // --- FIN DE DATOS DE MANUTOYS ---

    // --- ¡CARRITO ACTIVADO! ---
    let cart = []; 

    // --- Core App Logic ---
    const productGrid = document.getElementById('product-grid');
    // Elementos del carrito
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
        content.className = `text-white font-bold rounded-lg shadow-lg px-6 py-4 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`;
        notification.classList.add('show');
        setTimeout(() => notification.classList.remove('show'), 3000);
    };

    // --- FUNCIONES DEL CARRITO (ACTIVADAS) ---
    const updateCart = () => {
        if (!cartItemsContainer) return; // Chequeo de seguridad

        cartItemsContainer.innerHTML = ''; // Limpiar el carrito
        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block';
        } else {
            emptyCartMessage.style.display = 'none';
            cart.forEach(item => {
                // Añadir cada item al HTML del carrito
                cartItemsContainer.innerHTML += `
                    <div class="flex items-center gap-4 mb-4" data-id="${item.id}">
                        <img src="${item.image}" alt="${item.name}" class="w-20 h-20 rounded-md object-contain p-1 bg-white/10">
                        <div class="flex-grow">
                            <p class="font-bold text-white">${item.name}</p>
                            <p class="text-sm text-gray-400">$${item.price.toFixed(2)} x ${item.quantity}</p>
                        </div>
                        <button class="remove-from-cart-btn text-red-500 hover:text-red-400 text-2xl" data-id="${item.id}">&times;</button>
                    </div>
                `;
            });
        }
        
        // Actualizar contadores y subtotal
        cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
        // CORREGIDO: Añadir MXN al subtotal
        cartSubtotal.textContent = `$${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)} MXN`;
    };

    const addToCart = (productId) => {
        const product = products.find(p => p.id === productId);
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity++; // Si ya está, sumar 1
        } else {
            cart.push({ ...product, quantity: 1 }); // Si no, añadirlo al carrito
        }
        updateCart(); // Actualizar la UI
        showNotification(`${product.name} añadido al carrito.`, 'success');
    };
    
    const removeFromCart = (productId) => {
        const itemIndex = cart.findIndex(item => item.id === productId);
        if (itemIndex === -1) return;

        const item = cart[itemIndex];
        if (item.quantity > 1) {
            item.quantity--; // Si hay más de 1, restar 1
        } else {
            cart.splice(itemIndex, 1); // Si solo hay 1, quitarlo del array
        }
        updateCart(); // Actualizar la UI
    };
    // --- FIN FUNCIONES DEL CARRITO ---
    

    const setupProductCardHover = () => {
        // Esta función ya no hace nada
    };

    const renderProducts = (filter = 'all') => {
        if (!productGrid) return; // Chequeo de seguridad
        productGrid.innerHTML = '';
        products.filter(p => filter === 'all' || p.tags.includes(filter)).forEach(product => {
            // CORREGIDO: Añadir MXN al precio
            productGrid.innerHTML += `
                <div class="product-card bg-stone-900/50 border border-white/5 rounded-lg shadow-lg overflow-hidden group" data-id="${product.id}">
                    <div class="product-card-clickable w-full">
                        <img src="${product.image}" alt="${product.name}" class="w-full h-72 object-contain p-4">
                        <div class="p-6">
                            <h4 class="text-xl font-bold text-white mb-2 font-display">${product.name}</h4>
                            <p class="text-gray-400 mb-4 text-sm">${product.desc.substring(0, 100)}...</p>
                        </div>
                    </div>
                    <div class="p-6 pt-0 mt-auto flex justify-between items-center w-full">
                        <p class="text-2xl font-semibold text-secundario">$${product.price.toFixed(2)} MXN</p>
                        <button class="add-to-cart-btn bg-primario hover:bg-primario-hover text-white font-bold py-2 px-4 rounded-lg transition-colors">Añadir</button>
                    </div>
                </div>
            `;
        });
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
    window.addEventListener('scroll', () => {
        if(scrollToTopBtn) scrollToTopBtn.classList.toggle('visible', window.scrollY > 300);
    });
    scrollToTopBtn?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.getElementById('filters')?.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-button')) {
            document.querySelector('.filter-button.active')?.classList.remove('active', 'bg-primario');
            e.target.classList.add('active', 'bg-primario');
            renderProducts(e.target.dataset.filter);
        }
    });

    productGrid?.addEventListener('click', e => {
        const card = e.target.closest('.product-card');
        if (!card) return;
        const productId = parseInt(card.dataset.id);
        if (e.target.closest('.add-to-cart-btn')) {
            addToCart(productId);
        } else if (e.target.closest('.product-card-clickable')) {
            const product = products.find(p => p.id === productId);
            if (product) {
                document.getElementById('modal-product-name').textContent = product.name;
                // CORREGIDO: Añadir MXN al precio del modal
                document.getElementById('modal-product-price').textContent = `$${product.price.toFixed(2)} MXN`;
                document.getElementById('modal-product-desc').textContent = product.desc;
                
                const modalProductImage = document.getElementById('modal-product-image');
                modalProductImage.src = product.image; // Solo ponemos la imagen principal
                
                const galleryContainer = document.getElementById('modal-thumbnail-gallery');
                galleryContainer.innerHTML = ''; // Limpiamos por si acaso

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

    document.getElementById('modal-add-to-cart-btn')?.addEventListener('click', (e) => {
        addToCart(parseInt(e.target.dataset.productId));
        // No cerramos el modal, solo mostramos notificación
    });

    // --- LÓGICA PARA ABRIR/CERRAR Y ELIMINAR DEL CARRITO ---
    const toggleCart = () => {
        if (cartSidebar) cartSidebar.classList.toggle('is-open');
        if (cartOverlay) cartOverlay.classList.toggle('hidden');
    };
    
    document.getElementById('cart-button')?.addEventListener('click', toggleCart);
    document.getElementById('close-cart-btn')?.addEventListener('click', toggleCart);
    cartOverlay?.addEventListener('click', toggleCart);

    // Event listener para el botón de eliminar en el carrito
    cartItemsContainer?.addEventListener('click', e => {
        if (e.target.classList.contains('remove-from-cart-btn')) {
            const productId = parseInt(e.target.dataset.id);
            removeFromCart(productId);
        }
    });
    // --- FIN LÓGICA DEL CARRITO ---

    
    ['loginBtn', 'mobileLoginBtn', 'welcomeLoginBtn'].forEach(id => document.getElementById(id)?.addEventListener('click', () => {
        document.getElementById('welcomeModal')?.classList.remove('is-open');
        document.getElementById('loginModal')?.classList.add('is-open');
    }));
    ['registerBtn', 'mobileRegisterBtn', 'welcomeRegisterBtn'].forEach(id => document.getElementById(id)?.addEventListener('click', () => {
        document.getElementById('welcomeModal')?.classList.remove('is-open');
        document.getElementById('registerModal')?.classList.add('is-open');
    }));
    
    const mobileMenu = document.getElementById('mobileMenu');
    document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
        mobileMenu.classList.toggle('opacity-0');
        mobileMenu.classList.toggle('-translate-y-4');
        mobileMenu.classList.toggle('pointer-events-none');
    });
    mobileMenu?.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') {
            mobileMenu.classList.add('opacity-0', '-translate-y-4', 'pointer-events-none');
        }
    });
    
    // --- Lógica de Formulario de Registro y Login ---
    const validateField = (field) => {
        const errorMsg = field.parentElement.querySelector('.error-message');
        let isValid = true;
        if (!field) return false; // Protección por si el campo no existe

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
            if(errorMsg) errorMsg.style.display = 'block';
        } else {
            field.classList.remove('invalid');
            if(errorMsg) errorMsg.style.display = 'none';
        }
        return isValid;
    };
    
    const validateForm = (form) => {
        let isValid = true;
        if (!form) return false; // Protección
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


    document.getElementById('login-form')?.addEventListener('submit', (e) => {
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

    document.getElementById('register-form')?.addEventListener('submit', (e) => {
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
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    document.getElementById('mobileLogoutBtn')?.addEventListener('click', logout);

    // --- Renderizado Inicial ---
    renderProducts();
    updateCart(); // Llamar a updateCart al inicio para que muestre "Carrito vacío"
    
    // Iniciar el carrusel del Hero
    if (heroImages.length > 0 && heroBg1 && heroBg2) {
        // Ruta relativa al index.html
        heroBg1.style.backgroundImage = `url('${heroImages[heroImages.length - 1]}')`;
        heroBg2.style.backgroundImage = `url('${heroImages[0]}')`;
        heroBg2.classList.add('active');
        activeHeroBg = heroBg2;
        setInterval(changeHeroImage, 5000); // Rotar cada 5 segundos
    }
    
    // Quitar el preloader
    window.addEventListener('load', () => {
        const preloader = document.getElementById('preloader');
        if(preloader) preloader.classList.add('loaded');
        document.body.classList.remove('loading');
        
        // Mostrar modal de bienvenida después de un retraso
        if (auth && auth.currentUser && auth.currentUser.isAnonymous) {
            setTimeout(() => {
                document.getElementById('welcomeModal')?.classList.add('is-open');
            }, 2000);
        }
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

