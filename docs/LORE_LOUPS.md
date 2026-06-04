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
10. [Progression des personnages — Level & Character Design](#10-progression-des-personnages--level--character-design)
11. [Système d'affinité des boss](#11-système-daffinité-des-boss)
12. [Système de charges d'évolution](#12-système-de-charges-dévolution)
13. [Système d'équipement — Les Loups s'incarnent](#13-système-déquipement--les-loups-sincarnent)

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

## 10. Progression des personnages — Level & Character Design

---

### Kael — *La Puissance qui apprend à exister*

#### Évolution visuelle
Il commence visuellement **inachevé** — les marquages ancestraux de son clan sont présents mais pâles. Ils s'intensifient et se ramifient non pas à un level-up, mais lors d'un **moment narratif** : la première fois qu'il appelle les ancêtres pour protéger quelqu'un d'autre plutôt que pour se venger.

#### Arc mécanique en trois phases

**Acte I** — Le pouvoir brut sans maîtrise
- Utilisation des ancêtres coûteuse et limitée (1 charge)
- Chaque utilisation nourrit Vorgäss — tension permanente
- Le joueur est tenté de jouer safe et de garder ses charges

**Acte II** — La découverte du lien
- Ses stats montent mécaniquement quand Sûra et Vael sont en bonne santé
- Le joueur comprend que protéger les autres est rentable
- Charges ancestrales +1 à chaque moment narratif clé

**Acte III** — La transformation
- Le loup-garou est accessible uniquement si les 3 jauges de lien sont au maximum
- Ce n'est pas un cooldown — c'est une *condition*
- La transformation n'est pas possible si la meute n'est pas vraiment soudée

> **Tension centrale** : Vorgäss se renforce à chaque utilisation du pouvoir ancestral. Le joueur arbitre entre efficacité immédiate et ne pas nourrir le boss final.

---

### Sûra — *La Force qui apprend à faire confiance*

#### Évolution visuelle
Posture fermée au départ — oreilles légèrement en arrière, regard oblique. Chaque décision de confiance dans l'histoire modifie subtilement sa posture. Les marquages tribaux du Super Alpha apparaissent progressivement à partir du moment où elle accepte de mener — pas d'être menée.

#### Arc mécanique en trois phases

**Acte I** — La meilleure combattante individuelle, zéro synergie
- Toutes ses capacités de pack sont verrouillées
- Le joueur est tenté de la jouer solo — c'est intentionnel, c'est son personnage

**Acte II** — L'émergence du lien
- Les combos de meute nécessitent qu'elle ait survécu un certain nombre de combats *aux côtés* des autres, pas juste dans la même équipe
- **Instinct de meute** débloqué : quand un allié tombe sous 25% HP, Sûra peut agir hors de son tour

**Acte III** — Le Super Alpha
- S'active sur condition narrative : elle doit avoir été en position Alpha lors d'au moins un combat de boss
- Elle doit avoir *choisi* de mener, pas seulement d'attaquer

> **Tension centrale** : Sûra en Beta est plus puissante à court terme. Sûra en Alpha débloque son arc et des combos de fin de jeu. Le joueur arbitre entre optimisation et progression narrative.

---

### Vael — *La Corruption qui apprend à choisir*

#### Évolution visuelle
Sa jauge de corruption est **visible sur le sprite** — pas dans l'interface. À corruption basse : pelage gris-argent propre. À corruption haute : veines sombres sur les flancs, pelage perd de sa netteté. La forme Esprit du Loup *inverse* visuellement tout ça — les veines sombres deviennent des tracés lumineux.

#### Arc mécanique en trois phases

**Acte I** — Le plus puissant brut, au prix le plus élevé
- Capacités Hurlevides = dégâts massifs + corruption monte
- La jauge descend vite quand la cohésion de meute est haute — récompense active de jouer ensemble

**Acte II** — Vorgäss parle à son fils
- Si la jauge dépasse 60%, Vorgäss l'influence : fausses infos sur l'ennemi, ou perte de tour
- **La scène pivot** : Vael avoue ce qu'il est → reset partiel de la jauge + déblocage des premières synergies

**Acte III** — L'Esprit du Loup
- La forme ultime nécessite **jauge de corruption à zéro** — pas une jauge de lien
- Le joueur a dû résister à la tentation d'utiliser ses capacités sombres sur toute la fin du jeu
- La récompense transcende le problème plutôt que de le surmonter

> **Tension centrale** : Vael en mode corruption est redoutable mais instable. Vael en mode lien est plus faible mais ouvre la forme ultime. Les deux chemins doivent rester viables jusqu'au bout.

---

### Tableau de progression de la meute

| Moment narratif | Effet mécanique |
|---|---|
| Kael appelle les ancêtres pour protéger un allié | Marquages s'intensifient + charge ancestrale +1 |
| Sûra joue en Alpha pour la première fois | Combo "Instinct de meute" débloqué |
| Vael avoue sa nature à Kael | Corruption max -20% + premières synergies |
| Les trois survivent à un boss ensemble | Jauge de lien permanente +1 cran |
| Vael résiste à Vorgäss (acte III) | Corruption ne peut plus dépasser 40% |
| Les trois jauges de lien au max | Transformation de Kael accessible |
| Sûra a mené au moins un boss en Alpha | Super Alpha accessible |
| Corruption de Vael à zéro depuis 3 zones | Esprit du Loup accessible |

> Les formes ultimes ne sont pas des récompenses de puissance. Ce sont des récompenses de **cohérence** dans les choix du joueur.

---

## 11. Système d'affinité des boss

---

### Les trois niveaux de récompense

```
Vaincre le boss                              → XP de meute (tous progressent)
      +
Coup de grâce par le loup affinitaire        → Charges d'évolution (lui seul)
      +
En position avantageuse au moment du kill    → Bonus de charges
```

Le joueur doit **préparer le coup final** plutôt que simplement gagner. Gérer les HP ennemis pour amener le bon loup à porter le coup décisif devient une compétence à part entière.

---

### Bosses de Sûra — *L'Affinité des Torrents*

Sûra résonne avec tout ce qui **existe sans permission** — les prédateurs solitaires, les forces qui s'imposent par leur seule nature sans avoir été choisies.

| Boss | Territoire | Pourquoi Sûra | Mécanique signature |
|---|---|---|---|
| **La Reine des Rapides** | Rivière des Torrents Noirs | Prédateur de son territoire natal — ce qu'elle aurait pu devenir seule | Invisible un tour sur deux (attaque depuis l'eau) |
| **La Louve Bannie** | Forêt de l'exil | Miroir de Sûra : rejetée de sa meute, a choisi la destruction | Plus elle perd de HP, plus elle devient forte |
| **Le Lynx Fantôme** | Cols du glacier | Prédateur solitaire absolu, immunisé aux combos à 3 | Oblige à des stratégies individuelles |
| **L'Ourse Matriarch** | Plaines du nord | Femelle dominante protectrice — le Super Alpha naturel | Invulnérable tant que ses petits sont en vie |

**Bonus de coup de grâce en Alpha** : Sûra absorbe quelque chose de chaque prédateur solitaire vaincu. Étape concrète vers le Super Alpha qu'on ne lui a jamais donné.

---

### Bosses de Kael — *L'Affinité des Crêtes*

Kael résonne avec tout ce qui **porte le poids de l'histoire** — les gardiens, les héritiers corrompus, les esprits ancestraux mal orientés.

| Boss | Territoire | Pourquoi Kael | Mécanique signature |
|---|---|---|---|
| **L'Ancien Gardien** | Skövann corrompu | Ancien Super Alpha piégé — ce que Kael pourrait devenir | Utilise une version dégradée des pouvoirs ancestraux de Kael |
| **Le Taureau des Crêtes** | Territoire des Crêtes Blanches | Bête sacrée du clan de Kael, rendue folle par la corruption | Charge qui brise les formations — force un changement de position |
| **Le Spectre du Père** | Zone de transition spirituelle | Manifestation du père corrompue par Vorgäss | Invulnérable aux attaques physiques — uniquement vulnérable au pouvoir ancestral |
| **Le Colosse de Glace** | Sommet de Skövann | Armé de la puissance volée des ancêtres | Absorbe et retourne les combos de meute |

**Bonus de coup de grâce en Alpha** : Kael libère un fragment d'ancêtre piégé. La charge ancestrale augmente définitivement. Il devient plus lui-même à chaque boss ancestral libéré.

---

### Bosses de Vael — *L'Affinité du Seuil*

Vael résonne avec tout ce qui **existe entre deux états** — les Hurlevides ratés, les créatures coincées entre vie et mort, les miroirs de ce qu'il aurait pu devenir.

| Boss | Territoire | Pourquoi Vael | Mécanique signature |
|---|---|---|---|
| **Le Premier Converti** | Ancien territoire de Vorgäss | Premier loup transformé — ce que le rituel donne quand on accepte | Régénère chaque tour — ne peut être tué que par une attaque de Vael |
| **Le Loup-Miroir** | Zone de corruption maximale | Ce que Vael serait s'il avait accepté l'initiation complète | Copie exactement les actions de Vael du tour précédent |
| **Le Gardien du Seuil** | Frontière vivants/esprits | Hostile à l'existence hybride de Vael | Immunisé à tout sauf corruption ou vision spirituelle |
| **L'Ombre de Vorgäss** | Projection spirituelle | Fragment de conscience de Vorgäss — préfigure le combat final | Si corruption de Vael > 60%, Vael ne peut pas l'attaquer |

**Bonus de coup de grâce en Omega** : Chaque boss du seuil vaincu stabilise la corruption. Le plafond de la jauge descend définitivement. Vael se rapproche de la forme Esprit.

---

## 12. Système de charges d'évolution

---

### Fonctionnement

Chaque loup a un arbre de compétences à deux niveaux :
- **Niveau de base** : débloqué avec l'XP normale de meute
- **Niveau évolué** : nécessite des charges d'affinité spécifiques

| Condition de kill | Charges obtenues |
|---|---|
| Coup de grâce par le loup affinitaire | **+2 charges** |
| + en position avantageuse | **+1 charge bonus** → total +3 |
| + sans que les alliés aient attaqué lors du tour final | **+1 charge bonus** → total +4 |

---

### Exemples d'évolutions

**Sûra — Harcèlement**
- Base : saignement -8 HP/tour pendant 3 tours
- Évolué (2 charges) : le saignement réduit aussi l'ATK ennemie de 15%
- Évolué+ (4 charges) : si l'ennemi meurt sous saignement → Sûra agit immédiatement hors tour

**Kael — Appel ancestral**
- Base : +20% ATK pendant 2 tours
- Évolué (2 charges) : s'étend aux alliés dans la formation
- Évolué+ (4 charges) : les ancêtres absorbent 20% des dégâts reçus par la meute ce tour

**Vael — Vision du seuil**
- Base : révèle les faiblesses de l'ennemi
- Évolué (2 charges) : affaiblit les défenses ennemies de 20% ce tour
- Évolué+ (4 charges) : peut être utilisé sur un allié pour annuler une attaque ennemie ciblée

---

### Les quatre tensions stratégiques

**Formation vs. efficacité**
Un boss de Sûra est plus facile avec elle en Beta (sa position naturelle). Pour le bonus de charges, il faut la mettre en Alpha. Le joueur arbitre entre optimisation du combat et optimisation de la progression.

**Préparation du coup final**
Il faut finir le boss avec le bon loup — ce qui veut dire ne *pas* le tuer avant. Gérer les HP ennemis pour amener le bon loup au bon moment devient une compétence à part entière.

**Spécialisation vs. polyvalence**
Plus tu fais vaincre les boss par leur loup affinitaire, plus leurs compétences évoluent vite — au détriment de la progression générale. Un joueur qui veut tout débloquer doit optimiser chaque rencontre. Un joueur détendu progresse quand même, différemment.

**La contrainte de Vael**
Utiliser ses capacités de corruption contre ses boss affinitaires est tentant (bonus de dégâts). Mais ça monte sa jauge — et L'Ombre de Vorgäss est inaccessible si sa corruption dépasse 60%. Il doit parfois se battre contre ses propres boss sans ses meilleures armes.

---

---

## 13. Système d'équipement — Les Loups s'incarnent

> **Principe directeur** : les loups ne *portent* pas d'équipement, ils l'*incarnent*. Tout ce qui les équipe vient de la nature, de la chasse, des rituels ou du monde spirituel — jamais d'une forge.

---

### Vue d'ensemble — Les 5 slots

| Slot | Nom | Logique | Spécificité |
|---|---|---|---|
| **Tête** | Le Signe | Ce que le loup montre de lui | Universel, fort impact visuel |
| **Cou** | Le Collier | Capacités actives et passives | Système de fusion par emplacements jumelés |
| **Pelage** | La Marque de Guerre | Appliquée par un autre loup | Mécanique sociale unique |
| **Naturel** | Griffes / Crocs | Profil spécifique à chaque loup | Dual-slot Sûra, dual-état Vael |
| **Trophée** | Mémoire de Chasse | Drops de boss, forme variable | Connecté au système d'affinité |

---

### Slot 1 — Le Couvre-chef : *Le Signe*

Ce que le loup porte sur la tête dit qui il est dans sa tribu. Chaque pièce vient de quelque chose de vaincu ou de sacré.

| Catégorie | Exemples | Effet type |
|---|---|---|
| **Totémique** | Plume de Corbeau, Touffe de Lynx | Bonus d'information — révèle les faiblesses ennemies |
| **Prédateur** | Crâne miniature, Défense de Sanglier | Intimidation — chance que l'ennemi passe son tour |
| **Ancestral** | Ossement gravé, Écorce runique | Charge ancestrale +1 au départ de chaque combat |
| **Élémentaire** | Éclat de glacier, Mousse de rivière | Résistance élémentaire + effet passif |
| **Spirituel** | Œil de pierre, Plume d'esprit | Vael uniquement — améliore la vision du seuil |

---

### Slot 2 — Le Collier : *La Materia Loups*

Le collier est le **socle** (qualités : vigne tressée, cuir, os poli, métal humain trouvé) contenant des **logements de talismans**.

#### Types de talismans

**Prédateur** *(rouge-brun)* — Capacités offensives
- Dent d'Ours → frappe lourde 1x/combat
- Griffe de Lynx → SPD +8, esquive +5%
- Croc de Meute → bonus dégâts si un allié a attaqué avant ce tour

**Esprit** *(bleu-blanc)* — Connexion ancestrale
- Pierre Ancestrale → recharge 1 charge de Kael par combat
- Éclat de Skövann → immunité à 1 effet de corruption par combat
- Os de Gardien → absorbe 15% des dégâts une fois par tour

**Lien** *(vert)* — Synergies de meute
- Nœud de Meute → +10% aux dégâts de combo
- Sève Vitale → soin passif 5% HP max/tour si les 3 loups sont en vie
- Racine d'Union → un combo à 2 loups peut être déclenché même si l'un est à 0 HP

**Seuil** *(gris translucide)* — Spécifique Vael, équipable par les autres
- Relique Hurlevide → +20% ATK, +corruption (Vael : +10% ATK sans corruption)
- Œil du Passage → révèle si un ennemi a une nature spirituelle cachée
- Larme du Seuil → peut affecter des ennemis immunisés au physique

**Trophée** *(doré)* — Drops de boss exclusivement, non craftables

#### Les logements couplés

Les colliers de qualité supérieure ont des **emplacements jumelés**. Deux talismans compatibles dans des emplacements jumelés fusionnent leur effet :

| Fusion | Talismans | Effet combiné |
|---|---|---|
| **Frappe Sacrée** | Prédateur + Esprit | Dégâts physiques + ignore les immunités spirituelles |
| **Rage de Meute** | Lien + Prédateur | Le prochain combo déclenché ignore la DEF ennemie |
| **Vision de Mort** | Seuil + Esprit | Au tour 1, tous les points faibles ennemis révélés |
| **Corruption Canalisée** | Seuil + Lien | Vael transfère 10% de sa corruption en bonus de dégâts au prochain attaquant |

---

### Slot 3 — La Marque de Guerre : *L'Équipement Social*

**La mécanique la plus originale du système.** Applicable uniquement hors combat, par un *autre* loup de la meute. La marque est peinte sur le pelage avec des substances naturelles.

> Tu ne peux pas te marquer toi-même. Ça force une interaction concrète entre les personnages — et la marque appliquée par Kael sur Sûra n'a pas exactement le même effet que la même marque appliquée par Vael sur Sûra, parce que le lien entre eux change l'intensité.

| Marque | Substance | Effet | Durée |
|---|---|---|---|
| **Boue de Sang** | Argile rouge + herbe amère | Intimidation passive — ATK ennemie -10% | 3 combats |
| **Argile Blanche** | Craie des crêtes | +1 charge ancestrale + résistance corruption | 4 combats |
| **Charbon de Sapin** | Cendre de pin | Esquive +8%, invisibilité 1 tour/combat | 3 combats |
| **Sève Dorée** | Résine d'arbre sacré | Soins reçus +25% | 5 combats |
| **Limon du Seuil** | Terre des zones corrompues | Vael : corruption ne monte pas au prochain combat | 1 combat |

---

### Slot 4 — Les Armes Naturelles : *Par profil de loup*

Pas des armes portées — des **modifications de ce que le loup est déjà**.

#### Kael — Les Griffes Ancestrales

Ses griffes deviennent des conduits de puissance ancestrale.

| Item | Matière | Effet |
|---|---|---|
| Griffes de Pierre Runique | Silex gravé | Chaque attaque physique recharge 0.5 charge ancestrale |
| Griffes de Lune | Calcaire blanchi, os poli | Ignore 20% DEF ennemie dans les zones nocturnes |
| Griffes du Grand Hiver | Glace permanente | Attaques ralentissent l'ennemi (-SPD) |
| Griffes des Ancêtres | Os d'un ancien Super Alpha | 1x/combat : invoque un coup spectral supplémentaire |

#### Sûra — Crocs et Griffes de Chasse (dual-slot)

Deux sous-slots : **crocs** (venin, statut) et **griffes** (vitesse, saignement). Elle peut mixer.

| Item | Type | Matière | Effet |
|---|---|---|---|
| Crocs de Rivière | Crocs | Venin de plante aquatique | Empoisonnement + saignement simultanément |
| Griffes de Rapide | Griffes | Pierre de rivière aiguisée | SPD +10, attaque peut toucher 2 fois si rapide |
| Crocs de Bannie | Crocs | Acier humain brisé | Brise la défense ennemie sur le coup de grâce |
| Griffes-Ombre | Griffes | Cuir de lynx + charbon | Bonus si Kael ou Vael a attaqué avant elle ce tour |

#### Vael — Les Instruments du Seuil (dual-état)

Ses armes changent d'effet selon l'état de sa jauge de corruption.

| Item | Type | Effet basse corruption | Effet haute corruption |
|---|---|---|---|
| Griffes du Seuil | Griffes | Attaque les entités spirituelles immunisées | Dégâts doublés, jauge +5 |
| Crocs de Brume | Crocs | "Ralenti spectral" — ennemi perd 1 action | Drain 10% HP ennemi vers Vael |
| Griffes-Miroir | Griffes | Renvoie 15% des dégâts reçus | Renvoie 30%, Vael subit 10% aussi |
| Crocs Corrompus | Crocs | Poison ignore résistance magique | Poison + corruption de l'ennemi |

---

### Slot 5 — Les Trophées de Boss : *La Mémoire de la Chasse*

Drop automatique après chaque boss. **La forme dépend de qui a porté le coup de grâce et dans quelle position** — connecté directement au système d'affinité (section 11).

| Boss | Trophée (kill normal) | Trophée (kill affinitaire) | Bonus position avantageuse |
|---|---|---|---|
| La Reine des Rapides | Écaille de Rapide (+SPD) | Croc de Reine — venin de rivière permanent | Venin appliqué aux alliés adjacents aussi |
| L'Ancien Gardien | Fragment de Gardien (+DEF) | Éclat du Gardien — absorbe 1 attaque/combat | L'absorption riposte en dégâts spirituels |
| Le Premier Converti | Relique Brisée (+ATK) | Sceau du Converti — immunité corruption 1x/combat | L'immunité peut être transférée à un allié |
| Le Loup-Miroir | Éclat de Miroir (+LCK) | Miroir de Vael — copie la dernière action ennemie | Copie à 1.5× les dégâts |

---

*Document généré lors du brainstorm de refonte du lore — rpg-tactics.*
