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
        this.openForm = null; // Переменная для отслеживания открытой формы
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
                this.updateRepliesCount(repliesBtn, replies.length);
                
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
        showRepliesText.textContent = `Показать ${count} ${this.declOfNum(count, ['ответ', 'ответа', 'ответов'])}`;
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

        if (this.openReplies && this.openReplies !== comment) {
            this.closeReplies(this.openReplies);
        }

        button.setAttribute('aria-expanded', !isExpanded);
        replies.forEach(reply => {
            if (isExpanded) {
                this.closeReply(reply, showRepliesText, replies.length);
            } else {
                this.openReply(reply, showRepliesText);
            }
        });

        this.openReplies = isExpanded ? null : comment;
    }

    closeReplies(comment) {
        comment.querySelectorAll('.comment-replies').forEach(reply => this.closeReply(reply));
    }

    closeReply(reply, showRepliesText, repliesCount) {
        reply.style.height = '0';
        reply.style.opacity = '0';
        setTimeout(() => {
            reply.style.display = 'none';
            if (showRepliesText) {
                this.updateRepliesCount(showRepliesText.parentElement, repliesCount);
            }
        }, 300);
    }

    openReply(reply, showRepliesText) {
        reply.style.display = 'block';
        requestAnimationFrame(() => {
            reply.style.height = `${reply.scrollHeight}px`;
            reply.style.opacity = '1';
        });
        showRepliesText.textContent = 'Скрыть ответы';
    }

    /**
     * Настройка кнопок ответа
     * Setup reply buttons
     */
    setupReplyButtons() {
        this.commentsBlock.addEventListener('click', (event) => {
            if (event.target.classList.contains('reply-btn')) {
                const commentWrapper = event.target.closest('.comment-wrapper');
                const existingForm = commentWrapper.nextElementSibling;

                // Проверяем, существует ли уже форма
                // Check if the form already exists
                if (existingForm && existingForm.classList.contains('reply-form')) {
                    console.log('Форма уже существует, ничего не происходит.');
                    return;
                }

                // Закрываем открытую форму, если она не та же самая
                // Close the open form if it's not the same
                if (this.openForm && this.openForm !== existingForm) {
                    this.openForm.remove();
                    this.openForm = null;
                }

                const replyFormHTML = this.createReplyForm();
                commentWrapper.insertAdjacentHTML('afterend', replyFormHTML);
                this.openForm = commentWrapper.nextElementSibling;

                // Добавляем обработчик для кнопки "Отмена"
                // Add handler for the "Cancel" button
                const cancelButton = this.openForm.querySelector('.reply-form__button-cancel');
                cancelButton.addEventListener('click', () => {
                    this.closeReplyForm(this.openForm);
                });

                // Добавляем обработчик для отправки формы
                // Add handler for form submission
                const submitButton = this.openForm.querySelector('.reply-form__button reply-form__button-submit');
                submitButton.addEventListener('click', (event) => {
                    event.preventDefault(); // Prevent default form submission
                    const nameInput = this.openForm.querySelector('.reply-form__input[name="name"]');
                    const emailInput = this.openForm.querySelector('.reply-form__input[name="email"]');
                    const commentTextarea = this.openForm.querySelector('.reply-form__textarea');

                    // Проверяем вводимые данные с использованием продвинутого обработчика
                    if (this.advancedFilterInputData(nameInput.value, emailInput.value, commentTextarea.value)) {
                        // Здесь можно добавить логику для обработки отправки комментария
                        const newCommentHTML = `
                            <div class='comment-wrapper'>
                                <div class='comment-text'>${commentTextarea.value}</div>
                                <div class='comment-author'>${nameInput.value}</div>
                            </div>
                        `;
                        this.commentsBlock.insertAdjacentHTML('beforeend', newCommentHTML);

                        // Очищаем форму после отправки
                        nameInput.value = '';
                        emailInput.value = '';
                        commentTextarea.value = '';
                        this.closeReplyForm(this.openForm); // Закрываем форму
                    }
                });
            }
        });
    }

    /**
     * Переключение видимости формы ответа
     * Toggle reply form visibility
     */
    toggleReplyForm(form) {
        const isVisible = form.style.display === 'block';
        form.style.opacity = isVisible ? '0' : '1';
        form.style.transition = 'opacity 0.3s ease, height 0.3s ease';
        setTimeout(() => {
            form.style.display = isVisible ? 'none' : 'block';
            form.style.height = isVisible ? '0' : 'auto';
            if (!isVisible) {
                const height = form.scrollHeight + 'px';
                form.style.height = '0';
                requestAnimationFrame(() => {
                    form.style.height = height;
                });
            }
        }, 300);
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
        textElement.classList.toggle('expanded', !isExpanded);
        button.textContent = isExpanded ? 'читать полностью' : 'свернуть';
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

    closeReplyForm(form) {
        const nameInput = form.querySelector('.reply-form__input[name="name"]');
        const commentTextarea = form.querySelector('.reply-form__textarea');
        const emailInput = form.querySelector('.reply-form__input[name="email"]');

        // Сохраняем значения полей, кроме email
        const nameValue = nameInput.value;
        const commentValue = commentTextarea.value;

        // Удаляем форму из DOM
        form.remove();

        // Восстанавливаем значения
        nameInput.value = nameValue;
        commentTextarea.value = commentValue;
        emailInput.value = ''; // Очищаем поле email

        // Сбрасываем переменную openForm
        this.openForm = null; // Сброс переменной openForm для возможности повторного открытия
    }

    /**
     * Продвинутый обработчик вводимых данных в форму комментария
     * Advanced input data handler for the comment form
     */
    advancedFilterInputData(name, email, comment) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const maxCommentLength = 1000; // Максимальная длина комментария

        // Удаляем лишние пробелы
        comment = comment.trim();

        // Проверка на пустые поля
        if (!name || !comment) {
            alert('Имя и комментарий не могут быть пустыми.'); // Name and comment cannot be empty.
            return false;
        }

        // Проверка длины комментария
        if (comment.length > maxCommentLength) {
            alert(`Комментарий не может превышать ${maxCommentLength} символов.`); // Comment cannot exceed max length.
            return false;
        }

        // Проверка на корректный email
        if (!emailPattern.test(email)) {
            alert('Введите корректный email.'); // Enter a valid email.
            return false;
        }

        // Проверка на дубликаты комментариев
        const existingComments = Array.from(this.commentsBlock.querySelectorAll('.comment-text'));
        const isDuplicate = existingComments.some(existingComment => existingComment.textContent.trim() === comment);
        if (isDuplicate) {
            alert('Этот комментарий уже был отправлен.'); // This comment has already been submitted.
            return false;
        }

        return true;
    }
}

// Инициализация после загрузки DOM
// Initialize after DOM load
document.addEventListener('DOMContentLoaded', () => {
    new CommentsManager();
});
