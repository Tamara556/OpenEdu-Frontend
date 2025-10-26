import { Component, Input, OnInit, OnDestroy, ElementRef, Renderer2, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-text-type',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="text-type__content" [style.color]="currentColor">{{ displayedText }}</span>
    <span
      *ngIf="showCursor"
      #cursor
      class="text-type__cursor"
      [class.text-type__cursor--hidden]="shouldHideCursor"
    >
      {{ cursorCharacter }}
    </span>
  `,
  styleUrls: ['./text-type.component.css']
})
export class TextTypeComponent implements OnInit, OnDestroy {
  @Input() text: string | string[] = '';
  @Input() typingSpeed = 50;
  @Input() deletingSpeed = 30;
  @Input() pauseDuration = 2000;
  @Input() initialDelay = 0;
  @Input() loop = true;
  @Input() showCursor = true;
  @Input() hideCursorWhileTyping = false;
  @Input() cursorCharacter: string = '|';
  @Input() cursorBlinkDuration = 0.5;
  @Input() textColors: string[] = [];
  @Input() variableSpeed?: { min: number; max: number };
  @Input() reverseMode = false;

  displayedText = '';
  private isDeleting = false;
  private currentIndex = 0;
  private currentCharIndex = 0;
  private timeoutId?: any;
  private cursorEl?: HTMLElement;
  currentColor = 'inherit';
  private isBrowser: boolean;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  get shouldHideCursor(): boolean {
    const texts = Array.isArray(this.text) ? this.text : [this.text];
    return this.hideCursorWhileTyping &&
      (this.currentCharIndex < texts[this.currentIndex].length || this.isDeleting);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return; // SSR պաշտպանություն

    if (this.showCursor) {
      this.cursorEl = this.el.nativeElement.querySelector('.text-type__cursor');
      if (this.cursorEl) {
        gsap.to(this.cursorEl, {
          opacity: 0,
          duration: this.cursorBlinkDuration,
          repeat: -1,
          yoyo: true,
          ease: 'power2.inOut'
        });
      }
    }

    setTimeout(() => this.startTyping(), this.initialDelay);
  }

  private startTyping(): void {
    if (!this.isBrowser) return;

    const texts = Array.isArray(this.text) ? this.text : [this.text];
    const currentText = this.reverseMode
      ? texts[this.currentIndex].split('').reverse().join('')
      : texts[this.currentIndex];
    this.currentColor = this.textColors.length
      ? this.textColors[this.currentIndex % this.textColors.length]
      : 'inherit';

    if (this.isDeleting) {
      if (this.displayedText.length > 0) {
        this.displayedText = this.displayedText.slice(0, -1);
        this.timeoutId = setTimeout(() => this.startTyping(), this.deletingSpeed);
      } else {
        this.isDeleting = false;
        this.currentIndex = (this.currentIndex + 1) % texts.length;
        this.timeoutId = setTimeout(() => this.startTyping(), this.pauseDuration);
      }
    } else {
      if (this.currentCharIndex < currentText.length) {
        const speed = this.variableSpeed
          ? this.getRandomSpeed()
          : this.typingSpeed;
        this.displayedText += currentText[this.currentCharIndex];
        this.currentCharIndex++;
        this.timeoutId = setTimeout(() => this.startTyping(), speed);
      } else if (texts.length > 1) {
        this.isDeleting = true;
        this.currentCharIndex = 0;
        this.timeoutId = setTimeout(() => this.startTyping(), this.pauseDuration);
      }
    }
  }

  private getRandomSpeed(): number {
    if (!this.variableSpeed) return this.typingSpeed;
    const { min, max } = this.variableSpeed;
    return Math.random() * (max - min) + min;
  }

  ngOnDestroy(): void {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    if (this.isBrowser && this.cursorEl) {
      gsap.killTweensOf(this.cursorEl);
    }
  }
}
