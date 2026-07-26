# Liaison Backend – Frontend et rôle des DTO

Ce document explique **comment le backend et le frontend sont reliés** et **comment les DTO backend correspondent aux types frontend**, avec des exemples tirés du code actuel.

---

## 1. Principe de la liaison

- Le **frontend** envoie des requêtes **HTTP** (GET, POST, PUT, etc.) vers une **URL** du backend (ex. `http://localhost:8081/api/auth/login`).
- Les données sont échangées en **JSON** dans le corps de la requête (body) ou dans la réponse (response body).
- Le **backend** sérialise ses **DTO** en JSON (Spring le fait automatiquement).
- Le **frontend** reçoit ce JSON et le traite comme un **objet JavaScript/TypeScript** dont la forme est décrite par des **interfaces** (alignées sur les DTO backend).

Donc : **pas de fichier partagé** entre backend et frontend. La liaison se fait par **contrat** : mêmes noms de champs et mêmes types logiques (string, number, boolean, dates en string ISO, etc.).

---

## 2. Où sont définis les “DTO” de chaque côté

| Côté | Fichiers | Rôle |
|------|----------|------|
| **Backend** | `dto/auth/*.java`, `dto/user/*.java` | Objets Java utilisés pour les entrées (body) et sorties (response) des API. Spring les convertit en JSON. |
| **Frontend** | `api/api.types.ts`, parfois `data/types.ts` | Interfaces TypeScript qui décrivent la forme des objets reçus ou envoyés. On les garde alignées sur le backend. |

---

## 3. Exemple 1 : Login (AuthRequest → AuthResponse)

### Côté Backend

**Entrée :** le corps de la requête est mappé sur un DTO `AuthRequest`.

```java
// backend/.../dto/auth/AuthRequest.java
@Data
public class AuthRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}
```

**Sortie :** le contrôleur retourne un `AuthResponse`, sérialisé en JSON.

```java
// backend/.../dto/auth/AuthResponse.java
@Getter @Setter @Builder
public class AuthResponse {
    private String token;
    private String role;
    private String email;
}
```

**Contrôleur :**

```java
// backend/.../controller/auth/AuthController.java
@PostMapping("/login")
public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
    AuthResponse response = authService.login(request);
    return ResponseEntity.ok(response);
}
```

Donc en JSON la réponse a la forme : `{ "token": "...", "role": "ADMIN", "email": "user@example.com" }`.

### Côté Frontend

**Types (alignés sur le backend) :**

```typescript
// frontend/src/api/api.types.ts

/** POST /api/auth/login - body */
export interface AuthRequest {
  email: string;
  password: string;
}

/** POST /api/auth/login - response */
export interface AuthResponse {
  token: string;
  role: string;
  email: string;
}
```

**Appel API :**

```javascript
// frontend/src/api/auth.api.js
login: (data) => api.post(AUTH_ENDPOINTS.LOGIN, data),
```

**Utilisation dans le service (réception de la réponse = AuthResponse) :**

```javascript
// frontend/src/services/auth.service.js
async login(data) {
  const res = await authApi.login(data);   // data = { email, password } (AuthRequest)
  const responseData = res.data;           // res.data = { token, role, email } (AuthResponse)

  const token = responseData.accessToken || responseData.token;
  if (token) storage.set(TOKEN_KEY, token);
  if (responseData.role != null) storage.set("auth_role", String(responseData.role).toUpperCase());
  if (responseData.email) storage.set("auth_email", responseData.email);

  return responseData;
}
```

**Résumé :**

- **Backend** : reçoit un body JSON → mappé en `AuthRequest` ; retourne `AuthResponse` → sérialisé en JSON.
- **Frontend** : envoie un objet `{ email, password }` (forme `AuthRequest`) ; reçoit `res.data` (forme `AuthResponse`) et utilise `token`, `role`, `email`.

La liaison se fait par les **mêmes noms de champs** en JSON (token, role, email).

---

## 4. Exemple 2 : UserDTO (profil et liste des users)

Le backend expose un même DTO **UserDTO** pour plusieurs endpoints (GET /users/me, GET /admin/users, GET /admin/users/:id, PUT /users/update-profile response, etc.).

### Côté Backend

```java
// backend/.../dto/user/UserDTO.java
@Getter @Setter @Builder
public class UserDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String password;   // toujours null en réponse (sécurité)
    private String telephone;
    private String avatarUrl;
    private String role;
    private EtatCompte etatCompte;
    private boolean enabled;
    private LocalDate dateDeNaissance;
    private Integer niveau;
    private Integer scoreTotal;
    private Integer pointsExperience;
    private Long idRegion;
    private Long idGenre;
    private String resetToken;
    private LocalDateTime resetTokenExpiry;
    private String tokenVerification;
    private LocalDateTime dateExpirationToken;
    private LocalDateTime dateDerniereConnexion;
    private LocalDateTime dateCreation;
}
```

