# Bang Bang — Guia de Animações
## Catálogo de animações do projeto | v1.0

---

## Princípios

1. **Animação serve ao produto** — nunca distrai do conteúdo
2. **Sutileza > espetáculo** — a marca é bold, mas a animação é fluida
3. **Performance primeiro** — só animar transform e opacity (GPU-accelerated)
4. **Mobile: menos** — reduzir ou remover animações em mobile para performance
5. **Respeitar prefers-reduced-motion** — desativar animações para quem pede

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Tokens de Timing

```css
--transition-fast:     150ms ease;
--transition-base:     250ms ease;
--transition-slow:     400ms ease;
--transition-bounce:   400ms cubic-bezier(0.34, 1.56, 0.64, 1);
--transition-smooth:   600ms cubic-bezier(0.16, 1, 0.3, 1);
```

---

## Animações de Entrada (Scroll-triggered)

Usar Intersection Observer para trigger quando o elemento entra no viewport.
Threshold: 0.15 (15% visível = dispara).

### fade-in-up
Uso: Títulos de seção, cards, textos
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 600ms var(--transition-smooth) forwards;
  opacity: 0;
}
```

### fade-in-left
Uso: Textos do hero, títulos com alinhamento esquerdo
```css
@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-32px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

### fade-in-scale
Uso: Latas de produto, imagens de destaque
```css
@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

### stagger
Uso: Grid de cards, lista de features — cada item aparece com delay
```
Item 1: delay 0ms
Item 2: delay 100ms
Item 3: delay 200ms
Item 4: delay 300ms
```

Implementação via style inline:
```tsx
{items.map((item, i) => (
  <div
    key={i}
    className="animate-fade-in-up"
    style={{ animationDelay: `${i * 100}ms` }}
  >
    {/* ... */}
  </div>
))}
```

---

## Animações Contínuas

### float
Uso: Elementos decorativos flutuantes (chapéu, gelo, limão)
```css
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}
```

Variações de timing para cada elemento (evitar sincronismo):
```
Elemento 1: duration 6s, delay 0s
Elemento 2: duration 7s, delay 1s
Elemento 3: duration 5s, delay 2s
```

### marquee
Uso: Faixa de texto rolante (MarqueeBanner)
```css
@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

.animate-marquee {
  animation: marquee 30s linear infinite;
}

.animate-marquee:hover {
  animation-play-state: paused;
}
```

### pulse-soft
Uso: CTAs de destaque, badges "Novo"
```css
@keyframes pulseSoft {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}

.animate-pulse-soft {
  animation: pulseSoft 3s ease-in-out infinite;
}
```

---

## Animações de Interação

### Hover em Botões
```css
.btn-hover {
  transition: transform var(--transition-fast), 
              box-shadow var(--transition-fast);
}
.btn-hover:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 16px rgba(232, 122, 30, 0.3);
}
.btn-hover:active {
  transform: scale(0.98);
}
```

### Hover em Cards de Produto
```css
.product-card-hover {
  transition: transform var(--transition-base),
              box-shadow var(--transition-base);
}
.product-card-hover:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
.product-card-hover:hover .product-image {
  transform: scale(1.05);
}
```

### Hover em Logo Strip
```css
.logo-item {
  filter: grayscale(100%);
  opacity: 0.6;
  transition: all var(--transition-base);
}
.logo-item:hover {
  filter: grayscale(0%);
  opacity: 1;
}
```

### FAQ Accordion
```css
.accordion-content {
  overflow: hidden;
  transition: max-height var(--transition-base);
}
.accordion-icon {
  transition: transform var(--transition-fast);
}
.accordion-open .accordion-icon {
  transform: rotate(45deg);
}
```

---

## Animação do Number Counter

```typescript
// Hook customizado para contagem animada
function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}
```

---

## Header Scroll Transition

```css
.header-transparent {
  background: transparent;
  transition: background var(--transition-base),
              box-shadow var(--transition-base);
}
.header-solid {
  background: var(--bb-brown-dark);
  box-shadow: var(--shadow-md);
}
```

Trigger: scroll position > 100px → toggle class.
Implementar com useState + useEffect + scroll listener (com throttle).

---

## Regras Mobile

Em breakpoints < 768px:
- FloatingElements: `hidden`
- fade-in-up delay stagger: reduzir para 50ms (em vez de 100ms)
- float animation: desativar
- marquee: manter (leve e informativo)
- Number counter: manter (engajamento)
- Hover effects: ignorados (não existe hover em touch)

---

## Tailwind Config Additions

Adicionar ao `tailwind.config.ts`:
```typescript
extend: {
  keyframes: {
    fadeInUp: { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
    fadeInLeft: { from: { opacity: '0', transform: 'translateX(-32px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
    fadeInScale: { from: { opacity: '0', transform: 'scale(0.9)' }, to: { opacity: '1', transform: 'scale(1)' } },
    float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-15px)' } },
    marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
    pulseSoft: { '0%, 100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.03)' } },
  },
  animation: {
    'fade-in-up': 'fadeInUp 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
    'fade-in-left': 'fadeInLeft 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
    'fade-in-scale': 'fadeInScale 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
    'float': 'float 6s ease-in-out infinite',
    'marquee': 'marquee 30s linear infinite',
    'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
  },
}
```
