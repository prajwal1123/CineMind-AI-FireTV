import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Movie {
  id: string; title: string; year: number; genre: string; runtime: number;
  rating: string; family: boolean; description: string; emoji: string;
  colors: string[]; reason: string; match: number; mood: string[];
}
interface RecommendationResponse { recommendations: Movie[]; mode: 'ai' | 'demo'; note: string; }

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  prompt = 'Funny family movie under 2 hours';
  recommendations: Movie[] = [];
  loading = false;
  error = '';
  mode = 'demo';
  note = 'Your next great movie night starts here.';
  selectedIndex = 0;
  activeTab = 'For you';
  health = 'checking';
  suggestions = [
    'Funny family movie under 2 hours',
    'A calm movie for when I feel tired',
    'Mind-bending sci-fi about space',
    'A clever mystery for tonight'
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<{ok:boolean; aiEnabled:boolean}>('/api/health').subscribe({
      next: r => { this.health = r.ok ? 'online' : 'offline'; if (r.aiEnabled) this.note = 'Live AI is connected. Tell me your mood.'; },
      error: () => { this.health = 'offline'; this.note = 'API is offline. Start the Node.js backend to get recommendations.'; }
    });
    this.recommend();
  }

  recommend(value?: string): void {
    if (value) this.prompt = value;
    const clean = this.prompt.trim();
    if (!clean || this.loading) return;
    this.loading = true; this.error = '';
    this.http.post<RecommendationResponse>('/api/recommend', { prompt: clean }).subscribe({
      next: r => {
        this.recommendations = r.recommendations || [];
        this.mode = r.mode;
        this.note = r.note;
        this.selectedIndex = 0;
        this.loading = false;

        // Bring the recommendations into view after the API response arrives.
        // The cards were rendering below the hero, outside the initial viewport.
        setTimeout(() => {
          document.querySelector('.results-section')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }, 0);
      },
      error: e => {
        this.error = e.error?.error || 'Could not connect. Check that the backend is running.';
        this.loading = false;
      }
    });
  }

  chooseTab(tab: string): void {
    this.activeTab = tab;
    const map: Record<string,string> = {
      'For you': 'Funny family movie under 2 hours',
      'Family': 'Family-friendly feel-good movie for parents and kids',
      'Laughs': 'Funny light comedy that makes me laugh',
      'Adventure': 'Uplifting adventure with wonder and discovery',
      'Mystery': 'Clever mystery with suspense and puzzles'
    };
    this.recommend(map[tab] || this.prompt);
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    const key = event.key;

    // Only intercept arrow keys for TV remote navigation.
    // Do not intercept Enter or Space: native button activation and form submit
    // must be allowed to work normally in browsers and Fire TV web views.
    if (!['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(key)) {
      return;
    }

    const target = event.target as HTMLElement | null;
    const isTyping = target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement;
    if (isTyping) return;

    const focusables = Array.from(
      document.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [data-tv-focus]:not([disabled])'
      )
    ).filter(el => el.offsetParent !== null);

    if (!focusables.length) return;
    event.preventDefault();

    const current = document.activeElement as HTMLElement | null;
    const index = current ? focusables.indexOf(current) : -1;
    const forward = key === 'ArrowRight' || key === 'ArrowDown';
    const nextIndex = forward
      ? (index + 1) % focusables.length
      : (index <= 0 ? focusables.length - 1 : index - 1);

    focusables[nextIndex]?.focus();
  }

  selectMovie(index: number): void { this.selectedIndex = index; }
  trackById(_index: number, item: Movie): string { return item.id; }
}
