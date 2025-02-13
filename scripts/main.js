jQuery.noConflict();
(function($) {

    /**
     * Инициализация слайдера
     * Slider initialization
     */
    function initSlider() {
        const $slider = $('#slider');
        const $window = $(window);
        
        if ($slider.length) {
            $slider.slick({
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
                responsive: [
                    {
                        breakpoint: 768,
                        settings: {
                            arrows: false,
                            dots: true
                        }
                    }
                ]
            });

            $window.on('resize', function() {
                $slider.slick('setPosition');
                $slider.slick('slickSetOption', 'arrows', $window.width() > 768, true);
            });
        }
    }

    /**
     * Инициализация выпадающего меню
     * Dropdown menu initialization
     */
    function initHeaderSubmenu() {
        const menuItems = document.querySelectorAll('.header-item');
        const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        
        // Оптимизация: Проверяем наличие элементов меню
        if (!menuItems.length) return;

        /**
         * Закрытие всех открытых подменю
         * Close all open submenus
         */
        const closeAllSubmenus = () => {
            menuItems.forEach(item => {
                const subList = item.querySelector('.sub-list');
                const link = item.querySelector('a');
                if (subList && link) {
                    item.classList.remove('active');
                    subList.classList.remove('active');
                    link.setAttribute('aria-expanded', 'false');
                }
            });
        };

        /**
         * Инициализация каждого пункта меню
         * Initialize each menu item
         */
        menuItems.forEach(item => {
            const subList = item.querySelector('.sub-list');
            if (!subList) return; // Пропускаем элементы без подменю

            const link = item.querySelector('a');
            if (!link) return; // Проверка наличия ссылки

            // Добавляем необходимые атрибуты доступности
            item.classList.add('has-submenu');
            link.setAttribute('aria-expanded', 'false');
            link.setAttribute('aria-haspopup', 'true');
            
            if (isTouchDevice) {
                initTouchBehavior(item, link, subList, closeAllSubmenus);
            } else {
                initDesktopBehavior(item, link, subList, closeAllSubmenus);
            }
        });
    }

    /**
     * Инициализация поведения для сенсорных устройств
     * Initialize touch device behavior
     */
    function initTouchBehavior(item, link, subList, closeAllSubmenus) {
        // Обработчик клика по ссылке
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (!item.classList.contains('active')) {
                closeAllSubmenus();
                item.classList.add('active');
                subList.classList.add('active');
                link.setAttribute('aria-expanded', 'true');
            } else if (link.getAttribute('href')) {
                window.location.href = link.getAttribute('href');
            }
        });

        // Закрытие при клике вне меню
        document.addEventListener('touchstart', (e) => {
            if (!item.contains(e.target)) {
                item.classList.remove('active');
                subList.classList.remove('active');
                link.setAttribute('aria-expanded', 'false');
            }
        }, { passive: true }); // Оптимизация производительности
    }

    /**
     * Инициализация поведения для десктопов
     * Initialize desktop behavior
     */
    function initDesktopBehavior(item, link, subList, closeAllSubmenus) {
        let timeout;

        const openSubmenu = () => {
            if (timeout) clearTimeout(timeout);
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
     * Инициализация табов с контентом
     * Content tabs initialization
     */
    function initContentTabs() {
        const container = document.querySelector('.content-tabs');
        if (!container) {
            console.error("Контейнер '.content-tabs' не найден");
            return;
        }

        const buttonsContainer = container.querySelector('.tabs-buttons');
        if (!buttonsContainer) {
            console.error("Контейнер '.tabs-buttons' не найден");
            return;
        }

        // Получаем все контейнеры с контентом
        const tabContents = container.querySelectorAll('.tab-content');
        
        // Сохраняем все новости при инициализации
        const allNewsCards = Array.from(container.querySelectorAll('.card-news'));

        // Функция для фильтрации и сортировки новостей
        function filterAndSortNews(category) {
            // Фильтруем новости по категории
            const filteredNews = category === 'all' 
                ? allNewsCards // Для "all" берем все новости
                : allNewsCards.filter(news => news.dataset.category === category);

            // Сортируем по дате и ограничиваем до 6 новостей
            return filteredNews
                .sort((a, b) => {
                    const dateA = new Date(a.dataset.date || '');
                    const dateB = new Date(b.dataset.date || '');
                    return dateB - dateA;
                })
                .slice(0, 6);
        }

        // Функция обновления отображения
        function updateNewsDisplay(category, targetTabId) {
            // Скрываем все контейнеры контента
            tabContents.forEach(content => {
                content.classList.add('hidden');
            });

            // Показываем нужный контейнер
            const targetContent = container.querySelector(`.tab-content[data-tab="${targetTabId}"]`);
            if (!targetContent) return;
            
            targetContent.classList.remove('hidden');

            // Получаем отфильтрованные новости
            const filteredNews = filterAndSortNews(category);

            // Очищаем контейнер
            targetContent.innerHTML = '';

            if (filteredNews.length === 0) {
                targetContent.innerHTML = '<div class="no-news">В данной категории новостей нет</div>';
                return;
            }

            // Добавляем отфильтрованные новости
            filteredNews.forEach(news => {
                targetContent.appendChild(news.cloneNode(true));
            });
        }

        // Обработчик клика по кнопкам
        buttonsContainer.addEventListener('click', function(e) {
            const button = e.target.closest('.tab-button');
            if (!button) return;

            const category = button.dataset.category;
            const tabId = button.dataset.tab;
            
            if (!category || !tabId) {
                console.error('У кнопки отсутствует необходимый атрибут');
                return;
            }

            // Обновляем активные классы
            buttonsContainer.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });
            
            button.classList.add('active');
            button.setAttribute('aria-selected', 'true');

            // Обновляем отображение
            updateNewsDisplay(category, tabId);
        });

        // Инициализация: показываем все новости
        const defaultButton = buttonsContainer.querySelector('.tab-button[data-category="all"]');
        if (defaultButton) {
            defaultButton.classList.add('active');
            defaultButton.setAttribute('aria-selected', 'true');
            updateNewsDisplay('all', defaultButton.dataset.tab);
        }
    }

    /**
     * Инициализация выпадающего меню в футере
     * Footer dropdown menu initialization
     */
    function initFooterSubmenu() {
        const footerItems = document.querySelectorAll('.footer-item');
        const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

        if (!footerItems.length) return;

        const closeAllSubmenus = () => {
            footerItems.forEach(item => {
                const subList = item.querySelector('.footer-sublist');
                const link = item.querySelector('a');
                if (subList && link) {
                    item.classList.remove('active');
                    subList.classList.remove('active');
                    link.setAttribute('aria-expanded', 'false');
                }
            });
        };

        footerItems.forEach(item => {
            const subList = item.querySelector('.footer-sublist');
            if (!subList) return;

            const link = item.querySelector('a');
            if (!link) return;

            item.classList.add('has-submenu');
            link.setAttribute('aria-expanded', 'false');
            link.setAttribute('aria-haspopup', 'true');

            if (isTouchDevice) {
                // Обработчик для мобильных устройств
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    if (!item.classList.contains('active')) {
                        closeAllSubmenus();
                        item.classList.add('active');
                        subList.classList.add('active');
                        link.setAttribute('aria-expanded', 'true');
                    } else if (link.getAttribute('href')) {
                        window.location.href = link.getAttribute('href');
                    }
                });
            } else {
                // Обработчик для десктопа
                let timeout;

                const openSubmenu = () => {
                    if (timeout) clearTimeout(timeout);
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
        });

        // Закрытие при клике вне меню на мобильных
        if (isTouchDevice) {
            document.addEventListener('touchstart', (e) => {
                const clickedItem = e.target.closest('.footer-item');
                if (!clickedItem) {
                    closeAllSubmenus();
                }
            }, { passive: true });
        }
    }

    // Инициализация при загрузке DOM
    $(document).ready(function() {
        initSlider();
        if (('ontouchstart' in window) || (navigator.maxTouchPoints > 0)) {
            document.documentElement.classList.add('touch-device');
        }
        initHeaderSubmenu();
        initContentTabs();
        initFooterSubmenu();
    });

    // Accordion functionality
    //Функциональность аккордиона
    document.addEventListener('DOMContentLoaded', function() {
        const accordions = document.querySelectorAll('.accordion-header');
        
        accordions.forEach(accordion => {
            accordion.addEventListener('click', function() {
                const content = this.nextElementSibling;
                const parent = this.parentElement;
                
                parent.classList.toggle('active');
                
                if (parent.classList.contains('active')) {
                    content.style.maxHeight = content.scrollHeight + 'px';
                } else {
                    content.style.maxHeight = null;
                }
            });
        });
    });

    // Smooth scroll for breadcrumbs
    //Плавная прокрутка для хлебных крошек
    document.querySelectorAll('.breadcrumb a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href !== '#') {
                window.location.href = href;
            }
        });
    });

    // Image lazy loading
    //Загрузка изображений
    document.addEventListener('DOMContentLoaded', function() {
        const images = document.querySelectorAll('.content-body img');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('fade-in');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    });

    // Post Image Lazy Loading
    //Загрузка изображений постов
    // Этот код реализует ленивую загрузку изображений в постах.
    // Когда пользователь прокручивает страницу и изображение попадает в область видимости,
    // оно загружается с помощью IntersectionObserver API.
    // Это улучшает производительность страницы, так как изображения загружаются только когда они нужны.
    document.addEventListener('DOMContentLoaded', function() {
        // Находим все изображения в постах
        const postImages = document.querySelectorAll('.content-body img');
        
        // Настройки для IntersectionObserver:
        // threshold: 0.1 - изображение начнет загружаться когда 10% его видно
        // rootMargin: добавляет 50px снизу области наблюдения для предварительной загрузки
        const imageOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px 50px 0px'
        };

        // Создаем IntersectionObserver для отслеживания видимости изображений
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    // Если у изображения есть data-src атрибут, загружаем его
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                    }
                    // Прекращаем наблюдение после загрузки
                    observer.unobserve(img);
                }
            });
        }, imageOptions);

        // Начинаем наблюдение за каждым изображением
        postImages.forEach(img => imageObserver.observe(img));
    });

    // Share Buttons Functionality
    //Функциональность кнопок для соцсетей
    function sharePost(platform) {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(document.title);
        
        let shareUrl;
        
        switch(platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                break;
        }
        
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }

    // Smooth Scroll for Anchor Links
    //Плавная прокрутка якорных ссылок
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

    // Reading Time Estimate
    //Оценка времени на чтение 
    function calculateReadingTime() {
        const content = document.querySelector('.content-body');
        if (!content) return;
        
        const words = content.textContent.trim().split(/\s+/).length;
        const readingTime = Math.ceil(words / 150); // 150 слов в  минуту
        
        const readingTimeElement = document.querySelector('.reading-time');
        if (readingTimeElement) {
            readingTimeElement.textContent = `${readingTime} мин.`;
        }
    }

    // Initialize reading time calculation
    document.addEventListener('DOMContentLoaded', calculateReadingTime);

    document.addEventListener('DOMContentLoaded', function() {
        // Initialize toggle buttons
        const toggleButtons = document.querySelectorAll('.toggle-replies-btn');
        
        toggleButtons.forEach(button => {
            // Only show toggle button if there are replies
            const repliesContainer = button.closest('.comment').querySelector('.comment-replies');
            if (repliesContainer && repliesContainer.children.length > 0) {
                button.style.display = 'flex';
                
                button.addEventListener('click', function() {
                    const comment = this.closest('.comment');
                    const replies = comment.querySelector('.comment-replies');
                    
                    this.classList.toggle('active');
                    replies.classList.toggle('active');
                });
            } else {
                button.style.display = 'none';
            }
        });
    });

})(jQuery);