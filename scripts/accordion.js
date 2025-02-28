class Accordion {
    constructor(element) {
        this.accordion = element;
        this.trigger = element.querySelector('.accordion-trigger');
        this.content = element.querySelector('.accordion-content');
        
        this.init();
    }

    init() {
        if (!this.trigger || !this.content) return;
        
        // Set initial ARIA attributes
        this.trigger.setAttribute('aria-expanded', 'false');
        this.content.setAttribute('hidden', '');

        // Add click handler
        this.trigger.addEventListener('click', () => this.toggleAccordion());
    }

    toggleAccordion() {
        const isExpanded = this.trigger.getAttribute('aria-expanded') === 'true';
        this.trigger.setAttribute('aria-expanded', !isExpanded);
        
        if (isExpanded) {
            requestAnimationFrame(() => {
                this.content.style.maxHeight = '0';
                setTimeout(() => {
                    this.content.setAttribute('hidden', '');
                }, 300); // Время должно совпадать с transition в CSS
            });
        } else {
            this.content.removeAttribute('hidden');
            requestAnimationFrame(() => {
                const height = this.content.scrollHeight;
                this.content.style.maxHeight = `${height}px`;
            });
        }
    }
}

// Initialize all accordions on the page
document.addEventListener('DOMContentLoaded', () => {
    const accordions = document.querySelectorAll('.accordion-item');
    accordions.forEach(accordion => new Accordion(accordion));
}); 