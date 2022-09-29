## Informacje o zainstalowanych modułach:

-   ### Aliasy

Projekt korzysta z aliasów dla katalogów, które ułatwiają pracę z nimi. Dostęp do każdego folderu z dowolnego miejsca w projekcie możliwy jest za pomocą składni `@/nazwa_folderu`. Nie jest zatem
konieczne używanie ścieżek relacyjnych, takich jak np. `../../nazwa_folderu`. W celu prawidłowego załadowania aliasów na górze każdego pliku, który z nich korzysta konieczne jest dodanie importu
`import 'module-alias/register'`.

-   ### Prettier

    W projekcie został skonfigurowany plik `.prettierrc`, który zawiera reguły formatowania wykonywanego automatycznie przy zapisie pliku (konieczne włączenie tej opcji w usawieniach edytora). W celu
    skorzystania z niego konieczna jest odpowiednia konfiguracja.

-   ### Logowanie danych
    Klasa `Log` znajdująca się w pliku `library/Logging.ts` zawiera prosty loger do logowania tego, co dzieje się na serwerze. Dostęp do niego odbywa się poprzez polecenie `Log.funkcja(<argument>)`.
    Dostępne są standardowe opcje logowania:
-   _debug()_
-   _info()_
-   _warn()_
-   _error()_

W pliku `server.ts` został skonfigurowany loger requestów przychodzących do serwera oraz jego odpowiedzi na te requesty.

## Skrypty w pliku _package.json_:

-   `build`: Usuwa katalog _build_ i buduje projekt
-   `preserve`: uruchamia skrypt `build`
-   `serve`: Uruchamia serwer w trybie nasłuchiwania zmian w kodzie, a w momencie ich wykrycia przebudowuje projekt i uruchamia go ponownie
-   `prestart`: uruchamia skrypt `build`
-   `start`: uruchamia wcześniej zbudowany projekt
-   `postinstall`: uruchamia się automatycznie po uruchomieniu polecenia `npm install` i buduje projekt

## Dostępne endpointy:

Serwer działa pod adresem `localhost:4000`. Niektóre ścieżki wymagają zalogowania. Aby się zalogować, należy najpierw utworzyć użytkownika pod adresem `localhost:3000/signup`. Następnie należy się zalogować pod adresem `localhost:4000/login`. Wymagane dane w obu przypadkach:

```
{
    "username": string,
    "password": string
}
```

_Note:_ Hasło musi mieć minimum 6 znaków.

Pod adresem `localhost:4000/logout` można się wylogować.

Dostępne są ścieżki dla niektórych modeli wraz z wymaganymi danymi dla niektórych z nich:

-   ### Lekarze:

    -   `POST` - `/doctor/create`

        ```
        {
            "firstname": string,
            "lastname": string,
            "specialization": string
        }
        ```

    -   `GET` - `/doctor/get/:doctorId`
    -   `GET` - `/doctor/get/`
    -   `PATCH` - `/update/:doctorId`

        ```
        {
            "firstname": string,
            "lastname": string,
            "specialization": string
        }
        ```

    -   `DELETE` - `/update/:doctorId`

-   ### Rezerwacje:

    -   `POST` - `/reservation/create`

        ```
        {
            "email": string,
            "doctorId": string,
            "day": Date,
            "time": string w formacie hh:mm
        }
        ```

    -   `GET` - `/reservation/get/:reservationId`
    -   `GET` - `/reservation/get/`
    -   `PATCH` - `/update/:reservationId`

        ```
        {
            "email": string,
            "doctorId": string,
            "day": Date,
            "time": string w formacie hh:mm
        }
        ```

    -   `DELETE` - `/update/:reservationId`
