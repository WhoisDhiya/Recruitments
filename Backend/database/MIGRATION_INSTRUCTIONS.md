# Instructions de Migration - Champs Application

## Problème résolu
Les champs suivants collectés dans le formulaire de candidature n'étaient pas stockés en base de données :
- `phone` (téléphone)
- `address` (adresse)
- `portfolio_url` (URL du portfolio)
- `cover_letter` (lettre de motivation)

## Solution
Ces champs ont été ajoutés à la table `applications` dans la base de données.

## Migration

### Option 1 : Utiliser le script de migration (Recommandé)
```bash
mysql -u root -p recruitment_platform < database/migrate_application_fields.sql
```

### Option 2 : Exécuter manuellement dans MySQL
```sql
USE recruitment_platform;

ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) NULL AFTER date_application,
ADD COLUMN IF NOT EXISTS address TEXT NULL AFTER phone,
ADD COLUMN IF NOT EXISTS portfolio_url VARCHAR(500) NULL AFTER address,
ADD COLUMN IF NOT EXISTS cover_letter TEXT NULL AFTER portfolio_url;
```

### Option 3 : Si la table n'existe pas encore
Si vous créez la base de données pour la première fois, le fichier `schema.sql` a déjà été mis à jour avec ces champs. Exécutez simplement :
```bash
mysql -u root -p < database/schema.sql
```

## Vérification
Pour vérifier que les colonnes ont été ajoutées :
```sql
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'recruitment_platform' 
AND TABLE_NAME = 'applications'
ORDER BY ORDINAL_POSITION;
```

Vous devriez voir les colonnes suivantes :
- `phone` (VARCHAR(20), NULLABLE)
- `address` (TEXT, NULLABLE)
- `portfolio_url` (VARCHAR(500), NULLABLE)
- `cover_letter` (TEXT, NULLABLE)

## Notes
- Tous les champs sont optionnels (NULLABLE) pour la compatibilité avec les anciennes candidatures
- Les candidatures existantes auront ces champs à NULL
- Les nouvelles candidatures incluront ces informations si elles sont fournies dans le formulaire

