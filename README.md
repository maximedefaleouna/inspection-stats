# Inspection Statistics - Plateforme de Supervision et Pilotage Academique

Systeme d'information et tableau de bord decisionnel regional concu pour les inspections academiques, directions regionales de l'education et ministeres (developpe pour la supervision des etablissements de la Region de Kara, Togo).

Ce module constitue le pendant institutionnel du module ecole (`school-stats`). Il permet aux inspecteurs et responsables educatifs de consolider les effectifs de l'ensemble des lycees et centres de formation technique, de suivre la parite de genre a l'echelle regionale, de superviser le corps enseignant et de piloter les indicateurs de performance scolaire.

---

## Enjeux et Vision Institutionnelle

A l'echelle d'une inspection pedagogique regionale ou d'un bassin d'education, la collecte des statistiques scolaires fait face a plusieurs defis structurels :
- Fragmentation des donnees remontees par les differents etablissements scolaires.
- Retards importants dans la consolidation des rapports d'effectifs pour les instances ministerielles.
- Difficulte a comparer les performances relatives et les ratios d'encadrement enseignant/eleves entre les lycees generaux et techniques.
- Besoin d'un outil d'aide a la decision pour orienter les dotations de personnel et les investissements pedagogiques.

Inspection Statistics centralise ces flux de donnees, permet l'importation directe des bilans generes par les etablissements et automatise la generation d'indicateurs statistiques macroscopiques.

---

## Fonctionnalites Principales

### 1. Supervision et Cartographie des Etablissements
- **Repertoire regional** : Fiches d'identite completes de chaque etablissement sous tutelle (Lycée Technique, lycees d'enseignement general, centres d'apprentissage professionnel).
- **Suivi des chefs d'etablissement** : Coordonnees directes, statut d'homologation et historique des bilans transmis.

### 2. Agregation et Suivi Global des Effectifs
- **Consolidation macroscopique** : Effectif total d'eleves scolarises a l'echelle du district, reparti par genre (garcons / filles) et par cycle d'etude (BAC, BT, CAP).
- **Indicateurs de parite et de scolarisation** : Analyse des taux de representation feminine dans les filieres industrielles, technologiques et generales.
- **Ventilation multicritere** : Filtres analytiques par annee academique, type d'etablissement et filiere de formation.

### 3. Gestion et Recensement des Ressources Humaines
- **Registre global des personnels** : Recensement consolide de tous les enseignants en poste dans les etablissements de la circonscription.
- **Equipe d'inspection** : Gestion des inspecteurs pedagogiques, des conseillers et des affectations par bassin territorial.
- **Ratios d'encadrement** : Comparatif des besoins en personnel et detection des sureffectifs ou deficits enseignants par matiere.

### 4. Analyses Statistiques et Tableaux de Bord Comparatifs
- **Visualisations analytiques dynamiques** : Diagrammes de repartition par cycle, histogrammes de parite par niveau et graphiques comparatifs entre etablissements.
- **Analyses de tendances** : Evolution pluriannuelle des inscriptions et des flux d'eleves.

### 5. Passerelle de Synchronisation et Imports
- **Module d'import de donnees** : Reception et integration directe des fichiers JSON/CSV exportes depuis le module ecole (`school-stats`).
- **Mode Bureau hors-ligne (Electron)** : Possibilite de travailler en deplacements ou zones a connectivite limitee avec synchronisation ulterieure.

---

## Stack Technique

| Categorie | Technologies |
| :--- | :--- |
| **Framework Frontend** | React 18, TypeScript, Vite |
| **Design System & Composants** | Tailwind CSS, Shadcn UI, Radix UI Primitives, Lucide Icons |
| **Visualisation de Donnees** | Recharts (Graphiques de synthese, camemberts, barres de correlation) |
| **Formulaires & Validation** | React Hook Form, Zod |
| **Gestion d'Etat & Cache** | TanStack React Query |
| **Support Application Bureau** | Electron (Deploiement Desktop multiplateforme) |

---

## Installation et Lancement Local

### 1. Prerequis
- Node.js (version 18 ou superieure)
- npm, yarn ou bun

### 2. Cloner le depot
```bash
git clone https://github.com/maximedefaleouna/inspection-stats.git
cd inspection-stats
```

### 3. Installer les dependances
```bash
npm install
```

### 4. Lancer le serveur de developpement
```bash
npm run dev
```
Par defaut, l'application demarrera a l'adresse locale `http://localhost:4000` (port configure pour fonctionner conjointement avec le module ecole).

### 5. Lancer en mode Application Bureau (Electron)
```bash
npm run electron:start
```

### 6. Compiler pour la production
```bash
npm run build
```

---

## Auteur

**Maxime DEFALEOUNA**
- Profil GitHub : [@maximedefaleouna](https://github.com/maximedefaleouna)
