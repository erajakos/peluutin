export default {
  // Splash
  startBtn: 'Aloita',
  continueInThisLanguage: 'Jatka suomeksi',
  infoLink: 'Tietoja & tietosuoja',
  localOnlyBadge: 'Kaikki tiedot pysyvät puhelimessasi',

  // Front screen
  backToMenuBtn: 'Takaisin valikkoon',
  menuStartBtn: 'Aloita ottelu',
  menuHistory: 'Pelatut ottelut',
  menuHistoryNote: (count) => (count === 1 ? '1 ottelu tallessa' : `${count} ottelua tallessa`),
  menuHistoryEmptyNote: 'Ei vielä pelattuja otteluita',
  menuHelp: 'Ohjeet',
  menuHelpNote: 'Näin sovellus toimii',
  menuInfo: 'Tietoja',
  menuInfoNote: 'Tietosuoja ja tekijä',

  // Played matches
  historyTitle: 'Pelatut ottelut',
  historyEmpty: 'Täällä ei ole vielä mitään. Pelatut ottelut tallentuvat tähän listaan.',
  historyDayNote: (played, goalsFor, goalsAgainst) =>
    `${played === 1 ? '1 ottelu' : `${played} ottelua`} · ${goalsFor}\u2013${goalsAgainst}`,

  // Instructions
  helpTitle: 'Ohjeet',
  helpIntro: 'Lyhyesti: näin ottelu kulkee alusta loppuun.',
  helpSections: [
    {
      title: 'Ennen ottelua',
      body: 'Anna vastustajan nimi, ottelun kesto ja pelaajien lukumäärä (maalivahti mukaan lukien). Lisää pelaajat listaan — nimet muistetaan seuraavaa kertaa varten.',
    },
    {
      title: 'Aloituskokoonpano',
      body: 'Valitse jokaiseen pelipaikkaan pelaaja tai täytä loput satunnaisesti. Voit myös nimetä kapteenin.',
    },
    {
      title: 'Kello',
      body: 'Käynnistä kello tuomarin vihellyksestä. Jos kello unohtui käynnistää, napauta aikaa: sitä voi säätää minuutin verran suuntaan tai toiseen. Näyttö pysyy päällä ottelun ajan.',
    },
    {
      title: 'Vaihdot',
      body: 'Vedä vaihtopelaaja kentällä olevan pelaajan päälle tai kenttäpelaaja penkille. Voit suunnitella monta vaihtoa kerralla; mitään ei tapahdu ennen kuin vahvistat ne. Napauttaminen toimii samoin: ensin toinen, sitten toinen. Vaihdon voi kumota heti sen jälkeen.',
    },
    {
      title: 'Pelipaikat',
      body: 'Vedä kenttäpelaaja toisen kenttäpelaajan päälle, niin he vaihtavat pelipaikkaa. Se ei kuluta vaihtoa eikä katkaise kummankaan peliaikaa.',
    },
    {
      title: 'Kuka vaihtoon',
      body: 'Punainen nuoli kertoo, kuka on ollut kentällä pitkään ilman taukoa. Vihreä nuoli kertoo, kuka penkillä on pelannut vähiten. Maalivahtia ei ehdoteta vaihtoon.',
    },
    {
      title: 'Maalit ja kortit',
      body: 'Napauta tulostaulua: siellä kirjataan maalit tekijöineen ja kortit. Kaksi keltaista tarkoittaa ulosajoa, jolloin pelipaikka jää tyhjäksi.',
    },
    {
      title: 'Lopetus',
      body: 'Päätä puoliaika tai ottelu ■-painikkeesta. Yhteenveto näyttää tuloksen ja jokaisen peliajan, ja ottelu tallentuu Pelatut ottelut -listaan.',
    },
  ],

  // Info
  infoIntro: 'Pieni työkalu ottelun ja vaihtojen suunnitteluun kentän laidalla.',
  privacyTitle: 'Tietosi pysyvät sinulla',
  privacyBody:
    'Kaikki tiedot pysyvät tällä laitteella. Sovelluksessa ei ole tilejä, palvelimia, pilveä eikä tietokantaa. Joukkueen nimi, pelaajat, asetukset ja pelatut ottelut tallennetaan vain tämän laitteen omaan selainmuistiin, jotta niitä ei tarvitse kirjoittaa joka kerta, keskeytynyt ottelu jatkuu siitä mihin se jäi ja vanhat ottelut löytyvät myöhemminkin.',
  privacyNoTracking:
    'Ei seurantaa, ei analytiikkaa, ei telemetriaa, ei evästeitä, ei mainoksia. Mitään ei lähetetä mihinkään.',
  clearDataBtn: 'Tyhjennä kaikki tiedot',
  clearDataConfirm:
    'Poistetaanko joukkueen nimi, pelaajat, asetukset ja päivän tulokset? Kaikki palaa oletuksiin.',
  madeTitle: 'Miten tämä syntyi',
  madeBody:
    'Tämä on vibe-koodattu pojan futistreenin aikana Claudella ja kännykällä, kentän laidalla.',
  authorTitle: 'Tekijä',
  authorBody: 'Erkki Rajakoski, Studio Rajakoski',
  licenseTitle: 'Vapaa käyttää',
  licenseBody:
    'Täysin ilmainen. Käytä, muokkaa ja haaroita vapaasti — MIT-lisenssi. Ei takuuta, ei ehtoja.',
  backBtn: 'Takaisin',
  installAppBtn: 'Asenna sovellukseksi',
  installTitle: 'Asenna puhelimeen',
  installBody:
    'Peluutin toimii myös ilman verkkoa, kun sen on kerran avannut. Androidilla ja Chromessa asenna aloitusnäytön painikkeesta tai selaimen valikosta.',
  installIos: 'iPhonella: avaa Safarissa, napauta Jaa ja valitse Lisää Koti-valikkoon.',

  // Team name
  teamNameTitle: 'Anna joukkueesi nimi',
  teamNamePlaceholder: 'esim. LPS',
  teamContinueBtn: 'Jatka',
  teamNameRequired: 'Anna joukkueen nimi.',

  // Setup
  opponentTitle: 'Ketä vastaan pelaatte?',
  settingsTitle: 'Ottelun asetukset',
  squadTitle: 'Ketkä ovat mukana?',
  editPositionsLabel: 'Muokkaa pelipaikkojen nimiä',
  stepAria: (n, total) => `Vaihe ${n}/${total}`,
  sectionMatch: 'Ottelu',
  sectionCards: 'Kortit',
  yourTeamLabel: 'Joukkueesi',
  changeTeamLink: 'muuta',
  opponentPlaceholder: 'esim. PPJ',
  opponentRequired: 'Anna vastustajan nimi.',
  gameLengthLabel: 'Ottelun kesto (minuuttia)',
  twoHalvesLabel: 'Kaksi puoliaikaa',
  halfLengthLabel: 'Puoliajan pituus (minuuttia)',
  totalLengthNote: (total) => `Ottelun kokonaiskesto: ${total} minuuttia`,
  firstHalfLabel: 'Ensimmäinen puoliaika',
  secondHalfLabel: 'Toinen puoliaika',
  halfTimeLabel: 'Puoliaika',
  startSecondHalfBtn: 'Aloita toinen puoliaika',
  halfTimeBtn: 'Aloita puoliaikatauko',
  endHalfConfirmText: 'Päättyikö ensimmäinen puoliaika?',
  takeOffConfirm: 'Vaihtopenkillä ei ole ketään tilalle. Otetaanko pelaaja silti pois kentältä?',
  unlockGkConfirm: 'Vaihdetaanko maalivahtia?',
  yesBtn: 'Kyllä',
  fieldSizeLabel: 'Pelaajien lukumäärä',
  subsSectionLabel: 'Vaihdot',
  allowReentryLabel: 'Vaihdettu pelaaja voi tulla myöhemmin takaisin kentälle',
  subLimitLabel: 'Rajoita vaihtojen kokonaismäärää',
  subLimitMaxLabel: 'Vaihtojen enimmäismäärä ottelussa',
  trackCardsLabel: 'Keltaiset ja punaiset kortit ovat käytössä',
  formationLabel: 'Pelimuoto',
  positionNumbered: (n) => `Pelipaikka ${n}`,
  positionFallback: 'Pelipaikka',
  goalkeeperLabel: 'Maalivahti',
  playerNamePlaceholder: 'Pelaajan nimi',
  addPlayerAria: 'Lisää pelaaja',
  removeAria: 'Poista',
  clearRosterBtn: 'Tyhjennä kaikki',
  clearRosterConfirm: 'Poistetaanko kaikki pelaajat?',
  rosterCountNote: (have, need) =>
    `${have} pelaaja${have === 1 ? '' : 'a'} lisätty · tarvitaan vähintään ${need} aloittaakseen`,
  continueBtn: 'Valitse aloituskokoonpano',
  setupErrorNote: (need, have) => `Lisää vähintään ${need} pelaajaa — nyt on ${have}.`,

  // Lineup
  lineupTitle: 'Aloituskokoonpano',
  drawLineupBtn: 'Täytä satunnaisesti',
  captainLabel: 'Kapteeni',
  noCaptainOption: '— ei kapteenia —',
  choosePlayerOption: '— valitse pelaaja —',
  benchPreviewLabel: 'Vaihtopenkki alussa',
  benchPreviewEmpty: 'Kaikki aloittavat kentällä.',
  kickoffBtn: 'Aloita ottelu',

  // Live
  onFieldTitle: 'Kenttä ja penkki',
  eventsTitle: 'Tulos & tapahtumat',
  openEventsAria: 'Avaa tulos ja tapahtumat',
  adjustClockTitle: 'Säädä kelloa',
  doneBtn: 'Valmis',
  closeBtn: 'Sulje',
  totalFor: (time) => `yhteensä ${time}`,
  restingFor: (time) => `penkillä ${time}`,
  playingFor: (time) => `kentällä ${time}`,
  matchProgressAria: 'Ottelun eteneminen',
  dueOffBadge: 'VUOROSSA POIS',
  vacantLabel: 'Paikka tyhjänä',
  startClockBtn: 'Käynnistä kello',
  resumeBtn: 'Jatka',
  pauseBtn: 'Tauko',
  ofLabel: (time) => `/ ${time}`,
  subsUsedNote: (used, limit) => `Vaihtoja käytetty: ${used} / ${limit}`,
  undoSubBtn: 'Kumoa vaihto',
  benchTitle: 'Vaihtopenkki',
  benchEmptyNote: 'Ei vaihtopelaajia',
  plannedOffNote: (name) => `vaihtuu: ${name}`,
  plannedOnNote: (position) => `tulossa: ${position}`,
  whoComesOnNote: 'kuka tilalle?',
  pickPartnerNote: 'Valitse pari: pelaaja kentältä ja pelaaja penkiltä.',
  cancelChangeAria: 'Peru tämä vaihto',
  dragHintTitle: 'Näin teet vaihdon',
  dragHintSub: 'Vedä vaihtopelaaja kentälle — tai kenttäpelaaja penkille.',
  dragHintSwap: 'Vedä pelaaja toisen päälle, niin he vaihtavat pelipaikkaa.',
  dragHintConfirm: 'Vaihdot tapahtuvat vasta kun vahvistat ne.',
  dragHintOk: 'Selvä',
  confirmSubBtn: (count) => (count > 1 ? `Vahvista vaihdot (${count})` : 'Vahvista vaihto'),
  limitReachedNote: (used, limit) =>
    `Vaihtojen enimmäismäärä täynnä (${used}/${limit}) — lisää vaihtoja ei sallita.`,
  cancelBtn: 'Peruuta',
  endMatchLink: 'Lopeta ottelu & katso yhteenveto',
  endConfirmText: 'Lopetetaanko ottelu nyt? Tätä ei voi perua.',

  // Goals and cards
  goalsTitle: 'Tulos',
  whoScoredLabel: 'Kuka teki maalin?',
  changeScorerLabel: 'Vaihda maalintekijä',
  unknownScorerOption: 'Tuntematon',
  noGoalsNote: 'Ei vielä maaleja.',
  cardsTitle: 'Kortit',
  noCardsNote: 'Ei vielä kortteja.',
  yellowCardAria: 'Keltainen',
  redCardAria: 'Punainen',
  yellowCardConfirm: (name) => `Keltainen kortti pelaajalle ${name}?`,
  secondYellowConfirm: (name) =>
    `Toinen keltainen kortti pelaajalle ${name}? Hän ei voi enää pelata tässä ottelussa.`,
  redCardConfirm: (name) =>
    `Punainen kortti pelaajalle ${name}? Hän ei voi enää pelata tässä ottelussa.`,

  // Summary
  sectionPlayingTime: 'Peliajat',
  finalScoreTitle: 'Lopputulos',
  deltaExplained: (average) =>
    `Erotus kertoo, paljonko pelaaja pelasi yli (+) tai alle (−) kenttäpelaajien keskiarvon ${average}.`,
  tablePlayer: 'Pelaaja',
  tableMinutes: 'Minuutit',
  gkTag: 'Maalivahti',
  scorersTitle: 'Maalintekijät',
  cardsSummaryTitle: 'Kortit',
  playAnotherBtn: 'Pelaa toinen ottelu',
  finishSessionBtn: 'Näytä päivän tilastot',

  // Stats
  statsTitle: 'Päivän tilastot',
  matchesLabel: 'Ottelut',
  goalsLabel: 'Maalit',
  winsLabel: 'Voitot',
  drawsLabel: 'Tasapelit',
  lossesLabel: 'Häviöt',
  topScorersTitle: 'Maalintekijät',
  totalMinutesTitle: 'Peliaika yhteensä',
  matchHistoryTitle: 'Ottelut',
  noMatchesNote: 'Ei vielä otteluita.',
  resultTagWin: 'V',
  resultTagDraw: 'T',
  resultTagLoss: 'H',
}
