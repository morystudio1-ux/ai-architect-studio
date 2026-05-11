// AI Architect Design Studio - Enhanced UI Components

// Particle Background System
class ParticleBackground {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'particles-container';
        document.body.insertBefore(this.container, document.body.firstChild);
        this.particles = [];
        this.createParticles();
    }

    createParticles() {
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 15 + 's';
            particle.style.animationDuration = (15 + Math.random() * 10) + 's';
            this.container.appendChild(particle);
            this.particles.push(particle);
        }
    }

    update() {
        this.particles.forEach(particle => {
            if (Math.random() < 0.01) {
                particle.style.left = Math.random() * 100 + '%';
            }
        });
    }
}

// 3D Model Viewer
class ModelViewer3D {
    constructor(container) {
        this.container = container;
        this.scene = {
            rotation: { x: 0, y: 0 },
            scale: 1,
            isDragging: false,
            lastX: 0,
            lastY: 0
        };
        this.init();
    }

    init() {
        const viewer = this.container;

        // Mouse controls
        viewer.addEventListener('mousedown', (e) => this.startDrag(e));
        viewer.addEventListener('mousemove', (e) => this.drag(e));
        viewer.addEventListener('mouseup', () => this.endDrag());
        viewer.addEventListener('mouseleave', () => this.endDrag());

        // Touch controls
        viewer.addEventListener('touchstart', (e) => this.startDrag(e.touches[0]));
        viewer.addEventListener('touchmove', (e) => this.drag(e.touches[0]));
        viewer.addEventListener('touchend', () => this.endDrag());

        // Wheel zoom
        viewer.addEventListener('wheel', (e) => this.zoom(e));
    }

    startDrag(e) {
        this.scene.isDragging = true;
        this.scene.lastX = e.clientX;
        this.scene.lastY = e.clientY;
        this.container.style.cursor = 'grabbing';
    }

    drag(e) {
        if (!this.scene.isDragging) return;

        const deltaX = e.clientX - this.scene.lastX;
        const deltaY = e.clientY - this.scene.lastY;

        this.scene.rotation.y += deltaX * 0.01;
        this.scene.rotation.x -= deltaY * 0.01;

        this.updateTransform();

        this.scene.lastX = e.clientX;
        this.scene.lastY = e.clientY;
    }

    endDrag() {
        this.scene.isDragging = false;
        this.container.style.cursor = 'grab';
    }

    zoom(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        this.scene.scale *= delta;
        this.scene.scale = Math.max(0.5, Math.min(2, this.scene.scale));
        this.updateTransform();
    }

    updateTransform() {
        const model = this.container.querySelector('.model-3d');
        if (model) {
            model.style.transform = `
                scale(${this.scene.scale})
                rotateX(${this.scene.rotation.x}rad)
                rotateY(${this.scene.rotation.y}rad)
            `;
        }
    }

    reset() {
        this.scene.rotation = { x: 0, y: 0 };
        this.scene.scale = 1;
        this.updateTransform();
    }
}

// Advanced Notification System
class NotificationSystem {
    constructor() {
        this.container = document.getElementById('notification') || this.createContainer();
        this.queue = [];
        this.active = false;
    }

    createContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 400px;
        `;
        document.body.appendChild(container);
        return container;
    }

    show(message, type = 'info', duration = 5000) {
        const notification = this.createNotification(message, type);
        this.container.appendChild(notification);

        // Animate in
        setTimeout(() => notification.classList.add('show'), 10);

        // Auto remove
        setTimeout(() => {
            this.remove(notification);
        }, duration);

        return notification;
    }

    createNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            background: rgba(30, 41, 59, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 16px 20px;
            display: flex;
            align-items: flex-start;
            gap: 12px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        `;

        const icon = this.getIcon(type);
        const title = this.getTitle(type);

        notification.innerHTML = `
            <i class="${icon} text-xl" style="color: ${this.getColor(type)}"></i>
            <div style="flex: 1;">
                <div style="font-weight: 600; margin-bottom: 4px;">${title}</div>
                <div style="font-size: 14px; color: #cbd5e1;">${message}</div>
            </div>
            <button onclick="this.parentElement.remove()" style="
                background: none;
                border: none;
                color: #94a3b8;
                cursor: pointer;
                font-size: 18px;
                padding: 4px;
            ">×</button>
        `;

