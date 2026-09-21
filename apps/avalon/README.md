# Avalon (web)

Real-time Avalon-style social deduction game using Node.js and Socket.IO.

## Run

```bash
npm install
npm start
```

Open http://localhost:3000

## How to play

1. **Join** – Enter a username and click Join.
2. **Manager** – One player enters the manager password and clicks "Become manager".  
   **Manager password:** `configured through MANAGER_PASSWORD`
3. **Setup** – Manager clicks "Setup", then:
   - Set how many of each role (total must equal number of players when you start).
   - Optionally set vote time (seconds) and edit missions (participants per mission, fails required to fail).
4. **Start** – Manager clicks "Start game". Roles are distributed; after a short delay, the first leader selects a team.
5. **Team vote** – Everyone votes Approve/Reject. If more than half approve, the mission runs.
6. **Mission** – Players on the mission choose Succeed or Fail. Result is shown (number of fails only). First side to 3 mission wins wins, except if town wins 3 then the Assassin may guess Merlin; correct guess = mafia wins.
7. **Reset** – Manager can reset the game anytime.

## Roles

| Role | Side | Ability |
|------|------|--------|
| Merlin | Town | Sees all mafia except Mordred |
| Percival | Town | Sees Merlin and Morgana (doesn't know who is who) |
| Royal | Town | No ability |
| Mafia Minion | Mafia | No ability |
| Mordred | Mafia | Hidden from Merlin |
| Morgana | Mafia | Appears to Percival (with Merlin) |
| Assassin | Mafia | If town wins 3, can guess Merlin; correct = mafia wins |
| Oberon | Mafia | Doesn't know other mafia; they don't know him |

## Publication configuration

Set `MANAGER_PASSWORD` in your shell before `npm start`. The old embedded password has been removed. This is the local Ubuntu Avalon game, also previously included under `apps/word-role` in this repository. That earlier folder is retained. The game logic is preserved; no application or tests were run.