Spring convertit les `LocalDate` / `LocalDateTime` en chaînes ISO dans le JSON.

### Côté Frontend

On décrit la **même structure** en TypeScript (types pour la réponse API) :

```typescript
// frontend/src/api/api.types.ts

export interface UserDTO {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  password: string | null;
  telephone: string | null;
  avatarUrl: string | null;
  role: string;
  etatCompte: string;
  enabled: boolean;
  dateDeNaissance: string;
  niveau: number | null;
  scoreTotal: number | null;
  pointsExperience: number | null;
  idRegion: number | null;
  idGenre: number | null;
  resetToken: string | null;
  resetTokenExpiry: string | null;
  tokenVerification: string | null;
  dateExpirationToken: string | null;
  dateDerniereConnexion: string | null;
  dateCreation: string | null;
}
```

Le frontend réexporte aussi `UserDTO` depuis `data/types.ts` pour l’utiliser partout :

```typescript
// frontend/src/data/types.ts
export type { UserDTO } from '@/api/api.types';
```

### Utilisation dans les composants

**Liste des users (réponse = tableau de UserDTO) :**

```typescript
// frontend/src/pages/admin/Players.tsx
import type { UserDTO } from '@/data/types';
import adminApi from '@/api/admin.api';

const [users, setUsers] = useState<UserDTO[]>([]);

useEffect(() => {
  adminApi
    .getUsers()                    // GET /api/admin/users
    .then((res) => {
      setUsers(res.data ?? []);   // res.data = UserDTO[]
    })
    // ...
}, []);
// Dans le JSX : user.prenom, user.nom, user.email, user.role, user.etatCompte, etc.
```

**Profil “moi” (réponse = un seul UserDTO) :**

```typescript
// frontend/src/pages/admin/AdminEditMyProfile.tsx
import type { UserDTO } from '@/data/types';
import { userService } from '@/services/user.service';

const [profile, setProfile] = useState<UserDTO | null>(null);

userService.getProfile()   // appelle GET /api/users/me → UserDTO
  .then((data) => {
    setProfile(data as UserDTO);
    setForm({
      nom: d.nom ?? '',
      prenom: d.prenom ?? '',
      telephone: d.telephone ?? '',
      avatarUrl: d.avatarUrl ?? '',
    });
  });
```

**Résumé :**

- **Backend** : renvoie toujours un objet (ou une liste d’objets) dont la structure est celle de `UserDTO` (JSON).
- **Frontend** : type cette structure avec l’interface `UserDTO` et utilise `user.prenom`, `user.role`, etc. La liaison est le **contrat JSON** (mêmes noms de champs que le DTO backend).

---

## 5. Exemple 3 : Mise à jour du profil (UpdateProfileRequest → UserDTO)

### Côté Backend

**Entrée (body de la requête) :**

```java
// backend/.../dto/user/UpdateProfileRequest.java
@Getter @Setter
public class UpdateProfileRequest {
    private String nom;
    private String prenom;
    private String telephone;
    private String avatarUrl;
    private String email;
}
```

**Sortie :** le service met à jour l’utilisateur en base puis retourne un `UserDTO` (même structure que dans l’exemple 2).

```java
// UserController
@PutMapping("/update-profile")
public UserDTO updateProfile(@RequestBody UpdateProfileRequest request) {
    return userService.updateProfile(authentication, request);
}
```

### Côté Frontend

**Type de la requête (aligné sur UpdateProfileRequest) :**

```typescript
// frontend/src/api/api.types.ts
export interface UpdateProfileRequest {
  nom?: string;
  prenom?: string;
  telephone?: string;
  avatarUrl?: string | null;
  email?: string;
}
```

**Appel et utilisation :**

```typescript
// frontend/src/pages/admin/AdminEditMyProfile.tsx
import type { UpdateProfileRequest } from '@/api/api.types';

const [form, setForm] = useState<UpdateProfileRequest>({
  nom: '', prenom: '', telephone: '', avatarUrl: '',
});

userService
  .updateProfile({
    nom: form.nom || undefined,
    prenom: form.prenom || undefined,
    telephone: form.telephone || undefined,
    avatarUrl: form.avatarUrl || null,
  })
  .then((updated) => {
    // updated = UserDTO (réponse du backend)
    if (updated?.prenom != null) storage.set('auth_prenom', updated.prenom);
    if (updated?.nom != null) storage.set('auth_nom', updated.nom);
    navigate('/admin/players');
  });
```

**Couche API / service :**

