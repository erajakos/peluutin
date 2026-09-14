/**
 * What changed, and when.
 *
 * One list for both languages, so a version cannot say one thing in Finnish
 * and another in English, or carry two different dates. Releases are grouped
 * by what they did for the coach rather than listed change by change: nobody
 * on a touchline wants a commit log.
 *
 * `VERSION` is the version this build is. It must match package.json, and a
 * test says so.
 */
export const VERSION = '1.9'

export const RELEASES = [
  {
    version: '1.9',
    date: '2026-09-14',
    fi: {
      title: 'Luotettavampi ruutu',
      changes: [
        'Puoliajalla jokaisen pelaajan nykyinen vaihto alkaa alusta, joten vaihtoehdotukset ovat heti oikein toisella puoliajalla.',
        'Väärälle joukkueelle kirjatun maalin voi kumota heti sen jälkeen.',
        'Kumoa-painike kertoo, minkä vaihdon tai maalin se kumoaa.',
        'Puhelin värähtää, kun vaihto tapahtuu (Android).',
      ],
    },
    en: {
      title: 'A screen to trust',
      changes: [
        'At half time every player’s current spell starts again, so the change prompts are right from the first minute of the second half.',
        'A goal logged for the wrong team can be taken back straight after.',
        'The undo says which change or goal it will undo.',
        'The phone gives a short buzz when a change is made (Android).',
      ],
    },
  },
  {
    version: '1.8',
    date: '2026-09-14',
    fi: {
      title: 'Vaihto yhdellä liikkeellä',
      changes: [
        'Vaihto tapahtuu heti, kun pelaaja pudotetaan paikalleen — erillistä vahvistusta ei enää ole.',
        'Vahingossa tehdyn vaihdon voi kumota heti sen jälkeen.',
      ],
    },
    en: {
      title: 'One move to make a change',
      changes: [
        'A substitution happens the moment a player is dropped into place — there is no separate confirming any more.',
        'A change made by mistake can be undone straight after.',
      ],
    },
  },
  {
    version: '1.7',
    date: '2026-09-13',
    fi: {
      title: 'Useampi joukkue',
      changes: [
        'Voit lisätä useamman joukkueen ja vaihtaa niiden välillä valikon Joukkue-rivistä. Jokaisella joukkueella on omat pelaajansa, ja niitä muokataan samasta paikasta.',
        'Ottelun alussa merkitään vain, ketkä ovat paikalla. Pois jättäminen ei poista pelaajaa joukkueesta.',
        'Pelatut ottelut ja tilastot ovat joukkuekohtaisia.',
        'Maalintekijän voi jättää kirjaamatta selvemmin sanoin — “Ei kirjata” eikä “Tuntematon”.',
      ],
    },
    en: {
      title: 'More than one team',
      changes: [
        'Teams can be added and switched from the Team row on the menu, and each keeps its own players, edited in the same place.',
        'Setting up a match only asks who turned up. Leaving someone out of a match does not take them out of the team.',
        'Played matches and stats belong to the team that played them.',
        'Leaving a scorer unrecorded is said plainly — “Don’t record” rather than “Unknown”.',
      ],
    },
  },
  {
    version: '1.6',
    date: '2026-09-13',
    fi: {
      title: 'Silmät pelissä',
      changes: [
        'Maalin kirjaaminen ei enää vie pois ottelunäkymästä: painikkeet ovat tuloksen alla, ja tekijän napautat suoraan kentältä.',
        'Vaihtopelaajalle kirjattavasta maalista kysytään varmistus.',
        'Kenttäpelaajan voi vetää suoraan sen vaihtopelaajan päälle, jonka haluaa tilalle — ei enää ehdotettua pelaajaa väärään aikaan.',
        'Kapteeni näkyy C-merkillä kaikkialla: kokoonpanossa, kentällä, tuloksessa, päivän tilastoissa ja vanhoissa otteluissa.',
        'Sivuilla on Takaisin myös ylhäällä, ja yksi painallus riittää palaamaan.',
        'Selaimen paluuele liikkuu sovelluksen sisällä, eikä vie ulos ottelusta. Ohjeet ja ottelut voi avata myös suoralla linkillä.',
      ],
    },
    en: {
      title: 'Eyes on the game',
      changes: [
        'Logging a goal no longer leaves the match screen: the buttons sit under the score, and the scorer is tapped on the pitch.',
        'A goal credited to a substitute is asked about first.',
        'A player can be dragged straight onto the substitute you want in their place — no more suggestion arriving at the wrong moment.',
        'The captain wears a C everywhere: in the lineup, on the pitch, in the result, in the day’s stats and in old matches.',
        'Pages carry a back control at the top as well, and one press is enough to leave.',
        'The browser’s back gesture moves inside the app rather than out of a match. The instructions and played matches can be opened by link.',
      ],
    },
  },
  {
    version: '1.5',
    date: '2026-09-13',
    fi: {
      title: 'Etusivu ja muisti',
      changes: [
        'Sovellus avautuu valikkoon: aloita ottelu, pelatut ottelut, ohjeet ja tietoja.',
        'Pelatut ottelut säilyvät päivämäärän mukaan. Ottelun voi avata ja katsoa maalintekijät, kortit ja jokaisen peliajan.',
        'Ohjeet kertovat lyhyesti, miten ottelu kulkee alusta loppuun.',
        'Kaikki tiedot säilyvät laitteella niin pitkään kuin selain sallii — myös kesken jäänyt ottelun valmistelu ja valittu kieli.',
        'Korjattu: pelaaja, joka poistettiin ja lisättiin uudelleen, sai uuden henkilöllisyyden ja näkyi tilastoissa kahdesti.',
        'Korjattu: vaihdossa saattoi tulla kentälle eri pelaaja kuin oli valittu.',
      ],
    },
    en: {
      title: 'A front door and a memory',
      changes: [
        'The app opens onto a menu: start a match, played matches, how it works, and about.',
        'Played matches are kept by date. Open one for its scorers, its cards and everyone’s minutes.',
        'A short guide explains how a match runs from first whistle to last.',
        'Everything is kept on the device for as long as the browser allows — including a match still being set up, and the language you use.',
        'Fixed: a player removed and typed in again became a new person and appeared twice in the stats.',
        'Fixed: a substitution could send on a different player than the one chosen.',
      ],
    },
  },
  {
    version: '1.4',
    date: '2026-09-12',
    fi: {
      title: 'Vaihdot vetämällä',
      changes: [
        'Kenttä ja vaihtopenkki ovat samassa näkymässä: vaihdon tekee vetämällä pelaajan penkiltä kentälle tai kentältä penkille.',
        'Vaihdot suunnitellaan ensin ja vahvistetaan sitten — monta kerralla, ja mitään ei tapahdu ennen vahvistusta.',
        'Pelaajat liikkuvat kentälle ja penkille vahvistuksen jälkeen, joten muutoksen näkee tapahtuvan.',
        'Pelaajan voi ottaa pois kentältä, vaikka vaihtopenkillä ei olisi ketään tilalle.',
        'Asetuksista poistettiin maalivahtikysymykset: pelaajien lukumäärään lasketaan aina maalivahti.',
      ],
    },
    en: {
      title: 'Changes by dragging',
      changes: [
        'The pitch and the bench share one view: a change is made by dragging a player from one to the other.',
        'Changes are planned first and confirmed after — several at once, with nothing happening until you confirm.',
        'Players walk to their new places once confirmed, so the change can be seen happening.',
        'A player can come off even when there is nobody on the bench to replace them.',
        'The goalkeeper questions left the settings: the number of players always counts the keeper.',
      ],
    },
  },
  {
    version: '1.3',
    date: '2026-09-12',
    fi: {
      title: 'Varaa erehtyä',
      changes: [
        'Kelloa voi säätää minuutin verran, jos se unohtui käynnistää tai pysäyttää.',
        'Juuri tehdyn vaihdon voi kumota.',
        'Maalivahdin voi vaihtaa, vaikka hänen oli tarkoitus pelata koko ottelu.',
      ],
    },
    en: {
      title: 'Room to be wrong',
      changes: [
        'The clock can be nudged a minute either way, for when it was started or stopped late.',
        'A substitution just made can be taken back.',
        'The goalkeeper can be changed, even one meant to play the whole match.',
      ],
    },
  },
  {
    version: '1.2',
    date: '2026-09-12',
    fi: {
      title: 'Kentän laidalla',
      changes: [
        'Näyttö pysyy päällä ottelun ajan.',
        'Pelaajan paidassa näkyy nykyinen vaihto: kauanko hän on ollut kentällä tai penkillä juuri nyt.',
        'Vaihtoehdotus perustuu nykyiseen vaihtoon eikä kokonaispeliaikaan — juuri kentälle tullutta ei ehdoteta pois.',
        'Pelipaikoille omat lyhenteet (MV, PR, KP…).',
      ],
    },
    en: {
      title: 'On the touchline',
      changes: [
        'The screen stays awake for as long as the match is on.',
        'Each shirt shows the current spell: how long that player has been on, or sitting, right now.',
        'The change prompt follows the current spell rather than total minutes — a player just brought on is never flagged.',
        'Positions have proper short codes (GK, PM, CB…).',
      ],
    },
  },
  {
    version: '1.1',
    date: '2026-09-11',
    fi: {
      title: 'Mikään ei katoa',
      changes: [
        'Joukkue muistetaan viikosta toiseen; pelaajat voi myös tyhjentää kerralla.',
        'Kesken jäänyt ottelu jatkuu, vaikka sovellus suljettaisiin tai selain palaisi taaksepäin. Käynnissä ollut kello ottaa menetetyn ajan kiinni.',
        'Voitot, tasapelit ja häviöt erottuvat väreistä ja merkeistä.',
        'Kaikki tallennetut tiedot voi poistaa kerralla tietosuojasivulta.',
      ],
    },
    en: {
      title: 'Nothing is lost',
      changes: [
        'The squad is remembered from week to week, and can be cleared in one go.',
        'An interrupted match carries on, even if the app is closed or the browser goes back. A running clock catches up on the time away.',
        'Wins, draws and losses are told apart by colour and mark.',
        'Everything kept on the device can be wiped from the privacy page.',
      ],
    },
  },
  {
    version: '1.0',
    date: '2026-09-11',
    fi: {
      title: 'Peluutin',
      changes: [
        'Sovellus sai nimen Peluutin ja rakennettiin uusiksi: kello, kokoonpano kentällä, vaihdot ja peliajat.',
        'Ottelu voidaan pelata kahdessa puoliajassa, ja valmentaja päättää itse milloin puoliaika vaihtuu.',
        'Maalit tekijöineen sekä keltaiset ja punaiset kortit.',
        'Ottelun asetukset muistetaan seuraavaa kertaa varten.',
        'Sovelluksen voi asentaa puhelimeen ja se toimii ilman verkkoa.',
      ],
    },
    en: {
      title: 'Peluutin',
      changes: [
        'The app was named Peluutin and rebuilt: the clock, the lineup on the pitch, substitutions and playing time.',
        'A match can be played in two halves, with the coach deciding when the half turns.',
        'Goals with their scorers, and yellow and red cards.',
        'Match settings are remembered for next time.',
        'It can be installed on a phone and works with no connection.',
      ],
    },
  },
]
