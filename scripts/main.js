jQuery.noConflict();
(function($) {
    'use strict';

    /**
     * Кэшированные DOM элементы и часто используемые значения
     * Cached DOM elements and frequently used values
     */
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const $document = $(document);
    const $window = $(window);

    /**
     * Инициализация слайдера с оптимизированными настройками
     * Slider initialization with optimized settings
     */
    function initSlider() {
        const $slider = $('#slider');
        
        if (!$slider.length) return;

        const slickConfig = {
            adaptiveHeight: true,
            autoplay: true,
            autoplaySpeed: 5000,
            arrows: $window.width() > 768,
            fade: true,
            dots: false,
            infinite: true,
            speed: 500,
            cssEase: 'linear',
            pauseOnHover: true,
            lazyLoad: 'ondemand',
            responsive: [{
                breakpoint: 768,
                settings: {
                    arrows: false,
                    dots: false
                }
            }]
        };

        $slider.slick(slickConfig);

        // Оптимизированный обработчик изменения размера окна
        // Optimized window resize handler
        const debouncedResize = debounce(() => {
            const width = $window.width();
            $slider.slick('setPosition');
            $slider.slick('slickSetOption', 'arrows', width > 768, true);
        }, 250);

        $window.on('resize', debouncedResize);
    }

    /**
     * Улучшенная инициализация выпадающего меню
     * Enhanced dropdown menu initialization
     */
    function initHeaderSubmenu() {
        const menuItems = document.querySelectorAll('.header-item');
        if (!menuItems.length) return;

        const closeAllSubmenus = () => {
            menuItems.forEach(item => {
                const subList = item.querySelector('.sub-list');
                const link = item.querySelector('a');
                if (!subList || !link) return;
                
                item.classList.remove('active');
                subList.classList.remove('active');
                link.setAttribute('aria-expanded', 'false');
            });
        };

        menuItems.forEach(item => {
            const subList = item.querySelector('.sub-list');
            const link = item.querySelector('a');
            if (!subList || !link) return;

            setupMenuItemAccessibility(item, link);
            
            isTouchDevice ? 
                initTouchBehavior(item, link, subList, closeAllSubmenus) :
                initDesktopBehavior(item, link, subList, closeAllSubmenus);
        });
    }

    /**
     * Настройка доступности для пунктов меню
     * Setup accessibility for menu items
     */
    function setupMenuItemAccessibility(item, link) {
        item.classList.add('has-submenu');
        link.setAttribute('aria-expanded', 'false');
        link.setAttribute('aria-haspopup', 'true');
    }

    /**
     * Оптимизированное поведение для сенсорных устройств
     * Optimized touch device behavior
     */
    function initTouchBehavior(item, link, subList, closeAllSubmenus) {
        const handleClick = (e) => {
            e.preventDefault();
            
            const isActive = item.classList.contains('active');
            const href = link.getAttribute('href');

            if (!isActive) {
                closeAllSubmenus();
                item.classList.add('active');
                subList.classList.add('active');
                link.setAttribute('aria-expanded', 'true');
            } else if (href) {
                window.location.href = href;
            }
        };

        link.addEventListener('click', handleClick);

        // Оптимизированное закрытие при клике вне меню
        document.addEventListener('touchstart', (e) => {
            if (!item.contains(e.target)) {
                item.classList.remove('active');
                subList.classList.remove('active');
                link.setAttribute('aria-expanded', 'false');
            }
        }, { passive: true });
    }

    /**
     * Оптимизированное поведение для десктопов
     * Optimized desktop behavior
     */
    function initDesktopBehavior(item, link, subList, closeAllSubmenus) {
        let timeout;

        const openSubmenu = () => {
            clearTimeout(timeout);
            closeAllSubmenus();
            item.classList.add('active');
            subList.classList.add('active');
            link.setAttribute('aria-expanded', 'true');
        };

        const closeSubmenu = () => {
            timeout = setTimeout(() => {
                item.classList.remove('active');
                subList.classList.remove('active');
                link.setAttribute('aria-expanded', 'false');
            }, 150);
        };

        item.addEventListener('mouseenter', openSubmenu);
        item.addEventListener('mouseleave', closeSubmenu);
    }

    /**
     * Улучшенная инициализация табов с контентом
     * Enhanced content tabs initialization
     */
    function initContentTabs() {
        const container = document.querySelector('.content-tabs');
        const buttonsContainer = container?.querySelector('.tabs-buttons');
        
        if (!container || !buttonsContainer) {
            console.warn("Контейнеры табов не найдены / Tab containers not found");
            return;
        }

        const tabContents = container.querySelectorAll('.tab-content');
        const allNewsCards = Array.from(container.querySelectorAll('.card-news'));
        const newsCache = new Map(); // Кэш для отфильтрованных новостей

        function filterAndSortNews(category) {
            if (newsCache.has(category)) {
                return newsCache.get(category);
            }

            const filteredNews = category === 'all' ?
                allNewsCards :
                allNewsCards.filter(news => news.dataset.category === category);

            const sortedNews = filteredNews
                .sort((a, b) => new Date(b.dataset.date || '') - new Date(a.dataset.date || ''))
                .slice(0, 6);

            newsCache.set(category, sortedNews);
            return sortedNews;
        }

        function updateNewsDisplay(category, targetTabId) {
            const targetContent = container.querySelector(`.tab-content[data-tab="${targetTabId}"]`);
            if (!targetContent) return;

            tabContents.forEach(content => content.classList.add('hidden'));
            targetContent.classList.remove('hidden');

            const filteredNews = filterAndSortNews(category);
            
            targetContent.innerHTML = filteredNews.length ?
                filteredNews.map(news => news.outerHTML).join('') :
                '<div class="no-news">В данной категории новостей нет</div>';
        }

        // Делегирование событий для кнопок табов
        buttonsContainer.addEventListener('click', (e) => {
            const button = e.target.closest('.tab-button');
            if (!button) return;

            const { category, tab: tabId } = button.dataset;
            if (!category || !tabId) return;

            buttonsContainer.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });
            
            button.classList.add('active');
            button.setAttribute('aria-selected', 'true');

            updateNewsDisplay(category, tabId);
        });

        // Инициализация с дефолтной категорией
        const defaultButton = buttonsContainer.querySelector('.tab-button[data-category="all"]');
        if (defaultButton) {
            defaultButton.classList.add('active');
            defaultButton.setAttribute('aria-selected', 'true');
            updateNewsDisplay('all', defaultButton.dataset.tab);
        }
    }

    /**
     * Оптимизированная инициализация подменю футера
     * Optimized footer submenu initialization
     */
    function initFooterSubmenu() {
        const footerItems = document.querySelectorAll('.footer-item');
        if (!footerItems.length) return;

        const closeAllSubmenus = () => {
            footerItems.forEach(item => {
                const subList = item.querySelector('.footer-sublist');
                const link = item.querySelector('a');
                if (!subList || !link) return;
                
                item.classList.remove('active');
                subList.classList.remove('active');
                link.setAttribute('aria-expanded', 'false');
            });
        };

        footerItems.forEach(item => {
            const subList = item.querySelector('.footer-sublist');
            const link = item.querySelector('a');
            if (!subList || !link) return;

            setupMenuItemAccessibility(item, link);

            isTouchDevice ?
                initTouchBehavior(item, link, subList, closeAllSubmenus) :
                initDesktopBehavior(item, link, subList, closeAllSubmenus);
        });
    }

    /**
     * Оптимизированная функция debounce
     * Optimized debounce function
     */
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    /**
     * Инициализация всех компонентов при загрузке DOM
     * Initialize all components on DOM load
     */
    $document.ready(() => {
        if (isTouchDevice) {
            document.documentElement.classList.add('touch-device');
        }

        initSlider();
        initHeaderSubmenu();
        initContentTabs();
        initFooterSubmenu();
        initAccordion();
        initSmoothScroll();
        initLazyLoading();
        initShareButtons();
        initReadingTime();
    });

    /**
     * Инициализация аккордеона
     * Accordion initialization
     */
    function initAccordion() {
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', function() {
                const content = this.nextElementSibling;
                const parent = this.parentElement;
                
                parent.classList.toggle('active');
                content.style.maxHeight = parent.classList.contains('active') ?
                    `${content.scrollHeight}px` : null;
            });
        });
    }

    /**
     * Инициализация плавной прокрутки
     * Smooth scroll initialization
     */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    /**
     * Инициализация ленивой загрузки изображений
     * Lazy loading initialization
     */
    function initLazyLoading() {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                }
                img.classList.add('fade-in');
                observer.unobserve(img);
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px 50px 0px'
        });

        document.querySelectorAll('.content-body img').forEach(img => {
            imageObserver.observe(img);
        });
    }

    /**
     * Инициализация кнопок шаринга
     * Share buttons initialization
     */
    function initShareButtons() {
        window.sharePost = function(platform) {
            const url = encodeURIComponent(window.location.href);
            const title = encodeURIComponent(document.title);
            
            const shareUrls = {
                twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
                facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`
            };
            
            if (shareUrls[platform]) {
                window.open(shareUrls[platform], '_blank', 'width=600,height=400');
            }
        };
    }

    /**
     * Инициализация оценки времени чтения
     * Reading time estimation initialization
     */
    function initReadingTime() {
        const content = document.querySelector('.content-body');
        const readingTimeElement = document.querySelector('.reading-time');
        
        if (!content || !readingTimeElement) return;
        
        const words = content.textContent.trim().split(/\s+/).length;
        const readingTime = Math.ceil(words / 150);
        readingTimeElement.textContent = `${readingTime} мин.`;
    }

})(jQuery);