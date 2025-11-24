import { Component, ChangeDetectionStrategy, signal, inject, ViewChild, ElementRef, effect, OnInit, computed } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';

interface QuickReply {
  text: string;
  payload: string;
}

interface Message {
  text: string;
  from: 'user' | 'bot';
  quickReplies?: QuickReply[];
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './chatbot.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatbotComponent implements OnInit {
  isOpen = signal(false);
  isLoading = signal(false);
  messages = signal<Message[]>([]);
  showProactiveMessage = signal(false);
  
  private readonly geminiService = inject(GeminiService);
  private readonly languageService = inject(LanguageService);

  private readonly welcomeMessage = computed(() => this.languageService.translate('chatbot.welcome'));

  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  chatForm = new FormGroup({
    message: new FormControl('', Validators.required),
  });

  constructor() {
    effect(() => {
        this.messages(); // Depend on messages signal
        // Use a timeout to allow the DOM to update before scrolling
        setTimeout(() => this.scrollToBottom(), 0);
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      if (!this.isOpen()) {
        this.showProactiveMessage.set(true);
      }
    }, 10000); // Show after 10 seconds
  }

  lastMessage = computed(() => {
    const msgs = this.messages();
    return msgs.length > 0 ? msgs[msgs.length - 1] : null;
  });

  quickReplies = computed(() => {
    const last = this.lastMessage();
    // Only show quick replies if not loading a response
    if (last && last.from === 'bot' && last.quickReplies && !this.isLoading()) {
      return last.quickReplies;
    }
    return [];
  });

  toggleChat(): void {
    this.isOpen.update(open => !open);
    this.showProactiveMessage.set(false); // Hide proactive message on any interaction
    if(this.isOpen() && this.messages().length === 0) {
        this.messages.set([{ 
            from: 'bot', 
            text: this.welcomeMessage(),
            quickReplies: [
                { text: this.languageService.translate('chatbot.quickReplies.whatIs'), payload: this.languageService.translate('chatbot.quickReplies.whatIs') },
                { text: this.languageService.translate('chatbot.quickReplies.howItWorks'), payload: this.languageService.translate('chatbot.quickReplies.howItWorks') },
                { text: this.languageService.translate('chatbot.quickReplies.pricing'), payload: this.languageService.translate('chatbot.quickReplies.pricing') }
            ]
        }]);
    }
  }

  async sendMessage(): Promise<void> {
    if (this.chatForm.invalid) return;

    const userMessage = this.chatForm.value.message as string;
    
    // Update messages, removing quick replies from last bot message
    this.messages.update(m => {
        if (m.length > 0 && m[m.length - 1].from === 'bot') {
            m[m.length - 1].quickReplies = undefined;
        }
        return [...m, { from: 'user', text: userMessage }];
    });
    
    this.chatForm.reset();
    this.isLoading.set(true);

    const botResponse = await this.geminiService.sendMessage(userMessage);

    this.messages.update(m => [...m, { from: 'bot', text: botResponse }]);
    this.isLoading.set(false);
  }

  async sendQuickReply(payload: string, text: string): Promise<void> {
     // Update messages, removing quick replies from last bot message and adding user's choice
    this.messages.update(m => {
        if (m.length > 0 && m[m.length - 1].from === 'bot') {
            m[m.length - 1].quickReplies = undefined;
        }
        return [...m, { from: 'user', text: text }];
    });
    
    this.isLoading.set(true);

    const botResponse = await this.geminiService.sendMessage(payload);

    this.messages.update(m => [...m, { from: 'bot', text: botResponse }]);
    this.isLoading.set(false);
  }
  
  private scrollToBottom(): void {
    if (this.messageContainer?.nativeElement) {
      this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    }
  }
}
