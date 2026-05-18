import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
  effect,
  untracked,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../core/services/firebases/auth.service';
import { TipService } from '../../core/services/firebases/tip.service';
import { ConfirmModalComponent } from '../../shared/confirm-modal/confirm-modal.component';
import { Tip } from '../../core/models/common.model';

@Component({
  selector: 'app-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, ConfirmModalComponent],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  authService = inject(AuthService);
  private tipService = inject(TipService);
  private fb = inject(FormBuilder);

  isSubmitting = signal(false);
  editingTipId = signal<string | null>(null);
  isConfirmModalOpen = signal(false);
  tipIdToDelete = signal<string | null>(null);

  // Pagination signaux
  currentPage = signal<number>(1);
  pageSize = 5;
  totalPages = signal<number>(1);
  myTips = signal<Tip[]>([]);
  isLoadingMyTips = signal<boolean>(true);

  private cursors: any[] = [];

  tipForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    codeSnippet: [''],
    language: ['typescript'],
  });

  constructor() {
    // Recharger la pagination de profil lorsque l'utilisateur connecté change
    effect(() => {
      const user = this.authService.currentUser();
      untracked(() => {
        if (user) {
          this.currentPage.set(1);
          this.cursors = [];
          this.loadMyTips();
        } else {
          this.myTips.set([]);
          this.totalPages.set(1);
        }
      });
    });
  }

  ngOnInit(): void {
    // Initial load
    this.loadMyTips();
  }

  async loadMyTips() {
    const user = this.authService.currentUser();
    if (!user) {
      this.myTips.set([]);
      this.isLoadingMyTips.set(false);
      return;
    }

    this.isLoadingMyTips.set(true);
    try {
      const page = this.currentPage();
      const startAfterDoc = page > 1 ? this.cursors[page - 1] : null;

      const result = await this.tipService.getTipsPaginated({
        pageSize: this.pageSize,
        startAfterDoc,
        sortBy: 'createdAt', // Toujours trier par date pour le profil
        authorId: user.uid
      });

      const tips = result.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Tip))
        .filter(tip => tip.isDeleted !== true);

      // Stocker le curseur pour la page suivante
      if (result.docs.length > 0) {
        this.cursors[page] = result.docs[result.docs.length - 1];
      }

      this.myTips.set(tips);
      this.totalPages.set(Math.max(1, Math.ceil(result.totalCount / this.pageSize)));
    } catch (error) {
      console.error("Erreur de chargement des astuces du profil :", error);
    } finally {
      this.isLoadingMyTips.set(false);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
      this.loadMyTips();
      this.scrollToTips();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
      this.loadMyTips();
      this.scrollToTips();
    }
  }

  resetPagination() {
    this.currentPage.set(1);
    this.cursors = [];
    this.loadMyTips();
  }

  private scrollToTips(): void {
    setTimeout(() => {
      const container = document.getElementById('my-tips-container');
      if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  }

  editTip(tip: Tip): void {
    this.editingTipId.set(tip.id!);
    this.tipForm.setValue({
      title: tip.title,
      description: tip.description,
      codeSnippet: tip.codeSnippet || '',
      language: tip.language || 'typescript',
    });

    // Défilement automatique fluide vers le formulaire
    setTimeout(() => {
      const container = document.getElementById('tip-form-container');
      if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  }

  cancelEdit(): void {
    this.editingTipId.set(null);
    this.tipForm.reset({ language: 'typescript' });
  }

  async submitTip(): Promise<void> {
    if (this.tipForm.invalid) {
      this.tipForm.markAllAsTouched();
      return;
    }
    if (!this.authService.currentUser()) return;

    this.isSubmitting.set(true);
    const { title, description, codeSnippet, language } = this.tipForm.getRawValue();

    const titleTrimmed = title?.trim() || '';
    const descriptionTrimmed = description?.trim() || '';
    const snippetTrimmed = codeSnippet?.trim() || '';
    const languageTrimmed = language?.trim() || 'typescript';

    try {
      if (this.editingTipId()) {
        await this.tipService.updateTip(this.editingTipId()!, {
          title: titleTrimmed,
          description: descriptionTrimmed,
          codeSnippet: snippetTrimmed,
          language: languageTrimmed,
          isEdited: true,
        });
        this.cancelEdit();
        this.loadMyTips(); // Rafraîchir la page actuelle
      } else {
        const user = this.authService.currentUser()!;
        await this.tipService.addTip({
          title: titleTrimmed,
          description: descriptionTrimmed,
          codeSnippet: snippetTrimmed,
          language: languageTrimmed,
          authorId: user.uid,
          authorName: user.displayName || 'Utilisateur',
          authorAvatar: user.photoURL || '',
        });
        this.tipForm.reset({ language: 'typescript' });
        this.resetPagination(); // Revenir à la page 1 pour voir la nouvelle publication
      }
    } catch (err) {
      console.error('Erreur lors de la publication:', err);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  formatDate(createdAt: any): Date | string {
    if (!createdAt) return new Date();
    if (createdAt.seconds) {
      return new Date(createdAt.seconds * 1000);
    }
    return createdAt;
  }

  deleteTip(id: string): void {
    this.tipIdToDelete.set(id);
    this.isConfirmModalOpen.set(true);
  }

  async onConfirmDelete(): Promise<void> {
    const id = this.tipIdToDelete();
    if (id) {
      await this.tipService.deleteTip(id).catch(() => { });
      this.loadMyTips(); // Rafraîchir la liste après suppression
    }
    this.closeConfirmModal();
  }

  closeConfirmModal(): void {
    this.isConfirmModalOpen.set(false);
    this.tipIdToDelete.set(null);
  }
}
