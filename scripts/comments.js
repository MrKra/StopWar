/**
 * Класс для управления комментариями
 * Comments management class
 */
class CommentsManager {
    constructor() {
        // Инициализация основных элементов
        // Initialize main elements
        this.commentsBlock = document.querySelector('.block-comments');
        this.openReplies = null; // Переменная для отслеживания открытых ответов
        this.init();
    }

    /**
     * Инициализация функционала
     * Initialize functionality
     */
    init() {
        if (!this.commentsBlock) return;
        
        this.setupComments();
        this.setupReplyButtons();
        this.setupReadMoreButtons();
    }

    /**
     * Настройка базового функционала комментариев
     * Setup basic comments functionality
     */
    setupComments() {
        const comments = this.commentsBlock.querySelectorAll('.comment');
        
        comments.forEach(comment => {
            const repliesBtn = comment.querySelector('.replies-btn');
            const replies = comment.querySelectorAll('.comment-replies');
            
            // Показываем кнопку ответов только если есть ответы
            // Show replies button only if there are replies
            if (replies.length > 0) {
                repliesBtn.style.display = 'flex';
                const showRepliesText = repliesBtn.querySelector('.show-replies');
                showRepliesText.textContent = `Показать ${replies.length} ${this.declOfNum(replies.length, ['ответ', 'ответа', 'ответов'])}`;
                
                // Добавляем обработчик клика для кнопки
                repliesBtn.addEventListener('click', () => {
                    this.toggleReplies(comment, repliesBtn);
                });
            } else {
                repliesBtn.style.display = 'none';
            }
        });
    }

    /**
     * Обновление счетчика ответов
     * Update replies counter
     */
    updateRepliesCount(button, count) {
        const showRepliesText = button.querySelector('.show-replies');
        showRepliesText.textContent = `${count} ${this.declOfNum(count, ['ответ', 'ответа', 'ответов'])}`;
    }

    /**
     * Склонение числительных
     * Declension of numerals
     */
    declOfNum(number, titles) {
        const cases = [2, 0, 1, 1, 1, 2];
        return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
    }

    /**
     * Переключение видимости ответов
     * Toggle replies visibility
     */
    toggleReplies(comment, button) {
        const replies = comment.querySelectorAll('.comment-replies');
        const showRepliesText = button.querySelector('.show-replies');
        const isExpanded = button.getAttribute('aria-expanded') === 'true';

        // Закрываем открытые ответы, если они не те же самые
        if (this.openReplies && this.openReplies !== comment) {
            this.openReplies.querySelectorAll('.comment-replies').forEach(reply => {
                reply.style.height = '0';
                reply.style.opacity = '0';
                setTimeout(() => {
                    reply.style.display = 'none';
                }, 300); // Ждем окончания анимации
            });
            this.openReplies = null; // Сбрасываем переменную
        }

        button.setAttribute('aria-expanded', !isExpanded);

        replies.forEach(reply => {
            if (isExpanded) {
                // Скрываем ответы / Hide replies
                reply.style.height = '0';
                reply.style.opacity = '0';
                setTimeout(() => {
                    reply.style.display = 'none';
                }, 300); // Ждем окончания анимации
                showRepliesText.textContent = `Показать ${replies.length} ${this.declOfNum(replies.length, ['ответ', 'ответа', 'ответов'])}`;
            } else {
                // Показываем ответы / Show replies
                reply.style.display = 'block';
                requestAnimationFrame(() => {
                    reply.style.height = `${reply.scrollHeight}px`;
                    reply.style.opacity = '1';
                });
                showRepliesText.textContent = 'Скрыть ответы';
            }
        });

        // Сохраняем ссылку на открытые ответы
        this.openReplies = isExpanded ? null : comment;
    }

