# MDD API — Backend

API REST du réseau social **MDD (Monde de Dev)**.

## Stack

| Composant | Version |
|---|---|
| Java | 21 |
| Spring Boot | 3.3.4 |
| Sécurité | Spring Security + OAuth2 Resource Server (JWT natif `JwtEncoder`/`JwtDecoder`, HMAC-SHA256) |
| Persistance | Spring Data JPA / Hibernate 6 + MySQL 8.4 |
| Mapping | MapStruct 1.6 + Lombok |
| Documentation | springdoc-openapi (Swagger UI) |

## Démarrage

### 1. Variables d'environnement

```bash
cp .env.example .env
# puis générer une vraie clé :
openssl rand -base64 32
```

> Si le port 3306 est déjà occupé sur votre machine, renseignez `MYSQL_HOST_PORT=3307`
> dans `.env` et adaptez le port de `DB_URL`.

### 2. Base de données

```bash
docker compose up -d
```

Les scripts de `db/init` sont joués **uniquement à la première création du volume** :

- `01-schema.sql` : tables `users`, `topics`, `articles`, `comments` et table de jointure `user_topic`
- `02-data.sql` : jeu de thèmes initial

Pour rejouer les scripts depuis zéro : `docker compose down -v && docker compose up -d`.

### 3. Application

```bash
./mvnw spring-boot:run
```

- API : http://localhost:8080
- Swagger UI : http://localhost:8080/swagger-ui.html

### 4. Tests

```bash
./mvnw test
```

Les tests utilisent une base **H2 en mémoire** (`src/test/resources/application.properties`) :
aucun conteneur n'est nécessaire.

## Modèle de données

```
users ──< articles >── topics
  │           │
  │           └──< comments
  │                   │
  └───────────────────┘  (comments.author_id)

users >──── user_topic ────< topics   (abonnements, ManyToMany)
```

Clés étrangères : `articles.author_id`, `articles.topic_id`,
`comments.author_id`, `comments.article_id`, `user_topic.user_id`, `user_topic.topic_id`.

`spring.jpa.hibernate.ddl-auto=validate` : le schéma SQL fait foi, Hibernate se contente
de vérifier la cohérence des entités JPA au démarrage.

## Endpoints

| Méthode | URL | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Inscription, retourne un JWT |
| POST | `/api/auth/login` | — | Connexion par email **ou** username |
| GET | `/api/user/me` | JWT | Profil de l'utilisateur connecté |
| PUT | `/api/user/me` | JWT | Mise à jour du profil |
| POST | `/api/user/subscriptions/{topicId}` | JWT | S'abonner à un thème |
| DELETE | `/api/user/subscriptions/{topicId}` | JWT | Se désabonner |
| GET | `/api/topics` | JWT | Liste des thèmes |
| GET | `/api/articles` | JWT | Fil d'actualité paginé et triable |
| GET | `/api/articles/{id}` | JWT | Détail d'un article |
| POST | `/api/articles` | JWT | Publier un article |
| GET | `/api/articles/{articleId}/comments` | JWT | Commentaires d'un article |
| POST | `/api/articles/{articleId}/comments` | JWT | Ajouter un commentaire |

Le fil d'actualité accepte les paramètres `page`, `size` et `sort`
(par défaut `sort=createdAt,desc`).

### Authentification

Le JWT est signé en HMAC-SHA256, son claim `sub` contient l'identifiant technique
de l'utilisateur. Il doit être envoyé dans l'en-tête :

```
Authorization: Bearer <token>
```

Les abonnements sont gérés via `POST` / `DELETE` sur
`/api/user/subscriptions/{topicId}` et renvoient `204 No Content`.
La mise à jour du profil (`PUT /api/user/me`, `UpdateProfileRequest`) est **partielle** :
`email`, `username` et `password` sont tous optionnels, un champ `null` ou vide laisse
la valeur inchangée.

## Gestion des erreurs

Toutes les erreurs sont renvoyées au format **RFC 7807** (`application/problem+json`),
produit par `GlobalExceptionHandler`. Aucune stacktrace ni message technique n'est
exposé au client (`server.error.include-stacktrace=never`) : les exceptions non prévues
sont journalisées côté serveur et renvoyées sous forme d'un message générique.

```json
{
  "type": "about:blank",
  "title": "Erreur de validation",
  "status": 400,
  "detail": "Les données envoyées sont invalides",
  "errors": { "email": "Format d'email invalide" }
}
```

| Statut | Cas | Exception |
|---|---|---|
| 400 | Payload invalide (Bean Validation) | `MethodArgumentNotValidException` |
| 400 | Règle métier violée (email/username déjà pris, abonnement en double) | `BadRequestException` |
| 401 | Identifiants de connexion incorrects | `BadCredentialsException` |
| 401 | JWT absent, expiré ou invalide | `AuthenticationException` / `ProblemDetailAuthenticationEntryPoint` |
| 403 | Accès refusé sur une ressource autorisée | `AccessDeniedException` |
| 404 | Ressource inexistante (article, thème, utilisateur) | `ResourceNotFoundException` |
| 409 | Violation d'une contrainte d'unicité en base | `DataIntegrityViolationException` |
| 500 | Erreur non prévue | `Exception` (journalisée, message générique) |

## Configuration

Les clés sont validées au démarrage (`@ConfigurationProperties` + `@Validated`) :
une configuration absente ou invalide fait échouer le boot immédiatement.

| Variable `.env` | Propriété | Classe | Défaut |
|---|---|---|---|
| `DB_URL` / `DB_USERNAME` / `DB_PASSWORD` | `spring.datasource.*` | — | MySQL local `3306` |
| `JWT_SECRET_KEY` | `jwt.secret` | `JwtProperties` | **obligatoire**, ≥ 32 caractères |
| `JWT_EXPIRATION` | `jwt.expiration` | `JwtProperties` | `86400` (24 h) |
| `JWT_ISSUER` | `jwt.issuer` | `JwtProperties` | `mdd-api` |
| `CORS_ALLOWED_ORIGINS` | `cors.allowed-origins` | `CorsProperties` | `http://localhost:4200` |
| `MYSQL_HOST_PORT` | port hôte du conteneur MySQL | `docker-compose.yml` | `3306` |

Le port de l'API est fixé à `8080` (`server.port`).

