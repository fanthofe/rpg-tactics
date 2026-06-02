# Lore — Meute de Loups : Monde Enneigé

> Document de conception narrative et de level design.  
> Brainstorm complet — univers, personnages, mécaniques et symbolique.

---

## Table des matières

1. [Concept général](#1-concept-général)
2. [Système de combat — Meute & Formation](#2-système-de-combat--meute--formation)
3. [Combos de meute — style Chrono Trigger](#3-combos-de-meute--style-chrono-trigger)
4. [Univers — Le Monde Enneigé](#4-univers--le-monde-enneigé)
5. [L'ennemi — Les Hurlevides](#5-lennemi--les-hurlevides)
6. [Trame narrative](#6-trame-narrative)
7. [Personnages principaux](#7-personnages-principaux)
8. [Formes ultimes](#8-formes-ultimes)
9. [Symbolique — Triades](#9-symbolique--triades)

---

## 1. Concept général

Un RPG tactique au tour par tour dans un monde enneigé où le joueur contrôle **une meute de 3 loups**.

- Combat style **Final Fantasy** : les 3 loups jouent tour par tour
- Système de **formation** : le joueur assigne les loups aux positions Alpha / Beta / Omega avant chaque combat
- Chaque loup a une **affinité naturelle** pour une position, mais peut occuper les trois
- Les positions débloquent des **combos de meute** inspirés des dual/triple techs de **Chrono Trigger**
- Le vrai intérêt stratégique : parfois sacrifier la position optimale d'un loup pour débloquer un combo spécifique

---

## 2. Système de combat — Meute & Formation

### Les trois positions

| Position | Rôle | Tour |
|---|---|---|
| **Alpha** | Commande, intimidation, protection | 1er |
| **Beta** | Exécution, attaque, débuffs | 2ème |
| **Omega** | Support, soin, disruption | 3ème |

### Affinités naturelles

Chaque loup a un bonus quand il occupe sa position naturelle — mais jouer hors de sa position peut débloquer des combos uniques.

| Loup | Position naturelle | Bonus hors-position |
|---|---|---|
| **Kael** | Alpha | En Beta : frappe précise (ignore DEF). En Omega : dernier recours (boost si alliés < 40% HP) |
| **Sûra** | Beta | En Alpha : agressivité intimidante (chance de skip ennemi). En Omega : contre-attaque sur chaque coup reçu |
| **Vael** | Omega | En Beta : attaque surprenante (chance de frapper deux fois). En Alpha : ordre imprévisible (ennemi ne peut pas lire les actions) |

### Mécanique de cohésion

- **Jauge de lien** entre chaque paire de loups — se remplit avec les victoires et moments clés du scénario
- Plus la jauge est haute, plus les combos sont puissants
- **Jauge de corruption de Vael** — monte quand il utilise ses capacités Hurlevides, descend quand la cohésion de meute est forte
- Si la corruption de Vael atteint le maximum → il bascule et attaque n'importe quoi pendant 1 tour

---

## 3. Combos de meute — style Chrono Trigger

### Combos à 2 loups

| Nom | Condition | Effet |
|---|---|---|
| **Tactique du Sang** | Kael Alpha + Sûra Beta | Kael neutralise la cible, Sûra exécute — dégâts massifs sur un ennemi |
| **Relais de chasse** | Sûra Beta + Vael Omega | Harcèlement alterné — ATK ennemie -50% pendant 2 tours |
| **Signal de meute** | N'importe quel Alpha + Vael Omega | Vael hurle sur ordre — toute la meute régénère des HP |
| **Regard de l'Abîme** | Kael (toute position) + Vael Omega | Vael révèle les faiblesses spectrales — Kael frappe un point critique garanti |
| **Rage partagée** | Sûra Alpha + Vael Beta | Attaque simultanée — dégâts modérés + saignement + esquive impossible |
| **Maître sans maître** | Kael Alpha + Sûra Beta + inversion | Sûra prend la tête, Kael exécute — déroute l'ennemi (passe son tour) |

### Combos à 3 loups

| Nom | Condition | Effet |
|---|---|---|
| **Formation naturelle** | Kael Alpha + Sûra Beta + Vael Omega | +20% stats pour toute la meute pendant 3 tours |
| **Meute inversée** | Vael Alpha + Sûra Beta + Kael Omega | L'ennemi est désorienté — passe son prochain tour |
| **Hurlement coordonné** | Les 3 en vie — utilisable 1x/combat | Dégâts de zone massifs OU effet de peur durable sur tous les ennemis |
| **Relais total** | Déclenchement auto si un loup tombe à 0 HP | Les 2 survivants agissent immédiatement hors tour + regagnent 15% HP |

---

## 4. Univers — Le Monde Enneigé

### Skövann — *La Clairière des Premiers*

Le lieu sacré des loups. Un cercle naturel de rochers blancs au sommet d'un plateau glacé, visible de toutes les tribus. Neutre depuis la nuit des temps — aucune meute n'en revendique la propriété.

Chaque année, les **tribus de loups** s'y rassemblent pour **élire le Super Alpha** — un loup capable de canaliser la puissance des ancêtres. Le candidat doit traverser le **Donjon Interdit** de Skövann pour recevoir le pouvoir.

### Les tribus

Le monde est organisé en plusieurs clans, chacun avec son territoire et sa culture :

- **Clan des Crêtes Blanches** — la plus ancienne des tribus, gardienne des rituels. Considérée comme arrogante. Tribu de Kael.
- **Meute des Torrents Noirs** — rivale historique des Crêtes Blanches. Tribu de Sûra.
- D'autres tribus nommées lors du récit, dont la plupart sont décimées lors du massacre.

### Le Super Alpha

Le titre n'est pas héréditaire — les ancêtres choisissent. Le Super Alpha peut **canaliser la force des esprits ancestraux** pour se transformer temporairement.

La transformation ultime — le **Loup-Garou** — nécessite plus que le seul pouvoir ancestral : elle exige la résonance d'une meute vivante.

---

## 5. L'ennemi — Les Hurlevides

### Origine

Les Hurlevides sont des loups qui ont **rompu leur lien avec leurs ancêtres** en échange d'une puissance immédiate. Ils ont consommé la force vitale d'autres loups lors d'un rituel interdit, devenant incapables de mourir naturellement — mais incapables de vivre sans continuer à consommer.

En apparence des loups. Mais leur hurlement **sonne creux** — comme un écho dans une caverne vide.

### Vorgäss — *Le Père des Hurlevides*

Il y a vingt ans, il était candidat au titre de Super Alpha. Les ancêtres l'ont refusé. Publiquement. Sans explication.

Il a passé vingt ans à construire une autre voie. Il l'a trouvée — au prix de tout ce qui faisait de lui un loup.

**Son plan** : ne pas simplement détruire. **Consumer la puissance du Super Alpha** en absorbant Kael au moment où son pouvoir est à son apogée. Chaque fois que Kael appelle ses ancêtres, Vorgäss se renforce.

**Sa forme ultime** : il se transforme en loup-garou en sacrifiant son essence interne — sa connexion aux ancêtres, à sa meute, à son fils. Chaque abandon l'a rendu plus grand, plus fort, plus seul. Sa transformation est froide, expansive, qui consomme.

**La symétrie avec Kael** : Vorgäss et Kael sont le même archétype — rejetés ou inattendus dans leur rapport au pouvoir — mais avec vingt ans de différence dans la façon de répondre à la douleur.

---

## 6. Trame narrative

### Prologue — *Skövann*

Kael entre dans le Donjon Interdit sous les regards des tribus rassemblées. Son père ne le regarde pas — trop fier pour montrer sa fierté, trop inquiet pour cacher son inquiétude.

Dans le donjon *(tutoriel)*, il apprend le contrôle de la puissance ancestrale. Au moment de l'obtenir, les ancêtres lui apparaissent — et **son père est parmi eux**. Trop tôt. Beaucoup trop tôt.

Il sort en courant.

---

### Acte I — *Les Ruines de Skövann*

Le massacre est récent. Les Hurlevides sont partis mais leurs traces restent. Kael trouve **Sûra** dans les décombres — hostile, blessée dans son orgueil autant que dans sa chair. Ils n'ont pas le choix de se tolérer.

Ils trouvent **Vael** peu après. Il connaît les Hurlevides de l'intérieur. Il attend qu'on lui pose les bonnes questions avant de parler.

**Objectif** : fuir, comprendre, former un semblant de meute fonctionnelle.

---

### Acte II — *Les Territoires Perdus*

Ils traversent les territoires des tribus détruites — chaque zone révèle un fragment du plan de Vorgäss et approfondit les relations entre les trois loups.

Kael découvre que **chaque fois qu'il utilise son pouvoir, Vorgäss se renforce**. Il doit trouver comment utiliser les ancêtres sans nourrir l'ennemi.

**Pivot émotionnel** : Vael avoue l'étendue de ce qu'il est — fils de Vorgäss, initié de force. La meute éclate presque. Elle se reforme — différemment, plus honnêtement.

---

### Acte III — *La Traque*

Ils ne fuient plus. Ils chassent.

Vorgäss contacte Vael directement — lui offre de compléter l'initiation. *"Tu souffres parce que tu es à moitié. Laisse-moi te finir."*

Vael est tenté. Il le dit à Kael. Cette honnêteté est le tournant de leur relation.

Ils découvrent le rituel final de Vorgäss : absorber toute la force vitale stockée depuis le massacre **plus** la puissance de Kael pour devenir affranchi de la mort, des ancêtres, de la meute.

---

### Acte IV — *Retour à Skövann*

Vorgäss a corrompu le lieu sacré. Les ancêtres sont piégés à l'intérieur de lui — y compris le père de Kael.

**Le combat final** : Vorgäss en loup-garou contre Kael en loup-garou — l'un par destruction du soi, l'autre par plénitude du lien.

Vael, en Esprit du Loup, navigue entre les deux mondes pour libérer les ancêtres piégés. Sûra, en Super Alpha, tient la cohésion de la meute contre la corruption ambiante.

La transformation de Kael n'est accessible que si :
- Les trois loups sont en vie
- Leurs jauges de lien sont au maximum
- La corruption de Vael est à son minimum

**La scène finale** : Kael libère sa puissance. Les ancêtres s'échappent de Vorgäss. Son père est là — une dernière fois. La conversation inachevée a lieu.

---

## 7. Personnages principaux

---

### Kael — *Le Fils des Crêtes Blanches*

**Rôle** : Protagoniste — candidat au Super Alpha, fils du chef de la tribu des Crêtes Blanches.

**Apparence**
- Fourrure blanc-neige avec des bandes charbon profond sur l'échine — les marques du clan
- Yeux ambre doré au repos, bleu glacier lumineux quand il canalise les ancêtres
- Silhouette encore en formation — les épaules n'ont pas atteint leur largeur définitive
- Mouvement délibéré, économe, chaque geste est décidé avant d'être exécuté

**Personnalité**
Noble sans arrogance. A grandi en sachant que son père doutait de lui, et au lieu de s'en révolter il a cherché à comprendre pourquoi. Cette habitude d'examiner sa propre faiblesse avant de la nier lui donne une honnêteté qui met parfois les autres mal à l'aise. Il protège les autres instinctivement et invisiblement — ne sait pas demander de l'aide.

**Blessure centrale** : La conversation avec son père qui n'a jamais eu lieu.

**Arc** : Passer de l'héritier qui n'a pas demandé son pouvoir à quelqu'un qui *choisit* ce qu'il en fait.

---

### Sûra — *La Fille des Torrents Noirs*

**Rôle** : Compagnon 1 — fille du chef de la tribu rivale. Survit au massacre parce qu'elle était là où elle n'aurait pas dû être.

**Apparence**
- Fourrure charbon profond avec des reflets brun-rouille à la lumière rasante — la couleur de l'eau sombre sur les pierres de rivière
- Autour du museau et des pattes, l'ambre brûlé de sa fourrure évoque quelque chose de contenu sous pression
- Une encoche dans l'oreille gauche, ancienne, parfaitement cicatrisée — elle n'en parle jamais
- Mouvement liquide, instinctif — réagit à des informations que les autres lisent trop tard

**Personnalité**
Directe jusqu'à l'inconfort — elle dit ce qu'elle pense et n'attend pas de remerciements. Ce que certains lisent comme de la froideur est de la clarté. Sa tendresse existe, rare et non annoncée. Elle a été sous-estimée toute sa vie et en a fait un art de combat.

**Blessure centrale** : Elle aimait quelqu'un de la tribu ennemie, en secret. Elle n'a jamais su si c'était réciproque. Le massacre a pris cela aussi.

**Arc** : Passer de *"je voulais ce que tu as"* à *"je sais maintenant ce que je veux pour moi-même"*.

**Sa spécificité** : Dans sa tribu, seuls les mâles peuvent être candidats au Super Alpha. Elle était assez proche de Skövann lors du massacre pour voir — pas pour participer. Elle a survécu par transgression.

---

### Vael — *Le Fils de l'Abîme*

**Rôle** : Compagnon 2 — fils de Vorgäss, initié de force aux rites Hurlevides. Ni loup ordinaire, ni Hurlevide accompli.

**Apparence**
- Fourrure gris pâle argenté en pleine lumière — se creuse vers un gris froid à l'ombre
- Certains poils sur les flancs ont une qualité légèrement différente, comme s'ils avaient poussé *après* quelque chose
- **Hétérochromie** : œil droit ambre naturel / œil gauche gris-blanc presque translucide — l'*œil de dette*, celui qui voit les esprits
- Minimal dans ses mouvements. Disparaît dans un couloir de forêt avec une facilité troublante

**Personnalité**
Une lucidité qui frôle le détachement sans y tomber. Il a regardé la partie la plus sombre de sa propre nature en face depuis assez longtemps pour ne plus en avoir peur — ce qui ne veut pas dire qu'il lui fait confiance. Son humour est rare, toujours de travers. Il comprend Vorgäss d'une façon que personne d'autre ne peut — et cette compréhension est à la fois son outil le plus précieux et sa plus grande douleur.

**Blessure centrale** : Il n'a jamais eu la chance d'être quelqu'un avant d'être le fils de Vorgäss. Il ne sait pas ce qu'il serait sans cette ombre.

**Arc** : Choisir quelque chose — pour la première fois délibérément, pas par réflexe.

**Sa spécificité** : Son initiation incomplète a produit l'inverse de ce qu'elle était censée faire. Au lieu de couper son lien avec les esprits, elle a créé une fenêtre. Il vit entre deux mondes.

**Mécanique** : Jauge de corruption. Montre quand il utilise ses capacités Hurlevides, descend avec la cohésion de la meute. À son maximum — il bascule. Vorgäss peut influencer ses pensées quand la jauge est haute.

> *"Mon père a choisi de se vider pour devenir plus grand. Je me demande parfois si je ne suis pas juste ce qui reste après qu'il ait pris ce dont il avait besoin de moi."*

---

## 8. Formes ultimes

### Kael — *Le Loup-Garou des Ancêtres*

La transformation ressemble à une **révélation**, pas à une explosion. La forme semble avoir toujours existé sous la surface.

- Il grandit d'un tiers
- Les bandes charbon de son échine se ramifient sur tout le corps en un réseau de marques lumineuses — bleu glacier
- Il reste *lui* — ses yeux sont les mêmes, son regard est le même
- **Les marques portent les traces des deux autres** : du charbon ambré de Sûra, du gris translucide de Vael
- La transformation n'est pas individuelle — elle porte la signature de la meute

**Condition de déclenchement** : Les 3 loups en vie, jauges de lien au maximum, corruption de Vael au minimum.

**Symbolique** : Le présent incarné — la puissance collective rendue visible.

---

### Sûra — *Le Super Alpha*

La transformation de Sûra n'est pas physique d'abord. C'est **atmosphérique**.

- L'air autour d'elle prend une **charge électrique** imperceptible mais réelle
- Des motifs tribaux anciens apparaissent — blanc presque aveuglant sur le charbon de sa fourrure
- Elle ne devient pas plus grande. Elle devient **plus dense**
- Sa voix prend une résonance que les autres loups reconnaissent d'instinct
- Les Hurlevides dans son champ de présence hésitent — son état est l'antithèse exacte de ce qu'ils sont devenus

**Symbolique** : Le futur possible enfin accessible — le titre qu'on lui a refusé accompli par une voie que personne n'avait prévue.

---

### Vael — *L'Esprit du Loup*

Au lieu d'une augmentation physique, **une dissolution partielle**.

- Sa fourrure perd de sa densité — on peut voir à travers lui par endroits
- Les marques de l'initiation s'inversent : ce qui était sombre devient lumineux, blanc-bleu comme la lumière sur la neige la nuit
- Ses deux yeux s'uniformisent : gris-blanc lumineux
- Il voit les deux mondes superposés, sans filtre

**Ce qu'il peut faire** :
- Traverser les défenses Hurlevides — il existe dans leur registre sans en être
- Parler directement aux esprits piégés à l'intérieur de Vorgäss
- Marcher dans une zone de corruption sans en être affecté
- Voir son père tel qu'il était vraiment — les deux versions superposées, le monstre et l'aimant

**Symbolique** : La mémoire rendue navigable — le passé comme outil plutôt que comme prison.

---

### Synthèse — Les trois formes couvrent les trois axes du temps

| | Kael | Sûra | Vael |
|---|---|---|---|
| **Forme** | Loup-Garou des Ancêtres | Super Alpha | Esprit du Loup |
| **Temps** | Le présent amplifié | Le futur accompli | Le passé navigable |
| **Fourrure** | Blanc, marques lumineuses bleues + traces des alliés | Charbon, motifs tribaux blancs électriques | Gris translucide, inversions lumineuses |
| **Yeux** | Bleu glacier intense | Ambre électrifié | Blanc uniforme — double vision |
| **Ce que la forme exprime** | Le lien collectif rendu chair | L'identité propre enfin libérée | La réconciliation avec l'origine |

Vorgäss a voulu s'affranchir des trois axes — passé (ancêtres), présent (meute), futur (fils). C'est exactement pour ça qu'il ne peut pas gagner contre eux réunis.

---

## 9. Symbolique — Triades

Plusieurs triades culturelles peuvent nourrir les personnages et l'histoire.

### Kabbalah — la plus pertinente pour les loups

- **Nefesh** — l'âme animale, les instincts, la survie → ce que les loups sont *censés* être selon les clichés
- **Ruach** — l'âme émotionnelle, le siège des passions → les liens qui constituent la meute
- **Neshama** — l'âme haute, le souffle divin → la forme ultime de chaque loup

Un loup qui développe son *Neshama* subvertit complètement l'attente du prédateur pur.

### Égyptien — pour l'arc de Vael en particulier

- **Ka** — le double vital, l'énergie de survie
- **Ba** — la personnalité, ce que les autres perçoivent
- **Akh** — la lumière transcendante, la fusion accomplie de Ka et Ba

Vael cherche son *Akh* — sa forme vraie, distincte de l'ombre de son père.

### Nornes nordiques — pour la structure narrative

- **Urd** — ce qui a été (le père de Kael, le passé de Vorgäss)
- **Verdandi** — ce qui devient (les combats, les choix en cours)
- **Skuld** — ce qui doit être (les formes ultimes, la résolution)

---

*Document généré lors du brainstorm de refonte du lore — rpg-tactics.*
