import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  Subject,
  forkJoin,
  map,
  of,
  switchMap,
} from 'rxjs';
import {
  Pokemon,
  Type,
  Type2,
  TypeInformation,
} from '../pages/pokemon/pokemon.model';

@Injectable({
  providedIn: 'root',
})
export class PokemonStore {
  private readonly pokeApiUrl = `https://pokeapi.co/api/v2`;

  readonly pokemonNumberSubject = new BehaviorSubject<number>(1);
  readonly pokemonNameSubject = new Subject<string | undefined>();

  private readonly pokemonSubject = new BehaviorSubject<Pokemon | null>(null);
  readonly pokemon$ = this.pokemonSubject.asObservable();

  readonly typeInfo$ = this.pokemon$.pipe(
    switchMap((pokemon) => {
      if (!pokemon) return of([]);
      return this.fetchTypeInformation(pokemon.types);
    })
  );
  readonly goodAgainst$ = this.typeInfo$.pipe(
    map((typeInfo: TypeInformation[]) => {
      let goodAgainst: Type2[] = [];
      typeInfo.forEach((info) => {
        goodAgainst = [
          ...goodAgainst,
          ...info.damage_relations.double_damage_to,
        ];
      });
      return goodAgainst;
    })
  );

  readonly badAgainst$ = this.typeInfo$.pipe(
    map((typeInfo: TypeInformation[]) => {
      let badAgainst: Type2[] = [];
      typeInfo.forEach((info) => {
        badAgainst = [
          ...badAgainst,
          ...info.damage_relations.double_damage_from,
        ];
      });
      return badAgainst;
    })
  );

  constructor(private http: HttpClient) {
    this.pokemonNameSubject.subscribe((name) => {
      if (!name) return;
      this.fetchPokemonByName(name);
    });
    this.pokemonNumberSubject.subscribe((id) => this.fetchPokemonById(id));
    this.pokemonNumberSubject.next(1);
  }

  fetchPokemonById(id: number): void {
    this.http
      .get<Pokemon>(`${this.pokeApiUrl}/pokemon/${id}`)
      .subscribe((pokemon) => {
        this.pokemonSubject.next(pokemon);
      });
  }

  fetchPokemonByName(name: string): void {
    this.http
      .get<Pokemon>(`${this.pokeApiUrl}/pokemon/${name.toLowerCase()}`)
      .subscribe((pokemon) => {
        this.pokemonNameSubject.next(undefined);
        this.pokemonSubject.next(pokemon);
        this.pokemonNumberSubject.next(pokemon.id);
      });
  }

  fetchTypeInformation(types: Type[] | null): Observable<TypeInformation[]> {
    if (!types) return of([]);
    const reqs = types.map((type) => {
      return this.http.get<TypeInformation>(
        `${this.pokeApiUrl}/type/${type.type.name}`
      );
    });
    return forkJoin(reqs);
  }

  onPrevious(): void {
    this.pokemonNumberSubject.next(this.pokemonNumberSubject.value - 1);
  }

  onReset(): void {
    this.pokemonNumberSubject.next(1);
  }

  onNext(): void {
    this.pokemonNumberSubject.next(this.pokemonNumberSubject.value + 1);
  }
}
