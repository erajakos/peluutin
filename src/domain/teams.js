/**
 * The teams a coach keeps, each with its own squad.
 *
 * Most coaches have one; some have two, an age group and a club team, with
 * different children in each. A team is a name and a squad — nothing else,
 * because everything else about a match is decided per match.
 */
export function createTeam(id, name, roster = []) {
  return {
    id,
    name: name.trim(),
    roster: roster.map(({ id: playerId, name: playerName }) => ({
      id: playerId,
      name: playerName,
    })),
  }
}

/**
 * Whether this name is already a team's.
 *
 * Case and spacing are ignored, because "LPS musta" and "LPS Musta " are the
 * same team to everyone but a computer — and two teams with one name would
 * make the list a guessing game.
 */
export function isNameTaken(teams, name, exceptId = null) {
  const key = name.trim().toLocaleLowerCase('fi')
  return teams.some((team) => team.id !== exceptId && team.name.toLocaleLowerCase('fi') === key)
}

export function findTeam(teams, id) {
  return teams.find((team) => team.id === id) ?? null
}

/** With this team's squad replaced; other teams are left alone. */
export function withRoster(teams, id, roster) {
  return teams.map((team) => (team.id === id ? { ...team, roster } : team))
}

export function withName(teams, id, name) {
  const clean = name.trim()
  if (!clean) return teams
  return teams.map((team) => (team.id === id ? { ...team, name: clean } : team))
}

export function withoutTeam(teams, id) {
  return teams.filter((team) => team.id !== id)
}

/**
 * Only what can be trusted from storage: a team needs an id and a name, and a
 * squad of players with both. Anything else is dropped rather than allowed to
 * break the app on its way up.
 */
export function sanitizeTeams(raw) {
  if (!Array.isArray(raw)) return []
  return raw
    .filter(
      (team) =>
        team && Number.isInteger(team.id) && typeof team.name === 'string' && team.name.trim(),
    )
    .map((team) =>
      createTeam(
        team.id,
        team.name,
        Array.isArray(team.roster)
          ? team.roster.filter(
              (player) =>
                player &&
                Number.isInteger(player.id) &&
                typeof player.name === 'string' &&
                player.name.trim(),
            )
          : [],
      ),
    )
}
