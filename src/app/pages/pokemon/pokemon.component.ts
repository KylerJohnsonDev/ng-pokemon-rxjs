import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from 'src/app/components/button.component';
import { PokemonStore } from '../../global-state/pokemon-store';
import { PokemonDetailComponent } from './pokemon-detail.component';

@Component({
  selector: 'app-pokemon',
  standalone: true,
  host: {
    class: 'flex flex-col grow',
  },
  template: `
    <main class="grow overflow-auto">
      <section class="lg:hidden flex flex-row m-4">
        <input
          class="app-input bg-gray-600 text-white grow"
          type="text"
          placeholder="Type a Pokemon and press enter"
          (keyup.enter)="onEnter($event)"
        />
      </section>
      <app-pokemon-detail class="m-4"></app-pokemon-detail>
    </main>
    <footer class="flex flex-row lg:hidden bg-white gap-px">
      <button
        class="font-bold grow py-2 px-4 bg-blue-500"
        (click)="pokemonStore.onPrevious()"
      >
        Previous
      </button>
      <button
        class="font-bold grow py-2 px-4 bg-blue-500"
        (click)="pokemonStore.onReset()"
      >
        Reset
      </button>
      <button
        class="font-bold grow py-2 px-4 bg-blue-500"
        (click)="pokemonStore.onNext()"
      >
        Next
      </button>
    </footer>
  `,
  imports: [CommonModule, ButtonComponent, PokemonDetailComponent, FormsModule],
})
export class PokemonComponent {
  constructor(public pokemonStore: PokemonStore) {}

  onEnter(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.pokemonStore.pokemonNameSubject.next(input.value);
  }
}