        return notification;
    }

    getIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    getTitle(type) {
        const titles = {
            success: 'Başarılı!',
            error: 'Hata!',
            warning: 'Dikkat!',
            info: 'Bilgi'
        };
        return titles[type] || 'Bilgi';
    }

    getColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        return colors[type] || colors.info;
    }

    remove(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.parentElement.removeChild(notification);
            }
        }, 300);
    }
}

// Advanced Progress System
class ProgressSystem {
    constructor() {
        this.progressBars = new Map();
    }

    create(id, options = {}) {
        const container = document.createElement('div');
        container.className = 'progress-container';
        container.style.cssText = `
            position: relative;
            background: rgba(30, 41, 59, 0.5);
            border-radius: 8px;
            padding: 8px;
            min-height: 40px;
            margin: 10px 0;
        `;

        const bar = document.createElement('div');
        bar.className = 'progress-bar';
        bar.style.cssText = `
            background: linear-gradient(90deg, #3b82f6, #8b5cf6);
            height: 24px;
            border-radius: 6px;
            width: 0%;
            transition: width 0.3s ease;
            position: relative;
            overflow: hidden;
        `;

        const label = document.createElement('div');
        label.className = 'progress-label';
        label.textContent = options.label || 'Yükleniyor...';
        label.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 12px;
            font-weight: 600;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
        `;

        bar.appendChild(label);
        container.appendChild(bar);

        this.progressBars.set(id, { container, bar, label });

        return container;
    }

    update(id, value, label) {
        const progress = this.progressBars.get(id);
        if (progress) {
            progress.bar.style.width = `${value}%`;
            if (label) {
                progress.label.textContent = label;
            }
        }
    }

    remove(id) {
        const progress = this.progressBars.get(id);
        if (progress && progress.container.parentElement) {
            progress.container.parentElement.removeChild(progress.container);
        }
        this.progressBars.delete(id);
    }
}

// Tooltip System
class TooltipSystem {
    constructor() {
        this.tooltips = new Map();
        this.init();
    }

    init() {
        document.addEventListener('mouseover', (e) => this.show(e));
        document.addEventListener('mouseout', (e) => this.hide(e));
    }

    show(e) {
        const element = e.target;
        if (element.dataset.tooltip) {
            const tooltip = document.createElement('div');
            tooltip.className = 'custom-tooltip';
            tooltip.textContent = element.dataset.tooltip;
            tooltip.style.cssText = `
                position: absolute;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                white-space: nowrap;
                z-index: 1000;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;

            document.body.appendChild(tooltip);
            this.tooltips.set(element, tooltip);

            // Position tooltip
            const rect = element.getBoundingClientRect();
            tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';

            // Animate in
            setTimeout(() => tooltip.style.opacity = '1', 10);
        }
    }

    hide(e) {
        const element = e.target;
        const tooltip = this.tooltips.get(element);
        if (tooltip) {
            tooltip.style.opacity = '0';
            setTimeout(() => {
                if (tooltip.parentElement) {
                    tooltip.parentElement.removeChild(tooltip);
                }
            }, 300);
            this.tooltips.delete(element);
        }
    }
}

// Animation System
class AnimationSystem {
    constructor() {
        this.animations = new Map();
        this.init();
    }

    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animate(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('[data-animate]').forEach(el => {
            observer.observe(el);
        });
    }

    animate(element) {
        const animation = element.dataset.animate;
        const delay = element.dataset.delay || 0;

        setTimeout(() => {
            element.style.transition = 'all 0.6s ease';
            switch (animation) {
                case 'fade-up':
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                    break;
                case 'fade-in':
                    element.style.opacity = '1';
                    break;
                case 'slide-left':
                    element.style.opacity = '1';
                    element.style.transform = 'translateX(0)';
                    break;
                case 'scale-in':
                    element.style.opacity = '1';
                    element.style.transform = 'scale(1)';
                    break;
                case 'rotate-in':
                    element.style.opacity = '1';
                    element.style.transform = 'rotate(0deg) scale(1)';
                    break;
            }
        }, parseInt(delay));
    }
}

// Initialize UI Systems
const particleBg = new ParticleBackground();
const notificationSystem = new NotificationSystem();
const progressSystem = new ProgressSystem();
const tooltipSystem = new TooltipSystem();
const animationSystem = new AnimationSystem();

// Global UI Functions
window.UI = {
    notify: (message, type) => notificationSystem.show(message, type),
    progress: (id, options) => progressSystem.create(id, options),
    updateProgress: (id, value, label) => progressSystem.update(id, value, label),
    removeProgress: (id) => progressSystem.remove(id),
    animate: (element) => animationSystem.animate(element)
};