    /**
     * Настройка кнопок ответа
     * Setup reply buttons
     */
    setupReplyButtons() {
        const replyButtons = this.commentsBlock.querySelectorAll('.reply-btn');
        let openForm = null; // Переменная для отслеживания открытой формы

        replyButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const commentWrapper = event.target.closest('.comment-wrapper');
                const existingForm = commentWrapper.nextElementSibling; // Проверяем следующий элемент после comment-action
    
                // Закрываем открытую форму, если она не та же самая
                if (openForm && openForm !== existingForm) {
                    openForm.remove(); // Удаляем открытую форму
                    openForm = null; // Сбрасываем переменную
                }
    
                // Проверяем, существует ли уже форма
                if (existingForm && existingForm.classList.contains('reply-form')) {
                    console.log('Форма уже существует, ничего не происходит.'); // Отладочный вывод
                    return; // Если форма существует, выходим из функции
                }
    
                // Если формы нет, создаем новую
                const replyFormHTML = this.createReplyForm();
                commentWrapper.insertAdjacentHTML('afterend', replyFormHTML);
                openForm = commentWrapper.nextElementSibling; // Сохраняем ссылку на открытую форму
            });
        });
    }

    /**
     * Переключение видимости формы ответа
     * Toggle reply form visibility
     */
    toggleReplyForm(form) {
        const isVisible = form.style.display === 'block';
        
        if (isVisible) {
            form.style.opacity = '0';
            form.style.transition = 'opacity 0.3s ease, height 0.3s ease';
            setTimeout(() => {
                form.style.display = 'none';
                form.style.height = '0';
            }, 300);
        } else {
            form.style.display = 'block';
            form.style.height = 'auto';
            const height = form.scrollHeight + 'px';
            form.style.height = '0';
            requestAnimationFrame(() => {
                form.style.transition = 'opacity 0.3s ease, height 0.3s ease';
                form.style.opacity = '1';
                form.style.height = height;
            });
        }
    }

    /**
     * Настройка кнопок "читать полностью"
     * Setup read more buttons
     */
    setupReadMoreButtons() {
        const readMoreButtons = this.commentsBlock.querySelectorAll('.read-complet');
        
        readMoreButtons.forEach(button => {
            const commentText = button.closest('.comment-wrapper').querySelector('.comment-text');
            
            if (commentText.scrollHeight > 100) {
                button.style.display = 'block';
                commentText.classList.add('truncated');
            }
            
            button.addEventListener('click', () => {
                this.toggleReadMore(commentText, button);
            });
        });
    }

    /**
     * Переключение полного текста комментария
     * Toggle full comment text
     */
    toggleReadMore(textElement, button) {
        const isExpanded = textElement.classList.contains('expanded');
        
        if (isExpanded) {
            textElement.classList.remove('expanded');
            button.textContent = 'читать полностью';
        } else {
            textElement.classList.add('expanded');
            button.textContent = 'свернуть';
        }
    }

    createReplyForm() {
        return `
            <form class='reply-form'>
                <div class='reply-form__wrapper'>
                    <div class='reply-form__item'>
                        <input type='text' class='reply-form__input' name='name' placeholder=' ' required>
                        <label class='reply-form__label'>Ваше имя</label>
                    </div>
                    <div class='reply-form__item'>
                        <input type='email' class='reply-form__input' name='email' placeholder=' ' required>
                        <label class='reply-form__label'>Ваш email</label>
                    </div>
                </div>
                <div class='reply-form__item'>
                    <textarea class='reply-form__textarea' name='comment' placeholder=' ' required></textarea>
                    <label class='reply-form__label'>Ваш комментарий</label>
                </div>
                <div class='reply-form__buttons'>
                    <button type='button' class='reply-form__button reply-form__button-cancel'>Отмена</button>
                    <button type='submit' class='reply-form__button reply-form__button-submit'>Ответить</button>
                </div>
            </form>
        `;
    }
}



// Инициализация после загрузки DOM
// Initialize after DOM load
document.addEventListener('DOMContentLoaded', () => {
    new CommentsManager();
});