```javascript
// frontend/src/api/user.api.js
updateProfile: (data) => api.put(USER_ENDPOINTS.UPDATE_PROFILE, data),

// frontend/src/services/user.service.js
async updateProfile(data) {
  const res = await userApi.updateProfile(data);  // body = UpdateProfileRequest
  // res.data = UserDTO
  if (res.data.prenom != null) storage.set("auth_prenom", res.data.prenom);
  if (res.data.nom != null) storage.set("auth_nom", res.data.nom);
  return res.data;
}
```

**Résumé :**

- **Backend** : reçoit un body JSON → mappé en `UpdateProfileRequest` ; retourne un `UserDTO` en JSON.
- **Frontend** : envoie un objet de forme `UpdateProfileRequest` et traite la réponse comme `UserDTO`. Liaison = **mêmes noms de champs** en JSON.

---

## 6. Exemple 4 : Changer le rôle (UpdateRoleRequest → UserDTO)

### Côté Backend

**Entrée :**

```java
// backend/.../dto/user/UpdateRoleRequest.java
@Data
public class UpdateRoleRequest {
    @NotBlank(message = "Role is required")
    private String role;
}
```

**Contrôleur :** reçoit le body, retourne un `UserDTO`.

```java
@PutMapping("/{id}/change-role")
public ResponseEntity<UserDTO> updateUserRole(
        @PathVariable Long id,
        @RequestBody UpdateRoleRequest request,
        Authentication authentication) {
    UserDTO user = adminUserService.updateRole(id, request, currentEmail);
    return ResponseEntity.ok(user);
}
```

Donc le body JSON attendu est de la forme : `{ "role": "JOUEUR" }` (ou "PARENT", "EDUCATEUR").

### Côté Frontend

Il n’y a pas d’interface dédiée pour `UpdateRoleRequest` : on envoie un objet simple `{ role: string }`.

```javascript
// frontend/src/api/admin.api.js
updateUserRole: (id, role) => api.put(ADMIN_ENDPOINTS.USER_ROLE(id), { role: String(role) }),
```

**Utilisation :**

```typescript
// frontend/src/pages/admin/Players.tsx
const handleRoleChange = (user: UserDTO, newRole: string) => {
  adminApi
    .updateUserRole(user.id, newRole)   // body = { role: "JOUEUR" } (équivalent UpdateRoleRequest)
    .then(() => {
      setUsers((prev) => prev.map((u) =>
        u.id === user.id ? { ...u, role: newRole } : u
      ));
    });
};
```

La réponse du backend est un `UserDTO` ; le frontend met à jour la ligne du tableau avec le nouveau `role`.

**Résumé :**

- **Backend** : body = `UpdateRoleRequest` (champ `role`) ; réponse = `UserDTO`.
- **Frontend** : envoie `{ role: newRole }` (même champ que le DTO) ; peut typer la réponse en `UserDTO` si besoin. Liaison = **nom de champ `role`** identique.

---

## 7. Schéma récapitulatif du flux de données

```
┌─────────────────────────────────────────────────────────────────────────┐
│  FRONTEND                                                                │
│  • Composant (ex. Players.tsx, AdminEditMyProfile.tsx)                   │
│  • Utilise des types (UserDTO, UpdateProfileRequest) de api.types.ts     │
│  • Appelle un service (auth.service, user.service) ou une api (admin.api) │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 │  HTTP (axios)
                                 │  Body JSON = forme du DTO “Request”
                                 │  Header: Authorization: Bearer <token>
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  BACKEND                                                                 │
│  • Controller reçoit le body → mappé en DTO Request (ex. AuthRequest)   │
│  • Service fait la logique, lit/écrit en BDD                            │
│  • Controller retourne un DTO (ex. UserDTO, AuthResponse)              │
│  • Spring sérialise le DTO en JSON dans la réponse HTTP                 │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 │  Response body JSON = forme du DTO
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  FRONTEND                                                                │
│  • res.data a la forme du DTO (AuthResponse, UserDTO, etc.)             │
│  • On le type avec les interfaces de api.types.ts                       │
│  • On met à jour le state (users, profile) ou le storage (token, etc.) │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Bonnes pratiques (projet actuel)

1. **Un DTO backend = une interface (ou type) frontend** avec les **mêmes noms de champs** (en camelCase des deux côtés avec Spring).
2. **Dates** : backend en `LocalDate` / `LocalDateTime` → JSON en chaîne ISO → frontend en `string`.
3. **Optionnel** : backend `null` ou absent → frontend `| null` ou `?`.
4. **Centraliser les types API** dans `api/api.types.ts` et réexporter dans `data/types.ts` si besoin (ex. `UserDTO`).
5. **Documenter** dans les commentaires de `api.types.ts` quelle route utilise quel body et quelle réponse (comme dans le fichier actuel).

En suivant ces points, la **liaison** reste claire et évolutive : tout changement de champ dans un DTO backend doit être reporté dans le type frontend correspondant.
