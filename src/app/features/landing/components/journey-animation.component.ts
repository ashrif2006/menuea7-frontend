import { Component, OnDestroy, OnInit, signal } from '@angular/core';

interface Step {
  key: 'build' | 'qr' | 'scan' | 'open';
  label: string;
}

@Component({
  selector: 'app-journey-animation',
  standalone: true,
  imports: [],
  templateUrl: './journey-animation.component.html',
  styleUrl: './journey-animation.component.css'
})
export class JourneyAnimationComponent implements OnInit, OnDestroy {
  steps: Step[] = [
    { key: 'build', label: 'أضف منتجاتك' },
    { key: 'qr', label: 'يتولّد كود QR' },
    { key: 'scan', label: 'عميلك يمسح' },
    { key: 'open', label: 'المنيو يفتح فورًا' }
  ];

  activeIndex = signal(0);
  private timer: ReturnType<typeof setInterval> | null = null;

  menuItems = [
    { name: 'قهوة تركي', price: '25' },
    { name: 'كابتشينو', price: '45' },
    { name: 'عصير مانجو', price: '35' }
  ];

  visibleItems = signal(0);

  ngOnInit() {
    this.timer = setInterval(() => this.advance(), 2600);
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  get activeStep() {
    return this.steps[this.activeIndex()].key;
  }

  private advance() {
    const next = (this.activeIndex() + 1) % this.steps.length;
    this.activeIndex.set(next);

    if (this.steps[next].key === 'build') {
      this.replayBuildStep();
    }
  }

  private replayBuildStep() {
    this.visibleItems.set(0);
    this.menuItems.forEach((_, i) => {
      setTimeout(() => this.visibleItems.update(v => v + 1), (i + 1) * 350);
    });
  }

  goTo(index: number) {
    this.activeIndex.set(index);
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => this.advance(), 2600);
    if (this.steps[index].key === 'build') this.replayBuildStep();
  }
}