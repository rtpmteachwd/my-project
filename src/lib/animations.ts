// Animation utility functions
export const animations = {
  // Shake animation for wrong answers
  shake: (element: HTMLElement) => {
    element.style.animation = 'shake 0.5s';
    setTimeout(() => {
      element.style.animation = '';
    }, 500);
  },

  // Pulse animation for buzz button
  pulse: (element: HTMLElement) => {
    element.style.animation = 'pulse 1s infinite';
  },

  // Stop pulse animation
  stopPulse: (element: HTMLElement) => {
    element.style.animation = '';
  },

  // Bounce animation for correct answers
  bounce: (element: HTMLElement) => {
    element.style.animation = 'bounce 0.6s';
    setTimeout(() => {
      element.style.animation = '';
    }, 600);
  },

  // Fade in animation
  fadeIn: (element: HTMLElement, duration: number = 300) => {
    element.style.opacity = '0';
    element.style.transition = `opacity ${duration}ms ease-in`;
    setTimeout(() => {
      element.style.opacity = '1';
    }, 10);
  },

  // Fade out animation
  fadeOut: (element: HTMLElement, duration: number = 300) => {
    element.style.opacity = '1';
    element.style.transition = `opacity ${duration}ms ease-out`;
    setTimeout(() => {
      element.style.opacity = '0';
    }, 10);
  },

  // Slide in animation
  slideIn: (element: HTMLElement, direction: 'left' | 'right' | 'up' | 'down' = 'left') => {
    const transforms = {
      left: 'translateX(-100%)',
      right: 'translateX(100%)',
      up: 'translateY(-100%)',
      down: 'translateY(100%)'
    };
    
    element.style.transform = transforms[direction];
    element.style.transition = 'transform 0.3s ease-out';
    setTimeout(() => {
      element.style.transform = 'translateX(0) translateY(0)';
    }, 10);
  }
};

// Add CSS animations to document
export const injectAnimationStyles = () => {
  if (typeof document === 'undefined') return;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
    
    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-20px); }
      60% { transform: translateY(-10px); }
    }
    
    @keyframes confetti {
      0% { transform: translateY(0) rotate(0deg); opacity: 1; }
      100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }
    
    .confetti {
      position: fixed;
      width: 10px;
      height: 10px;
      background: #f0f;
      animation: confetti 3s linear forwards;
      pointer-events: none;
      z-index: 9999;
    }
  `;
  
  document.head.appendChild(style);
};

// Create confetti effect
export const createConfetti = (count: number = 50) => {
  if (typeof document === 'undefined') return;

  const colors = ['#FF6F61', '#D291BC', '#A1C6EA', '#B8E1DD', '#FADADD', '#F0F0F0'];
  
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = Math.random() * 0.5 + 's';
      confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        confetti.remove();
      }, 4000);
    }, i * 50);
  }
};