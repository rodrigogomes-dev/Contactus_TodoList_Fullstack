import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BadgeItem, BadgeService } from '../../services/badge';
import { LandingUiStateService } from '../../services/landing-ui-state';

type GlobalWindow = Window & { THREE?: unknown };

type VantaNetFactory = (options: {
  el: HTMLElement;
  THREE: unknown;
  mouseControls: boolean;
  touchControls: boolean;
  gyroControls: boolean;
  minHeight: number;
  minWidth: number;
  scale: number;
  scaleMobile: number;
  color: number;
  showDots?: boolean;
  points?: number;
  maxDistance?: number;
  spacing?: number;
  backgroundColor: number;
}) => { destroy: () => void };

type VantaNetInstance = {
  destroy: () => void;
  setOptions?: (options: { color?: number; backgroundColor?: number }) => void;
  blending?: 'additive' | 'subtractive';
  linesMesh?: {
    material?: {
      blending?: number;
      transparent?: boolean;
      opacity?: number;
      vertexColors?: boolean;
      color?: { set?: (value: number | string) => void };
      needsUpdate?: boolean;
    };
  };
};

@Component({
  selector: 'app-landing',
  imports: [RouterLink],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing implements OnInit, AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private badgeService = inject(BadgeService);
  private landingUiState = inject(LandingUiStateService);
  private vantaEffect: { destroy: () => void } | null = null;
  private revealObserver: IntersectionObserver | null = null;
  private removeLandingScrollListener: (() => void) | null = null;

  // Mock badges for landing page (no backend calls until user is logged in)
  private mockBadges: BadgeItem[] = [
    {
      id: 1,
      nome: 'Iniciante',
      descricao: '1 tarefa concluída',
      categoria: 'Geral',
      milestone: 'iniciante',
      percentage: 0,
      icon_url: 'https://api.iconify.design/lsicon:refresh-done-filled.svg?color=%230056CC&width=220&height=220',
      unlocked: false,
    },
    {
      id: 2,
      nome: 'Intermediário',
      descricao: '10 tarefas concluídas',
      categoria: 'Geral',
      milestone: 'intermediario',
      percentage: 50,
      icon_url: 'https://api.iconify.design/lsicon:radar-chart-filled.svg?color=%230056CC&width=220&height=220',
      unlocked: false,
    },
    {
      id: 3,
      nome: 'Avançado',
      descricao: '50 tarefas concluídas',
      categoria: 'Geral',
      milestone: 'avancado',
      percentage: 75,
      icon_url: 'https://api.iconify.design/lsicon:vip-filled.svg?color=%230056CC&width=220&height=220',
      unlocked: false,
    },
    {
      id: 4,
      nome: 'Especialista',
      descricao: '100 tarefas concluídas',
      categoria: 'Geral',
      milestone: 'especialista',
      percentage: 100,
      icon_url: 'https://api.iconify.design/lsicon:education-filled.svg?color=%230056CC&width=220&height=220',
      unlocked: false,
    },
  ];

  badges = signal<BadgeItem[]>(this.mockBadges);
  badgesLoadError = this.badgeService.getLoadErrorSignal();
  activeBadgeIndex = signal(0);
  activeLandingSection = this.landingUiState.activeSection;
  landingScrollProgress = this.landingUiState.scrollProgress;

  currentBadge = computed(() => this.badges()[this.activeBadgeIndex()] ?? null);
  isFirstBadge = computed(() => this.activeBadgeIndex() === 0);
  isLastBadge = computed(() => this.activeBadgeIndex() >= this.badges().length - 1);

  ngOnInit(): void {
    // No backend calls until user is logged in
    // Badges will be loaded after authentication in the main app

    // Reset scroll to top when component initializes (fixes issue when returning from login page)
    if (isPlatformBrowser(this.platformId)) {
      const landingContainer = document.querySelector('.landing') as HTMLElement | null;
      if (landingContainer) {
        landingContainer.scrollTop = 0;
      }
    }
  }

  async ngAfterViewInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.bindLandingScrollTracking();
    this.initRevealAnimations();

    const vantaElement = document.getElementById('landing-vanta-bg');
    if (!vantaElement) {
      return;
    }

    try {
      const [threeModule, vantaNetModule] = await Promise.all([
        import('three'),
        import('vanta/dist/vanta.net.min'),
      ]);

      const threeInstance = (threeModule as unknown as { default?: unknown }).default ?? threeModule;
      const win = window as GlobalWindow;
      win.THREE = threeInstance;

      const vantaFactory = (vantaNetModule.default ?? vantaNetModule) as unknown as VantaNetFactory;

      const effect = vantaFactory({
        el: vantaElement,
        THREE: threeInstance,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200,
        minWidth: 200,
        scale: 1,
        scaleMobile: 1,
        color: 0x007bff,
        showDots: true,
        points: 9,
        maxDistance: 14,
        spacing: 30,
        backgroundColor: 0x202022,
      });

      const netEffect = effect as VantaNetInstance;
      netEffect.setOptions?.({ color: 0x007bff, backgroundColor: 0x202022 });
      netEffect.blending = 'additive';

      const additiveBlending = (threeInstance as { AdditiveBlending?: number }).AdditiveBlending;
      if (netEffect.linesMesh?.material) {
        if (typeof additiveBlending === 'number') {
          netEffect.linesMesh.material.blending = additiveBlending;
        }
        // In newer Three.js versions, force vertex colors or lines can render white.
        netEffect.linesMesh.material.vertexColors = true;
        netEffect.linesMesh.material.color?.set?.(0x007bff);
        netEffect.linesMesh.material.transparent = true;
        netEffect.linesMesh.material.opacity = 0.95;
        netEffect.linesMesh.material.needsUpdate = true;
      }

      this.vantaEffect = netEffect;
    } catch (error) {
      console.error('Vanta NET initialization failed', error);
    }
  }

  ngOnDestroy(): void {
    this.removeLandingScrollListener?.();
    this.removeLandingScrollListener = null;
    this.landingUiState.reset();
    this.revealObserver?.disconnect();
    this.revealObserver = null;
    this.vantaEffect?.destroy();
    this.vantaEffect = null;
  }

  goNextBadge(): void {
    if (this.isLastBadge()) {
      return;
    }

    this.activeBadgeIndex.update((index) => index + 1);
  }

  goPreviousBadge(): void {
    if (this.isFirstBadge()) {
      return;
    }

    this.activeBadgeIndex.update((index) => index - 1);
  }

  getBadgeShortDescription(badge: BadgeItem): string {
    return badge.descricao;
  }

  spinBadgeImage(image: HTMLImageElement): void {
    image.classList.remove('is-spinning');
    // Force reflow to restart the CSS animation on repeated clicks.
    void image.offsetWidth;
    image.classList.add('is-spinning');
  }

  scrollToSection(fragment: string, event: Event): void {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return;
    }
    event.preventDefault();
    const target = document.getElementById(fragment);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.landingUiState.setActiveSection(fragment);
    window.history.replaceState(null, '', `#${fragment}`);
  }

  private bindLandingScrollTracking(): void {
    this.removeLandingScrollListener?.();
    this.removeLandingScrollListener = null;

    const landingContainer = document.querySelector('.landing') as HTMLElement | null;
    if (!landingContainer) {
      this.landingUiState.reset();
      return;
    }

    const sectionIds = this.landingUiState.sectionIds;

    const updateScrollUI = () => {
      const maxScroll = Math.max(landingContainer.scrollHeight - landingContainer.clientHeight, 1);
      const progress = (landingContainer.scrollTop / maxScroll) * 100;
      this.landingUiState.setScrollProgress(progress);

      const containerTop = landingContainer.getBoundingClientRect().top;
      let activeId: string = 'entrar';
      let bestDistance = Number.POSITIVE_INFINITY;

      sectionIds.forEach((id) => {
        const section = document.getElementById(id);
        if (!section) {
          return;
        }

        const relativeTop = section.getBoundingClientRect().top - containerTop;
        const distance = Math.abs(relativeTop - 110);
        if (distance < bestDistance) {
          bestDistance = distance;
          activeId = id;
        }
      });

      if (this.landingUiState.activeSection() !== activeId) {
        this.landingUiState.setActiveSection(activeId);
        window.history.replaceState(null, '', `#${activeId}`);
      }
    };

    landingContainer.addEventListener('scroll', updateScrollUI, { passive: true });
    this.removeLandingScrollListener = () => {
      landingContainer.removeEventListener('scroll', updateScrollUI);
    };

    updateScrollUI();
  }

  private initRevealAnimations(): void {
    const landingContainer = document.querySelector('.landing');
    if (!landingContainer) {
      return;
    }

    const revealTargets = document.querySelectorAll<HTMLElement>('.reveal-card');
    if (revealTargets.length === 0) {
      return;
    }

    this.revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            this.revealObserver?.unobserve(entry.target);
          }
        });
      },
      {
        root: landingContainer,
        threshold: 0.12,
        rootMargin: '0px 0px -8% 0px',
      },
    );

    revealTargets.forEach((target) => this.revealObserver?.observe(target));
  }
}
