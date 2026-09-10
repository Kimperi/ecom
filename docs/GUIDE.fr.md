# Guide de préparation et de présentation

## Lancer la démonstration

Dans le dossier du dépôt, avec Node.js 24 ou plus récent :

```powershell
npm ci
npm run dev
```

Ouvre l'adresse locale affichée. Aucun compte AWS ni fichier `.env` n'est nécessaire. Choisis « Demo customer », ajoute un article avec une taille, ouvre le panier puis utilise « Fill with sample details » au paiement. Pour l'administration, choisis « Demo administrator ». Tout est fictif et aucun e-mail n'est envoyé.

## Ce qui a changé, pourquoi et comment le tester

| Changement                  | Où                                            | Pourquoi / test                                                                                                     |
| --------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| README et étude de cas      | `README.md`, `docs/CASE-STUDY.md`             | Présenter le stage, ton travail et les choix techniques ; suivre les liens et le lancement rapide                   |
| Architecture AWS historique | `docs/ARCHITECTURE.md`                        | Conserver la valeur du rapport sans publier les comptes/captures sensibles ; expliquer chaque service à l'entretien |
| Démo locale                 | `src/demo/`, `src/auth/client.js`             | Montrer le projet sans payer AWS ; tester les profils client/admin et le retour à zéro au rechargement              |
| Configuration publique      | `src/config.js`, `.env.example`, `.gitignore` | Retirer les anciennes valeurs codées en dur ; mode démo sans `.env`, mode AWS incomplet refusé                      |
| Panier et formulaires       | `src/lib/validation.js`                       | Refuser quantités négatives/décimales, produit inconnu, adresse/avis invalides ; lancer les tests                   |
| Connexion                   | `src/auth/`, `src/pages/Login.jsx`            | Ne pas confondre session vide ou MFA en attente avec connexion terminée ; tests de session, AWS réel non validé     |
| Confirmation et paiement    | `src/pages/PlaceOrder.jsx`, `Orders.jsx`      | Ne pas promettre un paiement réel ; ouvrir directement `/orders` et vérifier l'absence de fausse confirmation       |
| Dépendances et qualité      | `package*.json`, `tests/`, `.github/`         | Vérifier les changements ; exécuter les commandes ci-dessous                                                        |

```powershell
npm run check
npm run check:secrets -- --history
npm audit
```

Le contrôle GitHub Actions est prêt dans le dépôt, mais son exécution distante n'est vérifiable qu'après publication des changements. Aucun workflow ne déploie sur AWS.

### Vérifications locales du 2 septembre 2026

- Analyse du code et mise en forme : réussies, sans avertissement ESLint.
- Tests automatisés : 20 réussis sur 20 ; compilation de production réussie.
- Audit npm : aucune vulnérabilité signalée à cette date, à revérifier régulièrement.
- Recherche par motifs dans les fichiers et l'historique Git accessible : aucun résultat ; ce contrôle limité ne prouve pas l'absence de tout secret.
- Parcours navigateur : catalogue, avis, panier, commande fictive, création/modification/suppression d'un produit, protections de navigation et affichage mobile vérifiés. Aucune erreur JavaScript ni requête externe constatée pendant ces parcours avec les images fournies.
- Captures du README prises dans la démonstration et vérifiées visuellement.

Ces résultats ne couvrent ni un backend AWS réel ni l'exécution distante de GitHub Actions. Le fichier inutilisé `src/assets/products.js`, doublon d'un ancien catalogue, a été retiré ; sa version précédente reste récupérable dans Git.

## Présenter le projet en entretien

Commence par le problème : relier un parcours e-commerce à une architecture serverless. Montre ensuite le catalogue, le panier et l'administration. Explique Cognito, les trois APIs/Lambdas, DynamoDB et la diffusion S3/CloudFront. Termine par les limites et les améliorations : validation serveur, reproductibilité de l'infrastructure et séparation entre authentification et autorisation.

Tu peux dire : « J'ai développé ce projet pendant mon stage d'initiation. L'environnement AWS a été arrêté pour maîtriser les coûts ; cette version locale permet de parcourir les fonctionnalités, et la documentation conserve l'architecture du projet d'origine. »

Ne présente pas la démo locale, les nouveaux tests ou le workflow ajouté en 2026 comme des livrables déjà réalisés durant le stage de 2025. Ne revendique pas de paiement Stripe/PayPal, de WAF ou de CloudTrail actuellement déployés.

## Avant d'envoyer le lien aux recruteurs

1. Vérifier les changements avec `git status` et la revue de code avant de les committer/pousser.
2. Confirmer les droits de publication du travail de stage et la provenance des images. Le rapport Word complet n'a pas été ajouté au dépôt.
3. Vérifier README, captures, liens et résultat de CI sur GitHub après le push.
4. Dans « About », utiliser par exemple : `React e-commerce portfolio with an AWS serverless architecture and a zero-AWS local demo.`
5. Ajouter des sujets pertinents : `react`, `aws`, `serverless`, `cognito`, `lambda`, `dynamodb`, `cloud-security`, `portfolio`.
6. Épingler ce dépôt sur ton profil et le relier depuis le README de profil.

La visibilité du dépôt, les métadonnées GitHub, les commits et le push ne sont pas modifiés automatiquement par la préparation locale.
